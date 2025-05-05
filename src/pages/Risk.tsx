import type React from "react"
import { useAppStore } from "../store"
import RiskLevelSelector from "../components/RiskLevelSelector"
import { AlertTriangle, Shield, TrendingUp, Activity, Clock, Info, CheckCircle, ArrowRight } from "lucide-react"
import { useTranslation } from "react-i18next"
import RiskStatusCard from "../components/RiskStatusCard"

const Risk: React.FC = () => {
  const { riskStatus, riskLimits, selectedRiskLevel } = useAppStore()
  const { t } = useTranslation()

  const formatRestrictionTime = () => {
    if (!riskStatus.restrictionEndTime) return null

    const now = Date.now()
    const endTime = riskStatus.restrictionEndTime

    if (now > endTime) return null

    const diffMs = endTime - now
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    return `${diffDays}d ${diffHours}h`
  }

  const restrictionTimeLeft = formatRestrictionTime()

  return (
    <div className="space-y-8">
      {/* Header Section with Gradient Background */}
      <div className="bg-gradient-to-br from-black to-violet-950/20 rounded-xl p-6 border border-violet-700/30 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-800 to-fuchsia-800 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4),transparent_70%)]"></div>
              <Shield className="text-white z-10" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-200">{t("risk.riskManagement")}</h1>
              <p className="text-sm text-gray-400 mt-1">Proteja seu capital com limites de risco personalizados</p>
            </div>
          </div>

          <div
            className={`px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm ${
              riskStatus.tradingAllowed
                ? "bg-violet-900/30 text-violet-400 border border-violet-800/40"
                : "bg-red-900/30 text-red-400 border border-red-800/40"
            }`}
          >
            {riskStatus.tradingAllowed ? (
              <>
                <CheckCircle size={16} className="text-violet-400" />
                <span className="font-medium">{t("risk.tradingAllowed")}</span>
              </>
            ) : (
              <>
                <AlertTriangle size={16} className="text-red-400" />
                <span className="font-medium">{t("risk.tradingRestricted")}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Adicionar o novo componente de status de risco */}
      <RiskStatusCard />

      {/* Trading Restriction Warning */}
      {!riskStatus.tradingAllowed && restrictionTimeLeft && (
        <div className="bg-gradient-to-r from-red-900/30 to-red-950/30 border border-red-800/50 rounded-lg p-5 flex items-start shadow-md animate-pulse relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]"></div>
          <AlertTriangle className="text-red-400 mr-4 flex-shrink-0 mt-0.5 relative z-10" size={24} />
          <div className="relative z-10">
            <h3 className="font-semibold text-red-400 text-lg">Operações Restritas</h3>
            <p className="text-gray-300 mt-2">
              {riskStatus.restrictionReason || "Suas operações estão restritas devido a alto risco."}
            </p>
            <div className="flex items-center mt-3 text-sm bg-red-950/50 px-3 py-2 rounded-md inline-block">
              <Clock size={16} className="mr-2 text-red-400" />
              <span className="text-red-300">
                Tempo restante: <span className="font-semibold">{restrictionTimeLeft}</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* How It Works Section */}
      <div className="bg-gradient-to-br from-black to-violet-950/20 rounded-xl border border-violet-700/30 shadow-lg overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]"></div>
        <div className="p-5 border-b border-violet-900/20 flex items-center relative z-10">
          <Info size={18} className="text-violet-400 mr-2" />
          <h2 className="text-lg font-semibold text-gray-200">{t("risk.howItWorks")}</h2>
        </div>
        <div className="p-5 text-gray-300 leading-relaxed relative z-10">
          <p className="flex gap-2">
            <span className="text-violet-400 font-medium">1.</span>
            <span>Escolha seu nível de gerenciamento de risco com base na sua tolerância e estilo de trading.</span>
          </p>
          <p className="flex gap-2 mt-2">
            <span className="text-violet-400 font-medium">2.</span>
            <span>O sistema monitora suas operações em tempo real e aplica os limites configurados.</span>
          </p>
          <p className="flex gap-2 mt-2">
            <span className="text-violet-400 font-medium">3.</span>
            <span>
              Se você exceder os limites, o sistema restringirá novas operações até que seu risco seja reduzido.
            </span>
          </p>
          <p className="flex gap-2 mt-2">
            <span className="text-violet-400 font-medium">4.</span>
            <span>Avance para níveis mais agressivos ao demonstrar consistência e disciplina.</span>
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Risk Level Selector - Left Column */}
        <div className="lg:col-span-1">
          <RiskLevelSelector />
        </div>

        {/* Risk Levels Comparison - Right Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gradient-to-br from-black to-violet-950/20 rounded-xl border border-violet-700/30 shadow-lg overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]"></div>
            <div className="p-5 border-b border-violet-900/20 relative z-10">
              <h2 className="text-lg font-semibold text-gray-200">Comparação de Níveis de Risco</h2>
            </div>

            <div className="overflow-x-auto relative z-10">
              <table className="w-full">
                <thead>
                  <tr className="bg-violet-900/20 text-gray-400 text-xs uppercase">
                    <th className="px-6 py-3 text-left">Parâmetro</th>
                    <th className="px-6 py-3 text-center">
                      <div className="flex flex-col items-center">
                        <Shield className="text-violet-400 mb-1" size={16} />
                        <span>{t("risk.conservative")}</span>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-center">
                      <div className="flex flex-col items-center">
                        <Activity className="text-yellow-400 mb-1" size={16} />
                        <span>{t("risk.moderate")}</span>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-center">
                      <div className="flex flex-col items-center">
                        <TrendingUp className="text-red-400 mb-1" size={16} />
                        <span>{t("risk.aggressive")}</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-violet-900/20">
                  <tr className="hover:bg-violet-900/20">
                    <td className="px-6 py-4 font-medium text-gray-300">{t("risk.dailyLossLimit")}</td>
                    <td className="px-6 py-4 text-center text-violet-400 font-medium">2% {t("risk.ofCapital")}</td>
                    <td className="px-6 py-4 text-center text-yellow-400 font-medium">5% {t("risk.ofCapital")}</td>
                    <td className="px-6 py-4 text-center text-red-400 font-medium">10% {t("risk.ofCapital")}</td>
                  </tr>
                  <tr className="hover:bg-violet-900/20">
                    <td className="px-6 py-4 font-medium text-gray-300">{t("risk.maxLeverage")}</td>
                    <td className="px-6 py-4 text-center text-violet-400 font-medium">5x</td>
                    <td className="px-6 py-4 text-center text-yellow-400 font-medium">10x</td>
                    <td className="px-6 py-4 text-center text-red-400 font-medium">20x</td>
                  </tr>
                  <tr className="hover:bg-violet-900/20">
                    <td className="px-6 py-4 font-medium text-gray-300">{t("risk.maxDailyTrades")}</td>
                    <td className="px-6 py-4 text-center text-violet-400 font-medium">5</td>
                    <td className="px-6 py-4 text-center text-yellow-400 font-medium">5</td>
                    <td className="px-6 py-4 text-center text-red-400 font-medium">5</td>
                  </tr>
                  <tr className="hover:bg-violet-900/20">
                    <td className="px-6 py-4 font-medium text-gray-300">{t("risk.recoveryTime")}</td>
                    <td className="px-6 py-4 text-center text-violet-400 font-medium">24 {t("risk.hours")}</td>
                    <td className="px-6 py-4 text-center text-yellow-400 font-medium">12 {t("risk.hours")}</td>
                    <td className="px-6 py-4 text-center text-red-400 font-medium">6 {t("risk.hours")}</td>
                  </tr>
                  <tr className="hover:bg-violet-900/20">
                    <td className="px-6 py-4 font-medium text-gray-300">Limite de Perda Semanal</td>
                    <td className="px-6 py-4 text-center text-violet-400 font-medium">10% {t("risk.ofCapital")}</td>
                    <td className="px-6 py-4 text-center text-yellow-400 font-medium">15% {t("risk.ofCapital")}</td>
                    <td className="px-6 py-4 text-center text-red-400 font-medium">20% {t("risk.ofCapital")}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-violet-900/20 border-t border-violet-900/20 text-xs text-gray-400 italic relative z-10">
              Nota: O limite global de perda semanal é de 20%. Exceder esse limite resultará em restrição de operações
              por 7 dias.
            </div>
          </div>

          {/* Risk Management Rules */}
          <div className="bg-gradient-to-br from-black to-violet-950/20 rounded-xl border border-violet-700/30 shadow-lg overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]"></div>
            <div className="p-5 border-b border-violet-900/20 relative z-10">
              <h2 className="text-lg font-semibold text-gray-200">{t("risk.riskManagementRules")}</h2>
            </div>

            <div className="p-5 space-y-6 relative z-10">
              <div className="flex items-start gap-4 p-4 rounded-lg bg-violet-900/20 hover:bg-violet-900/30 transition-colors border border-violet-700/30">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-violet-800 to-fuchsia-800 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4),transparent_70%)]"></div>
                  <span className="text-white text-sm font-bold z-10">1</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-200 text-lg">{t("risk.dailyLossLimitRule")}</h3>
                  <p className="text-gray-400 mt-2 leading-relaxed">{t("risk.dailyLossLimitDescription")}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-violet-900/20 hover:bg-violet-900/30 transition-colors border border-violet-700/30">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-violet-800 to-fuchsia-800 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4),transparent_70%)]"></div>
                  <span className="text-white text-sm font-bold z-10">2</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-200 text-lg">{t("risk.maximumLeverageRule")}</h3>
                  <p className="text-gray-400 mt-2 leading-relaxed">{t("risk.maximumLeverageDescription")}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-violet-900/20 hover:bg-violet-900/30 transition-colors border border-violet-700/30">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-violet-800 to-fuchsia-800 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4),transparent_70%)]"></div>
                  <span className="text-white text-sm font-bold z-10">3</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-200 text-lg">{t("risk.maximumDailyTradesRule")}</h3>
                  <p className="text-gray-400 mt-2 leading-relaxed">{t("risk.maximumDailyTradesDescription")}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-violet-900/20 hover:bg-violet-900/30 transition-colors border border-violet-700/30">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-violet-800 to-fuchsia-800 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4),transparent_70%)]"></div>
                  <span className="text-white text-sm font-bold z-10">4</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-200 text-lg">{t("risk.recoveryTimeRule")}</h3>
                  <p className="text-gray-400 mt-2 leading-relaxed">{t("risk.recoveryTimeDescription")}</p>
                </div>
              </div>

              {/* Weekly Loss Rule */}
              <div className="flex items-start gap-4 p-4 rounded-lg bg-violet-900/20 hover:bg-violet-900/30 transition-colors border border-violet-700/30">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-violet-800 to-fuchsia-800 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4),transparent_70%)]"></div>
                  <span className="text-white text-sm font-bold z-10">5</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-200 text-lg">Limite de Perda Semanal</h3>
                  <p className="text-gray-400 mt-2 leading-relaxed">
                    Se suas perdas semanais excederem o limite configurado para seu nível de risco, você será
                    automaticamente rebaixado para o nível inferior. Se atingir 20% de perda semanal, todas as operações
                    serão bloqueadas por 7 dias para recuperação.
                  </p>
                </div>
              </div>

              {/* Upgrade Rule */}
              <div className="flex items-start gap-4 p-4 rounded-lg bg-violet-900/20 hover:bg-violet-900/30 transition-colors border border-violet-700/30">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-violet-800 to-fuchsia-800 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4),transparent_70%)]"></div>
                  <span className="text-white text-sm font-bold z-10">6</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-200 text-lg">Avanço para o Próximo Nível</h3>
                  <p className="text-gray-400 mt-2 leading-relaxed">
                    Se você acumular 10% de lucro dentro de 7 dias, será elegível para avançar para o próximo nível de
                    gerenciamento de risco. Isso permite que traders consistentes assumam gradualmente mais risco.
                  </p>

                  {riskStatus.eligibleForUpgrade && selectedRiskLevel !== "Aggressive" && (
                    <div className="mt-3">
                      <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-800 to-fuchsia-800 hover:from-violet-700 hover:to-fuchsia-700 text-white rounded-lg transition-all duration-300 font-medium relative overflow-hidden group shadow-lg shadow-violet-700/20 hover:shadow-violet-600/40">
                        <span className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                        <span className="relative z-10">Avançar para o próximo nível</span>
                        <ArrowRight size={16} className="relative z-10" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Risk
