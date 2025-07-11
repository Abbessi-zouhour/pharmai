from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from src.models.interaction_model import predict_interaction
from src.models.solubility_model import predict_solubility
from src.utils.molecule_3d import get_molecule_3d, get_molecules_3d

app = FastAPI()

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Input models
class PredictionInput(BaseModel):
    drug_cid: int
    excipient_cid: int

class SolubilityInput(BaseModel):
    smiles: str

@app.post("/predict-interaction")
async def interaction_endpoint(input_data: PredictionInput):
    try:
        result = predict_interaction(input_data.drug_cid, input_data.excipient_cid)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/predict-solubility")
async def solubility_endpoint(input_data: SolubilityInput):
    try:
        result = predict_solubility(input_data.smiles)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/molecule-3d")
async def molecule_3d_endpoint(input_data: SolubilityInput):
    try:
        result = get_molecule_3d(input_data.smiles)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/molecules-3d")
async def molecules_3d_endpoint(input_data: PredictionInput):
    try:
        result = get_molecules_3d(input_data.drug_cid, input_data.excipient_cid)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy"}