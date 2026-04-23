# TrailMatch Setup Guide

## Prerequisites
- Git
- Python 3.8+
- pip
- Virtual environment tools

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd TrailMatch
```

### 2. Navigate to Backend Directory
```bash
cd backend
```

### 3. Create Virtual Environment
```bash
python -m venv venv
```

### 4. Activate Virtual Environment

**On Windows:**
```bash
venv\Scripts\activate
```

### 5. Create Environment Variables File
Create a `.env` file in the `backend` directory with the required environment variables:


Create manually:
```
# Add your environment variables here
# Generate your Gemini api key from https://aistudio.google.com/app/api-keys

GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.5-flash

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=your_secret_key_here
```

### 6. Install Dependencies
```bash
pip install -r requirements.txt
```

### 7. Verify Installation
```bash
python app.py
```

Your backend is now ready to use!

---

## Frontend Setup

### Prerequisites
- Node.js 16+

### 1. Navigate to Frontend Directory
```bash
cd ../frontend
```

### 2. Install Dependencies

If using npm:
```bash
npm install
```

### 3. Run Development Server

If using npm:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

Your frontend is now ready to use!
