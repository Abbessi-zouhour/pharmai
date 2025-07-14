# fastapi_backend/main.py

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pubchempy as pcp
import numpy as np
import tensorflow as tf
import time
from fastapi.middleware.cors import CORSMiddleware
import logging

# Setup logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Enable CORS (adjust origins as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CIDRequest(BaseModel):
    drug_cid: int
    excipient_cid: int

# Load the trained TensorFlow model (ensure path is correct)
model_path = "C:/Users/msi/OneDrive/Bureau/pharmai-app/fastapi_backend/models/best_model.h5"
model = tf.keras.models.load_model(model_path)
logger.info(f"Loaded model from {model_path}")

@app.post("/predict_interaction")
async def predict_interaction(request: CIDRequest):
    start_time = time.time()

    try:
        # Fetch compounds from PubChem by CID
        drug = pcp.Compound.from_cid(request.drug_cid)
        excipient = pcp.Compound.from_cid(request.excipient_cid)

        # Extract CACTVS fingerprints as lists of bits
        fp_drug = list(drug.cactvs_fingerprint)
        fp_excipient = list(excipient.cactvs_fingerprint)

        logger.info(f"Drug fingerprint length: {len(fp_drug)}")
        logger.info(f"Excipient fingerprint length: {len(fp_excipient)}")

        # Verify combined length matches model input shape (1762 expected)
        combined_fp = np.array(fp_drug + fp_excipient)
        if combined_fp.shape[0] != 1762:
            raise HTTPException(status_code=400, detail=f"Invalid fingerprint length: {combined_fp.shape[0]}, expected 1762")

        # Prepare input for model: shape (1, 1762), dtype int64
        model_input = combined_fp.reshape(1, -1).astype(np.int64)
        logger.info(f"Model input shape: {model_input.shape}")

        # Predict probability
        proba = model.predict(model_input)[0][0]

        # Round prediction to binary 0 or 1
        prediction = int(round(proba))

        # Confidence: probability if positive, else 1 - probability
        confidence = float(proba if prediction == 1 else 1 - proba)

        processing_time = round(time.time() - start_time, 2)

        logger.info(f"Prediction: {prediction}, Confidence: {confidence}, Processing time: {processing_time}s")

        return {
            "prediction": prediction,
            "confidence": round(confidence, 4),
            "processing_time": f"{processing_time}s"
        }

    except Exception as e:
        logger.error(f"Error in prediction: {e}")
        raise HTTPException(status_code=500, detail=str(e))
