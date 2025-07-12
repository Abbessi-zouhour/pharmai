# main.py
try:
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    from models import excipient_interaction, solubility_3d
except ModuleNotFoundError as e:
    raise ImportError("Required modules are missing. Please ensure FastAPI and its dependencies are installed. Run: pip install fastapi uvicorn") from e

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Pharmai API is running"}

app.include_router(excipient_interaction.router, prefix="/compatibility", tags=["Compatibility"])
app.include_router(solubility_3d.router, prefix="/solubility", tags=["Solubility"])
