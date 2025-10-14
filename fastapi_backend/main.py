import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import tensorflow as tf
import pandas as pd
import numpy as np
import pubchempy as pcp
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import StratifiedKFold
import datetime
import time
from rdkit import Chem
import deepchem as dc
from deepchem.feat import CircularFingerprint
from sklearn.ensemble import RandomForestRegressor
from rdkit.Chem import rdMolDescriptors
import warnings
from rdkit.Chem import AllChem
warnings.filterwarnings("ignore", category=DeprecationWarning)
from rdkit.Chem import Descriptors
from fastapi import FastAPI, Request, HTTPException
from typing import Optional
from transformers import pipeline
from openai import OpenAI
import requests
import os


app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic model for request body
class PredictionRequest(BaseModel):
    drug_cid: int
    excipient_cid: int

# Global variables for model and label encoder
model = None
LE = None

def initialize_model():
    global model, LE
    
    # Load and prepare dataset
    url = "C:/Users/msi/OneDrive/Bureau/pharmai-app/fastapi_backend/datasets/DEL.csv"
    df = pd.read_csv(url, low_memory=False)
    df.drop("Drugs", axis=1, inplace=True)
    df.drop("Excipients", axis=1, inplace=True)
    dataset = df.values
    X = dataset[:, 0:1762]
    Y1 = dataset[:, 1762:1763]
    LE = LabelEncoder()
    Y = LE.fit_transform(Y1)

    # Model filepath
    filepath = "C:/Users/msi/OneDrive/Bureau/pharmai-app/fastapi_backend/models/best_model.h5"
    
    # Create model architecture
    model = tf.keras.Sequential([
        tf.keras.layers.Dense(1024, activation="relu", input_shape=(1762,)),
        tf.keras.layers.Dense(1024, activation="relu"),
        tf.keras.layers.Dense(1024, activation="relu"),
        tf.keras.layers.Dense(1, activation="sigmoid")
    ])
    model.compile(
        optimizer=tf.keras.optimizers.RMSprop(), 
        loss=tf.keras.losses.BinaryCrossentropy(from_logits=False), 
        metrics=["accuracy"]
    )

    # Check if model file exists and load weights
    try:
        model.load_weights(filepath)
        print("Model weights loaded successfully")
    except:
        print("Model weights not found, training new model...")
        # Train model if weights don't exist
        train_model(X, Y, filepath)

def train_model(X, Y, filepath):
    global model
    
    log_dir = "logs/fit/" + datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
    tensorboard_callback = tf.keras.callbacks.TensorBoard(log_dir=log_dir, histogram_freq=1)
    
    skf = StratifiedKFold(n_splits=2, shuffle=True)
    for train, val in skf.split(X, Y):
        checkpoint = [
            tf.keras.callbacks.ModelCheckpoint(
                filepath, monitor="val_accuracy", mode="max", save_best_only=True, 
                save_weights_only=False, verbose=1
            ),
            tf.keras.callbacks.EarlyStopping(monitor="val_accuracy", patience=1, verbose=1),
            tensorboard_callback
        ]
        
        model.fit(
            X[train].astype(np.int64), Y[train].astype(np.int64),
            epochs=2000, callbacks=checkpoint,
            validation_data=(X[val].astype(np.int64), Y[val].astype(np.int64)),
            batch_size=100
        )
        break  # Use only one fold

# Initialize model on startup
initialize_model()

@app.post("/predict_interaction")
async def predict_interaction(request: PredictionRequest):
    try:
        start_time = time.time()
        
        # Fetch fingerprints from PubChem
        try:
            drug_compound = pcp.Compound.from_cid(request.drug_cid)
            excipient_compound = pcp.Compound.from_cid(request.excipient_cid)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to fetch compounds from PubChem: {str(e)}")
        
        try:
            fp_drug = drug_compound.cactvs_fingerprint
            fp_excipient = excipient_compound.cactvs_fingerprint
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to get fingerprints: {str(e)}")

        # Combine fingerprints
        List1 = list(fp_drug)
        List2 = list(fp_excipient)
        List = List1 + List2
        
        # Ensure we have the right number of features
        if len(List) != 1762:
            raise HTTPException(status_code=400, detail=f"Expected 1762 features, got {len(List)}")
        
        t = pd.DataFrame(np.array(List).reshape(-1, len(List)))
        dataset1 = t.values
        X_Predict = dataset1[:, 0:1762].astype(int)

        # Make prediction
        t1 = model.predict(X_Predict, verbose=0)
        prediction = np.round(t1)[0][0].astype(int)
        confidence = float(t1[0][0])

        processing_time = f"{time.time() - start_time:.2f}s"

        # Get compound names
        drug_name = getattr(drug_compound, 'iupac_name', None) or f"Drug-{request.drug_cid}"
        excipient_name = getattr(excipient_compound, 'iupac_name', None) or f"Excipient-{request.excipient_cid}"

        return {
            "prediction": int(prediction),
            "confidence": float(confidence),
            "processing_time": processing_time,
            "drug_name": drug_name,
            "excipient_name": excipient_name
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@app.get("/")
async def home():
    return {"message": "Drug-Excipient Compatibility API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "model_loaded": model is not None}




# === Data and Model Setup (Run once during startup) ===
##### solubility fastapi backend endpoint 
# Featurizer and Model Setup
featurizer = CircularFingerprint(radius=2, size=1024)
data_dir = "C:/Users/msi/OneDrive/Bureau/pharmai-app/fastapi_backend/datasets/dataset ESOL (solubility).csv"
# ✅ Correct dataset directory (must be a folder, not a file)
data_dir = os.path.join(os.getcwd(), "datasets")
os.makedirs(data_dir, exist_ok=True)  # ensure it exists

tasks, datasets, transformers = dc.molnet.load_delaney(
    featurizer=featurizer, splitter='random', reload=True, data_dir=data_dir
)

train_dataset, valid_dataset, test_dataset = datasets
rf_model = dc.models.SklearnModel(RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1))
rf_model.fit(train_dataset)

# Pydantic schema for SMILES input
class MoleculeInput(BaseModel):
    smiles: str

# POST /predict_logS: Return molecular properties and 3D structure
@app.post("/predict_logS")
def predict_logS(mol: MoleculeInput):
    smiles = mol.smiles
    rdkit_mol = Chem.MolFromSmiles(smiles)
    if rdkit_mol is None:
        raise HTTPException(status_code=400, detail="Invalid SMILES string")

    # Predict logS
    features = featurizer.featurize([smiles])
    if features[0] is None:
        raise HTTPException(status_code=400, detail="Could not featurize molecule")
    predicted_logS = float(rf_model.predict_on_batch(np.array(features)).flatten()[0])

    # Molecular properties
    molecular_weight = Descriptors.MolWt(rdkit_mol)
    formula = rdMolDescriptors.CalcMolFormula(rdkit_mol)

    # Generate 3D structure
    mol_3d = Chem.AddHs(rdkit_mol)
    AllChem.EmbedMolecule(mol_3d, AllChem.ETKDG())
    AllChem.UFFOptimizeMolecule(mol_3d)
    conf = mol_3d.GetConformer()

    # Atoms
    atoms = []
    for atom in mol_3d.GetAtoms():
        idx = atom.GetIdx()
        pos = conf.GetAtomPosition(idx)
        atoms.append({
            "id": idx,
            "element": atom.GetSymbol(),
            "position": [pos.x, pos.y, pos.z]
        })

    # Bonds
    bonds = []
    for bond in mol_3d.GetBonds():
        bonds.append({
            "start_atom": bond.GetBeginAtomIdx(),
            "end_atom": bond.GetEndAtomIdx(),
            "bond_type": str(bond.GetBondType())
        })

    return {
        "smiles": smiles,
        "predicted_logS": predicted_logS,
        "formula": formula,
        "molecular_weight": molecular_weight,
        "atoms": atoms,
        "bonds": bonds
    }

# Root health check
@app.get("/")
def root():
    return {"message": "Molecular Analysis API is running"}

@app.get("/health")
def health():
    return {"status": "healthy"}






# Initialize OpenAI client
client = OpenAI(
    api_key="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"
)

# Input model for /api/llm
class LLMRequest(BaseModel):
    prompt: str
    max_length:int= 2000
    temperature: Optional[float] = 0.7

# Root
@app.get("/")
def root():
    return {"message": "API is running."}

# Health check
@app.get("/health")
def health():
    return {"status": "healthy"}

# Your OpenRouter API key (replace with your actual key)
OPENROUTER_API_KEY = "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"

class LLMRequest(BaseModel):
    prompt: str
    max_length: Optional[int] = 100
    temperature: Optional[float] = 0.7

@app.get("/")
async def root():
    return {"message": "Pharmaceutical AI API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/api/llm")
async def ask_llm(request: LLMRequest):
    """Ask the AI assistant about pharmaceutical topics"""
    try:
        prompt = request.prompt
        print(f"Received prompt: {prompt}")  # Debug

        if not prompt:
            raise HTTPException(status_code=400, detail="Prompt is required")
        
        url = "https://openrouter.ai/api/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": "openai/gpt-3.5-turbo",  # You can change this to another model like 'mistralai/mistral-7b-instruct'
            "messages": [
                {"role": "system", "content": "You are a helpful assistant for pharmaceutical formulation and drug–excipient compatibility."},
                {"role": "user", "content": prompt}
            ],
            "max_tokens": request.max_length,
            "temperature": request.temperature
        }

        response = requests.post(url, headers=headers, json=payload)
        data = response.json()

        if response.status_code != 200:
            print(f"OpenRouter Error: {data}")
            raise HTTPException(status_code=response.status_code, detail=data)

        reply = data["choices"][0]["message"]["content"]
        print(f"Sending response: {reply}")
        return {"response": reply}

    except Exception as e:
        print(f"Error in LLM endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)