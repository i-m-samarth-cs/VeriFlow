from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import random
import asyncio


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

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

# ============================================================================
# VeriFlow™ Models
# ============================================================================

class WorkflowStep(BaseModel):
    """Individual step in a workflow"""
    step_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    type: str  # "inference", "validation", "tool"
    description: Optional[str] = None
    config: Dict[str, Any] = Field(default_factory=dict)

class WorkflowCreate(BaseModel):
    """Request to create a new workflow"""
    name: str
    description: Optional[str] = None
    steps: List[WorkflowStep]

class Workflow(BaseModel):
    """Complete workflow definition"""
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    steps: List[WorkflowStep]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class InferenceResult(BaseModel):
    """Result from a single inference"""
    node_id: str
    response: str
    latency_ms: int
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ValidationResult(BaseModel):
    """PoI/PoUW validation results"""
    poi_consensus: bool
    pouw_score: float  # 0.0 to 1.0
    embedding_distance: Optional[float] = None
    validator_nodes: List[str]
    deterministic_check: bool

class StepExecution(BaseModel):
    """Execution result for a single step"""
    step_id: str
    step_name: str
    status: str  # "pending", "running", "completed", "failed"
    inferences: List[InferenceResult] = Field(default_factory=list)
    validation: Optional[ValidationResult] = None
    evidence_hash: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

class WorkflowRunCreate(BaseModel):
    """Request to run a workflow"""
    workflow_id: str
    input_data: Dict[str, Any] = Field(default_factory=dict)

class WorkflowRun(BaseModel):
    """Complete workflow execution"""
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    workflow_id: str
    workflow_name: str
    status: str  # "pending", "running", "completed", "failed"
    input_data: Dict[str, Any]
    steps: List[StepExecution]
    overall_trust_score: Optional[float] = None
    started_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None

class EvidenceBundle(BaseModel):
    """Verifiable evidence for a workflow run"""
    workflow_run_id: str
    workflow_name: str
    steps: List[Dict[str, Any]]
    validators: List[str]
    total_latency_ms: int
    trust_score: float
    attestation_hash: str
    generated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ============================================================================
# Mock Cortensor Integration
# ============================================================================

async def mock_cortensor_infer(prompt: str, num_nodes: int = 3) -> List[InferenceResult]:
    """Mock Cortensor inference with multiple nodes (PoI)"""
    results = []
    base_responses = [
        "Analysis complete: The workflow demonstrates high confidence in the proposed solution.",
        "Inference result: Based on the input data, the recommended action is to proceed with validation.",
        "Processing complete: All parameters fall within acceptable ranges for continuation.",
    ]
    
    for i in range(num_nodes):
        # Simulate network latency
        latency = random.randint(150, 500)
        await asyncio.sleep(latency / 1000)
        
        results.append(InferenceResult(
            node_id=f"node_{i+1}",
            response=base_responses[i % len(base_responses)],
            latency_ms=latency
        ))
    
    return results

async def mock_validate_poi_pouw(inferences: List[InferenceResult]) -> ValidationResult:
    """Mock PoI/PoUW validation"""
    # Simulate validation logic
    await asyncio.sleep(0.2)
    
    # Mock consensus check (responses are similar enough)
    poi_consensus = len(inferences) >= 2
    
    # Mock PoUW score (trust score based on consistency)
    pouw_score = random.uniform(0.85, 0.98)
    
    # Mock embedding distance
    embedding_distance = random.uniform(0.02, 0.15)
    
    # Deterministic check (simplified)
    deterministic_check = pouw_score > 0.8
    
    return ValidationResult(
        poi_consensus=poi_consensus,
        pouw_score=round(pouw_score, 3),
        embedding_distance=round(embedding_distance, 3),
        validator_nodes=[inf.node_id for inf in inferences],
        deterministic_check=deterministic_check
    )

# ============================================================================
# API Routes
# ============================================================================

@api_router.get("/")
async def root():
    return {"message": "VeriFlow™ API - Trust-First Agentic Workflow Engine"}

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

# ============================================================================
# VeriFlow™ Workflow Endpoints
# ============================================================================

@api_router.post("/workflow/create", response_model=Workflow)
async def create_workflow(workflow_input: WorkflowCreate):
    """Create a new workflow definition"""
    workflow = Workflow(
        name=workflow_input.name,
        description=workflow_input.description,
        steps=workflow_input.steps
    )
    
    # Store in MongoDB
    doc = workflow.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.workflows.insert_one(doc)
    
    logger.info(f"Created workflow: {workflow.name} (ID: {workflow.id})")
    return workflow

@api_router.get("/workflows", response_model=List[Workflow])
async def list_workflows():
    """List all workflows"""
    workflows = await db.workflows.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO strings back to datetime
    for wf in workflows:
        if isinstance(wf['created_at'], str):
            wf['created_at'] = datetime.fromisoformat(wf['created_at'])
        if isinstance(wf['updated_at'], str):
            wf['updated_at'] = datetime.fromisoformat(wf['updated_at'])
    
    return workflows

@api_router.get("/workflow/{workflow_id}", response_model=Workflow)
async def get_workflow(workflow_id: str):
    """Get a specific workflow by ID"""
    workflow = await db.workflows.find_one({"id": workflow_id}, {"_id": 0})
    
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    # Convert ISO strings back to datetime
    if isinstance(workflow['created_at'], str):
        workflow['created_at'] = datetime.fromisoformat(workflow['created_at'])
    if isinstance(workflow['updated_at'], str):
        workflow['updated_at'] = datetime.fromisoformat(workflow['updated_at'])
    
    return workflow

@api_router.post("/workflow/run", response_model=WorkflowRun)
async def run_workflow(run_input: WorkflowRunCreate):
    """Execute a workflow with PoI/PoUW validation"""
    # Get workflow definition
    workflow = await db.workflows.find_one({"id": run_input.workflow_id}, {"_id": 0})
    
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    # Create workflow run
    workflow_run = WorkflowRun(
        workflow_id=run_input.workflow_id,
        workflow_name=workflow['name'],
        status="running",
        input_data=run_input.input_data,
        steps=[]
    )
    
    # Execute each step
    for step_def in workflow['steps']:
        step_execution = StepExecution(
            step_id=step_def['step_id'],
            step_name=step_def['name'],
            status="running",
            started_at=datetime.now(timezone.utc)
        )
        
        try:
            # Mock Cortensor inference (PoI - redundant inference)
            prompt = f"{step_def['name']}: {step_def.get('description', '')}"
            inferences = await mock_cortensor_infer(prompt, num_nodes=3)
            step_execution.inferences = inferences
            
            # Mock PoUW validation
            validation = await mock_validate_poi_pouw(inferences)
            step_execution.validation = validation
            
            # Generate evidence hash
            step_execution.evidence_hash = str(uuid.uuid4())[:8]
            
            step_execution.status = "completed"
            step_execution.completed_at = datetime.now(timezone.utc)
            
        except Exception as e:
            step_execution.status = "failed"
            step_execution.completed_at = datetime.now(timezone.utc)
            logger.error(f"Step execution failed: {str(e)}")
        
        workflow_run.steps.append(step_execution)
    
    # Calculate overall trust score
    trust_scores = [
        step.validation.pouw_score 
        for step in workflow_run.steps 
        if step.validation
    ]
    workflow_run.overall_trust_score = round(sum(trust_scores) / len(trust_scores), 3) if trust_scores else 0.0
    
    workflow_run.status = "completed"
    workflow_run.completed_at = datetime.now(timezone.utc)
    
    # Store workflow run
    doc = workflow_run.model_dump()
    doc['started_at'] = doc['started_at'].isoformat()
    if doc['completed_at']:
        doc['completed_at'] = doc['completed_at'].isoformat()
    
    # Convert nested datetime objects
    for step in doc['steps']:
        if step.get('started_at'):
            step['started_at'] = step['started_at'].isoformat()
        if step.get('completed_at'):
            step['completed_at'] = step['completed_at'].isoformat()
        for inf in step.get('inferences', []):
            if inf.get('timestamp'):
                inf['timestamp'] = inf['timestamp'].isoformat()
    
    await db.workflow_runs.insert_one(doc)
    
    logger.info(f"Completed workflow run: {workflow_run.id}")
    return workflow_run

@api_router.get("/workflow/runs", response_model=List[WorkflowRun])
async def list_workflow_runs():
    """List all workflow runs"""
    runs = await db.workflow_runs.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO strings back to datetime
    for run in runs:
        if isinstance(run['started_at'], str):
            run['started_at'] = datetime.fromisoformat(run['started_at'])
        if run.get('completed_at') and isinstance(run['completed_at'], str):
            run['completed_at'] = datetime.fromisoformat(run['completed_at'])
        
        # Convert step timestamps
        for step in run.get('steps', []):
            if step.get('started_at') and isinstance(step['started_at'], str):
                step['started_at'] = datetime.fromisoformat(step['started_at'])
            if step.get('completed_at') and isinstance(step['completed_at'], str):
                step['completed_at'] = datetime.fromisoformat(step['completed_at'])
            
            # Convert inference timestamps
            for inf in step.get('inferences', []):
                if inf.get('timestamp') and isinstance(inf['timestamp'], str):
                    inf['timestamp'] = datetime.fromisoformat(inf['timestamp'])
    
    return runs

@api_router.get("/workflow/{run_id}/evidence", response_model=EvidenceBundle)
async def get_evidence_bundle(run_id: str):
    """Get verifiable evidence bundle for a workflow run"""
    run = await db.workflow_runs.find_one({"id": run_id}, {"_id": 0})
    
    if not run:
        raise HTTPException(status_code=404, detail="Workflow run not found")
    
    # Calculate total latency
    total_latency = sum(
        inf['latency_ms']
        for step in run['steps']
        for inf in step.get('inferences', [])
    )
    
    # Collect validator nodes
    validators = list(set(
        inf['node_id']
        for step in run['steps']
        for inf in step.get('inferences', [])
    ))
    
    # Generate attestation hash
    attestation_hash = f"0x{uuid.uuid4().hex[:16]}"
    
    evidence = EvidenceBundle(
        workflow_run_id=run['id'],
        workflow_name=run['workflow_name'],
        steps=[
            {
                "step_name": step['step_name'],
                "poi_consensus": step.get('validation', {}).get('poi_consensus', False),
                "pouw_score": step.get('validation', {}).get('pouw_score', 0.0),
                "evidence_hash": step.get('evidence_hash', ''),
            }
            for step in run['steps']
        ],
        validators=validators,
        total_latency_ms=total_latency,
        trust_score=run.get('overall_trust_score', 0.0),
        attestation_hash=attestation_hash
    )
    
    return evidence

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_initialize_sample_workflows():
    """Initialize sample workflows for demonstration"""
    try:
        # Check if we already have workflows
        count = await db.workflows.count_documents({})
        if count > 0:
            logger.info(f"Found {count} existing workflows")
            return
        
        # Create sample workflows
        sample_workflows = [
            WorkflowCreate(
                name="Research & Due-Diligence Pipeline",
                description="Multi-step research agent with search, summarization, and fact verification",
                steps=[
                    WorkflowStep(
                        name="Web Search & Data Collection",
                        type="inference",
                        description="Search for relevant information across multiple sources",
                        config={"model": "cortensor-v1", "temperature": 0.3}
                    ),
                    WorkflowStep(
                        name="Content Summarization",
                        type="inference",
                        description="Summarize collected data with key findings",
                        config={"model": "cortensor-v1", "temperature": 0.5}
                    ),
                    WorkflowStep(
                        name="Fact Verification",
                        type="validation",
                        description="Verify factual consistency and detect hallucinations",
                        config={"validation_type": "poi", "min_consensus": 0.8}
                    )
                ]
            ),
            WorkflowCreate(
                name="DevOps Incident Analysis",
                description="Automated incident response with log analysis and root cause detection",
                steps=[
                    WorkflowStep(
                        name="Log Analysis",
                        type="inference",
                        description="Parse and analyze system logs for anomalies",
                        config={"model": "cortensor-v1"}
                    ),
                    WorkflowStep(
                        name="Root Cause Detection",
                        type="inference",
                        description="Identify probable root causes of incidents",
                        config={"model": "cortensor-v1"}
                    ),
                    WorkflowStep(
                        name="Solution Validation",
                        type="validation",
                        description="Validate proposed solutions with deterministic checks",
                        config={"validation_type": "pouw"}
                    )
                ]
            ),
            WorkflowCreate(
                name="Compliance Workflow",
                description="AI-powered compliance checking with cryptographic attestation",
                steps=[
                    WorkflowStep(
                        name="Policy Analysis",
                        type="inference",
                        description="Analyze documents against compliance policies",
                        config={"model": "cortensor-v1"}
                    ),
                    WorkflowStep(
                        name="Risk Assessment",
                        type="inference",
                        description="Assess compliance risks and generate recommendations",
                        config={"model": "cortensor-v1"}
                    ),
                    WorkflowStep(
                        name="Attestation Generation",
                        type="validation",
                        description="Generate cryptographic proof of compliance check",
                        config={"validation_type": "poi_pouw"}
                    )
                ]
            )
        ]
        
        for wf_input in sample_workflows:
            workflow = Workflow(
                name=wf_input.name,
                description=wf_input.description,
                steps=wf_input.steps
            )
            doc = workflow.model_dump()
            doc['created_at'] = doc['created_at'].isoformat()
            doc['updated_at'] = doc['updated_at'].isoformat()
            await db.workflows.insert_one(doc)
            logger.info(f"Created sample workflow: {workflow.name}")
        
        logger.info("Sample workflows initialized successfully")
        
    except Exception as e:
        logger.error(f"Failed to initialize sample workflows: {str(e)}")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()