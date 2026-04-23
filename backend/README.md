# Clinical Trial Matching Agentic AI API

This is a Flask backend application with an agentic AI system that analyzes patient-trial matching using multiple specialized agents. The system simulates Google ADK (Agent Development Kit) style agent orchestration for clinical trial eligibility analysis.

## Features

- **Agentic AI Architecture**: Multi-agent system with 7 specialized agents (including reporting)
- **Clinical Trial Matching**: Automated patient-trial eligibility analysis
- **RESTful API**: Clean endpoints for frontend integration
- **Real-time Processing**: Fast analysis with processing time tracking

## Agent Architecture

The system uses 5 specialized agents that work together:

1. **Data Ingestion Agent** - Validates and ingests patient/trial data
2. **Medical Analysis Agent** - Analyzes medical conditions and lab values
3. **Trial Matching Agent** - Matches patients to eligible clinical trials
4. **Risk Assessment Agent** - Identifies potential risks and contraindications
5. **Recommendation Agent** - Generates clinical recommendations and next steps
6. **Report Agent** - Assembles final report JSON combining patient profile, matches, and explanations

## API Endpoints

### Health Check
```
GET /api/agent/health
```
Returns service status and available agents.

### Patient-Trial Analysis
```
POST /api/agent/analyze
```
Triggers the complete agentic AI analysis pipeline.

**Request Body (Patient Data Only):**
```json
{
  "patient_data": {
    "age": 45,
    "conditions": ["diabetes", "hypertension"],
    "medications": ["metformin"],
    "allergies": [],
    "lab_results": {"HbA1c": 7.2}
  }
}
```

**Response:**
```json
{
  "analysis_id": "analysis-a74960eb",
  "success": true,
  "results": {
    "web_scraping": {
      "trials": [...],
      "total_found": 5,
      "source": "ClinicalTrials.gov API"
    },
    "data_ingestion": {...},
    "medical_analysis": {...},
    "trial_matching": {...},
    "risk_assessment": {...},
    "recommendation": {...}
  },
  "processing_time_ms": 1500.0,
  "trials_found": 5,
  "timestamp": "2026-03-06T13:16:13.795887"
}
```

## Project Structure

```
backend/
├── app.py                  # Main Flask application
├── config.py               # Configuration management
├── routes.py               # API endpoints with agentic AI
├── requirements.txt        # Python dependencies
├── .env.example            # Environment variables template
└── README.md               # This file
```

## Setup Instructions

```bash
python -m venv venv
venv\Scripts\activate  # On Windows
# or
source venv/bin/activate  # On macOS/Linux
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Edit `.env` and add your Gemini API key:
```
SECRET_KEY=your_secret_key_here
```

### 4. Run the Application

```bash
flask run --debug
```

The server will start at `http://localhost:5000`

## API Endpoints

### Health Check
- **Endpoint:** `GET /api/agent/health`
- **Description:** Check if the AI agent is initialized and running

### Query Endpoint
- **Endpoint:** `POST /api/agent/query`
- **Request Body:**
  ```json
  {
    "query": "Your question or prompt here"
  }
  ```
- **Response:**
  ```json
  {
    "query": "Your question or prompt here",
    "response": "AI response",
    "status": "success"
  }
  ```

### Chat Endpoint
- **Endpoint:** `POST /api/agent/chat`
- **Request Body:**
  ```json
  {
    "message": "Your message here"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Your message here",
    "reply": "AI response",
    "status": "success"
  }
  ```

## Example Usage

```bash
# Health check
curl http://localhost:5000/api/agent/health

# Send a query
curl -X POST http://localhost:5000/api/agent/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What is 5 + 3?"}'

# Chat
curl -X POST http://localhost:5000/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, how are you?"}'
```

## Configuration

The application supports multiple environments via `config.py`:
- **development:** Debug mode enabled
- **production:** Debug mode disabled
- **testing:** Testing configuration

Set the environment using the `FLASK_ENV` variable in `.env`

## Key Features

- ✅ Flask REST API with CORS support
- ✅ LangChain integration for Agentic AI
- ✅ OpenAI GPT-4 support
- ✅ Error handling and validation
- ✅ Multi-environment configuration
- ✅ Extensible tool system for agents

## Adding Custom Tools

Edit `agent.py` and add tools to the `_setup_tools()` method:

```python
def _setup_tools(self):
    tools = [
        Tool(
            name="Your Tool Name",
            func=self._your_tool_function,
            description="Description of what this tool does"
        )
    ]
    return tools
```

## Troubleshooting

- **OPENAI_API_KEY not set:** Make sure your `.env` file has the correct API key
- **Module not found:** Run `pip install -r requirements.txt`
- **Port already in use:** Change the port in `app.py` or kill the process using port 5000

## License

This project is part of CodeCrusaders team.
