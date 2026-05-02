"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, RotateCcw, Search, Download } from "lucide-react";
import Link from "next/link";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sphere, Text } from "@react-three/drei";
import { useState } from "react";
import * as THREE from "three";
import React, { useRef } from "react";
import { jsPDF } from "jspdf";

function Atom({ position, element, color }: { position: [number, number, number]; element: string; color: string }) {
  return (
    <group position={position}>
      <Sphere args={[0.3]}>
        <meshStandardMaterial color={color} />
      </Sphere>
      <Text position={[0, 0.6, 0]} fontSize={0.3} color="black" anchorX="center" anchorY="middle">
        {element}
      </Text>
    </group>
  );
}

function Bond({ start, end }: { start: [number, number, number]; end: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null);

  if (!start || !end || start.length !== 3 || end.length !== 3) return null;

  const startVec = new THREE.Vector3(...start);
  const endVec = new THREE.Vector3(...end);

  const direction = new THREE.Vector3().subVectors(endVec, startVec);
  const length = direction.length();
  if (length === 0) return null;

  const midPoint = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);
  const quaternion = new THREE.Quaternion();
  quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());

  return (
    <mesh ref={ref} position={midPoint.toArray()} quaternion={quaternion}>
      <cylinderGeometry args={[0.05, 0.05, length, 16]} />
      <meshStandardMaterial color="gray" />
    </mesh>
  );
}

function MolecularStructure({ molecule }: { molecule: any }) {
  return (
    <group>
      {molecule.atoms?.map((atom: any, index: number) => (
        <Atom key={index} position={atom.position} element={atom.element} color={atom.color} />
      ))}
      {molecule.bonds?.map((bond: any, index: number) => {
        const start = molecule.atoms[bond.start_atom]?.position;
        const end = molecule.atoms[bond.end_atom]?.position;
        return start && end ? <Bond key={index} start={start} end={end} /> : null;
      })}
    </group>
  );
}

export default function MolecularVisualization() {
  const [selectedMolecule, setSelectedMolecule] = useState<any>(null);
  const [customSmiles, setCustomSmiles] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSmilesAnalysis = async () => {
    if (!customSmiles.trim()) return;
    setIsAnalyzing(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/predict_logS", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ smiles: customSmiles }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Error: ${error.detail}`);
      } else {
        const data = await response.json();

        const atomColors: Record<string, string> = {
          C: "#404040",
          O: "#ff0000",
          N: "#0000ff",
          H: "#ffffff",
          S: "#ffff00",
          P: "#ffa500",
          Cl: "#00ff00",
          F: "#00ffff",
          Br: "#a52a2a",
          I: "#9400d3",
        };

        const atoms = data.atoms.map((atom: any) => ({
          element: atom.element,
          position: atom.position,
          color: atomColors[atom.element] || "#aaaaaa",
        }));

        setSelectedMolecule({
          id: "custom",
          name: `Molecule (${data.formula})`,
          cid: "-",
          formula: data.formula,
          smiles: data.smiles,
          molecularWeight: `${data.molecular_weight.toFixed(2)} g/mol`,
          logS: data.predicted_logS.toFixed(2),
          solubility: "N/A",
          atoms,
          bonds: data.bonds,
        });
      }
    } catch (error) {
      alert("Failed to connect to prediction server");
    } finally {
      setIsAnalyzing(false);
    }
  };

  //const handleExportMolecule = () => {
  //  if (!selectedMolecule) return;
  //  const data = {
  //   name: selectedMolecule.name,
  //    smiles: selectedMolecule.smiles,
  //    properties: {
  //      formula: selectedMolecule.formula,
  //      molecularWeight: selectedMolecule.molecularWeight,
  //      logS: selectedMolecule.logS,
  //     solubility: selectedMolecule.solubility,
  //    },
  //  };
  //  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    //const url = URL.createObjectURL(blob);
    //const a = document.createElement("a");
    //a.href = url;
    //a.download = `${selectedMolecule.name}_data.json`;
    //a.click();
    //URL.revokeObjectURL(url);
  //};
  

const handleExportMolecule = () => {
  if (!selectedMolecule) return;

  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Molecule Report", 20, 20);

  doc.setFontSize(12);
  doc.text(`Name: ${selectedMolecule.name}`, 20, 40);
  doc.text(`SMILES: ${selectedMolecule.smiles}`, 20, 50);
  doc.text(`Formula: ${selectedMolecule.formula}`, 20, 60);
  doc.text(`Molecular Weight: ${selectedMolecule.molecularWeight}`, 20, 70);
  doc.text(`Solubility Score: ${selectedMolecule.logS}`, 20, 80);

  // Optional: Include predicted solubility if it exists
  if (selectedMolecule.solubility) {
    doc.text(`Solubility Prediction: ${selectedMolecule.solubility}`, 20, 90);
  }

  doc.save(`${selectedMolecule.name}_report.pdf`);
};

const uniqueElementsWithColors: [string, string][] = selectedMolecule?.atoms
  ? Array.from(new Map<string, string>(selectedMolecule.atoms.map((atom: any) => [atom.element, atom.color])).entries())
  : [];


  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="border-b sticky top-0 z-10 bg-white dark:bg-gray-900 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/pharmai">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">3D Molecular Visualization</h1>
          </div>
          {selectedMolecule && (
            <Button onClick={handleExportMolecule} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Custom SMILES Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Input
                placeholder="Enter SMILES notation"
                value={customSmiles}
                onChange={(e) => setCustomSmiles(e.target.value)}
              />
              <Button onClick={handleSmilesAnalysis} disabled={isAnalyzing}>
                <Search className="w-4 h-4 mr-2" />
                {isAnalyzing ? "Analyzing..." : "Analyze"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {selectedMolecule && (
          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  3D Structure: {selectedMolecule.name}
                  <Button variant="outline" size="sm" onClick={() => setSelectedMolecule(null)}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[500px] p-0">
                <Canvas camera={{ position: [5, 5, 5], fov: 60 }}>
                  <ambientLight intensity={0.6} />
                  <pointLight position={[10, 10, 10]} />
                  <MolecularStructure molecule={selectedMolecule} />
                  <OrbitControls />
                </Canvas>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Molecular Properties</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div><strong>Name:</strong> {selectedMolecule.name}</div>
                  <div><strong>Formula:</strong> {selectedMolecule.formula}</div>
                  <div><strong>Molecular Weight:</strong> {selectedMolecule.molecularWeight}</div>
                  <div><strong>Solubility Score::</strong> {selectedMolecule.logS}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">SMILES Notation</CardTitle>
                </CardHeader>
                <CardContent>
                  <code className="text-sm block break-all p-4 bg-gray-100 rounded dark:bg-gray-800 dark:text-white">
                    {selectedMolecule.smiles}
                  </code>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Atom Color Legend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {uniqueElementsWithColors.map(([element, color]) => (
                      <div key={element} className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color, border: "1px solid #ccc" }} />
                        <span className="text-sm">{element}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

