import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Atom, FlaskConical, ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function PharmAIHomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Back to Healio Button */}
        <div className="flex justify-start w-full">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Healio
            </Button>
          </Link>
        </div>

        {/* Logo and Title */}
        <div className="space-y-6">
          <div className="flex justify-center">
            <Image src="/logo.png" alt="Healio Logo" width={120} height={120} className="rounded-full" />
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl font-bold text-gray-900 tracking-tight">Healio</h1>
            <p className="text-xl text-gray-600 font-medium">Advanced Drug Analysis Platform</p>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid md:grid-cols-2 gap-6 mt-12">
          <Link href="/molecular-visualization">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-200">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Atom className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">3D Molecular Visualization</h3>
                <p className="text-gray-600">Interactive 3D molecular structures with properties and SMILES notation</p>
                <Button className="w-full">Explore Molecules</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/compatibility">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-green-200">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <FlaskConical className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Drug-Excipient Compatibility</h3>
                <p className="text-gray-600">Analyze compatibility between drug compounds and excipients</p>
                <Button className="w-full">Check Compatibility</Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
