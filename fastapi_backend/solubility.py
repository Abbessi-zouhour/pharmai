
import py3Dmol
from rdkit import Chem
from rdkit.Chem import AllChem

def generate_3d(smiles: str):
    mol = Chem.MolFromSmiles(smiles)
    mol = Chem.AddHs(mol)
    AllChem.EmbedMolecule(mol)
    AllChem.UFFOptimizeMolecule(mol)
    mb = Chem.MolToMolBlock(mol)

    viewer = py3Dmol.view(width=400, height=300)
    viewer.addModel(mb, "mol")
    viewer.setStyle({'stick': {}})
    viewer.setBackgroundColor('0xeeeeee')
    viewer.zoomTo()
    return viewer.js()  # Return JavaScript snippet for frontend
