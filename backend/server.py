from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Dict, Any
import uuid
import json
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks


# Workflow Analysis Models
class WorkflowAnalysisRequest(BaseModel):
    workflow_description: str

class WorkflowAnalysisResponse(BaseModel):
    issues_risks: List[str]
    optimization_suggestions: List[str]
    cost_efficiency_insights: List[str]
    improved_workflow: List[str]
    complexity_analysis: str
    advanced_suggestions: List[str]


@api_router.post("/analyze-workflow", response_model=WorkflowAnalysisResponse)
async def analyze_workflow(request: WorkflowAnalysisRequest):
    """
    Analyze a workflow using AI and provide comprehensive insights
    """
    try:
        # Get API key from environment
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="API key not configured")
        
        # Initialize LLM Chat with Claude Sonnet 4.5 for structured analysis
        chat = LlmChat(
            api_key=api_key,
            session_id=f"workflow-analysis-{uuid.uuid4()}",
            system_message="""You are a senior AI systems engineer and automation expert specializing in workflow analysis.
Your task is to analyze workflows and provide deep, actionable insights.

You MUST respond in the following JSON format:
{
  "issues_risks": ["issue 1", "issue 2", ...],
  "optimization_suggestions": ["suggestion 1", "suggestion 2", ...],
  "cost_efficiency_insights": ["insight 1", "insight 2", ...],
  "improved_workflow": ["step 1", "step 2", ...],
  "complexity_analysis": "Brief complexity assessment (e.g., 'High - Multiple integration points with no error handling')",
  "advanced_suggestions": ["advanced tip 1", "advanced tip 2", ...]
}

Be technical, specific, and practical. Avoid generic advice."""
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")
        
        # Create the analysis prompt
        user_message = UserMessage(
            text=f"""Analyze this workflow and provide comprehensive insights:

WORKFLOW:
{request.workflow_description}

Provide your analysis in the exact JSON format specified in the system message. Focus on:
1. Issues/Risks: Identify logical errors, missing steps, failure points, edge cases
2. Optimization Suggestions: How to reduce steps, improve speed, increase efficiency
3. Cost & Efficiency Insights: Unnecessary API calls, delays, better alternatives, resource optimization
4. Improved Workflow: Rewrite the workflow in cleaner, optimized step-by-step format (as array of strings)
5. Complexity Analysis: Brief assessment of workflow complexity
6. Advanced Suggestions: Advanced engineering practices, monitoring, scaling, resilience patterns

Return ONLY valid JSON, no additional text."""
        )
        
        # Get AI response
        response_text = await chat.send_message(user_message)
        
        # Parse the JSON response
        # Extract JSON from response (handle potential markdown code blocks)
        response_clean = response_text.strip()
        if response_clean.startswith("```json"):
            response_clean = response_clean[7:]
        if response_clean.startswith("```"):
            response_clean = response_clean[3:]
        if response_clean.endswith("```"):
            response_clean = response_clean[:-3]
        response_clean = response_clean.strip()
        
        analysis_data = json.loads(response_clean)
        
        # Return structured response
        return WorkflowAnalysisResponse(**analysis_data)
        
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse AI response: {e}")
        logger.error(f"Response was: {response_text}")
        raise HTTPException(status_code=500, detail="Failed to parse AI response")
    except Exception as e:
        logger.error(f"Workflow analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()