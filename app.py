from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS  # Import CORS
import os
from portfolio_chatbot import PortfolioChatbot
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Enable CORS for all routes, allowing all origins
CORS(app)  # This allows all origins by default.

# Global chatbot instance
chatbot = None

def initialize_chatbot():
    """Initialize the portfolio chatbot"""
    global chatbot
    try:
        chatbot = PortfolioChatbot(debug=False)
        print("✅ Portfolio Chatbot initialized successfully!")
        return True
    except Exception as e:
        print(f"❌ Error initializing chatbot: {e}")
        chatbot = None
        return False

# HTML Template for the web interface
HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🤖 Abhishek Ambi's Portfolio Chatbot</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            margin-bottom: 10px;
            font-size: 2.5em;
        }
        
        .header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        
        .main-content {
            display: flex;
            min-height: 600px;
        }
        
        .chat-section {
            flex: 2;
            padding: 20px;
            display: flex;
            flex-direction: column;
        }
        
        .sidebar {
            flex: 1;
            background: #f8f9fa;
            padding: 20px;
            border-left: 1px solid #dee2e6;
        }
        
        .chat-container {
            flex: 1;
            border: 2px solid #e9ecef;
            border-radius: 15px;
            margin-bottom: 20px;
            display: flex;
            flex-direction: column;
            background: #fafafa;
        }
        
        .chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            max-height: 400px;
        }
        
        .message {
            margin-bottom: 15px;
            display: flex;
            align-items: flex-start;
        }
        
        .user-message {
            justify-content: flex-end;
        }
        
        .user-message .message-content {
            background: #667eea;
            color: white;
            padding: 12px 18px;
            border-radius: 18px 18px 5px 18px;
            max-width: 70%;
        }
        
        .bot-message .message-content {
            background: white;
            border: 1px solid #e9ecef;
            padding: 12px 18px;
            border-radius: 18px 18px 18px 5px;
            max-width: 85%;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        
        .input-area {
            display: flex;
            gap: 10px;
            align-items: flex-end;
        }
        
        .input-area textarea {
            flex: 1;
            padding: 12px;
            border: 2px solid #e9ecef;
            border-radius: 25px;
            resize: none;
            font-family: inherit;
            font-size: 14px;
        }
        
        .input-area textarea:focus {
            outline: none;
            border-color: #667eea;
        }
        
        .btn {
            background: #667eea;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 25px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        
        .btn:hover {
            background: #5a6fd8;
            transform: translateY(-2px);
        }
        
        .btn-secondary {
            background: #6c757d;
            width: 100%;
            margin-bottom: 10px;
        }
        
        .btn-secondary:hover {
            background: #5a6268;
        }
        
        .sidebar h3 {
            margin-bottom: 15px;
            color: #495057;
        }
        
        .api-info {
            background: #e3f2fd;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 20px;
            border-left: 4px solid #2196f3;
        }
        
        .api-info h4 {
            margin-bottom: 10px;
            color: #1976d2;
        }
        
        .api-info code {
            background: #f5f5f5;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 12px;
        }
        
        .project-search {
            margin-top: 20px;
        }
        
        .project-search input {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            margin-bottom: 10px;
        }
        
        .project-result {
            background: white;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 10px;
            min-height: 100px;
            font-size: 12px;
            white-space: pre-wrap;
        }
        
        .loading {
            opacity: 0.6;
            pointer-events: none;
        }
        
        @media (max-width: 768px) {
            .main-content {
                flex-direction: column;
            }
            .container {
                margin: 10px;
                border-radius: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 Abhishek Ambi's Portfolio Chatbot</h1>
            <p>Your AI assistant for portfolio information, career advice, and technical insights</p>
        </div>
        
        <div class="main-content">
            <div class="chat-section">
                <div class="chat-container">
                    <div class="chat-messages" id="chatMessages">
                        <div class="message bot-message">
                            <div class="message-content">
                                👋 Welcome! I'm Abhishek Ambi's AI assistant.<br><br>
                                I can help you with:<br>
                                • Information about Abhishek's background and education<br>
                                • Details about his projects and technical skills<br>
                                • Career advice and recommendations<br>
                                • Contact and networking information<br><br>
                                Feel free to ask me anything or use the quick action buttons!
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="input-area">
                    <textarea id="messageInput" placeholder="Ask me anything about Abhishek's portfolio..." rows="2"></textarea>
                    <button class="btn" onclick="sendMessage()">Send</button>
                </div>
                
                <button class="btn btn-secondary" onclick="clearChat()" style="margin-top: 10px; width: 150px;">Clear Chat</button>
            </div>
            
            <div class="sidebar">
               
                
                <h3>Quick Actions</h3>
                <button class="btn btn-secondary" onclick="quickAction('Tell me about Abhishek\\'s background')">👤 Background</button>
                <button class="btn btn-secondary" onclick="quickAction('Summarize Abhishek\\'s technical skills')">💻 Skills</button>
                <button class="btn btn-secondary" onclick="quickAction('List all projects')">🚀 Projects</button>
                <button class="btn btn-secondary" onclick="quickAction('Give me career advice')">🎯 Career Advice</button>
                <button class="btn btn-secondary" onclick="quickAction('How can I contact Abhishek?')">📞 Contact</button>
                <button class="btn btn-secondary" onclick="quickAction('What is the current model status?')">📊 Status</button>
                
                <div class="project-search">
                    <h3>🔍 Project Search</h3>
                    <input type="text" id="projectInput" placeholder="e.g., Meeting House, Quick Eats">
                    <button class="btn btn-secondary" onclick="searchProject()">Search Project</button>
                    <div class="project-result" id="projectResult">Enter a project name to search...</div>
                </div>
            </div>
        </div>
    </div>

    <script>
        function addMessage(content, isUser = false) {
            const messagesContainer = document.getElementById('chatMessages');
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
            
            const contentDiv = document.createElement('div');
            contentDiv.className = 'message-content';
            contentDiv.innerHTML = content.replace(/\\n/g, '<br>');
            
            messageDiv.appendChild(contentDiv);
            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
        
        function setLoading(loading) {
            const container = document.querySelector('.container');
            if (loading) {
                container.classList.add('loading');
            } else {
                container.classList.remove('loading');
            }
        }
        
        async function sendMessage() {
            const input = document.getElementById('messageInput');
            const message = input.value.trim();
            
            if (!message) return;
            
            addMessage(message, true);
            input.value = '';
            setLoading(true);
            
            try {
                const response = await fetch('/api/ask', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ question: message })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    addMessage(data.response);
                } else {
                    addMessage(`❌ Error: ${data.error}`);
                }
            } catch (error) {
                addMessage(`❌ Network Error: ${error.message}`);
            }
            
            setLoading(false);
        }
        
        async function quickAction(question) {
            addMessage(question, true);
            setLoading(true);
            
            try {
                const response = await fetch('/api/ask', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ question: question })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    addMessage(data.response);
                } else {
                    addMessage(`❌ Error: ${data.error}`);
                }
            } catch (error) {
                addMessage(`❌ Network Error: ${error.message}`);
            }
            
            setLoading(false);
        }
        
        async function searchProject() {
            const input = document.getElementById('projectInput');
            const projectName = input.value.trim();
            const resultDiv = document.getElementById('projectResult');
            
            if (!projectName) {
                resultDiv.textContent = 'Please enter a project name to search.';
                return;
            }
            
            resultDiv.textContent = 'Searching...';
            
            try {
                const response = await fetch('/api/ask', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ question: `Tell me detailed information about the project: ${projectName}` })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    resultDiv.textContent = data.response;
                } else {
                    resultDiv.textContent = `❌ Error: ${data.error}`;
                }
            } catch (error) {
                resultDiv.textContent = `❌ Network Error: ${error.message}`;
            }
        }
        
        function clearChat() {
            const messagesContainer = document.getElementById('chatMessages');
            messagesContainer.innerHTML = `
                <div class="message bot-message">
                    <div class="message-content">
                        👋 Welcome! I'm Abhishek Ambi's AI assistant.<br><br>
                        I can help you with:<br>
                        • Information about Abhishek's background and education<br>
                        • Details about his projects and technical skills<br>
                        • Career advice and recommendations<br>
                        • Contact and networking information<br><br>
                        Feel free to ask me anything or use the quick action buttons!
                    </div>
                </div>
            `;
        }
        
        // Enter key to send message
        document.addEventListener('DOMContentLoaded', function() {
            const input = document.getElementById('messageInput');
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });
        });
    </script>
</body>
</html>
"""

# Routes

@app.route('/')
def home():
    """Main web interface"""
    return render_template_string(HTML_TEMPLATE)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "message": "Abhishek Ambi's Portfolio Chatbot API is running",
        "chatbot_initialized": chatbot is not None
    }), 200

@app.route('/api/ask', methods=['POST'])
def api_ask():
    """Main chat endpoint"""
    try:
        if not chatbot:
            return jsonify({
                "error": "Chatbot not initialized. Please check your API key configuration.",
                "success": False
            }), 500
        
        data = request.get_json()
        
        if not data or 'question' not in data:
            return jsonify({
                "error": "Missing 'question' field in request body",
                "success": False
            }), 400
        
        question = data['question'].strip()
        
        if not question:
            return jsonify({
                "error": "Question cannot be empty",
                "success": False
            }), 400
        
        # Get response from chatbot
        response = chatbot.ask(question)
        
        return jsonify({
            "question": question,
            "response": response,
            "success": True,
            "model_status": chatbot.get_model_status() if hasattr(chatbot, 'get_model_status') else "Model info not available"
        }), 200
        
    except Exception as e:
        return jsonify({
            "error": f"Internal server error: {str(e)}",
            "success": False
        }), 500

@app.route('/api/projects', methods=['GET'])
def api_list_projects():
    """Get all projects"""
    try:
        if not chatbot:
            return jsonify({
                "error": "Chatbot not initialized",
                "success": False
            }), 500
        
        projects = chatbot.list_projects()
        
        return jsonify({
            "projects": projects,
            "success": True
        }), 200
        
    except Exception as e:
        return jsonify({
            "error": f"Error fetching projects: {str(e)}",
            "success": False
        }), 500

@app.route('/api/projects/<project_name>', methods=['GET'])
def api_get_project(project_name):
    """Get specific project information"""
    try:
        if not chatbot:
            return jsonify({
                "error": "Chatbot not initialized",
                "success": False
            }), 500
        
        project_info = chatbot.get_project_info(project_name)
        
        return jsonify({
            "project_name": project_name,
            "project_info": project_info,
            "success": True
        }), 200
        
    except Exception as e:
        return jsonify({
            "error": f"Error fetching project info: {str(e)}",
            "success": False
        }), 500

@app.route('/api/skills', methods=['GET'])
def api_get_skills():
    """Get technical skills summary"""
    try:
        if not chatbot:
            return jsonify({
                "error": "Chatbot not initialized",
                "success": False
            }), 500
        
        skills = chatbot.get_skills_summary()
        
        return jsonify({
            "skills": skills,
            "success": True
        }), 200
        
    except Exception as e:
        return jsonify({
            "error": f"Error fetching skills: {str(e)}",
            "success": False
        }), 500

@app.route('/api/background', methods=['GET'])
def api_get_background():
    """Get background information"""
    try:
        if not chatbot:
            return jsonify({
                "error": "Chatbot not initialized",
                "success": False
            }), 500
        
        background = chatbot.get_background_info()
        
        return jsonify({
            "background": background,
            "success": True
        }), 200
        
    except Exception as e:
        return jsonify({
            "error": f"Error fetching background: {str(e)}",
            "success": False
        }), 500

@app.route('/api/career-advice', methods=['GET'])
def api_get_career_advice():
    """Get career advice"""
    try:
        if not chatbot:
            return jsonify({
                "error": "Chatbot not initialized",
                "success": False
            }), 500
        
        advice = chatbot.get_career_advice()
        
        return jsonify({
            "career_advice": advice,
            "success": True
        }), 200
        
    except Exception as e:
        return jsonify({
            "error": f"Error fetching career advice: {str(e)}",
            "success": False
        }), 500

@app.route('/api/contact', methods=['GET'])
def api_get_contact():
    """Get contact information"""
    try:
        if not chatbot:
            return jsonify({
                "error": "Chatbot not initialized",
                "success": False
            }), 500
        
        contact = chatbot.get_contact_info()
        
        return jsonify({
            "contact": contact,
            "success": True
        }), 200
        
    except Exception as e:
        return jsonify({
            "error": f"Error fetching contact info: {str(e)}",
            "success": False
        }), 500

@app.route('/api/status', methods=['GET'])
def api_get_status():
    """Get model status"""
    try:
        if not chatbot:
            return jsonify({
                "error": "Chatbot not initialized",
                "success": False
            }), 500
        
        status = chatbot.get_model_status()
        
        return jsonify({
            "model_status": status,
            "success": True
        }), 200
        
    except Exception as e:
        return jsonify({
            "error": f"Error fetching status: {str(e)}",
            "success": False
        }), 500

@app.route('/api/switch-model', methods=['POST'])
def api_switch_model():
    """Force switch back to original model"""
    try:
        if not chatbot:
            return jsonify({
                "error": "Chatbot not initialized",
                "success": False
            }), 500
        
        result = chatbot.force_switch_back()
        
        return jsonify({
            "switch_result": result,
            "success": True
        }), 200
        
    except Exception as e:
        return jsonify({
            "error": f"Error switching model: {str(e)}",
            "success": False
        }), 500

@app.route('/api/docs', methods=['GET'])
def api_docs():
    """API documentation"""
    docs = {
        "title": "Abhishek Ambi's Portfolio Chatbot API",
        "version": "1.0.0",
        "description": "RESTful API for interacting with Abhishek Ambi's portfolio chatbot",
        "base_url": request.host_url + "api",
        "cors": "Enabled for all origins. Contact admin for specific origin restrictions.",
        "endpoints": {
            "health": {
                "method": "GET",
                "url": "/api/health",
                "description": "Health check endpoint"
            },
            "ask": {
                "method": "POST",
                "url": "/api/ask",
                "description": "Ask a question to the chatbot",
                "body": {
                    "question": "Your question here"
                }
            },
            "projects": {
                "method": "GET",
                "url": "/api/projects",
                "description": "Get all projects"
            },
            "specific_project": {
                "method": "GET",
                "url": "/api/projects/{project_name}",
                "description": "Get information about a specific project"
            },
            "skills": {
                "method": "GET",
                "url": "/api/skills",
                "description": "Get technical skills summary"
            },
            "background": {
                "method": "GET",
                "url": "/api/background",
                "description": "Get background information"
            },
            "career_advice": {
                "method": "GET",
                "url": "/api/career-advice",
                "description": "Get career advice"
            },
            "contact": {
                "method": "GET",
                "url": "/api/contact",
                "description": "Get contact information"
            },
            "status": {
                "method": "GET",
                "url": "/api/status",
                "description": "Get current model status"
            },
            "switch_model": {
                "method": "POST",
                "url": "/api/switch-model",
                "description": "Force switch back to original model"
            }
        },
        "example_usage": {
            "curl_ask": f"curl -X POST {request.host_url}api/ask -H \"Content-Type: application/json\" -d '{{\"question\": \"Tell me about Abhishek\"}}'",
            "curl_projects": f"curl -X GET {request.host_url}api/projects",
            "curl_skills": f"curl -X GET {request.host_url}api/skills"
        }
    }
    
    return jsonify(docs), 200

def main():
    """Main function to run the Flask application"""
    try:
        # Check if API key is available
        api_key = os.getenv('GROQ_API_KEY')
        if not api_key:
            print("⚠️  Warning: GROQ_API_KEY not found in environment variables")
            print("Please set your GROQ_API_KEY environment variable or create a .env file")
            print("The chatbot may not work without proper API configuration")
        
        # Initialize the chatbot
        if initialize_chatbot():
            print("🚀 Launching Abhishek Ambi's Portfolio Chatbot...")
            print("📱 Web Interface: http://localhost:7860")
            print("🔗 API Endpoints: http://localhost:7860/api/*")
            print("📚 API Documentation: http://localhost:7860/api/docs")
            print("🔑 Make sure your GROQ_API_KEY is properly configured")
            
            # Run the Flask app
            app.run(
                host="0.0.0.0",
                port=7860,
                debug=False,
                threaded=True
            )
        else:
            print("❌ Failed to initialize chatbot. Please check your configuration.")
        
    except Exception as e:
        print(f"❌ Error launching the application: {e}")
        print("Please check your configuration and try again")

if __name__ == "__main__":

    main()

