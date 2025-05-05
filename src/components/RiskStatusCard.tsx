// Melhorar o componente RiskStatusCard para exibir todas as informações de risco
import type React from "react"
import { useAppStore } from "../store"
import { AlertTriangle, TrendingUp, TrendingDown, Activity, Clock } from "lucide-react"

const RiskStatusCard: React.FC = () => {
  const { riskStatus, riskLimits } = useAppStore()

  // Função para determinar a cor do indicador de risco
  const getRiskColor = () => {
    switch (riskStatus.riskLevel) {
      case "low":
        return "bg-green-500"
      case "medium":
        return "bg-yellow-500"
      case "high":
        return "bg-orange-500"
      case "critical":
        return "bg-red-500"
      default:
        return "bg-green-500"
    }
  }

  // Função para formatar o nível de risco
  const formatRiskLevel = () => {
    switch (riskStatus.riskLevel) {
      case "low":
        return "Baixo"
      case "medium":
        return "Médio"
      case "high":
        return "Alto"
      case "critical":
        return "Crítico"
      default:
        return "Baixo"
    }
  }

  return (
    <div className="bg-gradient-to-br from-black to-violet-950/20 rounded-xl border border-violet-700/30 shadow-lg relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]"></div>
      <div className="p-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-200 mb-2 md:mb-0">Status de Risco Atual</h2>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full ${getRiskColor()} mr-2`}></div>
            <span className="text-sm font-medium text-gray-300">
              Nível de Risco: <span className="text-gray-200">{formatRiskLevel()}</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Perda Diária */}
          <div className="bg-violet-900/20 rounded-lg p-4 border border-violet-700/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]"></div>
            <div className="flex items-start relative z-10">
              <div className="w-10 h-10 rounded-full bg-gray-800/60 border border-gray-700/50 flex items-center justify-center mr-3 relative overflow-hidden">
                <TrendingDown className="text-red-400 relative z-10" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-400">Perda Diária</p>
                <p className="text-xl font-semibold text-gray-200">{riskStatus.dailyLoss.toFixed(2)}%</p>
                <div className="w-full h-1.5 bg-dark-700 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-600 to-red-400"
                    style={{ width: `${Math.min(100, (riskStatus.dailyLoss / riskLimits.dailyLossLimit) * 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Limite: {riskLimits.dailyLossLimit}%</p>
              </div>
            </div>
          </div>

          {/* Perda Semanal */}
          <div className="bg-violet-900/20 rounded-lg p-4 border border-violet-700/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]"></div>
            <div className="flex items-start relative z-10">
              <div className="w-10 h-10 rounded-full bg-gray-800/60 border border-gray-700/50 flex items-center justify-center mr-3 relative overflow-hidden">
                <AlertTriangle className="text-orange-400 relative z-10" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-400">Perda Semanal</p>
                <p className="text-xl font-semibold text-gray-200">{riskStatus.weeklyLoss.toFixed(2)}%</p>
                <div className="w-full h-1.5 bg-dark-700 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-600 to-orange-400"
                    style={{ width: `${Math.min(100, (riskStatus.weeklyLoss / riskLimits.weeklyLossLimit) * 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Limite: {riskLimits.weeklyLossLimit}%</p>
              </div>
            </div>
          </div>

          {/* Alavancagem Máxima */}
          <div className="bg-violet-900/20 rounded-lg p-4 border border-violet-700/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]"></div>
            <div className="flex items-start relative z-10">
              <div className="w-10 h-10 rounded-full bg-gray-800/60 border border-gray-700/50 flex items-center justify-center mr-3 relative overflow-hidden">
                <TrendingUp className="text-yellow-400 relative z-10" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-400">Alavancagem Máxima</p>
                <p className="text-xl font-semibold text-gray-200">{riskStatus.highestLeverage}x</p>
                <div className="w-full h-1.5 bg-dark-700 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400"
                    style={{ width: `${Math.min(100, (riskStatus.highestLeverage / riskLimits.maxLeverage) * 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Limite: {riskLimits.maxLeverage}x</p>
              </div>
            </div>
          </div>

          {/* Operações Hoje */}
          <div className="bg-violet-900/20 rounded-lg p-4 border border-violet-700/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]"></div>
            <div className="flex items-start relative z-10">
              <div className="w-10 h-10 rounded-full bg-gray-800/60 border border-gray-700/50 flex items-center justify-center mr-3 relative overflow-hidden">
                <Activity className="text-violet-400 relative z-10" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-400">Operações Hoje</p>
                <p className="text-xl font-semibold text-gray-200">{riskStatus.dailyTrades}</p>
                <div className="w-full h-1.5 bg-dark-700 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-400"
                    style={{ width: `${Math.min(100, (riskStatus.dailyTrades / riskLimits.maxDailyTrades) * 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Limite: {riskLimits.maxDailyTrades}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Indicador de Risco */}
        <div className="bg-violet-900/20 rounded-lg p-5 border border-violet-700/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]"></div>
          <div className="relative z-10">
            <h3 className="font-medium text-gray-200 mb-4">Indicador de Risco</h3>
            <div className="w-full h-4 bg-dark-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  riskStatus.currentRisk < 40
                    ? "bg-gradient-to-r from-green-600 to-green-400"
                    : riskStatus.currentRisk < 70
                      ? "bg-gradient-to-r from-yellow-600 to-yellow-400"
                      : riskStatus.currentRisk < 90
                        ? "bg-gradient-to-r from-orange-600 to-orange-400"
                        : "bg-gradient-to-r from-red-600 to-red-400"
                }`}
                style={{ width: `${riskStatus.currentRisk}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Baixo</span>
              <span>Médio</span>
              <span>Alto</span>
              <span>Crítico</span>
            </div>

            {/* Status de Trading */}
            <div
              className={`mt-4 p-3 rounded-lg ${
                riskStatus.tradingAllowed
                  ? "bg-green-900/20 border border-green-700/30"
                  : "bg-red-900/20 border border-red-700/30"
              }`}
            >
              <div className="flex items-center">
                <div
                  className={`w-3 h-3 rounded-full ${riskStatus.tradingAllowed ? "bg-green-500" : "bg-red-500"} mr-2`}
                ></div>
                <span
                  className={`text-sm font-medium ${riskStatus.tradingAllowed ? "text-green-400" : "text-red-400"}`}
                >
                  {riskStatus.tradingAllowed ? "Trading Permitido" : "Trading Restrito"}
                </span>
              </div>

              {!riskStatus.tradingAllowed && riskStatus.restrictionEndTime && (
                <div className="flex items-center mt-2 text-xs text-red-300">
                  <Clock size={14} className="mr-1" />
                  <span>
                    Restrição até: {new Date(riskStatus.restrictionEndTime).toLocaleDateString()}{" "}
                    {new Date(riskStatus.restrictionEndTime).toLocaleTimeString()}
                  </span>
                </div>
              )}

              {!riskStatus.tradingAllowed && riskStatus.restrictionReason && (
                <div className="mt-2 text-xs text-red-300">Motivo: {riskStatus.restrictionReason}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RiskStatusCard
