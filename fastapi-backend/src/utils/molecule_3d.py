from rdkit import Chem
from rdkit.Chem import AllChem
import pubchempy as pcp

def get_molecule_3d(smiles: str):
    mol = Chem.MolFromSmiles(smiles)
    if mol is None:
        raise ValueError("Invalid SMILES string")
    mol = Chem.AddHs(mol)
    AllChem.EmbedMolecule(mol, randomSeed=42)
    AllChem.UFFOptimizeMolecule(mol)

    atoms = []
    conf = mol.GetConformer()
    for atom in mol.GetAtoms():
        pos = conf.GetAtomPosition(atom.GetIdx())
        atoms.append({
            "element": atom.GetSymbol(),
            "position": [float(pos.x), float(pos.y), float(pos.z)],
            "color": "#404040" if atom.GetSymbol() == "C" else "#ff0000" if atom.GetSymbol() == "O" else "#0000ff" if atom.GetSymbol() == "N" else "#ffffff"
        })
    xyz = f"{mol.GetNumAtoms()}\n\n"
    xyz += "\n".join(f"{atom['element']} {atom['position'][0]:.4f} {atom['position'][1]:.4f} {atom['position'][2]:.4f}" for atom in atoms)
    return {"xyz": xyz, "atoms": atoms}

def get_molecules_3d(drug_cid: int, excipient_cid: int):
    drug = pcp.Compound.from_cid(drug_cid)
    excipient = pcp.Compound.from_cid(excipient_cid)
    mol_drug = Chem.MolFromSmiles(drug.isomeric_smiles)
    mol_excipient = Chem.MolFromSmiles(excipient.isomeric_smiles)

    mol_drug = Chem.AddHs(mol_drug)
    mol_excipient = Chem.AddHs(mol_excipient)
    AllChem.EmbedMolecule(mol_drug, randomSeed=42)
    AllChem.EmbedMolecule(mol_excipient, randomSeed=42)
    AllChem.UFFOptimizeMolecule(mol_drug)
    AllChem.UFFOptimizeMolecule(mol_excipient)

    def mol_to_atoms(mol):
        atoms = []
        conf = mol.GetConformer()
        for atom in mol.GetAtoms():
            pos = conf.GetAtomPosition(atom.GetIdx())
            atoms.append({
                "element": atom.GetSymbol(),
                "position": [float(pos.x), float(pos.y), float(pos.z)],
                "color": "#404040" if atom.GetSymbol() == "C" else "#ff0000" if atom.GetSymbol() == "O" else "#0000ff" if atom.GetSymbol() == "N" else "#ffffff"
            })
        return atoms

    return {
        "drug_atoms": mol_to_atoms(mol_drug),
        "excipient_atoms": mol_to_atoms(mol_excipient),
    }