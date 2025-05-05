// Modificar o tipo Exchange para conter apenas Binance
export type Exchange = "Binance"

export type RiskLevel = "Conservative" | "Moderate" | "Aggressive"

export interface RiskLimits {
  dailyLossLimit: number // Percentage of total capital
  maxLeverage: number
  maxDailyTrades: number
  recoveryTime: number // Hours
  weeklyLossLimit: number // New: Weekly loss limit (percentage)
}

export interface Position {
  id: string
  symbol: string
  size: number
  entryPrice: number
  leverage: number
  liquidationPrice: number
  unrealizedPnl: number
  side: "long" | "short"
  timestamp: number
}

export interface Trade {
  id: string
  symbol: string
  side: "buy" | "sell"
  price: number
  size: number
  leverage: number
  pnl: number
  timestamp: number
}

export interface AccountBalance {
  total: number
  available: number
  inPositions: number
  currency: string
  accountType?: "spot" | "futures" // Adicionado para especificar o tipo de carteira
}

export interface ExchangeConnection {
  exchange: Exchange
  connected: boolean
  apiKey?: string
  apiSecret?: string
  lastSynced?: number
}

export interface TradingBehavior {
  id: string
  type: string
  description: string
  severity: "low" | "medium" | "high"
  timestamp: number
  recommendation: string
}

export interface RiskStatus {
  currentRisk: number // 0-100
  riskLevel: "low" | "medium" | "high" | "critical"
  dailyLoss: number
  weeklyLoss: number // New: Weekly loss percentage
  dailyTrades: number
  highestLeverage: number
  tradingAllowed: boolean
  restrictionReason?: string // New: Reason for trading restriction
  restrictionEndTime?: number // New: When restriction ends (timestamp)
  weeklyProfit: number // New: Weekly profit percentage
  eligibleForUpgrade: boolean // New: If eligible for risk level upgrade
}

export interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "warning" | "danger" | "success"
  timestamp: number
  read: boolean
}
