const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PortfolioChatbot } = require('./portfolioChatbot');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 7860;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Global chatbot instance
let chatbot = null;

function initializeChatbot() {
    try {
        chatbot = new PortfolioChatbot({ debug: false });
        console.log('✅ Portfolio Chatbot initialized successfully!');
        return true;
    } catch (error) {
        console.error(`❌ Error initializing chatbot: ${error.message}`);
        chatbot = null;
        return false;
    }
}

// HTML Template for the web interface
const HTML_TEMPLATE = `
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
            word-wrap: break-word;
        }
        
        .bot-message .message-content {
            background: white;
            border: 1px solid #e9ecef;
            padding: 12px 18px;
            border-radius: 18px 18px 18px 5px;
            max-width: 85%;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            word-wrap: break-word;
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
            messageDiv.className = \`message \${isUser ? 'user-message' : 'bot-message'}\`;
            
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
                    addMessage(\`❌ Error: \${data.error}\`);
                }
            } catch (error) {
                addMessage(\`❌ Network Error: \${error.message}\`);
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
                    addMessage(\`❌ Error: \${data.error}\`);
                }
            } catch (error) {
                addMessage(\`❌ Network Error: \${error.message}\`);
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
                    body: JSON.stringify({ question: \`Tell me detailed information about the project: \${projectName}\` })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    resultDiv.textContent = data.response;
                } else {
                    resultDiv.textContent = \`❌ Error: \${data.error}\`;
                }
            } catch (error) {
                resultDiv.textContent = \`❌ Network Error: \${error.message}\`;
            }
        }
        
        function clearChat() {
            const messagesContainer = document.getElementById('chatMessages');
            messagesContainer.innerHTML = \`
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
            \`;
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
`;

// Routes

app.get('/', (req, res) => {
    res.send(HTML_TEMPLATE);
});

app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        message: "Abhishek Ambi's Portfolio Chatbot API is running",
        chatbot_initialized: chatbot !== null,
    });
});

app.post('/api/ask', async (req, res) => {
    try {
        if (!chatbot) {
            return res.status(500).json({
                error: 'Chatbot not initialized. Please check your API key configuration.',
                success: false,
            });
        }

        const { question } = req.body;

        if (!question || typeof question !== 'string') {
            return res.status(400).json({
                error: "Missing or invalid 'question' field in request body",
                success: false,
            });
        }

        const trimmedQuestion = question.trim();

        if (!trimmedQuestion) {
            return res.status(400).json({
                error: 'Question cannot be empty',
                success: false,
            });
        }

        // Get response from chatbot
        const response = await chatbot.ask(trimmedQuestion);

        res.status(200).json({
            question: trimmedQuestion,
            response: response,
            success: true,
            model_status: chatbot.getModelStatus ? chatbot.getModelStatus() : 'Model info not available',
        });
    } catch (error) {
        res.status(500).json({
            error: `Internal server error: ${error.message}`,
            success: false,
        });
    }
});

app.get('/api/projects', async (req, res) => {
    try {
        if (!chatbot) return res.status(500).json({ error: 'Chatbot not initialized', success: false });
        const projects = await chatbot.listProjects();
        res.status(200).json({ projects, success: true });
    } catch (error) {
        res.status(500).json({ error: `Error fetching projects: ${error.message}`, success: false });
    }
});

app.get('/api/projects/:project_name', async (req, res) => {
    try {
        if (!chatbot) return res.status(500).json({ error: 'Chatbot not initialized', success: false });
        const projectName = req.params.project_name;
        const projectInfo = await chatbot.getProjectInfo(projectName);
        res.status(200).json({ project_name: projectName, project_info: projectInfo, success: true });
    } catch (error) {
        res.status(500).json({ error: `Error fetching project info: ${error.message}`, success: false });
    }
});

app.get('/api/skills', async (req, res) => {
    try {
        if (!chatbot) return res.status(500).json({ error: 'Chatbot not initialized', success: false });
        const skills = await chatbot.getSkillsSummary();
        res.status(200).json({ skills, success: true });
    } catch (error) {
        res.status(500).json({ error: `Error fetching skills: ${error.message}`, success: false });
    }
});

app.get('/api/background', async (req, res) => {
    try {
        if (!chatbot) return res.status(500).json({ error: 'Chatbot not initialized', success: false });
        const background = await chatbot.getBackgroundInfo();
        res.status(200).json({ background, success: true });
    } catch (error) {
        res.status(500).json({ error: `Error fetching background: ${error.message}`, success: false });
    }
});

app.get('/api/career-advice', async (req, res) => {
    try {
        if (!chatbot) return res.status(500).json({ error: 'Chatbot not initialized', success: false });
        const career_advice = await chatbot.getCareerAdvice();
        res.status(200).json({ career_advice, success: true });
    } catch (error) {
        res.status(500).json({ error: `Error fetching career advice: ${error.message}`, success: false });
    }
});

app.get('/api/contact', async (req, res) => {
    try {
        if (!chatbot) return res.status(500).json({ error: 'Chatbot not initialized', success: false });
        const contact = await chatbot.getContactInfo();
        res.status(200).json({ contact, success: true });
    } catch (error) {
        res.status(500).json({ error: `Error fetching contact info: ${error.message}`, success: false });
    }
});

app.get('/api/status', (req, res) => {
    try {
        if (!chatbot) return res.status(500).json({ error: 'Chatbot not initialized', success: false });
        const model_status = chatbot.getModelStatus();
        res.status(200).json({ model_status, success: true });
    } catch (error) {
        res.status(500).json({ error: `Error fetching status: ${error.message}`, success: false });
    }
});

app.post('/api/switch-model', (req, res) => {
    try {
        if (!chatbot) return res.status(500).json({ error: 'Chatbot not initialized', success: false });
        const switch_result = chatbot.forceSwitchBack();
        res.status(200).json({ switch_result, success: true });
    } catch (error) {
        res.status(500).json({ error: `Error switching model: ${error.message}`, success: false });
    }
});

app.get('/api/docs', (req, res) => {
    const hostUrl = `${req.protocol}://${req.get('host')}/`;
    const docs = {
        title: "Abhishek Ambi's Portfolio Chatbot API",
        version: "1.0.0",
        description: "RESTful API for interacting with Abhishek Ambi's portfolio chatbot",
        base_url: hostUrl + "api",
        cors: "Enabled for all origins. Contact admin for specific origin restrictions.",
        endpoints: {
            health: {
                method: "GET",
                url: "/api/health",
                description: "Health check endpoint"
            },
            ask: {
                method: "POST",
                url: "/api/ask",
                description: "Ask a question to the chatbot",
                body: {
                    question: "Your question here"
                }
            },
            projects: {
                method: "GET",
                url: "/api/projects",
                description: "Get all projects"
            },
            specific_project: {
                method: "GET",
                url: "/api/projects/{project_name}",
                description: "Get information about a specific project"
            },
            skills: {
                method: "GET",
                url: "/api/skills",
                description: "Get technical skills summary"
            },
            background: {
                method: "GET",
                url: "/api/background",
                description: "Get background information"
            },
            career_advice: {
                method: "GET",
                url: "/api/career-advice",
                description: "Get career advice"
            },
            contact: {
                method: "GET",
                url: "/api/contact",
                description: "Get contact information"
            },
            status: {
                method: "GET",
                url: "/api/status",
                description: "Get current model status"
            },
            switch_model: {
                method: "POST",
                url: "/api/switch-model",
                description: "Force switch back to original model"
            }
        },
        example_usage: {
            curl_ask: `curl -X POST ${hostUrl}api/ask -H "Content-Type: application/json" -d '{"question": "Tell me about Abhishek"}'`,
            curl_projects: `curl -X GET ${hostUrl}api/projects`,
            curl_skills: `curl -X GET ${hostUrl}api/skills`
        }
    };

    res.status(200).json(docs);
});

// Start server
function main() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        console.warn("⚠️  Warning: GROQ_API_KEY not found in environment variables");
        console.warn("Please set your GROQ_API_KEY environment variable or create a .env file");
        console.warn("The chatbot may not work without proper API configuration");
    }

    if (initializeChatbot()) {
        app.listen(PORT, () => {
            console.log("🚀 Launching Abhishek Ambi's Portfolio Chatbot...");
            console.log(`📱 Web Interface: http://localhost:${PORT}`);
            console.log(`🔗 API Endpoints: http://localhost:${PORT}/api/*`);
            console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
            console.log("🔑 Make sure your GROQ_API_KEY is properly configured");
        });
    } else {
        console.error("❌ Failed to initialize chatbot. Please check your configuration.");
    }
}

if (require.main === module) {
    main();
}
