"use client"

import type React from "react"
import { useAppStore } from "../store"
import { useTranslation } from "react-i18next"
import type { RiskLevel } from "../types"
import { ArrowUpCircle, AlertTriangle, Shield, Activity, TrendingUp } from "lucide-react"
import { toast } from "react-toastify"

// Modificar o componente RiskLevelSelector para implementar a lógica de seleção de nível
const RiskLevelSelector: React.FC = () => {
  const { selectedRiskLevel, riskLimits, riskStatus, setRiskLevel } = useAppStore()
  const { t } = useTranslation()

  const riskLevels: RiskLevel[] = ["Conservative", "Moderate", "Aggressive"]

  const handleUpgrade = () => {
    if (!riskStatus.eligibleForUpgrade) {
      // Mostrar mensagem de erro se tentar fazer upgrade sem ser elegível
      toast.warning("Você precisa acumular pelo menos 10% de lucro em 7 dias para avançar para o próximo nível.")
      return
    }

    let nextLevel: RiskLevel | null = null
    if (selectedRiskLevel === "Conservative") {
      nextLevel = "Moderate"
    } else if (selectedRiskLevel === "Moderate") {
      nextLevel = "Aggressive"
    }

    if (nextLevel) {
      setRiskLevel(nextLevel)
    }
  }

  const handleLevelSelect = (level: RiskLevel) => {
    // Verificar se está tentando pular níveis
    if (
      (selectedRiskLevel === "Conservative" && level === "Aggressive") ||
      (selectedRiskLevel === "Aggressive" && level === "Conservative")
    ) {
      toast.warning("Você deve progredir ou regredir um nível de cada vez no gerenciamento de risco.")
      return
    }

    // Verificar se está tentando subir de nível sem ser elegível
    if (
      (selectedRiskLevel === "Conservative" && level === "Moderate" && !riskStatus.eligibleForUpgrade) ||
      (selectedRiskLevel === "Moderate" && level === "Aggressive" && !riskStatus.eligibleForUpgrade)
    ) {
      toast.warning("Você precisa acumular pelo menos 10% de lucro em 7 dias para avançar para o próximo nível.")
      return
    }

    // Se está tentando descer de nível, permitir sempre
    if (
      (selectedRiskLevel === "Moderate" && level === "Conservative") ||
      (selectedRiskLevel === "Aggressive" && level === "Moderate")
    ) {
      setRiskLevel(level)
      return
    }

    // Se não mudou de nível, apenas atualizar
    if (selectedRiskLevel === level) {
      setRiskLevel(level)
      return
    }

    // Se chegou aqui, a mudança é válida
    setRiskLevel(level)
  }

  const getRiskIcon = (level: RiskLevel) => {
    switch (level) {
      case "Conservative":
        return <Shield className="text-violet-400" size={24} />
      case "Moderate":
        return <Activity className="text-yellow-400" size={24} />
      case "Aggressive":
        return <TrendingUp className="text-red-400" size={24} />
    }
  }

  // Verificar se o nível está disponível para seleção
  const isLevelAvailable = (level: RiskLevel): boolean => {
    // Conservative está sempre disponível
    if (level === "Conservative") return true

    // Para Moderate, o usuário deve estar no Conservative e ser elegível para upgrade
    if (level === "Moderate") {
      return selectedRiskLevel === "Conservative" ? riskStatus.eligibleForUpgrade : true
    }

    // Para Aggressive, o usuário deve estar no Moderate e ser elegível para upgrade
    if (level === "Aggressive") {
      return selectedRiskLevel === "Moderate" ? riskStatus.eligibleForUpgrade : true
    }

    return false
  }

  return (
    <div className="bg-gradient-to-br from-black to-violet-950/20 rounded-xl border border-violet-700/30 shadow-lg relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]"></div>
      <div className="p-6 relative z-10">
        <h2 className="text-xl font-semibold mb-5 text-gray-200">{t("risk.riskManagementLevel")}</h2>

        {riskStatus.eligibleForUpgrade && selectedRiskLevel !== "Aggressive" && (
          <div className="mb-5 p-4 bg-gradient-to-r from-violet-900/30 to-violet-950/30 border border-violet-800/50 rounded-lg flex items-start relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]"></div>
            <ArrowUpCircle className="text-violet-400 mr-3 flex-shrink-0 mt-0.5 relative z-10" size={20} />
            <div className="relative z-10">
              <p className="text-sm font-medium text-violet-400">Elegível para Upgrade de Nível</p>
              <p className="text-xs text-gray-300 mt-1">
                Você acumulou {riskStatus.weeklyProfit.toFixed(1)}% de lucro esta semana. Você pode avançar para o
                próximo nível de risco.
              </p>
              <button
                onClick={handleUpgrade}
                className="mt-3 px-4 py-2 bg-gradient-to-r from-violet-800 to-fuchsia-800 hover:from-violet-700 hover:to-fuchsia-700 text-white rounded-lg transition-all duration-300 font-medium relative overflow-hidden group shadow-lg shadow-violet-700/20 hover:shadow-violet-600/40"
              >
                <span className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative z-10">Avançar para o próximo nível</span>
              </button>
            </div>
          </div>
        )}

        {riskStatus.weeklyLoss > 0 && (
          <div className="mb-5 p-4 bg-gradient-to-r from-red-900/30 to-red-950/30 border border-red-800/50 rounded-lg flex items-start relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]"></div>
            <AlertTriangle className="text-red-400 mr-3 flex-shrink-0 mt-0.5 relative z-10" size={20} />
            <div className="relative z-10">
              <p className="text-sm font-medium text-red-400">Perda Semanal: {riskStatus.weeklyLoss.toFixed(1)}%</p>
              <p className="text-xs text-gray-300 mt-1">
                Limite de perda semanal: {riskLimits.weeklyLossLimit}% (nível atual) / 20% (global)
              </p>
              <div className="mt-3 w-full h-2 bg-dark-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-red-400"
                  style={{ width: `${(riskStatus.weeklyLoss / 20) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {riskLevels.map((level) => (
            <button
              key={level}
              className={`w-full p-4 rounded-lg border-2 transition-all ${
                selectedRiskLevel === level
                  ? "border-violet-500 bg-violet-900/30"
                  : isLevelAvailable(level)
                    ? "border-violet-700/30 hover:border-violet-600/50 bg-violet-900/20 hover:bg-violet-900/30"
                    : "border-violet-700/10 bg-violet-900/10 opacity-50 cursor-not-allowed"
              } relative overflow-hidden group`}
              onClick={() => handleLevelSelect(level)}
              disabled={!isLevelAvailable(level)}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="flex items-center relative z-10">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-800 to-fuchsia-800 flex items-center justify-center mr-3 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4),transparent_70%)]"></div>
                  <div className="relative z-10">{getRiskIcon(level)}</div>
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-200">{level}</div>
                  <div
                    className={`text-xs mt-1 ${
                      level === "Conservative"
                        ? "text-violet-400"
                        : level === "Moderate"
                          ? "text-yellow-400"
                          : "text-red-400"
                    }`}
                  >
                    {level === "Conservative"
                      ? t("risk.conservative")
                      : level === "Moderate"
                        ? t("risk.moderate")
                        : t("risk.aggressive")}
                  </div>
                </div>
                {selectedRiskLevel === level && (
                  <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-xs font-medium px-2 py-1 rounded-md ml-2">
                    {t("risk.selected")}
                  </div>
                )}
                {!isLevelAvailable(level) && (
                  <div className="bg-gray-700/50 text-gray-300 text-xs font-medium px-2 py-1 rounded-md ml-2">
                    Bloqueado
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="mt-6 bg-violet-900/20 rounded-lg p-5 border border-violet-700/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]"></div>
          <div className="relative z-10">
            <h3 className="font-medium mb-4 text-gray-200">{t("risk.currentRiskStatus")}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">{t("risk.dailyLossLimit")}</p>
                <p className="font-medium text-gray-200">
                  {riskLimits.dailyLossLimit}% {t("risk.ofCapital")}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">{t("risk.maxLeverage")}</p>
                <p className="font-medium text-gray-200">{riskLimits.maxLeverage}x</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">{t("risk.maxDailyTrades")}</p>
                <p className="font-medium text-gray-200">{riskLimits.maxDailyTrades}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">{t("risk.recoveryTime")}</p>
                <p className="font-medium text-gray-200">
                  {riskLimits.recoveryTime} {t("risk.hours")}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-400">Limite de Perda Semanal</p>
                <p className="font-medium text-gray-200">
                  {riskLimits.weeklyLossLimit}% {t("risk.ofCapital")}
                </p>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500 italic">
              Nota: Estes limites não podem ser modificados manualmente para garantir um gerenciamento de risco
              disciplinado.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RiskLevelSelector
