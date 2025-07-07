"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, RotateCcw, Search, Download } from "lucide-react"
import Link from "next/link"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Sphere, Text } from "@react-three/drei"
import { useState } from "react"

// Sample molecular data compatible with RDKit/DeepChem backend
const molecules = [
  {
    id: "aspirin",
    name: "Aspirin",
    cid: "2244",
    formula: "C9H8O4",
    smiles: "CC(=O)OC1=CC=CC=C1C(=O)O",
    molecularWeight: "180.16 g/mol",
    logS: "-2.23", // Solubility prediction from ESOL
    meltingPoint: "135°C",
    boilingPoint: "140°C",
    solubility: "3.3 g/L (water)",
    ecfp: "Generated via CircularFingerprint",
    atoms: [
      { element: "C", position: [0, 0, 0], color: "#404040" },
      { element: "C", position: [1.5, 0, 0], color: "#404040" },
      { element: "C", position: [2.25, 1.3, 0], color: "#404040" },
      { element: "C", position: [1.5, 2.6, 0], color: "#404040" },
      { element: "C", position: [0, 2.6, 0], color: "#404040" },
      { element: "C", position: [-0.75, 1.3, 0], color: "#404040" },
      { element: "O", position: [3.5, 1.3, 0], color: "#ff0000" },
      { element: "O", position: [-2, 1.3, 0], color: "#ff0000" },
      { element: "O", position: [-2.5, 0, 0], color: "#ff0000" },
    ],
  },
  {
    id: "caffeine",
    name: "Caffeine",
    cid: "2519",
    formula: "C8H10N4O2",
    smiles: "CN1C=NC2=C1C(=O)N(C(=O)N2C)C",
    molecularWeight: "194.19 g/mol",
    logS: "-0.55",
    meltingPoint: "235°C",
    boilingPoint: "178°C",
    solubility: "21.6 g/L (water)",
    ecfp: "Generated via CircularFingerprint",
    atoms: [
      { element: "C", position: [0, 0, 0], color: "#404040" },
      { element: "N", position: [1.4, 0.8, 0], color: "#0000ff" },
      { element: "C", position: [2.8, 0, 0], color: "#404040" },
      { element: "N", position: [2.8, -1.4, 0], color: "#0000ff" },
      { element: "C", position: [1.4, -2.2, 0], color: "#404040" },
      { element: "C", position: [0, -1.4, 0], color: "#404040" },
      { element: "O", position: [-1.4, -2.2, 0], color: "#ff0000" },
      { element: "N", position: [1.4, -3.6, 0], color: "#0000ff" },
      { element: "O", position: [4.2, 0.8, 0], color: "#ff0000" },
    ],
  },
  {
    id: "ibuprofen",
    name: "Ibuprofen",
    cid: "3672",
    formula: "C13H18O2",
    smiles: "CC(C)CC1=CC=C(C=C1)C(C)C(=O)O",
    molecularWeight: "206.28 g/mol",
    logS: "-3.97",
    meltingPoint: "75-78°C",
    boilingPoint: "157°C",
    solubility: "0.021 g/L (water)",
    ecfp: "Generated via CircularFingerprint",
    atoms: [
      { element: "C", position: [0, 0, 0], color: "#404040" },
      { element: "C", position: [1.5, 0, 0], color: "#404040" },
      { element: "C", position: [2.25, 1.3, 0], color: "#404040" },
      { element: "C", position: [1.5, 2.6, 0], color: "#404040" },
      { element: "C", position: [0, 2.6, 0], color: "#404040" },
      { element: "C", position: [-0.75, 1.3, 0], color: "#404040" },
      { element: "C", position: [3.5, 1.3, 0], color: "#404040" },
      { element: "C", position: [4.25, 0, 0], color: "#404040" },
      { element: "O", position: [5.5, 0, 0], color: "#ff0000" },
      { element: "O", position: [4.25, -1.3, 0], color: "#ff0000" },
    ],
  },
]

function Atom({ position, element, color }: { position: [number, number, number]; element: string; color: string }) {
  return (
    <group position={position}>
      <Sphere args={[0.3]} position={[0, 0, 0]}>
        <meshStandardMaterial color={color} />
      </Sphere>
      <Text position={[0, 0.6, 0]} fontSize={0.3} color="black" anchorX="center" anchorY="middle">
        {element}
      </Text>
    </group>
  )
}

function MolecularStructure({ molecule }: { molecule: (typeof molecules)[0] }) {
  return (
    <group>
      {molecule.atoms.map((atom, index) => (
        <Atom
          key={index}
          position={atom.position as [number, number, number]}
          element={atom.element}
          color={atom.color}
        />
      ))}
    </group>
  )
}

export default function MolecularVisualization() {
  const [selectedMolecule, setSelectedMolecule] = useState(molecules[0])
  const [customSmiles, setCustomSmiles] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleMoleculeChange = (moleculeId: string) => {
    const molecule = molecules.find((m) => m.id === moleculeId)
    if (molecule) setSelectedMolecule(molecule)
  }

  const handleSmilesAnalysis = async () => {
    if (!customSmiles.trim()) return

    setIsAnalyzing(true)
    // Simulate API call to backend for SMILES analysis
    setTimeout(() => {
      setIsAnalyzing(false)
      alert(`Analysis complete for SMILES: ${customSmiles}\nThis would connect to your RDKit/DeepChem backend.`)
    }, 2000)
  }

  const handleExportMolecule = () => {
    const data = {
      name: selectedMolecule.name,
      smiles: selectedMolecule.smiles,
      properties: {
        formula: selectedMolecule.formula,
        molecularWeight: selectedMolecule.molecularWeight,
        logS: selectedMolecule.logS,
        solubility: selectedMolecule.solubility,
      },
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${selectedMolecule.name}_data.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/pharmai">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">3D Molecular Visualization</h1>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedMolecule.id}
              onChange={(e) => handleMoleculeChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {molecules.map((molecule) => (
                <option key={molecule.id} value={molecule.id}>
                  {molecule.name}
                </option>
              ))}
            </select>
            <Button onClick={handleExportMolecule} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* SMILES Input Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Custom SMILES Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Input
                placeholder="Enter SMILES notation (e.g., CC(=O)OC1=CC=CC=C1C(=O)O)"
                value={customSmiles}
                onChange={(e) => setCustomSmiles(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSmilesAnalysis} disabled={isAnalyzing}>
                <Search className="w-4 h-4 mr-2" />
                {isAnalyzing ? "Analyzing..." : "Analyze"}
              </Button>
            </div>
            <p className="text-sm text-gray-600 mt-2">Enter SMILES notation for molecular analysis</p>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* 3D Visualization */}
          <Card className="h-[600px]">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                3D Structure: {selectedMolecule.name}
                <Button variant="outline" size="sm">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset View
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[500px] p-0">
              <Canvas camera={{ position: [5, 5, 5], fov: 60 }}>
                <ambientLight intensity={0.6} />
                <pointLight position={[10, 10, 10]} />
                <MolecularStructure molecule={selectedMolecule} />
                <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
              </Canvas>
            </CardContent>
          </Card>

          {/* Properties Panel */}
          <div className="space-y-6">
            {/* Basic Properties */}
            <Card>
              <CardHeader>
                <CardTitle>Molecular Properties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Name</label>
                    <p className="text-lg font-semibold">{selectedMolecule.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">PubChem CID</label>
                    <p className="text-lg font-semibold">{selectedMolecule.cid}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Formula</label>
                    <p className="text-lg font-semibold">{selectedMolecule.formula}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Molecular Weight</label>
                    <p className="text-lg">{selectedMolecule.molecularWeight}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">LogS (Solubility)</label>
                    <p className="text-lg">{selectedMolecule.logS}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Water Solubility</label>
                    <p className="text-lg">{selectedMolecule.solubility}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SMILES Notation */}
            <Card>
              <CardHeader>
                <CardTitle>SMILES Notation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <code className="text-sm font-mono break-all">{selectedMolecule.smiles}</code>
                </div>
                <p className="text-sm text-gray-600 mt-2">SMILES notation compatible with RDKit molecular processing</p>
              </CardContent>
            </Card>

            {/* Legend */}
            <Card>
              <CardHeader>
                <CardTitle>Atom Color Legend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gray-600 rounded-full"></div>
                    <span className="text-sm">Carbon (C)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    <span className="text-sm">Oxygen (O)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Nitrogen (N)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-white border-2 border-gray-400 rounded-full"></div>
                    <span className="text-sm">Hydrogen (H)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
