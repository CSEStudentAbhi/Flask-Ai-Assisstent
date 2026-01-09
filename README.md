# 🤖 Abhishek Ambi's Portfolio Chatbot

A personalized AI assistant designed to showcase Abhishek Ambi's portfolio, skills, and projects. Built with **Flask**, **LangChain**, and **Groq/Google Gemini**.

## ✨ Features

- **Personalized Knowledge Base**: Answers questions about Abhishek's background, education, and projects (Meeting House, Quick Eats, etc.).
- **Smart Model Switching**: 
  - Uses **Groq (Llama 3.3 70B)** by default for high-speed responses.
  - Automatically falls back to **Google Gemini (2.5 Flash)** if rate limits are hit.
- **Interactive UI**: Clean, responsive web interface for chatting.
- **REST API**: Exposes endpoints for chat, project listing, and status checks.

## 🛠️ Technology Stack

- **Backend**: Python, Flask
- **AI/LLM**: LangChain, Groq API, Google Generative AI
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- API Keys for **Groq** and **Google Gemini**

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/CSEStudentAbhi/Flask-Ai-Assisstent.git
    cd Flask-Ai-Assisstent
    ```

2.  **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

3.  **Configure Environment Variables**:
    Create a `.env` file in the root directory:
    ```ini
    GROQ_API_KEY=your_groq_api_key_here
    GEMINI_API_KEY=your_gemini_api_key_here
    ```

### Running the Application

Start the Flask server:

```bash
python app.py
```

The application will be available at:
- **Web Interface**: `http://localhost:7860`
- **API Docs**: `http://localhost:7860/api/docs`

## 📁 Project Structure

- `app.py`: Main Flask application and server configuration.
- `portfolio_chatbot.py`: Core chatbot logic, LangChain integration, and prompt engineering.
- `requirements.txt`: Python dependencies.
- `.env`: Environment variables (API keys).

## ⚠️ Notes

- **Secrets Management**: Ensure `.env` is added to `.gitignore` to prevent leaking API keys.
- **Rate Limits**: The application handles Groq rate limits automatically by switchingproviders.

## 📄 License

This project is for portfolio demonstration purposes.
