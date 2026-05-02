"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Send, Bot, User, Sparkles, MessageCircle, Lightbulb, FlaskConical } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useRef, useEffect } from "react"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  isTyping?: boolean
}

const suggestedQuestions = [
  "What are the compatibility issues between aspirin and microcrystalline cellulose?",
  "How does pH affect drug-excipient interactions?",
  "What are the key factors in tablet formulation stability?",
  "Explain the role of disintegrants in pharmaceutical formulations",
  "What are the common incompatibilities with lactose monohydrate?",
  "How do I choose the right excipient for a moisture-sensitive drug?",
]

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      content: "Hello! I'm your pharmaceutical AI assistant.What would you like to know? ",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

const handleSendMessage = async (input: string) => {
  if (!input.trim()) return

  const userMessage: Message = {
    id: Date.now().toString(),
    type: "user",
    content: input,
    timestamp: new Date(),
  }

  setMessages((prev) => [...prev, userMessage])
  setInputValue("")
  setIsTyping(true)

  try {
    console.log("Sending request to:", "http://127.0.0.1:8000/api/llm")
    console.log("Request body:", { prompt: userMessage.content })

    const res = await fetch("http://127.0.0.1:8000/api/llm", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: userMessage.content }),
    })

    console.log("Response status:", res.status)
    console.log("Response ok:", res.ok)

    if (!res.ok) {
      const errorText = await res.text()
      console.error("Error response:", errorText)
      throw new Error(`HTTP ${res.status}: ${errorText}`)
    }

    const data = await res.json()
    console.log("Response data:", data)

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: "assistant",
      content: data.response || "Sorry, no response.",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, assistantMessage])
  } catch (error) {
    console.error("LLM fetch error:", error)
    const errorMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: "assistant",
      content: `An error occurred: ${error.message}`,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, errorMessage])
  } finally {
    setIsTyping(false)
  }
}

  const handleSuggestedQuestion = (question: string) => {
    handleSendMessage(question)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(inputValue)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="border-b bg-white dark:bg-gray-900 dark:border-gray-700 sticky top-0 z-10 transition-colors">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/pharmai">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white transition-colors">
                  Pharmaceutical AI Assistant
                </h1>
              </div>
            </div>
          </div>
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            Online
          </Badge>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 pb-24">
        {/* Welcome Section */}
        {messages.length === 1 && (
          <div className="text-center py-12 mb-8">
            <div className="flex justify-center mb-6">
              <Image
                src="/robot.jpg"
                alt="AI Assistant Robot"
                width={200}
                height={200}
                className="rounded-2xl shadow-lg"
              />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">
              Welcome to Healio AI
            </h2>

            {/* Suggested Questions */}
            <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {suggestedQuestions.slice(0, 4).map((question, index) => (
                <Card
                  key={index}
                  className="cursor-pointer hover:shadow-md transition-all duration-200 border-2 hover:border-cyan-200 dark:hover:border-cyan-400 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  onClick={() => handleSuggestedQuestion(question)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-cyan-100 dark:bg-cyan-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        {index === 0 && <FlaskConical className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />}
                        {index === 1 && <Lightbulb className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />}
                        {index === 2 && <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />}
                        {index === 3 && <MessageCircle className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />}
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 text-left transition-colors">{question}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="space-y-6">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`flex space-x-3 max-w-3xl ${message.type === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
              >
                {/* Avatar */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.type === "user" ? "bg-blue-500" : "bg-gradient-to-br from-cyan-400 to-blue-500"
                  }`}
                >
                  {message.type === "user" ? (
                    <User className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    message.type === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                  } transition-colors`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  <p
                    className={`text-xs mt-2 ${
                      message.type === "user" ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
                    } transition-colors`}
                  >
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex space-x-3 max-w-3xl">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 transition-colors">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 transition-colors">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about drug-excipient compatibility, formulation science, or pharmaceutical properties..."
                className="pr-12 py-3 text-base bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                disabled={isTyping}
              />
              <Button
                onClick={() => handleSendMessage(inputValue)}
                disabled={!inputValue.trim() || isTyping}
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
