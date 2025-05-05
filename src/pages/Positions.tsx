"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useAppStore } from "../store"
import { api } from "../services/api"
import { useTranslation } from "react-i18next"

const Positions: React.FC = () => {
  const { positions, riskStatus, connections, setPositions, updateRiskStatus } = useAppStore()
  const [isLoading, setIsLoading] = useState(true)
  const { t } = useTranslation()

  // Check if user has connected exchanges
  const hasConnections = connections.length > 0

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Se houver conexões, buscar dados reais (que agora retornam vazios)
        if (hasConnections) {
          const positionsData = await api.getPositions(connections)
          setPositions(positionsData)

          const riskStatusData = await api.getRiskStatus(connections)
          updateRiskStatus(riskStatusData)
        } else {
          // Se não houver conexões, manter posições vazias
          setPositions([])
        }
      } catch (error) {
        console.error("Error fetching positions data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [setPositions, updateRiskStatus, hasConnections, connections])
}

export default Positions
