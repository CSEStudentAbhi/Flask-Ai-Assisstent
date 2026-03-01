const { ChatGroq } = require("@langchain/groq");
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { PromptTemplate } = require("@langchain/core/prompts");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

class PortfolioChatbot {
  /**
   * Initialize the portfolio chatbot.
   *
   * @param {Object} options
   * @param {string} [options.apiKey] Groq API key (defaults to GROQ_API_KEY env var)
   * @param {string} [options.model] LLM model to use
   * @param {boolean} [options.debug] Enable debug mode
   */
  constructor({
    apiKey = process.env.GROQ_API_KEY,
    model = "llama-3.3-70b-versatile",
    debug = false,
  } = {}) {
    this.apiKey = apiKey;
    this.geminiApiKey = process.env.GEMINI_API_KEY;

    if (!this.apiKey) {
      console.warn("⚠️ GROQ_API_KEY not found. Attempting to use GEMINI_API_KEY if available.");
    }

    this.originalModel = model;
    this.currentModel = model;
    this.provider = "groq";

    // Initialize LLM
    if (this.apiKey) {
      this.llm = new ChatGroq({
        model: model,
        apiKey: this.apiKey,
        maxRetries: 0,
      });
    } else if (this.geminiApiKey) {
      this._switchToGemini();
    } else {
      throw new Error("No valid API keys found. Please set GROQ_API_KEY or GEMINI_API_KEY.");
    }

    // Model switching variables
    this.modelSwitchTime = null;
    this.switchDuration = 1800 * 1000; // 30 minutes in milliseconds

    this._setupChain();
  }

  _setupChain() {
    this.promptTemplate = PromptTemplate.fromTemplate(this._getPromptTemplate());
    this.chain = this.promptTemplate.pipe(this.llm).pipe(new StringOutputParser());
  }

  _getPromptTemplate() {
    return `system_prompt:
I am Abhishek Ambi's AI assistant, designed to provide accurate, clear, and contextual answers about his portfolio and career. 

RESPONSE GUIDELINES:
• Always provide responses in clear, organized bullet points
• Use numbered lists for sequential information
• Structure information logically with headers
• Be concise but comprehensive
• If asked about something not in my knowledge base, acknowledge it and provide related information
• For unknown facts, say "I don't have specific information about [topic], but based on Abhishek's background, I can tell you..."

My primary objectives are to:
• Provide detailed information about Abhishek's projects and technical skills
• Offer career advice based on his expertise and experience
• Answer questions about his full-stack development capabilities
• Assist with portfolio-related inquiries
• Share information about his background, education, and professional journey
• Handle unknown topics gracefully by providing related context

ABOUT ABHISHEK:
Final year computer science student with practical experience in software development, data analysis, machine learning and computer vision through academic projects. Interested in using code and insights to solve real-world problems. Seeking to join a forward-thinking organization that supports innovation, mentorship, and lifelong learning while gaining worthwhile industry experience.
knowledge_prompt:
PERSONAL BACKGROUND:
Abhishek Gangappa Ambi is a final year computer science student with practical experience in software development, data analysis, machine learning and computer vision through academic projects. He is passionate about creating innovative digital solutions and combines technical expertise with creative problem-solving to deliver exceptional user experiences.

**Personal Journey**:
- Born and raised in Mahalingpur, Karnataka
- Date of birth 15/06/2003
- Gender Male
- Satus Single
- Started educational journey at Jaycee English Medium School
- Completed SSLC in 2020 with 64% marks
- Pursued Diploma in Computer Science (2020-2023) with excellent performance (9.83 CGPA)
- Currently pursuing BE in Computer Science with strong academic record (8.26 CGPA)
- Passionate about technology and continuous learning

**Personal Traits**:
- Dedicated and hardworking individual
- Strong problem-solving mindset
- Enjoys learning new technologies
- Team player with good communication skills
- Detail-oriented and quality-focused
- Self-motivated and goal-driven

EDUCATION:
1. RV INSTITUTE OF TECHNOLOGY AND MANAGEMENT BENGALURU
   - BE in Computer Science & Engineering
   - CGPA: 8.26
   - Duration: 2023 - 2026

2. K.L.E.SOCIETY'S POLYTECHNIC MAHALINGAPUR
   - Diploma in Computer Science & Engineering
   - CGPA: 9.83
   - Duration: 2020 - 2023

3. JAYCEE ENGLISH MEDIUM SCHOOL MAHALINGPUR
   - SSLC (10th Standard)
   - Percentage: 64%
   - Passout Year: 2020
   - Location: Mahalingpur, Karnataka

CERTIFICATIONS & ACTIVITIES:
- Continuous learning through online courses and certifications
- Active participation in coding communities and hackathons
- Academic projects in machine learning and computer vision

PERSONAL INTERESTS & HOBBIES:
- **Coding & Programming**: Passionate about writing code, solving problems, and building applications
- **Reading**: Enjoys reading technical books, programming documentation, and educational content
- **Testing & Quality Assurance**: Interested in software testing, debugging, and ensuring code quality
- **Learning New Technologies**: Constantly exploring new programming languages, frameworks, and tools
- **Problem Solving**: Enjoys tackling complex technical challenges and finding innovative solutions
- **Open Source Contribution**: Interested in contributing to open-source projects and developer communities
- **Technical Writing**: Creating documentation, tutorials, and sharing knowledge with others
- **Algorithm Practice**: Regular practice of data structures and algorithms for skill improvement
- **Project Building**: Creating personal projects to apply and showcase technical skills
- **Networking**: Connecting with fellow developers and tech professionals

PROFESSIONAL EXPERIENCE:
- Full-stack development with focus on MERN stack
- Mobile app development using React Native and Android Studio
- Experience in both frontend and backend development
- Project management and client communication skills
- Academic projects in machine learning and computer vision
- Data analysis and insights generation

PROJECT PORTFOLIO:

1. Meeting House
   - Technology: MERN Stack (MongoDB, Express.js, React, Node.js)
   - Description: Developed an online meeting application with user authentication, 
     event management, and resource sharing for seamless collaboration.
   - Features: Real-time communication, user management, event scheduling, 
     virtual meeting rooms, participant management, meeting recording capabilities
   - Impact: Streamlined remote collaboration for teams and organizations

2. Shri Vagdevi Construction (Real Time Project)
   - Technology: MERN Stack (MongoDB, Express.js, React, Node.js)
   - Website: shrivagdeviconstructions.com
   - Description: A professional civil engineering and construction firm website dedicated to delivering high-quality residential and commercial projects with precision and reliability.
   - Features: Modern responsive design, project galleries, client testimonials, contact forms,
     content management system, smooth front-end and back-end interaction,
     service booking, project portfolio, team information, contact management
   - Impact: Professional online presence for construction business

3. Quick Eats
   - Technology: React Native, Express.js, MongoDB
   - Description: A hybrid app for a cloud kitchen designed to manage both online delivery and walk-in/takeaway services.
   - Features: User authentication, order management, payment integration,
     real-time order tracking, restaurant listings, menu management, delivery scheduling
   - Impact: Complete food delivery solution for restaurants and customers

4. Plant Disease Detection
   - Technology: Machine Learning, Android, VSCode, React Native/Flutter
   - Description: Building a plant disease detection system using machine learning and mobile technologies.
   - Features: Image processing, disease classification, mobile interface, real-time detection
   - Impact: Agricultural technology solution for farmers and gardeners

5. Object Detection
   - Technology: YOLOv5, Python, Computer Vision
   - Description: YOLOv5 (You Only Look Once version 5) is a powerful real-time object detection model known for its speed and accuracy.
   - Features: Real-time object detection, high accuracy, fast processing, multiple object classes
   - Impact: Computer vision applications in various domains

6. Path Finder
   - Technology: React
   - Description: Created a web application to visualize pathfinding algorithms
   - Features: Dijkstra's, DFS, BFS, A* algorithms visualization for finding shortest paths,
     interactive grid system, algorithm comparison, step-by-step visualization
   - Impact: Educational tool for understanding algorithm concepts

7. Todo List
   - Technology: Java
   - Description: Created a Java application for managing tasks
   - Features: Straightforward interface to boost productivity, task categorization,
     priority levels, due date management, progress tracking
   - Impact: Simple yet effective task management solution

8. C-Tutor
   - Technology: Augmented Reality (AR), Mobile Development
   - Description: Augmented Reality (AR) application transforming education by creating immersive and interactive learning experiences that engage students and enhance comprehension.
   - Features: AR visualization, interactive learning modules, educational content
   - Impact: Enhanced educational experience through immersive technology

9. Online Medicine Store
   - Technology: React, Node.js, MongoDB
   - Description: Designed a web application for online medicine purchasing
   - Features: Simple cart system, product management, secure transactions,
     prescription upload, medicine search, inventory management, delivery tracking
   - Impact: Healthcare accessibility through digital platform

TECHNICAL SKILLS:

Programming Languages:
- Python (Data Analysis, Machine Learning, Computer Vision)
- Java (Core & Advanced, Android Development)
- JavaScript (ES6+, Frontend & Backend)
- C++ (System Programming)
- PHP (Web Development)

Frontend Technologies:
- React.js (Advanced)
- React Native (Mobile Development)
- Angular (Frontend Framework)
- HTML5, CSS3
- Bootstrap (CSS Framework)
- Tailwind CSS (Utility-first CSS)

Backend Technologies:
- Node.js (Advanced)
- Express.js (RESTful APIs)
- API Development & Integration

Database & Storage:
- MongoDB (NoSQL)
- MySQL (Relational Database)
- Database Design & Optimization
- Data Modeling

Mobile Development:
- Android Studio
- Java for Android
- React Native
- Flutter (Cross-platform)
- Mobile App Architecture

Machine Learning & AI:
- YOLOv5 (Object Detection)
- Computer Vision
- Data Analysis
- Machine Learning Algorithms

Development Tools & Practices:
- Git & GitHub (Version Control)
- VS Code, Eclipse, Postman
- RESTful API Design
- Agile Development Methodology
- Code Review & Testing

Design & Creative Tools:
- Canva (Graphic Design)
- Photoshop (Image Editing)
- Blender (3D Modeling)
- After Effects (Video Editing)

CAREER FOCUS AREAS:
- Full-Stack Web Development
- Mobile App Development
- API Development
- Database Design
- Machine Learning & Computer Vision
- Data Analysis & Insights
- User Experience Optimization
- Performance Optimization
- Security Implementation
- Augmented Reality (AR) Development

PROFESSIONAL VALUES:
- Clean, maintainable code
- User-centered design
- Performance optimization
- Security best practices
- Continuous learning
- Problem-solving approach
- Team collaboration

CONTACT & NETWORKING:
- Portfolio Website: https://www.abhishekambi.info/
- Email: abhishekambi2003@gmail.com
- LinkedIn: linkedin.com/in/abhishekambi2003
- GitHub: github.com/CSEStudentAbhi
- Professional networking through LinkedIn and GitHub
- Active participation in developer communities
- Open to collaboration and new opportunities

User Query: "{user_input}"

Answer:
`;
  }

  _switchToGemini() {
    if (!this.geminiApiKey) {
      console.error("❌ Cannot switch to Gemini: GEMINI_API_KEY not found.");
      return false;
    }

    try {
      console.log("🔄 Switching to Gemini model (gemini-2.5-flash)...");
      this.currentModel = "gemini-2.5-flash";
      this.provider = "google";
      this.llm = new ChatGoogleGenerativeAI({
        model: this.currentModel,
        apiKey: this.geminiApiKey,
        maxRetries: 0,
      });
      this._setupChain();
      console.log(`✅ Switched to defined Gemini model: ${this.currentModel}`);
      return true;
    } catch (e) {
      console.error(`❌ Error switching to Gemini: ${e.message}`);
      return false;
    }
  }

  _switchModel(newModel) {
    try {
      this.currentModel = newModel;
      this.provider = "groq";
      this.llm = new ChatGroq({
        model: newModel,
        apiKey: this.apiKey,
        maxRetries: 0,
      });
      this._setupChain();
      console.log(`🔄 Switched to model: ${newModel}`);
    } catch (e) {
      console.error(`❌ Error switching model: ${e.message}`);
    }
  }

  _checkAndSwitchBack() {
    if (
      this.modelSwitchTime &&
      Date.now() - this.modelSwitchTime >= this.switchDuration &&
      this.currentModel !== this.originalModel
    ) {
      this.currentModel = this.originalModel;
      this.provider = "groq";
      this.llm = new ChatGroq({
        model: this.originalModel,
        apiKey: this.apiKey,
        maxRetries: 0,
      });
      this._setupChain();
      this.modelSwitchTime = null;
      console.log(`🔄 Switched back to original model: ${this.originalModel}`);
    }
  }

  async ask(question) {
    this._checkAndSwitchBack();

    try {
      const result = await this.chain.invoke({ user_input: question });
      return result.trim();
    } catch (e) {
      const errorStr = e.message ? e.message.toLowerCase() : String(e).toLowerCase();
      console.warn(`⚠️ Error encountered: ${e.message}`);

      const isRateLimit =
        errorStr.includes("rate limit") ||
        errorStr.includes("429") ||
        errorStr.includes("tpd") ||
        errorStr.includes("resource exhausted");

      if (isRateLimit) {
        console.warn("⚠️ Rate limit or resource exhaustion detected.");

        if (this.provider === "groq") {
          console.warn("⚠️ Groq limit hit. Attempting fallback to Gemini...");
          if (this._switchToGemini()) {
            this.modelSwitchTime = Date.now();
            try {
              const result = await this.chain.invoke({ user_input: question });
              return result.trim();
            } catch (retryError) {
              return `Sorry, I encountered an error even with Gemini: ${retryError.message}`;
            }
          }
        }
      }

      return `Sorry, I encountered an error: ${e.message}`;
    }
  }

  async getProjectInfo(projectName) {
    const question = `Tell me detailed information about the project: ${projectName}`;
    return this.ask(question);
  }

  async listProjects() {
    return this.ask("List all my projects with their technologies");
  }

  async getTechRecommendation() {
    return this.ask("Based on my portfolio, which technologies should I focus on for career growth?");
  }

  async getSkillsSummary() {
    return this.ask("Summarize my technical skills based on my projects");
  }

  async getBackgroundInfo() {
    return this.ask("Tell me about Abhishek's background, education, and professional journey");
  }

  async getCareerAdvice() {
    return this.ask("Based on my portfolio and experience, what career advice would you give me?");
  }

  async getContactInfo() {
    return this.ask("How can someone contact Abhishek or learn more about his work?");
  }

  async getProjectRecommendations() {
    return this.ask("Based on my current portfolio, what types of projects should I consider working on next?");
  }

  getModelStatus() {
    let status = `Current Model: ${this.currentModel}\nOriginal Model: ${this.originalModel}\n`;

    if (this.modelSwitchTime) {
      const elapsed = (Date.now() - this.modelSwitchTime) / 1000;
      const remaining = this.switchDuration / 1000 - elapsed;
      if (remaining > 0) {
        status += `Switched ${elapsed.toFixed(0)}s ago, ${remaining.toFixed(0)}s remaining before switch back`;
      } else {
        status += "Ready to switch back to original model";
      }
    } else {
      status += "No model switch in progress";
    }

    return status;
  }

  forceSwitchBack() {
    if (this.currentModel !== this.originalModel) {
      this._switchModel(this.originalModel);
      this.modelSwitchTime = null;
      return `✅ Forced switch back to ${this.originalModel}`;
    } else {
      return `ℹ️ Already using original model: ${this.originalModel}`;
    }
  }
}

module.exports = { PortfolioChatbot };
