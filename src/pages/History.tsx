"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAppStore } from "../store"
import { api } from "../services/api"
import { useTranslation } from "react-i18next"
import { format, subDays, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar, Search, Filter, ArrowDownRight, ArrowUpRight, RefreshCw } from "lucide-react"
import { toast } from "react-toastify"

type FilterPeriod = "7days" | "30days" | "90days" | "custom"

const History: React.FC = () => {
  const { trades, setTrades, connections } = useAppStore()
  const [isLoading, setIsLoading] = useState(true)
  const { t } = useTranslation()

  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>("7days")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [filteredTrades, setFilteredTrades] = useState<any[]>([])

  const hasConnections = connections.length > 0

  const fetchData = async () => {
    setIsLoading(true)
    try {
      if (hasConnections) {
        // Calcular datas com base no filtro selecionado
        let startTime
        const now = new Date()

        if (filterPeriod === "7days") {
          startTime = subDays(now, 7).getTime()
        } else if (filterPeriod === "30days") {
          startTime = subDays(now, 30).getTime()
        } else if (filterPeriod === "90days") {
          startTime = subDays(now, 90).getTime()
        } else if (filterPeriod === "custom" && startDate && endDate) {
          startTime = parseISO(startDate).getTime()
        }

        // Passar o startTime para a API
        const tradesData = await api.getTrades(connections, 100, startTime)

        if (tradesData.length === 0) {
          toast.info("Nenhuma operação encontrada. Verifique se você tem operações na corretora conectada.")
        }

        setTrades(tradesData)
      } else {
        setTrades([])
      }
    } catch (error) {
      console.error("Error fetching trade history:", error)
      toast.error("Erro ao buscar histórico de operações. Verifique sua conexão com a corretora.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [setTrades, hasConnections, connections])

  useEffect(() => {
    // Recarregar dados quando o filtro de período mudar
    if (hasConnections) {
      fetchData()
    }
  }, [filterPeriod, startDate, endDate])

  useEffect(() => {
    let filtered = [...trades]

    // Aplicar apenas o filtro de busca por texto aqui, já que o filtro de período
    // é aplicado diretamente na API
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (trade) => trade.symbol.toLowerCase().includes(term) || trade.side.toLowerCase().includes(term),
      )
    }

    // Ordenar por timestamp (mais recente primeiro)
    filtered.sort((a, b) => b.timestamp - a.timestamp)

    setFilteredTrades(filtered)
  }, [trades, searchTerm])

  const totalTrades = filteredTrades.length
  const totalPnL = filteredTrades.reduce((sum, trade) => sum + trade.pnl, 0)
  const winningTrades = filteredTrades.filter((trade) => trade.pnl > 0)
  const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0

  if (!hasConnections) {
    return (
      <div className="bg-gradient-to-br from-black to-violet-950/20 rounded-xl p-6 text-center text-gray-400 border border-violet-700/30 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]"></div>
        <div className="relative z-10">
          <p className="mb-3">Conecte sua corretora para visualizar seu histórico de operações</p>
          <a
            href="/connections"
            className="inline-block px-6 py-3 bg-gradient-to-r from-violet-800 to-fuchsia-800 hover:from-violet-700 hover:to-fuchsia-700 text-white rounded-lg transition-all duration-300 font-medium relative overflow-hidden group shadow-lg shadow-violet-700/20 hover:shadow-violet-600/40"
          >
            <span className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative z-10">Conectar Corretora</span>
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-200">{t("history.tradeHistory")}</h1>
        <button
          onClick={fetchData}
          disabled={isLoading}
          className="px-4 py-2 bg-gradient-to-r from-violet-800 to-fuchsia-800 hover:from-violet-700 hover:to-fuchsia-700 text-white rounded-lg transition-all duration-300 font-medium relative overflow-hidden group shadow-lg shadow-violet-700/20 hover:shadow-violet-600/40 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          {isLoading ? <RefreshCw size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          <span className="ml-2">Atualizar</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-br from-black to-violet-950/20 rounded-xl p-4 border border-violet-700/30 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]"></div>
        <div className="flex flex-col md:flex-row gap-4 relative z-10">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-1">Buscar</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-500" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por símbolo, lado..."
                className="block w-full pl-10 pr-3 py-2 bg-violet-900/20 border border-violet-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-200 placeholder-gray-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Período</label>
            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value as FilterPeriod)}
              className="block w-full px-3 py-2 bg-violet-900/20 border border-violet-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-200"
            >
              <option value="7days">Últimos 7 dias</option>
              <option value="30days">Últimos 30 dias</option>
              <option value="90days">Últimos 90 dias</option>
              <option value="custom">Período personalizado</option>
            </select>
          </div>

          {filterPeriod === "custom" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Data inicial</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar size={16} className="text-gray-500" />
                  </div>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 bg-violet-900/20 border border-violet-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Data final</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar size={16} className="text-gray-500" />
                  </div>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 bg-violet-900/20 border border-violet-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-200"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-black to-violet-950/20 rounded-xl p-4 border border-violet-700/30 shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]"></div>
          <div className="relative z-10">
            <div className="text-sm text-gray-400 mb-1">Total de Operações</div>
            <div className="text-xl font-medium text-gray-200">{totalTrades}</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-black to-violet-950/20 rounded-xl p-4 border border-violet-700/30 shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]"></div>
          <div className="relative z-10">
            <div className="text-sm text-gray-400 mb-1">Taxa de Acerto</div>
            <div className="text-xl font-medium text-violet-400">{winRate.toFixed(1)}%</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-black to-violet-950/20 rounded-xl p-4 border border-violet-700/30 shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]"></div>
          <div className="relative z-10">
            <div className="text-sm text-gray-400 mb-1">Lucro/Prejuízo Total</div>
            <div className={`text-xl font-medium ${totalPnL >= 0 ? "text-fuchsia-400" : "text-red-400"}`}>
              {totalPnL >= 0 ? "+" : ""}
              {totalPnL.toFixed(2)} USD
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-black to-violet-950/20 rounded-xl p-4 border border-violet-700/30 shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]"></div>
          <div className="relative z-10">
            <div className="text-sm text-gray-400 mb-1">Operações Exibidas</div>
            <div className="text-xl font-medium text-gray-200">{filteredTrades.length}</div>
          </div>
        </div>
      </div>

      {/* Trades Table */}
      <div className="bg-gradient-to-br from-black to-violet-950/20 rounded-xl border border-violet-700/30 shadow-lg overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]"></div>
        <div className="p-4 border-b border-violet-900/20 flex justify-between items-center relative z-10">
          <h2 className="text-lg font-semibold text-gray-200">Operações</h2>
          <div className="text-xs text-gray-400 flex items-center">
            <Filter size={14} className="mr-1" />
            {filterPeriod === "7days" && "Últimos 7 dias"}
            {filterPeriod === "30days" && "Últimos 30 dias"}
            {filterPeriod === "90days" && "Últimos 90 dias"}
            {filterPeriod === "custom" && "Período personalizado"}
          </div>
        </div>

        {isLoading ? (
          <div className="animate-pulse p-6 space-y-4">
            <div className="h-12 bg-violet-900/20 rounded"></div>
            <div className="h-12 bg-violet-900/20 rounded"></div>
            <div className="h-12 bg-violet-900/20 rounded"></div>
          </div>
        ) : filteredTrades.length > 0 ? (
          <div className="overflow-x-auto relative z-10">
            <table className="w-full">
              <thead className="bg-violet-900/20">
                <tr className="text-left text-gray-400 text-xs uppercase">
                  <th className="px-6 py-3">Data & Hora</th>
                  <th className="px-6 py-3">Par</th>
                  <th className="px-6 py-3">Tipo</th>
                  <th className="px-6 py-3">Preço</th>
                  <th className="px-6 py-3">Tamanho</th>
                  <th className="px-6 py-3">Alavancagem</th>
                  <th className="px-6 py-3">PnL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-violet-900/20">
                {filteredTrades.map((trade) => (
                  <tr key={trade.id} className="text-gray-200 hover:bg-violet-900/20 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {format(new Date(trade.timestamp), "dd/MM/yyyy HH:mm", { locale: ptBR })}
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
                    <td className="px-6 py-4">${trade.price.toLocaleString()}</td>
                    <td className="px-6 py-4">{trade.size}</td>
                    <td className="px-6 py-4">{trade.leverage}x</td>
                    <td className={`px-6 py-4 font-medium ${trade.pnl >= 0 ? "text-fuchsia-400" : "text-red-400"}`}>
                      {trade.pnl >= 0 ? "+" : ""}
                      {trade.pnl.toLocaleString()} USD
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-gray-400 text-center py-8 relative z-10">
            <p>Nenhuma operação encontrada para o período selecionado</p>
            <p className="text-sm text-gray-500 mt-1">Tente ajustar os filtros ou conectar uma corretora</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default History
