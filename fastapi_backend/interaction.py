
import tensorflow as tf
import numpy as np
import pubchempy as pcp
from sklearn.preprocessing import LabelEncoder

# ----------------------------
# Load model and label encoder
# ----------------------------
model = tf.keras.models.load_model('C:/Users/msi/OneDrive/Bureau/pharmai-app/fastapi_backend/models/__pycache__/best_model.h5')  # Adjust as needed
LE = LabelEncoder()
#LE.classes_ = np.load('models/classes.npy', allow_pickle=True)  # Provide classes.npy

def predict_interaction(drug_cid: int, excipient_cid: int):
    drug_fp = pcp.Compound.from_cid(drug_cid).cactvs_fingerprint
    excipient_fp = pcp.Compound.from_cid(excipient_cid).cactvs_fingerprint
    combined_fp = list(drug_fp) + list(excipient_fp)
    X_input = np.array(combined_fp).reshape(1, -1).astype(int)

    pred_prob = model.predict(X_input)
    pred_class = np.round(pred_prob).astype(int)
    pred_label = LE.inverse_transform(pred_class.flatten())[0]
    return {
        "probability": float(pred_prob[0][0]),
        "label": pred_label
    }
