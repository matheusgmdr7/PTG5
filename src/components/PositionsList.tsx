"use client"

import type React from "react"
import { useAppStore } from "../store"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { AlertTriangle } from "lucide-react"
import { useStore } from "../store"
import { useMemo } from "react"

const PositionsList: React.FC = () => {
  const { positions, connections, balance } = useAppStore()
  const { t } = useTranslation()
  const { riskLimits } = useStore()

  // Check if user has connected exchanges
  const hasConnections = connections.length > 0

  if (!hasConnections) {
    return (
      <div className="bg-dark-800 rounded-lg shadow-md p-6 text-center text-gray-400 border border-dark-700">
        <p className="mb-3">Conecte sua corretora para visualizar suas posições abertas</p>
        <Link
          to="/connections"
          className="inline-block px-4 py-2 bg-primary-600 text-dark-900 rounded-md hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 text-sm"
        >
          Conectar Corretora
        </Link>
      </div>
    )
  }

  if (positions.length === 0) {
    return (
      <div className="bg-dark-800 rounded-lg shadow-md p-6 text-center text-gray-400 border border-dark-700">
        {t("positions.noOpenPositions")}
      </div>
    )
  }

  // Verificar se a posição excede os limites de risco
  const checkPositionRiskStatus = useMemo(() => {
    return (position) => {
      // Verificar alavancagem
      const isLeverageExceeded = position.leverage > riskLimits.maxLeverage

      // Verificar tamanho (estimativa simplificada)
      let isSizeExceeded = false
      if (balance && balance.total > 0) {
        const positionValue = position.size * position.entryPrice
        const positionSizePercent = (positionValue / balance.total) * 100

        // Definir limite baseado no nível de risco
        let sizeLimit = 40 // Valor padrão moderado
        if (riskLimits.maxLeverage <= 5) sizeLimit = 20 // Conservador
        if (riskLimits.maxLeverage >= 15) sizeLimit = 60 // Agressivo

        isSizeExceeded = positionSizePercent > sizeLimit
      }

      return {
        hasRisk: isLeverageExceeded || isSizeExceeded,
        leverageRisk: isLeverageExceeded,
        sizeRisk: isSizeExceeded,
      }
    }
  }, [riskLimits, balance])

  return (
    <div className="bg-dark-800 rounded-lg shadow-md overflow-hidden border border-dark-700">
      <div className="p-4 border-b border-dark-700">
        <h2 className="text-lg font-semibold text-gray-200">{t("positions.openPositions")}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-dark-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                {t("positions.symbol")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                {t("positions.side")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                {t("positions.size")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                {t("positions.entryPrice")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                {t("positions.leverage")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                {t("positions.liquidationPrice")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                {t("positions.pnl")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-700">
            {positions.map((position) => {
              const riskStatus = checkPositionRiskStatus(position)
              return (
                <tr key={position.id} className="hover:bg-dark-900 relative">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-200">{position.symbol}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <div
                      className={`flex items-center ${position.side === "long" ? "text-primary-500" : "text-red-500"}`}
                    >
                      {position.side === "long" ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                      <span className="ml-1 capitalize">{position.side}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{position.size}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                    ${position.entryPrice.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{position.leverage}x</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                    ${position.liquidationPrice.toLocaleString()}
                  </td>
                  <td
                    className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${
                      position.unrealizedPnl >= 0 ? "text-primary-500" : "text-red-500"
                    }`}
                  >
                    {position.unrealizedPnl >= 0 ? "+" : ""}
                    {position.unrealizedPnl.toLocaleString()} USD
                  </td>
                  {riskStatus.hasRisk && (
                    <div className="absolute top-2 right-2 bg-red-900/60 text-red-300 px-2 py-1 rounded-md text-xs flex items-center">
                      <AlertTriangle size={12} className="mr-1" />
                      <span>
                        {riskStatus.leverageRisk && "Alavancagem"}
                        {riskStatus.leverageRisk && riskStatus.sizeRisk && " & "}
                        {riskStatus.sizeRisk && "Tamanho"}
                      </span>
                    </div>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default PositionsList
