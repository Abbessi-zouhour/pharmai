
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from interaction import predict_interaction
from solubility import generate_3d

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class InteractionRequest(BaseModel):
    drug_cid: int
    excipient_cid: int

class SolubilityRequest(BaseModel):
    smiles: str

@app.post("/predict-interaction")
def interaction_endpoint(data: InteractionRequest):
    result = predict_interaction(data.drug_cid, data.excipient_cid)
    return result

@app.post("/generate-3d")
def solubility_endpoint(data: SolubilityRequest):
    js_code = generate_3d(data.smiles)
    return {"viewer_js": js_code}
