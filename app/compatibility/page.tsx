"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Search, AlertTriangle, CheckCircle, XCircle, Brain, Zap } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

// Sample compatibility data compatible with TensorFlow backend
const compatibilityData = [
  {
    drugCID: "2244",
    drugName: "Aspirin",
    excipientCID: "104938",
    excipientName: "Microcrystalline Cellulose",
    compatibility: "compatible",
    score: 95,
    prediction: 1,
    confidence: 0.95,
    notes: "TensorFlow model prediction: Compatible",
    fingerprint: "Generated via PubChem CACTVS",
  },
  {
    drugCID: "2244",
    drugName: "Aspirin",
    excipientCID: "5460341",
    excipientName: "Lactose Monohydrate",
    compatibility: "compatible",
    score: 88,
    prediction: 1,
    confidence: 0.88,
    notes: "Neural network confidence: High",
    fingerprint: "Generated via PubChem CACTVS",
  },
  {
    drugCID: "2244",
    drugName: "Aspirin",
    excipientCID: "11177",
    excipientName: "Magnesium Stearate",
    compatibility: "caution",
    score: 65,
    prediction: 0,
    confidence: 0.65,
    notes: "Model uncertainty detected",
    fingerprint: "Generated via PubChem CACTVS",
  },
  {
    drugCID: "3672",
    drugName: "Ibuprofen",
    excipientCID: "104938",
    excipientName: "Microcrystalline Cellulose",
    compatibility: "compatible",
    score: 92,
    prediction: 1,
    confidence: 0.92,
    notes: "High confidence prediction",
    fingerprint: "Generated via PubChem CACTVS",
  },
  {
    drugCID: "3672",
    drugName: "Ibuprofen",
    excipientCID: "23665706",
    excipientName: "Sodium Starch Glycolate",
    compatibility: "incompatible",
    score: 35,
    prediction: 0,
    confidence: 0.89,
    notes: "Strong incompatibility signal",
    fingerprint: "Generated via PubChem CACTVS",
  },
  {
    drugCID: "2519",
    drugName: "Caffeine",
    excipientCID: "5460341",
    excipientName: "Lactose Monohydrate",
    compatibility: "compatible",
    score: 90,
    prediction: 1,
    confidence: 0.9,
    notes: "Stable neural network prediction",
    fingerprint: "Generated via PubChem CACTVS",
  },
]

const getCompatibilityIcon = (compatibility: string) => {
  switch (compatibility) {
    case "compatible":
      return <CheckCircle className="w-5 h-5 text-green-500" />
    case "caution":
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />
    case "incompatible":
      return <XCircle className="w-5 h-5 text-red-500" />
    default:
      return null
  }
}

const getCompatibilityBadge = (compatibility: string, score: number) => {
  switch (compatibility) {
    case "compatible":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Compatible ({score}%)</Badge>
    case "caution":
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Caution ({score}%)</Badge>
    case "incompatible":
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Incompatible ({score}%)</Badge>
    default:
      return null
  }
}

export default function CompatibilityPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredData, setFilteredData] = useState(compatibilityData)
  const [drugCID, setDrugCID] = useState("")
  const [excipientCID, setExcipientCID] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [predictionResult, setPredictionResult] = useState<any>(null)

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    if (term === "") {
      setFilteredData(compatibilityData)
    } else {
      const filtered = compatibilityData.filter(
        (item) =>
          item.drugName.toLowerCase().includes(term.toLowerCase()) ||
          item.drugCID.includes(term) ||
          item.excipientName.toLowerCase().includes(term.toLowerCase()) ||
          item.excipientCID.toLowerCase().includes(term.toLowerCase()),
      )
      setFilteredData(filtered)
    }
  }

  const handlePrediction = async () => {
    if (!drugCID.trim() || !excipientCID.trim()) {
      alert("Please enter both Drug CID and Excipient CID")
      return
    }

    setIsAnalyzing(true)

    // Simulate API call to TensorFlow backend
    setTimeout(() => {
      const mockResult = {
        drugCID,
        excipientCID,
        prediction: Math.random() > 0.5 ? 1 : 0,
        confidence: Math.random(),
        fingerprint_generated: true,
        model_version: "TensorFlow 2.x",
        processing_time: "2.3s",
      }

      setPredictionResult(mockResult)
      setIsAnalyzing(false)
    }, 2300)
  }

  const compatibleCount = filteredData.filter((item) => item.compatibility === "compatible").length
  const cautionCount = filteredData.filter((item) => item.compatibility === "caution").length
  const incompatibleCount = filteredData.filter((item) => item.compatibility === "incompatible").length

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
            <h1 className="text-2xl font-bold text-gray-900">Drug-Excipient Compatibility</h1>
          </div>
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by Drug CID, Drug Name, or Excipient..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Prediction Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="w-5 h-5 mr-2" />
              Prediction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Drug PubChem CID</label>
                <Input
                  placeholder="e.g., 3878 (Aspirin)"
                  value={drugCID}
                  onChange={(e) => setDrugCID(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Excipient PubChem CID</label>
                <Input
                  placeholder="e.g., 104938 (MCC)"
                  value={excipientCID}
                  onChange={(e) => setExcipientCID(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handlePrediction} disabled={isAnalyzing} className="w-full">
                  <Zap className="w-4 h-4 mr-2" />
                  {isAnalyzing ? "Analyzing..." : "Predict"}
                </Button>
              </div>
            </div>

            {predictionResult && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Prediction Result:</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Drug CID:</strong> {predictionResult.drugCID}
                  </div>
                  <div>
                    <strong>Excipient CID:</strong> {predictionResult.excipientCID}
                  </div>
                  <div>
                    <strong>Prediction:</strong> {predictionResult.prediction === 1 ? "Compatible" : "Incompatible"}
                  </div>
                  <div>
                    <strong>Confidence:</strong> {(predictionResult.confidence * 100).toFixed(1)}%
                  </div>
                  <div>
                    <strong>Fingerprint:</strong> {predictionResult.fingerprint_generated ? "Generated" : "Failed"}
                  </div>
                  <div>
                    <strong>Processing Time:</strong> {predictionResult.processing_time}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Combinations</p>
                  <p className="text-2xl font-bold">{filteredData.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Search className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Compatible</p>
                  <p className="text-2xl font-bold text-green-600">{compatibleCount}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Caution</p>
                  <p className="text-2xl font-bold text-yellow-600">{cautionCount}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Incompatible</p>
                  <p className="text-2xl font-bold text-red-600">{incompatibleCount}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Compatibility Table */}
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-semibold">Drug Information</th>
                    <th className="text-left p-4 font-semibold">Excipient Information</th>
                    <th className="text-left p-4 font-semibold">ML Prediction</th>
                    <th className="text-left p-4 font-semibold">Confidence</th>
                    <th className="text-left p-4 font-semibold">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div>
                          <p className="font-semibold">{item.drugName}</p>
                          <p className="text-sm text-gray-600">CID: {item.drugCID}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-semibold">{item.excipientName}</p>
                          <p className="text-sm text-gray-600">CID: {item.excipientCID}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          {getCompatibilityIcon(item.compatibility)}
                          {getCompatibilityBadge(item.compatibility, item.score)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          <p className="font-semibold">{(item.confidence * 100).toFixed(1)}%</p>
                          <p className="text-gray-600">Neural Network</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-gray-700">{item.notes}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredData.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No compatibility data found for your search.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
