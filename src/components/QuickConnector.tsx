"use client"

import type React from "react"
import { useState } from "react"
import { useAppStore } from "../store"
import type { Exchange } from "../types"
import { api } from "../services/api"
import { useTranslation } from "react-i18next"
import { addExchangeConnection } from "../services/supabaseService"
import { toast } from "react-toastify"

const QuickConnector: React.FC = () => {
const { connections, addConnection, setBalance } = useAppStore()
const { t } = useTranslation()
const [selectedExchange, setSelectedExchange] = useState<Exchange>("Binance")
const [apiKey, setApiKey] = useState("")
const [apiSecret, setApiSecret] = useState("")
const [isConnecting, setIsConnecting] = useState(false)
const [error, setError] = useState("")
const [accountType, setAccountType] = useState<"spot" | "futures">("futures")

const exchanges: Exchange[] = ["Binance", "Bybit", "OKX", "Kraken", "Deribit"]

const handleConnect = async () => {
  if (!apiKey || !apiSecret) {
    setError("API Key and Secret are required")
    return
  }

  setIsConnecting(true)
  setError("")

  try {
    console.log("QuickConnector: Connecting to exchange:", selectedExchange, accountType)

    // First validate with exchange API
    const result = await api.connectExchange(selectedExchange, apiKey, apiSecret, accountType)

    if (result.success) {
      console.log("QuickConnector: Connection successful, saving to Supabase")

      // Then save to Supabase
      await addExchangeConnection({
        exchange: selectedExchange,
        api_key: apiKey,
        api_secret: apiSecret,
        account_type: accountType,
      })

      // Create the new connection object
      const newConnection = {
        exchange: selectedExchange,
        connected: true,
        apiKey,
        apiSecret,
        accountType,
        lastSynced: Date.now(),
      }

      // Update local state
      console.log("QuickConnector: Adding connection to local state")
      addConnection(newConnection)

      // Update the hasConnectedExchanges flag in the API
      const updatedConnections = [...connections, newConnection]
      console.log("QuickConnector: Updating hasConnectedExchanges flag")
      await api.checkRealConnections(updatedConnections)

      // Fetch balance immediately to update the dashboard
      console.log("QuickConnector: Fetching initial balance")
      const balanceData = await api.getAccountBalance(updatedConnections, accountType)
      console.log("QuickConnector: Initial balance fetched:", balanceData)
      setBalance(balanceData)

      toast.success(`Connected to ${selectedExchange} ${accountType} account successfully`)

      // Reset form
      setApiKey("")
      setApiSecret("")
    } else {
      setError(result.message || "Failed to connect to exchange")
      toast.error(result.message || "Failed to connect to exchange")
    }
  } catch (err: any) {
    console.error("QuickConnector: Error connecting to exchange:", err)
    setError("An error occurred while connecting to the exchange")
    toast.error(err.message || "An error occurred while connecting to the exchange")
  } finally {
    setIsConnecting(false)
  }
}
