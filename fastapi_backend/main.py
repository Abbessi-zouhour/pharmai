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
async def root():
    return {"message": "Drug-Excipient Compatibility API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "model_loaded": model is not None}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)