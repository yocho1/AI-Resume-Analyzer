# AI Resume Analyzer 🤖📄

A full-stack web application that uses AI to analyze resumes and provide detailed feedback, scores, and improvement suggestions. Built with React frontend and Flask backend, powered by Google Gemini AI.

![AI Resume Analyzer](https://img.shields.io/badge/AI-Powered-blue) ![React](https://img.shields.io/badge/React-18.2.0-blue) ![Flask](https://img.shields.io/badge/Flask-2.3.3-green) ![Gemini AI](https://img.shields.io/badge/Gemini-AI-orange)

## ✨ Features

- **AI-Powered Analysis**: Uses Google Gemini AI for intelligent resume review
- **Multiple File Support**: Upload PDF, DOCX, and TXT files
- **Detailed Feedback**: Get scores, strengths, weaknesses, and improvement suggestions
- **Keyword Optimization**: Discover missing keywords for ATS systems
- **Grammar & Formatting**: Get suggestions for better formatting and grammar
- **Fallback Analysis**: Works even when AI is unavailable
- **Real-time Processing**: Fast analysis with immediate results

## 🛠️ Tech Stack

### Frontend

- **React** - User interface
- **CSS3** - Styling and responsive design
- **JavaScript ES6+** - Client-side logic

### Backend

- **Flask** - Python web framework
- **Google Gemini AI** - AI analysis engine
- **PyPDF2** - PDF text extraction
- **python-docx** - DOCX text extraction
- **Flask-CORS** - Cross-origin resource sharing

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- Python (v3.8 or higher)
- Google Gemini API key

### Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/YOUR_USERNAME/AI-Resume-Analyzer.git
    cd AI-Resume-Analyzer

    ```

2.  **Backend setup**

    cd backend
    pip install -r requirements.txt

3.  **Set up environment variables**

    Create .env file in backend directory

        echo "GEMINI_API_KEY=your_gemini_api_key_here" > .env

4.  **Frontend Setup**

    cd ../frontend
    npm install
