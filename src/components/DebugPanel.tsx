"use client"

import type React from "react"
import { useState } from "react"
import { useAppStore } from "../store"
import { api } from "../services/api"

interface DebugPanelProps {
  initialExpanded?: boolean
}

const DebugPanel: React.FC<DebugPanelProps> = ({ initialExpanded = false }) => {
  const [expanded, setExpanded] = useState(initialExpanded)
  const { connections, balance } = useAppStore()
  const [apiState, setApiState] = useState<{ hasConnectedExchanges: boolean }>({ hasConnectedExchanges: false })

  // Função para verificar o estado atual da API
  const checkApiState = async () => {
    // Verificar o estado atual da flag hasConnectedExchanges
    const hasConnections = await api.checkRealConnections(connections)
    setApiState({ hasConnectedExchanges: hasConnections })
  }

  // Função para forçar uma atualização do saldo
  const forceBalanceUpdate = async () => {
    try {
      const accountType = connections.length > 0 ? connections[0].accountType || "futures" : "futures"
      await api.checkRealConnections(connections)
      const balanceData = await api.getAccountBalance(connections, accountType)
      console.log("DebugPanel: Forced balance update:", balanceData)
    } catch (error) {
      console.error("DebugPanel: Error forcing balance update:", error)
    }
  }
}
