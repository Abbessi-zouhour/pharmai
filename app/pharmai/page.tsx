import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Atom, FlaskConical, ArrowLeft, Bot } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function PharmAIHomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-center p-8 transition-colors">
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
            <Image
              src="/logo.png"
              alt="Healio Logo"
              width={120}
              height={120}
              className="rounded-full object-cover w-[120px] h-[120px]"
            />
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white tracking-tight transition-colors">
              Healio
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 font-medium transition-colors">
              Advanced Drug Analysis Platform
            </p>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Link href="/molecular-visualization">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-200 dark:hover:border-blue-400 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
                  <Atom className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">3D Molecular Visualization</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Interactive 3D molecular structures with properties and SMILES notation
                </p>
                <Button className="w-full">Explore Molecules</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/compatibility">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-green-200 dark:hover:border-green-400 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
                  <FlaskConical className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Drug-Excipient Compatibility</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Analyze compatibility between drug compounds and excipients
                </p>
                <Button className="w-full">Check Compatibility</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/ai-assistant">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-cyan-200 dark:hover:border-cyan-400 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900 dark:to-blue-900 rounded-full flex items-center justify-center mx-auto">
                  <Bot className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Pharmaceutical AI Assistant</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Interactive AI assistant for pharmaceutical questions and drug analysis guidance
                </p>
                <Button className="w-full">Ask Questions</Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
