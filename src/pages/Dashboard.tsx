"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useAppStore } from "../store"
import { api } from "../services/api"
import { useTranslation } from "react-i18next"
import { format, subDays } from "date-fns"
import {
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  AlertTriangle,
  Wallet,
  LineChart,
  ArrowRight,
  History,
} from "lucide-react"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"
import RiskStatusCard from "../components/RiskStatusCard"

const Dashboard: React.FC = () => {
  const { balance, positions, trades, connections, setBalance, setPositions, setTrades } = useAppStore()
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(true)
  const [tradingPerformanceData, setTradingPerformanceData] = useState<any[]>([])
  const [localBalance, setLocalBalance] = useState<any>(null)
  const [rawApiData, setRawApiData] = useState<any>(null)
  const [lastRefreshTime, setLastRefreshTime] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [updateCount, setUpdateCount] = useState(0)

  // Fetch data from API
  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      console.log("Dashboard: Iniciando busca de dados com conexões:", connections)

      if (connections && connections.length > 0) {
        console.log("Dashboard: Conexões encontradas:", connections.length)

        const accountType = connections[0].accountType || "futures"
        console.log("Dashboard: Buscando saldo para tipo de conta:", accountType)

        const balanceData = await api.getAccountBalance(connections, accountType)
        console.log("Dashboard: Dados de saldo recebidos:", balanceData)

        try {
          const rawData = api.getRawExchangeData()
          setRawApiData(rawData)
        } catch (rawDataError) {
          console.error("Dashboard: Erro ao obter dados brutos:", rawDataError)
        }

        setLocalBalance(balanceData)
        setBalance(balanceData)

        const positionsData = await api.getPositions(connections)
        console.log("Dashboard: Posições recebidas:", positionsData)
        setPositions(positionsData)

        try {
          const tradesData = await api.getTrades(connections, 100)
          console.log("Dashboard: Trades recebidos:", tradesData)
          setTrades(tradesData)
        } catch (tradeError) {
          console.error("Dashboard: Erro ao buscar histórico de trades:", tradeError)
          toast.warning("Não foi possível obter o histórico de operações")
        }

        // Adicionar atualização do status de risco
        try {
          console.log("Dashboard: Atualizando status de risco")
          await useAppStore.getState().updateRiskStatus(connections)
        } catch (riskError) {
          console.error("Dashboard: Erro ao atualizar status de risco:", riskError)
        }

        setLastRefreshTime(new Date().toLocaleTimeString())
        setUpdateCount((prev) => prev + 1)
      } else {
        console.log("Dashboard: Sem conexões disponíveis, usando dados vazios")
        setError("Nenhuma corretora conectada. Conecte uma corretora para ver seus dados.")

        const emptyBalance = {
          total: 0,
          available: 0,
          inPositions: 0,
          currency: "USD",
          accountType: "futures",
        }
        setLocalBalance(emptyBalance)
        setBalance(emptyBalance)
        setPositions([])
        setTrades([])
        setRawApiData(null)
      }
    } catch (error) {
      console.error("Dashboard: Erro ao buscar dados:", error)
      setError("Erro ao buscar dados da corretora. Verifique o console para mais detalhes.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const intervalId = setInterval(fetchData, 30000)
    return () => clearInterval(intervalId)
  }, [connections, setBalance, setPositions, setTrades])

  useEffect(() => {
    if (trades && trades.length > 0) {
      const tradesByDay = new Map()

      const diasDaSemana = {
        Sun: "Dom",
        Mon: "Seg",
        Tue: "Ter",
        Wed: "Qua",
        Thu: "Qui",
        Fri: "Sex",
        Sat: "Sáb",
      }

      for (let i = 6; i >= 0; i--) {
        const date = subDays(new Date(), i)
        const formattedDate = format(date, "EEE")
        const diaEmPortugues = diasDaSemana[formattedDate as keyof typeof diasDaSemana] || formattedDate
        tradesByDay.set(diaEmPortugues, { date: diaEmPortugues, profit: 0, loss: 0 })
      }

      trades.forEach((trade) => {
        const tradeDate = new Date(trade.timestamp)
        const dayName = format(tradeDate, "EEE")
        const diaEmPortugues = diasDaSemana[dayName as keyof typeof diasDaSemana] || dayName

        const sevenDaysAgo = subDays(new Date(), 7)
        if (tradeDate >= sevenDaysAgo) {
          if (tradesByDay.has(diaEmPortugues)) {
            const dayData = tradesByDay.get(diaEmPortugues)
            if (trade.pnl >= 0) {
              dayData.profit += trade.pnl
            } else {
              dayData.loss += trade.pnl
            }
            tradesByDay.set(diaEmPortugues, dayData)
          }
        }
      })

      const chartData = Array.from(tradesByDay.values())
      setTradingPerformanceData(chartData)
    } else {
      const emptyData = []

      const diasDaSemana = {
        Sun: "Dom",
        Mon: "Seg",
        Tue: "Ter",
        Wed: "Qua",
        Thu: "Qui",
        Fri: "Sex",
        Sat: "Sáb",
      }

      for (let i = 6; i >= 0; i--) {
        const date = subDays(new Date(), i)
        const formattedDate = format(date, "EEE")
        const diaEmPortugues = diasDaSemana[formattedDate as keyof typeof diasDaSemana] || formattedDate
        emptyData.push({ date: diaEmPortugues, profit: 0, loss: 0 })
      }
      setTradingPerformanceData(emptyData)
    }
  }, [trades])

  // Usar valores padrão para evitar erros
  const displayBalance = localBalance ||
    balance || {
      total: 0,
      available: 0,
      inPositions: 0,
      currency: "USD",
      accountType: "futures",
    }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-200">Dashboard</h1>
        <div className="flex items-center gap-3">
          {lastRefreshTime && (
            <span className="text-xs text-gray-400 bg-violet-900/20 px-3 py-1.5 rounded-md border border-violet-700/30">
              Atualizado: {lastRefreshTime}
            </span>
          )}
          <button
            onClick={async () => {
              try {
                setIsLoading(true)
                await fetchData()
                console.log("Dashboard: Buscando posições manualmente")
                const positionsData = await api.getPositions(connections)
                console.log("Dashboard: Posições recebidas:", positionsData)
                setPositions(positionsData)
                toast.success("Dados atualizados com sucesso")
              } catch (error) {
                console.error("Dashboard: Erro ao atualizar dados:", error)
                toast.error("Erro ao atualizar dados")
              } finally {
                setIsLoading(false)
              }
            }}
            className="px-4 py-2 bg-gradient-to-r from-violet-800 to-fuchsia-800 hover:from-violet-700 hover:to-fuchsia-700 text-white rounded-lg transition-all duration-300 font-medium relative overflow-hidden group shadow-lg shadow-violet-700/20 hover:shadow-violet-600/40 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <RefreshCw size={16} className="animate-spin mr-2" />
                Atualizando...
              </>
            ) : (
              <>
                <RefreshCw size={16} className="mr-2" />
                Atualizar
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-800 rounded-lg p-4 flex items-start">
          <AlertTriangle className="text-red-400 mr-3 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-medium text-red-400">Erro</h3>
            <p className="text-sm text-gray-300 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Balance Section */}
      <RiskStatusCard />
      <div className="bg-gradient-to-br from-black to-violet-950/20 rounded-xl border border-violet-700/30 shadow-lg overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]"></div>
        <div className="p-5 border-b border-violet-900/20 flex justify-between items-center relative z-10">
          <h2 className="text-xl font-semibold text-gray-200">Saldo</h2>
          <div className="text-xs text-gray-400 flex items-center">
            <span className="mr-2">Tipo de conta:</span>
            <span className="px-2 py-0.5 bg-violet-900/30 text-violet-400 rounded-full">
              {displayBalance?.accountType === "futures" ? "Futuros" : "Spot"}
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="animate-pulse p-6">
            <div className="h-10 bg-violet-900/20 rounded mb-4"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 bg-violet-900/20 rounded"></div>
              <div className="h-16 bg-violet-900/20 rounded"></div>
            </div>
          </div>
        ) : (
          <div className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-gray-400">Saldo Total</div>
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                {displayBalance?.total?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }) || "0.00"}{" "}
                <span className="text-sm text-gray-400">{displayBalance?.currency || "USD"}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-violet-900/20 rounded-lg p-4 border border-violet-700/30">
                <div className="text-sm text-gray-400 mb-1">Disponível</div>
                <div className="text-xl font-medium text-gray-200">
                  {displayBalance?.available?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }) || "0.00"}{" "}
                  <span className="text-xs text-gray-400">{displayBalance?.currency || "USD"}</span>
                </div>
              </div>

              <div className="bg-violet-900/20 rounded-lg p-4 border border-violet-700/30">
                <div className="text-sm text-gray-400 mb-1">Em Posições</div>
                <div className="text-xl font-medium text-gray-200">
                  {displayBalance?.inPositions?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }) || "0.00"}{" "}
                  <span className="text-xs text-gray-400">{displayBalance?.currency || "USD"}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-violet-900/20">
              <div className="text-sm text-gray-400 mb-3">Corretoras Conectadas:</div>
              {connections && connections.length > 0 ? (
                <div className="space-y-2">
                  {connections.map((connection) => (
                    <div
                      key={connection.exchange}
                      className="flex items-center bg-violet-900/20 p-3 rounded-lg border border-violet-700/30"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-800 to-fuchsia-800 flex items-center justify-center mr-3 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4),transparent_70%)]"></div>
                        <Wallet className="text-white z-10" size={16} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-200">{connection.exchange}</div>
                        <div className="text-xs text-gray-400">{connection.accountType || "futures"}</div>
                      </div>
                      <div className="text-xs px-2 py-1 bg-violet-900/20 text-violet-400 rounded-full border border-violet-700/30">
                        Conectada
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-400 text-center py-3 bg-violet-900/20 rounded-lg border border-violet-700/30">
                  Nenhuma corretora conectada
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Open Orders Section */}
      <div className="bg-gradient-to-br from-black to-violet-950/20 rounded-xl border border-violet-700/30 shadow-lg overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]"></div>
        <div className="p-5 border-b border-violet-900/20 flex justify-between items-center relative z-10">
          <h2 className="text-xl font-semibold text-gray-200">Ordens Abertas</h2>
          <div className="text-xs text-gray-400">
            {positions?.length || 0} {positions?.length === 1 ? "posição" : "posições"} ativa
            {positions?.length !== 1 ? "s" : ""}
          </div>
        </div>

        {isLoading ? (
          <div className="animate-pulse p-6 space-y-4">
            <div className="h-12 bg-violet-900/20 rounded"></div>
            <div className="h-12 bg-violet-900/20 rounded"></div>
          </div>
        ) : positions && positions.length > 0 ? (
          <div className="overflow-x-auto relative z-10">
            <table className="w-full">
              <thead className="bg-violet-900/20">
                <tr className="text-left text-gray-400 text-xs uppercase">
                  <th className="px-6 py-3">Par</th>
                  <th className="px-6 py-3">Lado</th>
                  <th className="px-6 py-3">Tamanho</th>
                  <th className="px-6 py-3">Preço Entrada</th>
                  <th className="px-6 py-3">Alavancagem</th>
                  <th className="px-6 py-3">PnL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-violet-900/20">
                {positions.map((position) => (
                  <tr key={position.id} className="text-gray-200 hover:bg-violet-900/20 transition-colors">
                    <td className="px-6 py-4 font-medium">{position.symbol}</td>
                    <td className="px-6 py-4">
                      <div
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          position.side === "long"
                            ? "bg-violet-900/20 text-violet-400 border border-violet-700/30"
                            : "bg-red-900/20 text-red-400 border border-red-700/30"
                        }`}
                      >
                        {position.side === "long" ? (
                          <ArrowUpRight size={14} className="mr-1" />
                        ) : (
                          <ArrowDownRight size={14} className="mr-1" />
                        )}
                        <span className="capitalize">{position.side}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{position.size}</td>
                    <td className="px-6 py-4">${position.entryPrice?.toLocaleString() || "0"}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 bg-violet-900/20 rounded text-xs border border-violet-700/30">
                        {position.leverage}x
                      </span>
                    </td>
                    <td
                      className={`px-6 py-4 font-medium ${
                        position.unrealizedPnl >= 0 ? "text-fuchsia-400" : "text-red-400"
                      }`}
                    >
                      {position.unrealizedPnl >= 0 ? "+" : ""}
                      {position.unrealizedPnl?.toLocaleString() || "0"} USD
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-gray-400 text-center py-8 relative z-10">
            <div className="w-16 h-16 mx-auto bg-violet-900/20 rounded-full flex items-center justify-center mb-3 border border-violet-700/30">
              <LineChart size={24} className="text-gray-500" />
            </div>
            <p>Nenhuma ordem aberta no momento</p>
            <p className="text-sm text-gray-500 mt-1">As posições abertas aparecerão aqui</p>
          </div>
        )}
      </div>

      {/* Trade History Section */}
      <div className="bg-gradient-to-br from-black to-violet-950/20 rounded-xl border border-violet-700/30 shadow-lg overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]"></div>
        <div className="p-5 border-b border-violet-900/20 flex justify-between items-center relative z-10">
          <h2 className="text-xl font-semibold text-gray-200">Histórico de Operações</h2>
          <Link
            to="/dashboard/history"
            className="text-xs text-violet-400 hover:text-violet-300 flex items-center group"
          >
            Ver tudo{" "}
            <ArrowRight
              size={14}
              className="ml-1 transform group-hover:translate-x-1 transition-transform duration-200"
            />
          </Link>
        </div>

        {isLoading ? (
          <div className="animate-pulse p-6 space-y-4">
            <div className="h-12 bg-violet-900/20 rounded"></div>
            <div className="h-12 bg-violet-900/20 rounded"></div>
          </div>
        ) : trades && trades.length > 0 ? (
          <div className="overflow-x-auto relative z-10">
            <table className="w-full">
              <thead className="bg-violet-900/20">
                <tr className="text-left text-gray-400 text-xs uppercase">
                  <th className="px-6 py-3">Data</th>
                  <th className="px-6 py-3">Par</th>
                  <th className="px-6 py-3">Tipo</th>
                  <th className="px-6 py-3">Preço</th>
                  <th className="px-6 py-3">Tamanho</th>
                  <th className="px-6 py-3">PnL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-violet-900/20">
                {trades.slice(0, 5).map((trade) => (
                  <tr key={trade.id} className="text-gray-200 hover:bg-violet-900/20 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(trade.timestamp).toLocaleDateString()} {new Date(trade.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 font-medium">{trade.symbol}</td>
                    <td className="px-6 py-4">
                      <div
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          trade.side === "buy"
                            ? "bg-violet-900/20 text-violet-400 border border-violet-700/30"
                            : "bg-red-900/20 text-red-400 border border-red-700/30"
                        }`}
                      >
                        {trade.side === "buy" ? (
                          <ArrowUpRight size={14} className="mr-1" />
                        ) : (
                          <ArrowDownRight size={14} className="mr-1" />
                        )}
                        <span className="capitalize">{trade.side}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">${trade.price?.toLocaleString() || "0"}</td>
                    <td className="px-6 py-4">{trade.size}</td>
                    <td className={`px-6 py-4 font-medium ${trade.pnl >= 0 ? "text-fuchsia-400" : "text-red-400"}`}>
                      {trade.pnl >= 0 ? "+" : ""}
                      {trade.pnl?.toLocaleString() || "0"} USD
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-gray-400 text-center py-8 relative z-10">
            <div className="w-16 h-16 mx-auto bg-violet-900/20 rounded-full flex items-center justify-center mb-3 border border-violet-700/30">
              <History size={24} className="text-gray-500" />
            </div>
            <p>Nenhuma operação realizada</p>
            <p className="text-sm text-gray-500 mt-1">Seu histórico de operações aparecerá aqui</p>
          </div>
        )}
      </div>

      {/* Weekly Performance Section */}
      <div className="bg-gradient-to-br from-black to-violet-950/20 rounded-xl border border-violet-700/30 shadow-lg overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]"></div>
        <div className="p-6 relative z-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-200">Performance da Semana</h2>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 mr-2"></div>
                <span className="text-gray-300">Lucro</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                <span className="text-gray-300">Perda</span>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="animate-pulse h-64 bg-violet-900/20 rounded"></div>
          ) : (
            <div className="relative h-64">
              <div className="absolute inset-0 flex flex-col justify-between">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="border-t border-violet-900/20 w-full h-0"></div>
                ))}
              </div>

              <div className="absolute left-0 inset-y-0 flex flex-col justify-between text-xs text-gray-500 pr-2">
                {[0, 25, 50, 75, 100].map((value) => (
                  <div key={value} className="h-6 flex items-center">
                    {value}%
                  </div>
                ))}
              </div>

              <div className="ml-10 h-full flex items-end justify-between">
                {tradingPerformanceData.map((day, index) => {
                  const maxValue = Math.max(
                    ...tradingPerformanceData.map((d) => Math.max(d.profit || 0, Math.abs(d.loss || 0))),
                  )
                  const scale = maxValue > 0 ? 100 / maxValue : 1

                  const profitHeight = (day.profit || 0) * scale
                  const lossHeight = Math.abs(day.loss || 0) * scale

                  return (
                    <div key={day.date} className="flex flex-col items-center w-full max-w-[40px]">
                      <div
                        className="w-6 bg-gradient-to-t from-violet-600 to-fuchsia-400 rounded-t-sm"
                        style={{ height: `${profitHeight}%` }}
                      >
                        {profitHeight > 10 && (
                          <div className="text-xs text-dark-900 font-medium text-center">
                            {day.profit > 0 ? `+${day.profit.toFixed(1)}` : ""}
                          </div>
                        )}
                      </div>

                      <div className="w-10 h-0.5 bg-violet-900/20"></div>

                      <div
                        className="w-6 bg-gradient-to-b from-red-500 to-red-600 rounded-b-sm"
                        style={{ height: `${lossHeight}%` }}
                      >
                        {lossHeight > 10 && (
                          <div className="text-xs text-dark-900 font-medium text-center">
                            {day.loss < 0 ? day.loss.toFixed(1) : ""}
                          </div>
                        )}
                      </div>

                      <div className="mt-2 text-xs text-gray-400">{day.date}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
