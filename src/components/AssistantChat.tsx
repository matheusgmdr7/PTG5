"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { sendMessageToAssistant } from "../services/assistantService"
import { Send } from "lucide-react"

interface Message {
  id: string
  content: string
  sender: "user" | "assistant"
  timestamp: number
}

interface AssistantChatProps {
  className?: string
}

const AssistantChat: React.FC<AssistantChatProps> = ({ className = "" }) => {
  const { t } = useTranslation()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: t("assistant.welcomeMessage"),
      sender: "assistant",
      timestamp: Date.now(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Função para formatar timestamp
  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Função para enviar mensagem
  const handleSendMessage = async () => {
    if (inputValue.trim() === "" || isLoading) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputValue,
      sender: "user",
      timestamp: Date.now(),
    }

    // Adicionar mensagem do usuário
    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    // Criar mensagem do assistente (inicialmente vazia)
    const assistantMessageId = `assistant-${Date.now()}`
    const assistantMessage: Message = {
      id: assistantMessageId,
      content: "",
      sender: "assistant",
      timestamp: Date.now(),
    }

    // Adicionar mensagem vazia do assistente
    setMessages((prev) => [...prev, assistantMessage])

    try {
      // Enviar mensagem para o assistente
      await sendMessageToAssistant(
        userMessage.content,
        (chunk) => {
          // Atualizar o conteúdo da mensagem do assistente à medida que os chunks chegam
          setMessages((prev) =>
            prev.map((msg) => (msg.id === assistantMessageId ? { ...msg, content: msg.content + chunk } : msg)),
          )
        },
        () => {
          setIsLoading(false)
        },
      )
    } catch (error) {
      console.error("Error sending message:", error)
      setIsLoading(false)
    }
  }

  // Rolar para o final da conversa quando novas mensagens são adicionadas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focar no input quando o componente é montado
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Área de mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.sender === "user"
                  ? "bg-gradient-to-r from-violet-700 to-violet-600 text-white"
                  : "bg-black/40 border border-violet-700/20 text-white"
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              <div className={`text-xs mt-1 ${message.sender === "user" ? "text-violet-200" : "text-violet-400"}`}>
                {formatTimestamp(message.timestamp)}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-black/40 border border-violet-700/20 text-white rounded-lg p-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-violet-500 animate-bounce"></div>
                <div
                  className="w-2 h-2 rounded-full bg-violet-500 animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2 h-2 rounded-full bg-violet-500 animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Área de input */}
      <div className="border-t border-violet-700/20 p-4">
        <div className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") handleSendMessage()
            }}
            placeholder={t("assistant.inputPlaceholder")}
            className="flex-1 bg-black/40 border border-violet-700/30 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 text-white placeholder-violet-400/70"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || inputValue.trim() === ""}
            className="bg-gradient-to-r from-violet-700 to-violet-600 text-white rounded-lg px-3 py-2 hover:from-violet-600 hover:to-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default AssistantChat
