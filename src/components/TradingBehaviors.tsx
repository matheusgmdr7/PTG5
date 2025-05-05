"use client"

import type React from "react"
import { useState } from "react"
import { useAppStore } from "../store"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

const TradingBehaviors: React.FC = () => {
  const { behaviors, connections } = useAppStore()
  const { t } = useTranslation()
  const [showAll, setShowAll] = useState(false)

  // Check if user has connected exchanges
  const hasConnections = connections.length > 0

  if (!hasConnections) {
    return (
      <div className="bg-dark-800 rounded-lg shadow-md p-6 text-center text-gray-400 border border-dark-700">
        <p className="mb-3">Conecte sua corretora para analisar seus padrões de trading</p>
        <Link
          to="/connections"
          className="inline-block px-4 py-2 bg-primary-600 text-dark-900 rounded-md hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 text-sm"
        >
          Conectar Corretora
        </Link>
      </div>
    )
  }

  // Resto do código permanece igual...
}
