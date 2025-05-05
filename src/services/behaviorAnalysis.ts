// src/services/behaviorAnalysis.ts
import type { Trade, Position, RiskLimits, TradingBehavior } from "../types"

// Função para detectar uso excessivo de alavancagem
export function detectExcessiveLeverage(
  trades: Trade[],
  positions: Position[],
  riskLimits: RiskLimits,
): TradingBehavior | null {
  // Verificar alavancagem em trades recentes (últimas 24h)
  const recentTrades = trades.filter((trade) => {
    const tradeTime = new Date(trade.timestamp).getTime()
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
    return tradeTime >= oneDayAgo
  })

  // Verificar alavancagem em posições atuais
  const highLeveragePositions = positions.filter((position) => position.leverage > riskLimits.maxLeverage)

  // Verificar alavancagem em trades recentes
  const highLeverageTrades = recentTrades.filter((trade) => trade.leverage > riskLimits.maxLeverage)

  // Se houver posições ou trades com alavancagem excessiva
  if (highLeveragePositions.length > 0 || highLeverageTrades.length > 0) {
    // Calcular a alavancagem média das posições com alta alavancagem
    const avgPositionLeverage =
      highLeveragePositions.length > 0
        ? highLeveragePositions.reduce((sum, pos) => sum + pos.leverage, 0) / highLeveragePositions.length
        : 0

    // Calcular a alavancagem média dos trades com alta alavancagem
    const avgTradeLeverage =
      highLeverageTrades.length > 0
        ? highLeverageTrades.reduce((sum, trade) => sum + trade.leverage, 0) / highLeverageTrades.length
        : 0

    // Usar o maior valor entre as duas médias
    const avgLeverage = Math.max(avgPositionLeverage, avgTradeLeverage)

    // Determinar a severidade com base na diferença entre a alavancagem usada e o limite
    const leverageRatio = avgLeverage / riskLimits.maxLeverage
    let severity: "low" | "medium" | "high" = "low"

    if (leverageRatio >= 2) {
      severity = "high"
    } else if (leverageRatio >= 1.5) {
      severity = "medium"
    } else {
      severity = "low"
    }

    return {
      id: `excessive-leverage-${Date.now()}`,
      type: "Uso Excessivo de Alavancagem",
      description: `Você está utilizando alavancagem acima do recomendado para seu perfil de risco. Limite: ${riskLimits.maxLeverage}x, Utilizado: ${avgLeverage.toFixed(1)}x.`,
      severity,
      recommendation: `Considere reduzir sua alavancagem para no máximo ${riskLimits.maxLeverage}x para seu nível de risco atual.`,
      timestamp: Date.now(),
    }
  }

  return null
}

// Função para detectar trading emocional
export function detectEmotionalTrading(trades: Trade[]): TradingBehavior | null {
  // Filtrar trades das últimas 24 horas
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
  const recentTrades = trades.filter((trade) => trade.timestamp >= oneDayAgo)

  if (recentTrades.length < 3) return null // Precisa de pelo menos 3 trades para análise

  // Ordenar trades por timestamp (mais antigo primeiro)
  const sortedTrades = [...recentTrades].sort((a, b) => a.timestamp - b.timestamp)

  // Detectar padrão de abrir e fechar posições rapidamente (menos de 5 minutos)
  const quickTradePatterns = []

  for (let i = 0; i < sortedTrades.length - 1; i++) {
    const currentTrade = sortedTrades[i]
    const nextTrade = sortedTrades[i + 1]

    // Verificar se são trades do mesmo símbolo com lados opostos
    if (
      currentTrade.symbol === nextTrade.symbol &&
      ((currentTrade.side === "buy" && nextTrade.side === "sell") ||
        (currentTrade.side === "sell" && nextTrade.side === "buy"))
    ) {
      // Calcular o tempo entre os trades (em minutos)
      const timeDiff = (nextTrade.timestamp - currentTrade.timestamp) / (60 * 1000)

      // Se o tempo for menor que 5 minutos, considerar como trade rápido
      if (timeDiff < 5) {
        quickTradePatterns.push({
          symbol: currentTrade.symbol,
          timeDiff,
          pnl: nextTrade.pnl,
        })
      }
    }
  }

  // Detectar padrão de aumentar posições após perdas
  const increasingAfterLossPatterns = []

  for (let i = 0; i < sortedTrades.length - 1; i++) {
    const currentTrade = sortedTrades[i]
    const nextTrade = sortedTrades[i + 1]

    // Verificar se são trades do mesmo símbolo e mesmo lado
    if (currentTrade.symbol === nextTrade.symbol && currentTrade.side === nextTrade.side) {
      // Verificar se o primeiro trade teve perda e o segundo aumentou a posição
      if (currentTrade.pnl < 0 && nextTrade.size > currentTrade.size) {
        increasingAfterLossPatterns.push({
          symbol: currentTrade.symbol,
          initialLoss: currentTrade.pnl,
          increaseFactor: nextTrade.size / currentTrade.size,
        })
      }
    }
  }

  // Se encontrou algum dos padrões, criar um comportamento
  if (quickTradePatterns.length > 0 || increasingAfterLossPatterns.length > 0) {
    let description = ""
    let recommendation = ""
    let severity: "low" | "medium" | "high" = "low"

    if (quickTradePatterns.length > 0) {
      const lossCount = quickTradePatterns.filter((p) => p.pnl < 0).length
      description += `Você abriu e fechou ${quickTradePatterns.length} posições em menos de 5 minutos, `
      description += `com ${lossCount} resultando em perda. `
      recommendation += "Considere estabelecer um tempo mínimo para manter posições abertas. "

      // Severidade baseada na quantidade e nas perdas
      if (quickTradePatterns.length >= 5 || lossCount >= 3) {
        severity = "high"
      } else if (quickTradePatterns.length >= 3 || lossCount >= 2) {
        severity = "medium"
      }
    }

    if (increasingAfterLossPatterns.length > 0) {
      const avgIncrease =
        increasingAfterLossPatterns.reduce((sum, p) => sum + p.increaseFactor, 0) / increasingAfterLossPatterns.length

      if (description) description += "\n\n"

      description += `Você aumentou posições após perdas em ${increasingAfterLossPatterns.length} ocasiões, `
      description += `com aumento médio de ${(avgIncrease * 100 - 100).toFixed(0)}% no tamanho da posição.`
      recommendation += "Evite aumentar posições após perdas, isso pode amplificar seus prejuízos."

      // Severidade baseada na quantidade e no fator de aumento
      if (increasingAfterLossPatterns.length >= 3 || avgIncrease >= 2) {
        severity = "high"
      } else if (increasingAfterLossPatterns.length >= 2 || avgIncrease >= 1.5) {
        severity = "medium"
      }
    }

    return {
      id: `emotional-trading-${Date.now()}`,
      type: "Trading Emocional Detectado",
      description,
      severity,
      recommendation,
      timestamp: Date.now(),
    }
  }

  return null
}

// Função para detectar violação de limites de risco
export function detectRiskLimitViolation(
  dailyPnLPercentage: number,
  weeklyPnLPercentage: number,
  riskLimits: RiskLimits,
): TradingBehavior | null {
  // Converter para valores absolutos (perdas são negativas)
  const dailyLossPercentage = Math.abs(Math.min(0, dailyPnLPercentage))
  const weeklyLossPercentage = Math.abs(Math.min(0, weeklyPnLPercentage))

  // Verificar se algum limite foi excedido
  const isDailyLimitExceeded = dailyLossPercentage > riskLimits.dailyLossLimit
  const isWeeklyLimitExceeded = weeklyLossPercentage > riskLimits.weeklyLossLimit

  if (isDailyLimitExceeded || isWeeklyLimitExceeded) {
    let description = ""
    let recommendation = ""
    let severity: "low" | "medium" | "high" = "medium"

    if (isDailyLimitExceeded) {
      const exceedFactor = dailyLossPercentage / riskLimits.dailyLossLimit
      description += `Você excedeu seu limite de perda diária de ${riskLimits.dailyLossLimit}%. `
      description += `Perda atual: ${dailyLossPercentage.toFixed(2)}% (${(exceedFactor * 100 - 100).toFixed(0)}% acima do limite).`
      recommendation += "Considere parar de operar pelo resto do dia para evitar mais perdas. "

      // Severidade baseada em quanto o limite foi excedido
      if (exceedFactor >= 2) {
        severity = "high"
      } else if (exceedFactor >= 1.5) {
        severity = "medium"
      }
    }

    if (isWeeklyLimitExceeded) {
      const exceedFactor = weeklyLossPercentage / riskLimits.weeklyLossLimit

      if (description) description += "\n\n"

      description += `Você excedeu seu limite de perda semanal de ${riskLimits.weeklyLossLimit}%. `
      description += `Perda atual: ${weeklyLossPercentage.toFixed(2)}% (${(exceedFactor * 100 - 100).toFixed(0)}% acima do limite).`
      recommendation += "Considere reduzir significativamente seu tamanho de posição ou fazer uma pausa nas operações."

      // Severidade baseada em quanto o limite foi excedido
      if (exceedFactor >= 1.5) {
        severity = "high"
      }
    }

    return {
      id: `risk-limit-violation-${Date.now()}`,
      type: "Violação de Limites de Risco",
      description,
      severity,
      recommendation,
      timestamp: Date.now(),
    }
  }

  return null
}

// Função para detectar múltiplas operações com alta alavancagem
export function detectMultipleHighLeveragePositions(
  positions: Position[],
  riskLimits: RiskLimits,
): TradingBehavior | null {
  // Filtrar posições com alavancagem acima do limite
  const highLeveragePositions = positions.filter((position) => position.leverage > riskLimits.maxLeverage)

  // Se houver mais de uma posição com alta alavancagem
  if (highLeveragePositions.length >= 2) {
    // Calcular a exposição total (soma dos valores das posições)
    const totalExposure = highLeveragePositions.reduce((sum, position) => {
      return sum + position.size * position.entryPrice
    }, 0)

    // Calcular a alavancagem média
    const avgLeverage =
      highLeveragePositions.reduce((sum, position) => sum + position.leverage, 0) / highLeveragePositions.length

    // Determinar a severidade com base na quantidade de posições e na alavancagem média
    let severity: "low" | "medium" | "high" = "low"

    if (highLeveragePositions.length >= 4 || avgLeverage >= riskLimits.maxLeverage * 2) {
      severity = "high"
    } else if (highLeveragePositions.length >= 3 || avgLeverage >= riskLimits.maxLeverage * 1.5) {
      severity = "medium"
    }

    return {
      id: `multiple-high-leverage-${Date.now()}`,
      type: "Múltiplas Operações com Alta Alavancagem",
      description: `Você tem ${highLeveragePositions.length} posições abertas com alavancagem acima do limite recomendado (${riskLimits.maxLeverage}x). Alavancagem média: ${avgLeverage.toFixed(1)}x.`,
      severity,
      recommendation: `Considere reduzir o número de posições com alta alavancagem ou diminuir a alavancagem para no máximo ${riskLimits.maxLeverage}x.`,
      timestamp: Date.now(),
    }
  }

  return null
}
