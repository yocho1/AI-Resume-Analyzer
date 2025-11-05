import React, { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, CheckCircle, Star, AlertCircle, Zap, TrendingUp, Download, Shield } from "lucide-react";

// Fixed: Use Create React App environment variables
const API = process.env.REACT_APP_API_URL || "http://127.0.0.1:5001";

export default function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(`${API}/analyze_resume`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
    } catch (err) {
      setError("Failed to analyze resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === "application/pdf" || droppedFile.name.endsWith(".docx"))) {
      setFile(droppedFile);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBg = (score) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-4xl"
      >
        {/* Header Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/60 p-8 mb-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl text-white mx-auto mb-4 shadow-lg">
            🧠
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            AI Resume Analyzer
          </h1>
          <p className="text-gray-600 text-lg max-w-md mx-auto">
            Get instant AI-powered insights to improve your resume and land more interviews
          </p>
        </div>

        {/* Main Content Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/60 p-8">
          <form onSubmit={handleUpload} className="space-y-6">
            {/* Upload Area */}
            <div
              className={`border-3 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer ${
                dragOver
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-300 hover:border-blue-300 hover:bg-gray-50"
              } ${file ? "border-green-400 bg-green-50" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById("file-input").click()}
            >
              <input
                id="file-input"
                type="file"
                accept=".pdf,.docx"
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden"
              />
              
              <div className="flex flex-col items-center gap-4">
                {file ? (
                  <>
                    <CheckCircle className="w-16 h-16 text-green-500" />
                    <div>
                      <p className="text-lg font-semibold text-gray-800">File Selected</p>
                      <p className="text-gray-600 flex items-center gap-2 mt-1">
                        <FileText className="w-4 h-4" />
                        {file.name}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <Upload className="w-16 h-16 text-gray-400" />
                    <div>
                      <p className="text-lg font-semibold text-gray-800">
                        Drop your resume here or click to browse
                      </p>
                      <p className="text-gray-500 mt-1">Supports PDF and DOCX files</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Action Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading || !file}
              className={`w-full py-4 rounded-xl font-semibold text-white shadow-lg transition-all ${
                loading || !file
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-xl hover:from-blue-600 hover:to-purple-700"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing with AI...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <Zap className="w-5 h-5" />
                  <span>Analyze My Resume</span>
                </div>
              )}
            </motion.button>
          </form>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results Section */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mt-8 space-y-6"
              >
                {/* Score Card */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-500" />
                        Overall Score
                      </h3>
                      <p className="text-gray-600 mt-1">Based on AI analysis of your resume</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-4xl font-bold ${getScoreColor(result.score)}`}>
                        {result.score}
                        <span className="text-2xl text-gray-400">/100</span>
                      </div>
                      <div className="w-24 h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                        <div
                          className={`h-full ${getScoreBg(result.score)} transition-all duration-1000`}
                          style={{ width: `${result.score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                {result.summary && (
                  <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-green-500" />
                      Professional Summary
                    </h3>
                    <p className="text-gray-700 leading-relaxed">{result.summary}</p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Strengths */}
                  {result.strengths && result.strengths.length > 0 && (
                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Star className="w-5 h-5 text-green-500" />
                        Strengths
                      </h3>
                      <ul className="space-y-2">
                        {result.strengths.map((strength, index) => (
                          <li key={index} className="flex items-center gap-3 text-gray-700">
                            <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Areas for Improvement */}
                  {result.weaknesses && result.weaknesses.length > 0 && (
                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-orange-500" />
                        Areas for Improvement
                      </h3>
                      <ul className="space-y-2">
                        {result.weaknesses.map((weakness, index) => (
                          <li key={index} className="flex items-center gap-3 text-gray-700">
                            <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" />
                            {weakness}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Keywords & Recommendations */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Recommended Keywords */}
                  {result.keywords_to_add && result.keywords_to_add.length > 0 && (
                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-blue-500" />
                        Suggested Keywords
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {result.keywords_to_add.map((keyword, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommended Changes */}
                  {result.recommended_changes && result.recommended_changes.length > 0 && (
                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-purple-500" />
                        Action Items
                      </h3>
                      <ul className="space-y-2">
                        {result.recommended_changes.map((change, index) => (
                          <li key={index} className="flex items-center gap-3 text-gray-700">
                            <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0" />
                            {change}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Fallback Notice */}
                {result.fallback_analysis && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-center">
                    <p className="text-yellow-700 text-sm">
                      ⚠️ Using basic analysis (AI service unavailable). For detailed insights, check your API configuration.
                    </p>
                  </div>
                )}

                {/* Try Another Button */}
                <div className="text-center pt-4">
                  <button
                    onClick={() => {
                      setFile(null);
                      setResult(null);
                      setError(null);
                    }}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-600 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all font-medium"
                  >
                    Analyze Another Resume
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Powered by Google Gemini AI • Secure & Private • No data stored</p>
        </div>
      </motion.div>
    </div>
  );
}