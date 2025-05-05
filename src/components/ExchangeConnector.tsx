"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAppStore } from "../store"
import type { Exchange } from "../types"
import { api } from "../services/api"
import { useTranslation } from "react-i18next"
import { addExchangeConnection, getExchangeConnections, deleteExchangeConnection } from "../services/supabaseService"
import { toast } from "react-toastify"
import { Wallet, Key, KeyRound, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react"

const ExchangeConnector: React.FC = () => {
  const { connections, addConnection, removeConnection, setBalance } = useAppStore()
  const { t } = useTranslation()
  const selectedExchange: Exchange = "Binance"
  const [apiKey, setApiKey] = useState("")
  const [apiSecret, setApiSecret] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [accountType, setAccountType] = useState<"spot" | "futures">("futures")

  const exchanges: Exchange[] = ["Binance"]

  useEffect(() => {
    const loadConnections = async () => {
      try {
        setIsLoading(true)
        const connections = await getExchangeConnections()
        connections.forEach((connection) => {
          addConnection(connection)
        })

        if (connections.length > 0) {
          await api.checkRealConnections(connections)
        }
      } catch (error) {
        console.error("Error loading exchange connections:", error)
        toast.error("Falha ao carregar conexões de corretoras")
      } finally {
        setIsLoading(false)
      }
    }

    loadConnections()
  }, [addConnection])

  // Modifique a função handleConnect para garantir que os dados sejam atualizados após conectar uma corretora
  const handleConnect = async () => {
    if (!apiKey || !apiSecret) {
      setError("API Key e Secret são obrigatórios")
      return
    }

    setIsConnecting(true)
    setError("")

    try {
      console.log("ExchangeConnector: Connecting to exchange:", selectedExchange, accountType)
      console.log(
        "ExchangeConnector: API Key format check:",
        apiKey.length > 8
          ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`
          : "API Key muito curta ou inválida",
      )
      console.log("ExchangeConnector: API Secret length:", apiSecret.length)

      // First validate with exchange API
      const result = await api.connectExchange(selectedExchange, apiKey, apiSecret, accountType)

      if (result.success) {
        console.log("ExchangeConnector: Connection successful, saving to Supabase")

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
        console.log("ExchangeConnector: Adding connection to local state")
        addConnection(newConnection)

        // Update the hasConnectedExchanges flag in the API
        const updatedConnections = [...connections, newConnection]
        console.log("ExchangeConnector: Updating hasConnectedExchanges flag")
        await api.checkRealConnections(updatedConnections)

        // Fetch balance immediately to update the dashboard
        console.log("ExchangeConnector: Fetching initial balance")
        try {
          const balanceData = await api.getAccountBalance(updatedConnections, accountType)
          console.log("ExchangeConnector: Initial balance fetched:", balanceData)
          setBalance(balanceData)
        } catch (balanceError) {
          console.error("ExchangeConnector: Error fetching initial balance:", balanceError)
          toast.warning("Conexão estabelecida, mas houve um erro ao buscar o saldo inicial")
        }

        toast.success(`Conectado à ${selectedExchange} ${accountType === "futures" ? "Futuros" : "Spot"} com sucesso!`)

        // Reset form
        setApiKey("")
        setApiSecret("")
      } else {
        console.error("ExchangeConnector: Connection failed:", result.message)
        setError(result.message || "Falha ao conectar à corretora")
        toast.error(result.message || "Falha ao conectar à corretora")
      }
    } catch (err: any) {
      console.error("ExchangeConnector: Error connecting to exchange:", err)
      setError("Ocorreu um erro ao conectar à corretora: " + (err.message || "Erro desconhecido"))
      toast.error(err.message || "Ocorreu um erro ao conectar à corretora")
    } finally {
      setIsConnecting(false)
    }
  }

  const handleRemoveConnection = async (exchange: string) => {
    try {
      await deleteExchangeConnection(exchange)
      removeConnection(exchange)

      const updatedConnections = (connections || []).filter((conn) => conn.exchange !== exchange)
      await api.checkRealConnections(updatedConnections)

      toast.success(`Desconectado de ${exchange} com sucesso!`)
    } catch (error) {
      console.error("Error removing exchange connection:", error)
      toast.error("Falha ao remover conexão com a corretora")
    }
  }

  return (
    <div className="space-y-6">
      {/* Connection Form */}
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Corretora</label>
            <div className="flex items-center space-x-3 p-3 bg-black/40 border border-violet-700/30 rounded-lg">
              <Wallet size={18} className="text-violet-400" />
              <span className="text-gray-200">Binance</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Tipo de Conta</label>
            <div className="relative">
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value as "spot" | "futures")}
                className="w-full bg-black/40 border border-violet-700/30 rounded-lg px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-200"
              >
                <option value="futures">Futuros</option>
                <option value="spot">Spot</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">API Key</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Key size={18} className="text-violet-400" />
            </div>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 bg-black/40 border border-violet-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-200 placeholder-gray-500"
              placeholder="Cole sua API Key aqui"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">API Secret</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <KeyRound size={18} className="text-violet-400" />
            </div>
            <input
              type="password"
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 bg-black/40 border border-violet-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-200 placeholder-gray-500"
              placeholder="Cole seu API Secret aqui"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Seu API Secret nunca é armazenado em texto simples e é criptografado antes de ser salvo.
          </p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-800 rounded-lg p-3 flex items-center">
            <AlertTriangle size={18} className="text-red-400 mr-2 flex-shrink-0" />
            <span className="text-sm text-red-400">{error}</span>
          </div>
        )}

        <button
          onClick={handleConnect}
          disabled={isConnecting || !apiKey || !apiSecret}
          className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isConnecting ? (
            <>
              <RefreshCw size={18} className="animate-spin mr-2" />
              Conectando...
            </>
          ) : (
            <>
              <Wallet size={18} className="mr-2" />
              Conectar Corretora
            </>
          )}
        </button>
      </div>

      {/* Connected Exchanges */}
      {(connections || []).length > 0 && (
        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-semibold text-gray-200 border-b border-dark-700 pb-2">
            {t("connections.connectedExchanges")}
          </h3>
          <div className="space-y-3">
            {(connections || []).map((connection) => (
              <div
                key={connection.exchange}
                className="flex items-center justify-between bg-black/40 p-4 rounded-lg border border-violet-700/30 hover:border-violet-600/50 transition-colors"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-violet-900/30 flex items-center justify-center mr-3">
                    <Wallet size={20} className="text-violet-400" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-200">{connection.exchange}</div>
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-gray-400 mr-2">
                        {connection.accountType === "futures" ? "Futuros" : "Spot"}
                      </span>
                      <span className="flex items-center text-xs text-violet-400">
                        <CheckCircle size={12} className="mr-1" />
                        Conectada
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveConnection(connection.exchange)}
                  className="flex items-center px-4 py-2 bg-black/60 hover:bg-black/80 border border-violet-700/30 hover:border-violet-600/50 text-gray-300 rounded-lg transition-colors"
                >
                  Desconectar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ExchangeConnector
