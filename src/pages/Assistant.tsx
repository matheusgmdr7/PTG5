"use client"

import type React from "react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import AssistantChat from "../components/AssistantChat"
import { generateUserInsights, sendAssistantNotification } from "../services/assistantService"

const Assistant: React.FC = () => {
  const { t } = useTranslation()
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false)

  // Lista de perguntas sugeridas
  const suggestedQuestions = [
    t("assistant.suggestedQuestions.performance"),
    t("assistant.suggestedQuestions.risk"),
    t("assistant.suggestedQuestions.balance"),
    t("assistant.suggestedQuestions.positions"),
    t("assistant.suggestedQuestions.tips"),
  ]

  // Função para gerar insights
  const handleGenerateInsights = async () => {
    if (isGeneratingInsights) return

    setIsGeneratingInsights(true)
    try {
      const insights = await generateUserInsights()

      // Enviar notificação com os insights
      sendAssistantNotification({
        title: t("assistant.insightsNotificationTitle"),
        message: t("assistant.insightsNotificationMessage"),
        type: "info",
        link: "/dashboard/assistant",
      })

      // Exibir alerta com os insights
      alert(t("assistant.insightsGeneratedTitle") + "\n\n" + insights)
    } catch (error) {
      console.error("Error generating insights:", error)
      alert(t("assistant.insightsError"))
    } finally {
      setIsGeneratingInsights(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
          {t("assistant.title")}
        </h1>
        <button
          onClick={handleGenerateInsights}
          disabled={isGeneratingInsights}
          className="btn btn-primary text-sm px-4 py-2"
        >
          <span className="relative z-10">
            {isGeneratingInsights ? t("assistant.generatingInsights") : t("assistant.generateInsights")}
          </span>
          <span className="btn-radial-effect"></span>
        </button>
      </div>

      <div className="flex flex-1 gap-4 h-[calc(100vh-200px)]">
        {/* Chat principal */}
        <div className="flex-1 bg-black/30 backdrop-blur-sm border border-violet-700/20 rounded-lg shadow-lg overflow-hidden">
          <AssistantChat />
        </div>

        {/* Barra lateral */}
        <div className="w-64 bg-black/30 backdrop-blur-sm border border-violet-700/20 rounded-lg shadow-lg p-4">
          <h2 className="text-lg font-semibold mb-3 text-violet-300">{t("assistant.suggestedQuestionsTitle")}</h2>
          <ul className="space-y-2">
            {suggestedQuestions.map((question, index) => (
              <li key={index}>
                <button
                  className="text-left text-violet-400 hover:text-violet-300 w-full transition-colors"
                  onClick={() => {
                    // Aqui você pode implementar a lógica para adicionar a pergunta ao chat
                    // Por exemplo, disparando um evento personalizado
                    const event = new CustomEvent("assistant:ask", { detail: { question } })
                    document.dispatchEvent(event)
                  }}
                >
                  {question}
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-6 border-t border-violet-700/20 pt-4">
            <h2 className="text-lg font-semibold mb-3 text-violet-300">{t("assistant.dataAvailabilityTitle")}</h2>
            <ul className="space-y-2">
              <li className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-fuchsia-500 mr-2"></span>
                {t("assistant.dataAvailability.balance")}
              </li>
              <li className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-fuchsia-500 mr-2"></span>
                {t("assistant.dataAvailability.positions")}
              </li>
              <li className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-fuchsia-500 mr-2"></span>
                {t("assistant.dataAvailability.trades")}
              </li>
              <li className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-fuchsia-500 mr-2"></span>
                {t("assistant.dataAvailability.risk")}
              </li>
              <li className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
                {t("assistant.dataAvailability.behaviors")}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Assistant
