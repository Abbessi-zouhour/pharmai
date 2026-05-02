"use client"

import { useEffect, useState } from "react"
import { JSX } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Brain,
  Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

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
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-200">
          Compatible ({score}%)
        </Badge>
      )
    case "caution":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200">
          Caution ({score}%)
        </Badge>
      )
    case "incompatible":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-200">
          Incompatible ({score}%)
        </Badge>
      )
    default:
      return null
  }
}

export default function CompatibilityPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [compatibilityData, setCompatibilityData] = useState<any[]>([])
  const [defaultData, setDefaultData] = useState<any[]>([])
  const [drugCID, setDrugCID] = useState("")
  const [excipientCID, setExcipientCID] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [predictionResult, setPredictionResult] = useState<any>(null)

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const res = await fetch("http://127.0.0.1:8000/initial_compatibility_data")
        if (!res.ok) throw new Error("Failed to load compatibility data")
        const data = await res.json()
        setCompatibilityData(data)
        setDefaultData(data)
      } catch (err) {
        console.error("Error fetching initial data:", err)
      }
    }

    fetchInitialData()
  }, [])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    if (term === "") {
      setCompatibilityData(defaultData)
    } else {
      const filtered = defaultData.filter(
        (item) =>
          item.drugName.toLowerCase().includes(term.toLowerCase()) ||
          item.drugCID.toLowerCase().includes(term) ||
          item.excipientName.toLowerCase().includes(term.toLowerCase()) ||
          item.excipientCID.toLowerCase().includes(term),
      )
      setCompatibilityData(filtered)
    }
  }

  const handlePrediction = async () => {
    if (!drugCID.trim() || !excipientCID.trim()) {
      alert("Please enter both Drug CID and Excipient CID")
      return
    }

    setIsAnalyzing(true)
    setPredictionResult(null)

    try {
      const response = await fetch("http://127.0.0.1:8000/predict_interaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          drug_cid: parseInt(drugCID),
          excipient_cid: parseInt(excipientCID),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Prediction result:", data)

      const compatibility = data.prediction === 1 ? "compatible" : "incompatible"

      const newPrediction = {
        drugCID,
        drugName: data.drug_name || `Drug-${drugCID}`,
        excipientCID,
        excipientName: data.excipient_name || `Excipient-${excipientCID}`,
        compatibility,
        score: Math.round(data.confidence * 100),
        prediction: data.prediction,
        confidence: data.confidence,
        notes: `Prediction: ${compatibility === "compatible" ? "Compatible" : "Incompatible"}`,
        fingerprint: "Generated via PubChem CACTVS",
      }

      setCompatibilityData((prevData) => [newPrediction, ...prevData])
      setDefaultData((prevData) => [newPrediction, ...prevData])

      setPredictionResult({
        drugCID,
        excipientCID,
        prediction: data.prediction,
        confidence: data.confidence,
        fingerprint_generated: true,
        model_version: "FastAPI-backend",
        processing_time: data.processing_time || "N/A",
      })

      setDrugCID("")
      setExcipientCID("")
    } catch (error: any) {
      console.error("Prediction error:", error)
      alert("Error: " + error.message)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const compatibleCount = compatibilityData.filter((item) => item.compatibility === "compatible").length
  const cautionCount = compatibilityData.filter((item) => item.compatibility === "caution").length
  const incompatibleCount = compatibilityData.filter((item) => item.compatibility === "incompatible").length

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <div className="border-b bg-white dark:bg-gray-900 dark:border-gray-700 sticky top-0 z-10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/pharmai">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">
              Drug-Excipient Compatibility
            </h1>
          </div>
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by Drug CID, Drug Name, or Excipient..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Prediction Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-900 dark:text-white transition-colors">
              <Brain className="w-5 h-5 mr-2" />
              Prediction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                  Drug CID
                </label>
                <Input
                  placeholder="e.g., 3878"
                  value={drugCID}
                  onChange={(e) => setDrugCID(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                  Excipient CID
                </label>
                <Input
                  placeholder="e.g., 104938"
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
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg transition-colors">
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white transition-colors">
                  Prediction Result:
                </h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="text-gray-900 dark:text-white"><strong>Drug CID:</strong> {predictionResult.drugCID}</div>
                  <div className="text-gray-900 dark:text-white"><strong>Excipient CID:</strong> {predictionResult.excipientCID}</div>
                  <div className="text-gray-900 dark:text-white"><strong>Prediction:</strong> {predictionResult.prediction === 1 ? "Compatible" : "Incompatible"}</div>
                  <div className="text-gray-900 dark:text-white"><strong>Model Certainty:</strong> {(predictionResult.confidence * 100).toFixed(1)}%</div>
                  <div className="text-gray-900 dark:text-white"><strong>Fingerprint:</strong> {predictionResult.fingerprint_generated ? "Generated" : "Failed"}</div>
                  <div className="text-gray-900 dark:text-white"><strong>Processing Time:</strong> {predictionResult.processing_time}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <SummaryCard label="Total Combinations" count={compatibilityData.length} icon={<Search className="w-6 h-6" />} color="blue" />
          <SummaryCard label="Compatible" count={compatibleCount} icon={<CheckCircle className="w-6 h-6" />} color="green" />
          <SummaryCard label="Incompatible" count={incompatibleCount} icon={<XCircle className="w-6 h-6" />} color="red" />
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
                  <tr>
                    <th className="text-left p-4">Drug</th>
                    <th className="text-left p-4">Excipient</th>
                    <th className="text-left p-4">ML Prediction</th>
                    <th className="text-left p-4">Model Certainty</th>
                    <th className="text-left p-4">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {compatibilityData.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-4">{item.drugName} (CID: {item.drugCID})</td>
                      <td className="p-4">{item.excipientName} (CID: {item.excipientCID})</td>
                      <td className="p-4 flex items-center space-x-2">
                        {getCompatibilityIcon(item.compatibility)}
                        {getCompatibilityBadge(item.compatibility, item.score)}
                      </td>
                      <td className="p-4">{(item.confidence * 100).toFixed(1)}%</td>
                      <td className="p-4">{item.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {compatibilityData.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No compatibility data found for your search.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function SummaryCard({ label, count, icon, color }: { label: string; count: number; icon: JSX.Element; color: string }) {
  return (
    <Card className={`bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
            <p className={`text-2xl font-bold text-${color}-600 dark:text-${color}-400`}>{count}</p>
          </div>
          <div className={`w-12 h-12 bg-${color}-100 dark:bg-${color}-900 rounded-full flex items-center justify-center`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
