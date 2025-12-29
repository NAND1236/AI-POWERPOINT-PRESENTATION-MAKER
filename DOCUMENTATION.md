# AI Presentation Maker - Project Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Architecture Flow](#architecture-flow)
5. [API Endpoints](#api-endpoints)
6. [Database Models](#database-models)
7. [Frontend Components](#frontend-components)
8. [Features](#features)
9. [Setup & Installation](#setup--installation)
10. [Environment Variables](#environment-variables)

---

## 🎯 Project Overview

**AI Presentation Maker** is a full-stack web application that automatically generates professional PowerPoint presentations using AI. Users can create presentations from multiple input sources:

- **Text Input** - Paste any text content
- **PDF Upload** - Extract content from PDF files
- **URL Scraping** - Generate from web page content
- **Topic Generation** - Create from keywords/topics

The AI analyzes the content and generates structured, comprehensive slides that can be previewed, edited, and exported as `.pptx` files.

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| HTML5 | Structure |
| CSS3 | Styling with modern gradients & animations |
| Vanilla JavaScript | Interactivity & API calls |
| Font Awesome | Icons |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime environment |
| Express.js | Web framework |
| MongoDB | Database |
| Mongoose | ODM for MongoDB |
| JWT | Authentication |
| bcrypt | Password hashing |
| PptxGenJS | PowerPoint generation |
| Multer | File upload handling |
| Cheerio | Web scraping |
| pdf-parse | PDF text extraction |

### AI Integration
| Service | Purpose |
|---------|---------|
| OpenRouter API | AI model access (GPT-4, Claude, etc.) |

---

## 📁 Project Structure

```
aippt/
├── index.html              # Main frontend file (Single Page Application)
├── api.js                  # Frontend API integration module
├── DOCUMENTATION.md        # This file
│
└── backend/
    ├── server.js           # Server entry point
    ├── app.js              # Express app configuration
    ├── package.json        # Dependencies
    │
    ├── config/
    │   ├── ai.js           # AI/OpenRouter configuration & prompts
    │   └── db.js           # MongoDB connection
    │
    ├── controllers/
    │   ├── authController.js      # Authentication logic
    │   └── generateController.js  # Presentation generation logic
    │
    ├── middleware/
    │   ├── authMiddleware.js      # JWT verification
    │   └── errorMiddleware.js     # Error handling
    │
    ├── models/
    │   ├── User.js               # User schema
    │   └── Presentation.js       # Presentation schema
    │
    ├── routes/
    │   ├── authRoutes.js         # Auth endpoints
    │   └── generateRoutes.js     # Generation endpoints
    │
    └── utils/
        ├── pdfHandler.js         # PDF processing
        ├── urlHandler.js         # URL scraping
        └── pptxExport.js         # PowerPoint export
```

---

## 🔄 Architecture Flow

### High-Level Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (index.html)                     │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐            │
│  │  Text   │  │   PDF   │  │   URL   │  │  Topic  │            │
│  │  Input  │  │ Upload  │  │  Input  │  │  Input  │            │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘            │
│       │            │            │            │                   │
│       └────────────┴────────────┴────────────┘                   │
│                          │                                       │
│                    ┌─────▼─────┐                                │
│                    │  api.js   │  (API Integration Module)       │
│                    └─────┬─────┘                                │
└──────────────────────────┼──────────────────────────────────────┘
                           │ HTTP Requests
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND (Express.js)                         │
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │    Routes    │───▶│  Middleware  │───▶│ Controllers  │      │
│  │ (Endpoints)  │    │ (Auth/Error) │    │   (Logic)    │      │
│  └──────────────┘    └──────────────┘    └──────┬───────┘      │
│                                                  │               │
│         ┌────────────────────┬──────────────────┤               │
│         ▼                    ▼                  ▼               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │    Utils     │    │   MongoDB    │    │  OpenRouter  │      │
│  │ (PDF/URL/PPT)│    │  (Database)  │    │    (AI)      │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

### Detailed Flow: Text to Presentation

```
1. User Input
   └── User enters text in the text input section

2. Frontend Processing
   └── api.js: generateFromTextAPI() sends POST to /api/generate/text

3. Backend Processing
   ├── Route: generateRoutes.js receives request
   ├── Middleware: authMiddleware.js verifies JWT token
   ├── Controller: generateController.js processes request
   │   ├── Validates input (min 50 chars, max 50,000)
   │   └── Calls AI service
   └── AI Config: ai.js sends prompt to OpenRouter API

4. AI Generation
   ├── OpenRouter API receives content + system prompt
   ├── AI generates structured JSON with slides
   └── Returns presentation data

5. Data Storage
   ├── Presentation saved to MongoDB
   └── User's presentations array updated

6. Response
   └── JSON response with title and slides sent to frontend

7. Frontend Display
   ├── api.js receives response
   ├── Slides rendered in preview section
   └── User can edit and customize

8. Export (Optional)
   ├── User clicks Export button
   ├── exportToPowerPoint() sends data to /api/generate/export
   ├── pptxExport.js generates .pptx file
   └── File downloaded to user's device
```

---

## 🔌 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/signup` | Register new user | No |
| POST | `/login` | Login user | No |
| GET | `/me` | Get current user profile | Yes |

#### Request/Response Examples

**Signup**
```json
// POST /api/auth/signup
// Request
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

// Response
{
  "success": true,
  "data": {
    "user": { "id": "...", "name": "John Doe", "email": "john@example.com" },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Login**
```json
// POST /api/auth/login
// Request
{
  "email": "john@example.com",
  "password": "password123"
}

// Response
{
  "success": true,
  "data": {
    "user": { "id": "...", "name": "John Doe", "email": "john@example.com" },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### Generation Routes (`/api/generate`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/text` | Generate from text | Yes |
| POST | `/pdf` | Generate from PDF | Yes |
| POST | `/url` | Generate from URL | Yes |
| POST | `/topic` | Generate from topic | Yes |
| GET | `/presentations` | Get user's presentations | Yes |
| GET | `/presentations/:id` | Get single presentation | Yes |
| DELETE | `/presentations/:id` | Delete presentation | Yes |
| POST | `/export` | Export to PowerPoint | No |
| GET | `/themes` | Get available themes | No |

#### Request/Response Examples

**Generate from Text**
```json
// POST /api/generate/text
// Headers: Authorization: Bearer <token>
// Request
{
  "text": "Your content here (min 50 characters)...",
  "slideCount": 5
}

// Response
{
  "title": "Generated Presentation Title",
  "slides": [
    {
      "slideTitle": "Introduction",
      "points": [
        "First detailed point...",
        "Second detailed point...",
        "Third detailed point..."
      ]
    }
  ]
}
```

**Export to PowerPoint**
```json
// POST /api/generate/export
// Request
{
  "presentation": {
    "title": "My Presentation",
    "slides": [
      {
        "slideTitle": "Slide 1",
        "points": ["Point 1", "Point 2"]
      }
    ]
  },
  "theme": "professional"
}

// Response: Binary .pptx file download
```

---

## 🗄 Database Models

### User Model

```javascript
{
  name: String,           // Required, 2-50 chars
  email: String,          // Required, unique, valid email format
  password: String,       // Required, min 6 chars (hashed with bcrypt)
  presentations: [ObjectId],  // Array of Presentation references
  createdAt: Date,
  updatedAt: Date
}
```

### Presentation Model

```javascript
{
  title: String,          // Required, max 200 chars
  slides: [{
    slideTitle: String,   // Required
    points: [String]      // Array of bullet points
  }],
  sourceType: String,     // 'text' | 'pdf' | 'url' | 'topic'
  sourceContent: String,  // Original content (first 5000 chars)
  user: ObjectId,         // Reference to User
  aiEnhanced: Boolean,    // Default: true
  slideCount: Number,     // 1-20, default: 5
  metadata: {
    originalFileName: String,
    originalUrl: String,
    topic: String,
    generatedAt: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🎨 Frontend Components

### Pages

1. **Login Page** - User authentication
2. **Signup Page** - New user registration
3. **Dashboard** - Main workspace with input modes
4. **Editor Page** - Slide editing and customization
5. **Profile Section** - User stats and history

### Input Modes

| Mode | Description |
|------|-------------|
| Text Mode | Paste/type content directly |
| PDF Mode | Upload PDF files (drag & drop supported) |
| URL Mode | Enter webpage URL to scrape |
| Topic Mode | Enter topic + keywords for AI generation |

### Themes Available

| Theme Name | Description |
|------------|-------------|
| Cyber Purple | Modern purple gradient |
| Neon Tech | Dark with neon accents |
| Corporate Blue | Professional blue theme |
| Sunset Gradient | Warm orange/pink gradient |
| Dark Mode Pro | Dark background theme |
| Pastel Dream | Soft pastel colors |
| Ocean Wave | Blue ocean-inspired |
| Royal Gold | Elegant gold accents |
| Minimal White | Clean minimal design |
| Vibrant Education | Colorful educational theme |

---

## ✨ Features

### Core Features
- ✅ AI-powered slide generation
- ✅ Multiple input sources (Text, PDF, URL, Topic)
- ✅ User authentication with JWT
- ✅ Presentation history & management
- ✅ Real-time slide preview
- ✅ Inline slide editing
- ✅ PowerPoint (.pptx) export
- ✅ Multiple export themes
- ✅ Responsive design

### AI Features
- Smart content extraction
- Comprehensive bullet points (5-7 per slide)
- Structured JSON output
- Context-aware slide titles
- Statistics and facts inclusion

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js v16+
- MongoDB (local or Atlas)
- OpenRouter API key

### Installation Steps

```bash
# 1. Clone the repository
git clone <repository-url>
cd aippt

# 2. Install backend dependencies
cd backend
npm install

# 3. Create .env file
cp .env.example .env
# Edit .env with your credentials

# 4. Start the server
npm start
# or for development
npm run dev

# 5. Open frontend
# Open index.html in browser or use Live Server
```

---

## 🔐 Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/aippt

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# OpenRouter API (for AI generation)
OPENROUTER_API_KEY=sk-or-v1-your-api-key-here

# Frontend URL (for CORS in production)
FRONTEND_URL=http://localhost:5500
```

---

## 📊 Data Flow Summary

```
┌────────────────────────────────────────────────────────────────┐
│                         USER JOURNEY                            │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. SIGNUP/LOGIN                                               │
│     └── User creates account or logs in                        │
│         └── JWT token stored in localStorage                   │
│                                                                 │
│  2. SELECT INPUT MODE                                          │
│     └── Choose: Text | PDF | URL | Topic                       │
│                                                                 │
│  3. PROVIDE CONTENT                                            │
│     ├── Text: Paste content                                    │
│     ├── PDF: Upload file                                       │
│     ├── URL: Enter webpage URL                                 │
│     └── Topic: Enter topic + keywords                          │
│                                                                 │
│  4. GENERATE PRESENTATION                                      │
│     └── Click "Generate" button                                │
│         └── AI processes content                               │
│             └── Slides returned & displayed                    │
│                                                                 │
│  5. CUSTOMIZE (Optional)                                       │
│     ├── Select theme                                           │
│     ├── Select font                                            │
│     ├── Edit slide content                                     │
│     └── Add/remove slides                                      │
│                                                                 │
│  6. OPEN EDITOR (Optional)                                     │
│     └── Click "Open in Editor" for detailed editing            │
│                                                                 │
│  7. EXPORT                                                     │
│     └── Click "Export" button                                  │
│         └── Download .pptx file                                │
│                                                                 │
│  8. HISTORY                                                    │
│     └── View past presentations in profile                     │
│         └── Re-open or delete presentations                    │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| MongoDB connection failed | Check MONGODB_URI in .env |
| AI generation fails | Verify OPENROUTER_API_KEY |
| CORS errors | Add your frontend URL to corsOptions in app.js |
| Export not working | Ensure server is running on port 5000 |
| Login fails | Check if user exists, verify password |

---

## 📝 License

ISC License

---

## 👥 Contributors

AI Presentation Maker Team

---

*Last Updated: December 29, 2025*
