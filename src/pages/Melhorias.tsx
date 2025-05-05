"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { useStore } from "../store"
import { api } from "../services/api"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import {
  TrendingUp,
  BarChart3,
  BrainCircuit,
  Lightbulb,
  Target,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  AlertCircle,
} from "lucide-react"
import { toast } from "react-toastify"

// Cache para armazenar os resultados da análise de comportamentos
// Isso evita refazer a análise completa a cada renderização
let behaviorsCache = {
  data: [],
  timestamp: 0,
  isLoading: false,
}

// Cache para armazenar estatísticas de trades
let tradeStatsCache = {
  data: null,
  timestamp: 0,
}

const Melhorias: React.FC = () => {
  const { behaviors, addBehavior, connections, trades } = useStore()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"padroes" | "recomendacoes" | "estatisticas">("padroes")
  const { t } = useTranslation()

  // Estado local para armazenar comportamentos filtrados
  const [filteredBehaviors, setFilteredBehaviors] = useState([])

  // Estado local para armazenar estatísticas
  const [tradeStats, setTradeStats] = useState({
    totalTrades: 0,
    winRate: 0,
    avgLeverage: 0,
    buyWinRate: 0,
    sellWinRate: 0,
    mostTradedSymbol: { symbol: "", count: 0 },
  })

  const hasConnections = connections.length > 0

  // Função para calcular estatísticas de trades
  const calculateTradeStats = () => {
    // Verificar se temos dados em cache recentes (menos de 15 minutos)
    const cacheAge = Date.now() - tradeStatsCache.timestamp
    if (tradeStatsCache.data && cacheAge < 15 * 60 * 1000) {
      console.log("Melhorias: Usando estatísticas em cache")
      setTradeStats(tradeStatsCache.data)
      return
    }

    console.log("Melhorias: Calculando novas estatísticas de trades")

    // Filtrar apenas trades recentes (últimos 7 dias)
    const recentTime = Date.now() - 7 * 24 * 60 * 60 * 1000
    const recentTrades = trades.filter((t) => t.timestamp > recentTime)

    if (recentTrades.length === 0) {
      const emptyStats = {
        totalTrades: 0,
        winRate: 0,
        avgLeverage: 0,
        buyWinRate: 0,
        sellWinRate: 0,
        mostTradedSymbol: { symbol: "", count: 0 },
      }
      setTradeStats(emptyStats)
      tradeStatsCache = {
        data: emptyStats,
        timestamp: Date.now(),
      }
      return
    }

    const winningTrades = recentTrades.filter((trade) => trade.pnl > 0)
    const winRate = (winningTrades.length / recentTrades.length) * 100

    const buyTrades = recentTrades.filter((trade) => trade.side === "buy")
    const sellTrades = recentTrades.filter((trade) => trade.side === "sell")
    const buyWins = buyTrades.filter((trade) => trade.pnl > 0)
    const sellWins = sellTrades.filter((trade) => trade.pnl > 0)

    const buyWinRate = buyTrades.length > 0 ? (buyWins.length / buyTrades.length) * 100 : 0
    const sellWinRate = sellTrades.length > 0 ? (sellWins.length / sellTrades.length) * 100 : 0

    const avgLeverage = recentTrades.reduce((sum, trade) => sum + trade.leverage, 0) / recentTrades.length

    // Calcular símbolo mais negociado
    const symbolCounts = {}
    recentTrades.forEach((trade) => {
      symbolCounts[trade.symbol] = (symbolCounts[trade.symbol] || 0) + 1
    })

    let mostTradedSymbol = { symbol: "", count: 0 }
    Object.entries(symbolCounts).forEach(([symbol, count]) => {
      if (count > mostTradedSymbol.count) {
        mostTradedSymbol = { symbol, count: count as number }
      }
    })

    const stats = {
      totalTrades: recentTrades.length,
      winRate,
      avgLeverage,
      buyWinRate,
      sellWinRate,
      mostTradedSymbol,
    }

    // Atualizar o estado e o cache
    setTradeStats(stats)
    tradeStatsCache = {
      data: stats,
      timestamp: Date.now(),
    }

    console.log("Melhorias: Estatísticas calculadas:", stats)
  }

  // Função para buscar comportamentos de forma otimizada
  const fetchBehaviors = async (force = false) => {
    // Se já estiver carregando ou não houver conexões, não fazer nada
    if (behaviorsCache.isLoading || !hasConnections) return

    // Verificar se o cache é recente (menos de 15 minutos)
    const cacheAge = Date.now() - behaviorsCache.timestamp
    if (!force && cacheAge < 15 * 60 * 1000 && behaviorsCache.data.length > 0) {
      console.log("Melhorias: Usando dados em cache")
      setFilteredBehaviors(behaviorsCache.data)
      return
    }

    // Marcar como carregando para evitar chamadas duplicadas
    behaviorsCache.isLoading = true
    setIsLoading(true)

    try {
      console.log("Melhorias: Buscando novos comportamentos...")

      // Usar uma abordagem mais leve para buscar comportamentos
      // Passando um parâmetro para limitar o período e a quantidade
      const behaviorsData = await api.getLightBehaviors(connections)

      console.log("Melhorias: Received behaviors data:", behaviorsData)

      // Atualizar o cache
      behaviorsCache = {
        data: behaviorsData,
        timestamp: Date.now(),
        isLoading: false,
      }

      // Atualizar o estado local
      setFilteredBehaviors(behaviorsData)

      // Adicionar ao store global apenas comportamentos novos
      if (behaviorsData && behaviorsData.length > 0) {
        const existingIds = behaviors.map((b) => b.id)
        const newBehaviors = behaviorsData.filter((b) => !existingIds.includes(b.id))

        newBehaviors.forEach((behavior) => {
          console.log("Melhorias: Adding new behavior:", behavior)
          addBehavior(behavior)
        })
      }
    } catch (error) {
      console.error("Melhorias: Error fetching behaviors data:", error)
      toast.error("Erro ao carregar padrões de comportamento")
    } finally {
      behaviorsCache.isLoading = false
      setIsLoading(false)
    }
  }

  // Carregar dados apenas quando a página for montada ou as conexões mudarem
  useEffect(() => {
    // Verificar se já temos dados em cache antes de buscar
    if (behaviorsCache.data.length > 0 && Date.now() - behaviorsCache.timestamp < 15 * 60 * 1000) {
      console.log("Melhorias: Usando dados em cache do useEffect")
      setFilteredBehaviors(behaviorsCache.data)
    } else {
      fetchBehaviors()
    }

    // Calcular estatísticas
    calculateTradeStats()
  }, [hasConnections, connections, trades])

  // Função simplificada para atualizar dados
  const refreshData = () => {
    if (isLoading) return

    fetchBehaviors(true)
    calculateTradeStats()
    toast.info("Atualizando dados...")
  }

  // Recomendações estáticas baseadas em estatísticas gerais
  const recommendations = useMemo(
    () => [
      {
        id: 1,
        title: "Defina uma estratégia clara",
        description: "Estabeleça regras claras para entradas e saídas antes de operar",
        icon: <Target className="text-violet-400" size={20} />,
        priority: "alta",
      },
      {
        id: 2,
        title: "Mantenha alavancagem consistente",
        description: `Sua alavancagem média é de ${tradeStats.avgLeverage.toFixed(1)}x. Considere manter um nível consistente para melhor gerenciamento de risco`,
        icon: <TrendingUp className="text-yellow-400" size={20} />,
        priority: "média",
      },
      {
        id: 3,
        title: "Defina stop loss para todas operações",
        description: "Utilize stop loss em todas as operações para limitar perdas e proteger seu capital",
        icon: <AlertTriangle className="text-red-400" size={20} />,
        priority: "alta",
      },
      {
        id: 4,
        title: "Analise seus melhores horários",
        description:
          "Identifique os horários do dia em que você tem melhor desempenho e foque suas operações nesses períodos",
        icon: <Clock className="text-blue-400" size={20} />,
        priority: "média",
      },
      {
        id: 5,
        title: "Foque em menos pares",
        description: `Você opera muitos pares diferentes. Considere focar em ${tradeStats.mostTradedSymbol.symbol || "poucos"} pares para desenvolver especialização`,
        icon: <Target className="text-violet-400" size={20} />,
        priority: "média",
      },
    ],
    [tradeStats],
  )

  if (!hasConnections) {
    return (
      <div className="bg-gradient-to-br from-black to-violet-950/20 rounded-xl p-6 sm:p-8 text-center text-gray-400 border border-violet-700/30 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]"></div>
        <div className="relative z-10">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-violet-800 to-fuchsia-800 rounded-full flex items-center justify-center mb-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4),transparent_70%)]"></div>
            <BrainCircuit className="text-white z-10" size={28} />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-300 mb-3">
            Conecte sua corretora para análise de melhorias
          </h2>
          <p className="mb-6 max-w-md mx-auto text-sm sm:text-base">
            Nossa análise avançada identifica padrões em suas operações e sugere melhorias personalizadas para otimizar
            seus resultados.
          </p>
          <Link
            to="/connections"
            className="inline-block px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-violet-800 to-fuchsia-800 hover:from-violet-700 hover:to-fuchsia-700 text-white rounded-lg transition-all duration-300 font-medium relative overflow-hidden group shadow-lg shadow-violet-700/20 hover:shadow-violet-600/40"
          >
            <span className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative z-10">Conectar Corretora</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-200">Melhorias</h1>
        <button
          onClick={refreshData}
          disabled={isLoading}
          className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-violet-800 to-fuchsia-800 hover:from-violet-700 hover:to-fuchsia-700 text-white rounded-lg transition-all duration-300 font-medium relative overflow-hidden group shadow-lg shadow-violet-700/20 hover:shadow-violet-600/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm sm:text-base"
        >
          <span className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          {isLoading ? <RefreshCw size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          <span className="ml-2">Atualizar</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-gradient-to-br from-black to-violet-950/20 rounded-xl border border-violet-700/30 shadow-lg overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]"></div>

        {/* Tabs responsivos */}
        <div className="flex flex-wrap border-b border-violet-900/20 relative z-10">
          <button
            className={`flex-1 py-3 sm:py-4 px-2 sm:px-6 text-center font-medium transition-colors text-sm sm:text-base ${
              activeTab === "padroes"
                ? "bg-violet-900/50 text-violet-400 border-b-2 border-violet-500"
                : "text-gray-400 hover:bg-violet-900/20"
            }`}
            onClick={() => setActiveTab("padroes")}
          >
            <div className="flex items-center justify-center gap-1 sm:gap-2">
              <BrainCircuit size={16} className="sm:block" />
              <span>Padrões</span>
            </div>
          </button>
          <button
            className={`flex-1 py-3 sm:py-4 px-2 sm:px-6 text-center font-medium transition-colors text-sm sm:text-base ${
              activeTab === "recomendacoes"
                ? "bg-violet-900/50 text-violet-400 border-b-2 border-violet-500"
                : "text-gray-400 hover:bg-violet-900/20"
            }`}
            onClick={() => setActiveTab("recomendacoes")}
          >
            <div className="flex items-center justify-center gap-1 sm:gap-2">
              <Lightbulb size={16} className="sm:block" />
              <span>Recomendações</span>
            </div>
          </button>
          <button
            className={`flex-1 py-3 sm:py-4 px-2 sm:px-6 text-center font-medium transition-colors text-sm sm:text-base ${
              activeTab === "estatisticas"
                ? "bg-violet-900/50 text-violet-400 border-b-2 border-violet-500"
                : "text-gray-400 hover:bg-violet-900/20"
            }`}
            onClick={() => setActiveTab("estatisticas")}
          >
            <div className="flex items-center justify-center gap-1 sm:gap-2">
              <BarChart3 size={16} className="sm:block" />
              <span>Estatísticas</span>
            </div>
          </button>
        </div>

        <div className="p-4 sm:p-6 relative z-10">
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-16 sm:h-20 bg-violet-900/20 rounded-lg"></div>
              <div className="h-16 sm:h-20 bg-violet-900/20 rounded-lg"></div>
            </div>
          ) : (
            <>
              {/* Padrões Identificados */}
              {activeTab === "padroes" && (
                <div className="space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-200 mb-3 sm:mb-4">
                    Padrões de Trading Recentes
                  </h3>

                  {filteredBehaviors.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      {filteredBehaviors.slice(0, 4).map((behavior) => (
                        <div
                          key={behavior.id}
                          className={`p-3 sm:p-5 rounded-lg border ${
                            behavior.severity === "low"
                              ? "bg-violet-900/10 border-violet-800/30"
                              : behavior.severity === "high"
                                ? "bg-red-900/10 border-red-800/30"
                                : "bg-yellow-900/10 border-yellow-800/30"
                          }`}
                        >
                          <div className="flex items-start">
                            <div className="mt-1 mr-3 sm:mr-4 flex-shrink-0">
                              {behavior.severity === "low" ? (
                                <CheckCircle2 className="text-violet-400" size={18} />
                              ) : behavior.severity === "high" ? (
                                <AlertTriangle className="text-red-400" size={18} />
                              ) : (
                                <AlertCircle className="text-yellow-400" size={18} />
                              )}
                            </div>
                            <div>
                              <h4
                                className={`font-medium text-sm sm:text-base ${
                                  behavior.severity === "low"
                                    ? "text-violet-400"
                                    : behavior.severity === "high"
                                      ? "text-red-400"
                                      : "text-yellow-400"
                                }`}
                              >
                                {behavior.type}
                              </h4>
                              <p className="text-xs sm:text-sm text-gray-300 mt-1">{behavior.description}</p>
                              {behavior.recommendation && (
                                <p className="text-xs text-gray-400 mt-2 italic">
                                  Recomendação: {behavior.recommendation}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 sm:py-8 bg-violet-900/20 rounded-lg border border-violet-700/30">
                      <p className="text-gray-400 text-sm sm:text-base">Nenhum padrão recente identificado</p>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        Continue operando para que possamos analisar seus padrões
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Recomendações */}
              {activeTab === "recomendacoes" && (
                <div className="space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-200 mb-3 sm:mb-4">
                    Recomendações Baseadas em Padrões Recentes
                  </h3>

                  {filteredBehaviors.filter((b) => b.recommendation).length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                      {filteredBehaviors
                        .filter((b) => b.recommendation)
                        .slice(0, 3)
                        .map((behavior, index) => (
                          <div
                            key={behavior.id || index}
                            className="p-3 sm:p-5 rounded-lg bg-violet-900/20 border border-violet-700/30 hover:border-violet-600/50 transition-colors"
                          >
                            <div className="flex items-start">
                              <div className="mt-1 mr-3 sm:mr-4 flex-shrink-0">
                                {behavior.severity === "low" ? (
                                  <CheckCircle2 className="text-violet-400" size={18} />
                                ) : behavior.severity === "high" ? (
                                  <AlertTriangle className="text-red-400" size={18} />
                                ) : (
                                  <AlertCircle className="text-yellow-400" size={18} />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                                  <h4 className="font-medium text-sm sm:text-base text-gray-200">{behavior.type}</h4>
                                  <span
                                    className={`text-xs px-2 py-0.5 rounded-full w-fit ${
                                      behavior.severity === "high"
                                        ? "bg-red-900/30 text-red-400"
                                        : behavior.severity === "medium"
                                          ? "bg-yellow-900/30 text-yellow-400"
                                          : "bg-blue-900/30 text-blue-400"
                                    }`}
                                  >
                                    Prioridade{" "}
                                    {behavior.severity === "high"
                                      ? "alta"
                                      : behavior.severity === "medium"
                                        ? "média"
                                        : "baixa"}
                                  </span>
                                </div>
                                <p className="text-xs sm:text-sm text-gray-400 mt-1">{behavior.recommendation}</p>
                              </div>
                            </div>
                          </div>
                        ))}

                      {/* Mostrar recomendações gerais se houver poucas recomendações específicas */}
                      {filteredBehaviors.filter((b) => b.recommendation).length < 2 && (
                        <div className="p-3 sm:p-5 rounded-lg bg-violet-900/20 border border-violet-700/30">
                          <h4 className="font-medium text-sm sm:text-base text-gray-200 mb-2">Recomendações Gerais</h4>
                          <div className="space-y-3">
                            {recommendations.slice(0, 2).map((rec) => (
                              <div key={rec.id} className="flex items-start">
                                <div className="mt-1 mr-3 flex-shrink-0">{rec.icon}</div>
                                <div>
                                  <h5 className="text-sm font-medium text-gray-300">{rec.title}</h5>
                                  <p className="text-xs text-gray-400">{rec.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center py-4 bg-violet-900/20 rounded-lg border border-violet-700/30 mb-4">
                        <p className="text-gray-400 text-sm">Nenhuma recomendação específica disponível</p>
                      </div>

                      <h4 className="font-medium text-sm sm:text-base text-gray-200">Recomendações Gerais</h4>
                      <div className="space-y-3">
                        {recommendations.slice(0, 3).map((rec) => (
                          <div key={rec.id} className="p-3 rounded-lg bg-violet-900/10 border border-violet-700/30">
                            <div className="flex items-start">
                              <div className="mt-1 mr-3 flex-shrink-0">{rec.icon}</div>
                              <div>
                                <h5 className="text-sm font-medium text-gray-300">{rec.title}</h5>
                                <p className="text-xs text-gray-400">{rec.description}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Estatísticas */}
              {activeTab === "estatisticas" && (
                <div className="space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-200 mb-3">
                    Estatísticas Recentes (7 dias)
                  </h3>

                  {tradeStats.totalTrades > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                      <div className="bg-violet-900/20 rounded-lg p-3 sm:p-4 border border-violet-700/30">
                        <div className="text-xs sm:text-sm text-gray-400 mb-1">Total de Operações</div>
                        <div className="text-lg sm:text-xl font-medium text-gray-200">{tradeStats.totalTrades}</div>
                      </div>
                      <div className="bg-violet-900/20 rounded-lg p-3 sm:p-4 border border-violet-700/30">
                        <div className="text-xs sm:text-sm text-gray-400 mb-1">Taxa de Acerto</div>
                        <div className="text-lg sm:text-xl font-medium text-violet-400">
                          {tradeStats.winRate.toFixed(1)}%
                        </div>
                      </div>
                      <div className="bg-violet-900/20 rounded-lg p-3 sm:p-4 border border-violet-700/30">
                        <div className="text-xs sm:text-sm text-gray-400 mb-1">Alavancagem Média</div>
                        <div className="text-lg sm:text-xl font-medium text-gray-200">
                          {tradeStats.avgLeverage.toFixed(1)}x
                        </div>
                      </div>

                      {/* Estatísticas adicionais */}
                      {tradeStats.mostTradedSymbol.symbol && (
                        <div className="bg-violet-900/20 rounded-lg p-3 sm:p-4 border border-violet-700/30">
                          <div className="text-xs sm:text-sm text-gray-400 mb-1">Par Mais Negociado</div>
                          <div className="text-lg sm:text-xl font-medium text-gray-200">
                            {tradeStats.mostTradedSymbol.symbol}
                            <span className="text-xs text-gray-400 ml-2">
                              ({tradeStats.mostTradedSymbol.count} trades)
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Taxa de acerto compra/venda */}
                      <div className="bg-violet-900/20 rounded-lg p-3 sm:p-4 border border-violet-700/30">
                        <div className="text-xs sm:text-sm text-gray-400 mb-1">Taxa de Acerto (Compra)</div>
                        <div className="text-lg sm:text-xl font-medium text-green-400">
                          {tradeStats.buyWinRate.toFixed(1)}%
                        </div>
                      </div>
                      <div className="bg-violet-900/20 rounded-lg p-3 sm:p-4 border border-violet-700/30">
                        <div className="text-xs sm:text-sm text-gray-400 mb-1">Taxa de Acerto (Venda)</div>
                        <div className="text-lg sm:text-xl font-medium text-red-400">
                          {tradeStats.sellWinRate.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-violet-900/20 rounded-lg border border-violet-700/30">
                      <p className="text-gray-400 text-sm">Nenhuma operação recente encontrada</p>
                      <p className="text-xs text-gray-500 mt-1">Realize operações para visualizar suas estatísticas</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Melhorias
