import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function HealioLanding() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl mx-auto text-center space-y-12">
        {/* Logo */}
        <div className="flex justify-center">
          <Image src="/logo.png" alt="Healio Logo" width={200} height={200} className="rounded-full shadow-lg" />
        </div>

        {/* Brand Name */}
        <div className="space-y-4">
          <h1 className="text-7xl font-bold text-gray-900 tracking-tight">Healio</h1>
          <p className="text-xl text-gray-600 font-medium">Advanced Pharmaceutical Intelligence Platform</p>
        </div>

        {/* Enter Button */}
        <div className="pt-8">
          <Link href="/pharmai">
            <Button size="lg" className="px-12 py-4 text-lg font-semibold">
              Enter Platform
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
