from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import io
from PyPDF2 import PdfReader
from docx import Document
import google.generativeai as genai
import json
import re

app = Flask(__name__)
CORS(app)

# --- Configure Gemini ---
GEMINI_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_AVAILABLE = False
AVAILABLE_MODEL = None

if GEMINI_KEY:
    try:
        genai.configure(api_key=GEMINI_KEY)
        # Find a working model
        models = list(genai.list_models())
        for model in models:
            if 'generateContent' in model.supported_generation_methods:
                # Prefer these models in order
                if 'gemini-1.5-flash' in model.name:
                    AVAILABLE_MODEL = model.name
                    break
                elif 'gemini-1.5-pro' in model.name:
                    AVAILABLE_MODEL = model.name
                    break
                elif 'gemini-pro' in model.name:
                    AVAILABLE_MODEL = model.name
                    break
        
        # If no preferred model found, take the first available one
        if not AVAILABLE_MODEL and models:
            AVAILABLE_MODEL = models[0].name
        
        if AVAILABLE_MODEL:
            GEMINI_AVAILABLE = True
            print(f"SUCCESS: Gemini configured. Using model: {AVAILABLE_MODEL}")
        else:
            print("ERROR: No suitable Gemini model found")
            
    except Exception as e:
        print(f"ERROR: Gemini configuration failed: {e}")


# --- Helper: extract text from PDF/DOCX ---
def extract_text_from_file(filename, file_bytes):
    filename = filename.lower()
    if filename.endswith(".pdf"):
        reader = PdfReader(io.BytesIO(file_bytes))
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    elif filename.endswith(".docx"):
        doc = Document(io.BytesIO(file_bytes))
        return "\n".join(p.text for p in doc.paragraphs)
    else:
        return file_bytes.decode(errors="ignore")


# --- Helper: build AI prompt ---
def build_prompt(resume_text):
    return f"""
You are an AI resume reviewer. Analyze this resume and return structured JSON only.
Respond in this exact JSON format:
{{
  "score": 85,
  "summary": "Brief professional summary here",
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "weaknesses": ["Weakness 1", "Weakness 2"],
  "keywords_to_add": ["Keyword 1", "Keyword 2"],
  "grammar_and_formatting": ["Suggestion 1", "Suggestion 2"],
  "recommended_changes": ["Change 1", "Change 2"]
}}

Resume content:
{resume_text[:10000]}  # Limit to avoid token limits
"""


# --- Call Gemini ---
def analyze_with_gemini(resume_text):
    if not AVAILABLE_MODEL:
        raise Exception("No Gemini model available")
    
    prompt = build_prompt(resume_text)
    model = genai.GenerativeModel(AVAILABLE_MODEL)
    response = model.generate_content(prompt)
    return response.text


# --- Flask endpoint ---
@app.route("/analyze_resume", methods=["POST"])
def analyze_resume():
    if "file" not in request.files:
        return jsonify({"error": "file field required"}), 400

    f = request.files["file"]
    filename = f.filename or "upload"
    file_bytes = f.read()

    # Extract text
    text = extract_text_from_file(filename, file_bytes)
    if not text or len(text.strip()) < 20:
        return jsonify({"error": "Could not extract text from file or file too small"}), 400

    # --- Use Gemini if available ---
    if GEMINI_AVAILABLE:
        try:
            print(f"ANALYZING: Resume with {AVAILABLE_MODEL}...")
            analysis_text = analyze_with_gemini(text)
            print(f"RESPONSE: {analysis_text[:200]}...")
            
            # Try to extract JSON from response
            json_match = re.search(r"\{[\s\S]*\}", analysis_text)
            if json_match:
                parsed = json.loads(json_match.group(0))
                parsed["model_used"] = AVAILABLE_MODEL
                return jsonify(parsed)
            else:
                # If no JSON found, return as raw text
                return jsonify({
                    "raw_analysis": analysis_text,
                    "model_used": AVAILABLE_MODEL,
                    "note": "Could not parse JSON from response"
                })
                
        except Exception as e:
            print(f"ERROR: Gemini analysis failed: {e}")
            return jsonify({
                "error": "AI request failed", 
                "detail": str(e),
                "fallback_used": True
            }), 500

    # --- Fallback to mock analysis ---
    print("FALLBACK: Using mock analysis (no Gemini available)")
    txt = text.lower()
    words = txt.split()
    word_count = len(words)
    score = min(90, max(30, int(word_count / 5)))
    strengths = []
    weaknesses = []
    keywords = []
    
    if "experience" in txt or "worked" in txt:
        strengths.append("Shows work experience")
    else:
        weaknesses.append("No explicit work experience section found")
        
    if "python" in txt:
        keywords.append("python")
    if "sql" in txt:
        keywords.append("sql")
    if "machine learning" in txt:
        keywords.append("machine learning")
        
    return jsonify({
        "summary": "Quick heuristic analysis (AI not available).",
        "score": score,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "keywords_to_add": keywords,
        "grammar_and_formatting": [],
        "recommended_changes": [
            "Provide a clear Work Experience section",
            "Add 3-5 technical keywords"
        ],
        "fallback_analysis": True
    })


@app.route("/health", methods=["GET"])
def health_check():
    """Check API health and Gemini status"""
    status = {
        "status": "healthy",
        "gemini_available": GEMINI_AVAILABLE,
        "gemini_model": AVAILABLE_MODEL,
        "message": "Resume Analyzer API is running"
    }
    return jsonify(status)


if __name__ == "__main__":
    print("STARTING: Resume Analyzer API...")
    print(f"GEMINI AVAILABLE: {GEMINI_AVAILABLE}")
    print(f"MODEL: {AVAILABLE_MODEL}")
    app.run(debug=True, host="127.0.0.1", port=5001)