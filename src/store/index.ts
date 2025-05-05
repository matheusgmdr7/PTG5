import { create } from "zustand"
import type {
  AccountBalance,
  ExchangeConnection,
  Position,
  RiskLevel,
  RiskLimits,
  RiskStatus,
  Trade,
  TradingBehavior,
  Notification,
} from "../types"
import { getRiskSettings, updateRiskSettings } from "../services/supabaseService"
import { api } from "../services/api"

interface AppState {
  // User connections
  connections: ExchangeConnection[]
  addConnection: (connection: ExchangeConnection) => void
  removeConnection: (exchange: string) => void

  // Account data
  balance: AccountBalance | null
  positions: Position[]
  trades: Trade[]
  setBalance: (balance: AccountBalance) => void
  setPositions: (positions: Position[]) => void
  setTrades: (trades: Trade[]) => void

  // Risk management
  selectedRiskLevel: RiskLevel
  riskLimits: RiskLimits
  riskStatus: RiskStatus
  setRiskLevel: (level: RiskLevel) => void
  updateRiskStatus: (connections: ExchangeConnection[]) => void
  checkRiskLevelUpgrade: () => void
  checkRiskLevelDowngrade: () => void

  // Behaviors and insights
  behaviors: TradingBehavior[]
  addBehavior: (behavior: TradingBehavior) => void

  // Notifications
  notifications: Notification[]
  addNotification: (notification: Notification) => void
  markNotificationAsRead: (id: string) => void

  // Guided Tour
  isTourCompleted: boolean
  setTourCompleted: (completed: boolean) => void
}

// Default risk limits for each level
const riskLimitsMap: Record<RiskLevel, RiskLimits> = {
  Conservative: {
    dailyLossLimit: 2, // 2% of total capital
    maxLeverage: 5,
    maxDailyTrades: 5, // Same for all levels
    recoveryTime: 24, // 24 hours
    weeklyLossLimit: 10, // 10% weekly loss limit
  },
  Moderate: {
    dailyLossLimit: 5, // 5% of total capital
    maxLeverage: 10,
    maxDailyTrades: 5, // Same for all levels
    recoveryTime: 12, // 12 hours
    weeklyLossLimit: 15, // 15% weekly loss limit
  },
  Aggressive: {
    dailyLossLimit: 10, // 10% of total capital
    maxLeverage: 20,
    maxDailyTrades: 5, // Same for all levels
    recoveryTime: 6, // 6 hours
    weeklyLossLimit: 20, // 20% weekly loss limit
  },
}

export const useAppStore = create<AppState>((set, get) => ({
  // User connections
  connections: [],
  addConnection: (connection) =>
    set((state) => ({
      connections: [...state.connections.filter((c) => c.exchange !== connection.exchange), connection],
    })),
  removeConnection: (exchange) =>
    set((state) => ({
      connections: state.connections.filter((c) => c.exchange !== exchange),
    })),

  // Account data
  balance: null,
  positions: [],
  trades: [],
  setBalance: (balance) => set({ balance }),
  setPositions: (positions) => set({ positions }),
  setTrades: (trades) => set({ trades }),

  // Risk management
  selectedRiskLevel: "Conservative",
  riskLimits: riskLimitsMap.Conservative,
  riskStatus: {
    currentRisk: 0,
    riskLevel: "low",
    dailyLoss: 0,
    weeklyLoss: 0,
    weeklyProfit: 0,
    dailyTrades: 0,
    highestLeverage: 0,
    tradingAllowed: true,
    eligibleForUpgrade: false,
  },
  // Modificar a função setRiskLevel para implementar a lógica de progressão/regressão
  setRiskLevel: async (level) => {
    // Obter o estado atual
    const currentState = get()
    const currentLevel = currentState.selectedRiskLevel

    // Verificar se o usuário está tentando pular níveis
    if (
      (currentLevel === "Conservative" && level === "Aggressive") ||
      (currentLevel === "Aggressive" && level === "Conservative")
    ) {
      console.log("Store: Cannot skip risk levels. Must progress/regress one level at a time.")

      // Adicionar notificação informando que não é possível pular níveis
      currentState.addNotification({
        id: `risk-level-skip-${Date.now()}`,
        title: "Não é possível pular níveis",
        message: "Você deve progredir ou regredir um nível de cada vez no gerenciamento de risco.",
        type: "warning",
        timestamp: Date.now(),
        read: false,
      })

      return
    }

    // Verificar se o usuário está tentando subir de nível sem ser elegível
    if (
      (currentLevel === "Conservative" && level === "Moderate" && !currentState.riskStatus.eligibleForUpgrade) ||
      (currentLevel === "Moderate" && level === "Aggressive" && !currentState.riskStatus.eligibleForUpgrade)
    ) {
      console.log("Store: Cannot upgrade risk level without meeting profit requirements.")

      // Adicionar notificação informando que não é elegível para upgrade
      currentState.addNotification({
        id: `risk-level-not-eligible-${Date.now()}`,
        title: "Upgrade de Nível Não Permitido",
        message: "Você precisa acumular pelo menos 10% de lucro em 7 dias para avançar para o próximo nível.",
        type: "warning",
        timestamp: Date.now(),
        read: false,
      })

      return
    }

    // Se chegou aqui, a mudança de nível é permitida
    set({ selectedRiskLevel: level, riskLimits: riskLimitsMap[level] })
    await updateRiskSettings(level)

    // Adicionar notificação sobre a mudança de nível
    currentState.addNotification({
      id: `risk-level-change-${Date.now()}`,
      title: `Nível de Risco Alterado para ${level}`,
      message: `Seu nível de gerenciamento de risco foi alterado para ${level}.`,
      type: "info",
      timestamp: Date.now(),
      read: false,
    })
  },
  // Corrigir a função updateRiskStatus para usar a API corretamente
  updateRiskStatus: async (connections) => {
    try {
      console.log("Store: Updating risk status with connections:", connections)

      // Obter dados de P&L diretamente da API
      const pnlData = await api.getPnLData(connections)
      console.log("Store: Received P&L data:", pnlData)

      // Determinar o nível de risco atual com base nos dados
      let riskLevel = "low"
      let currentRisk = 0

      // Calcular risco atual (0-100) com base na perda diária e semanal
      const { riskLimits, selectedRiskLevel } = get()
      const dailyLossRatio =
        pnlData.dailyPnLPercentage < 0 ? Math.abs(pnlData.dailyPnLPercentage) / riskLimits.dailyLossLimit : 0

      const weeklyLossRatio =
        pnlData.weeklyPnLPercentage < 0 ? Math.abs(pnlData.weeklyPnLPercentage) / riskLimits.weeklyLossLimit : 0

      // Usar o maior dos dois ratios para determinar o risco atual
      currentRisk = Math.max(dailyLossRatio, weeklyLossRatio) * 100

      // Determinar nível qualitativo de risco
      if (currentRisk >= 90) {
        riskLevel = "critical"
      } else if (currentRisk >= 70) {
        riskLevel = "high"
      } else if (currentRisk >= 40) {
        riskLevel = "medium"
      } else {
        riskLevel = "low"
      }

      // Verificar se o trading está permitido
      const tradingAllowed = currentRisk < 100

      // Atualizar o status de risco com os dados obtidos
      set((state) => ({
        riskStatus: {
          ...state.riskStatus,
          currentRisk,
          riskLevel,
          dailyLoss: pnlData.dailyPnLPercentage < 0 ? Math.abs(pnlData.dailyPnLPercentage) : 0,
          weeklyLoss: pnlData.weeklyPnLPercentage < 0 ? Math.abs(pnlData.weeklyPnLPercentage) : 0,
          weeklyProfit: pnlData.weeklyPnLPercentage > 0 ? pnlData.weeklyPnLPercentage : 0,
          highestLeverage: pnlData.highestLeverage,
          dailyTrades: pnlData.dailyTrades,
          tradingAllowed,
        },
      }))

      console.log("Store: Updated risk status")

      // Verificar limites de risco
      const { checkRiskLevelDowngrade, checkRiskLevelUpgrade } = get()
      checkRiskLevelDowngrade()
      checkRiskLevelUpgrade()
    } catch (error) {
      console.error("Store: Error updating risk status:", error)
    }
  },

  checkRiskLevelUpgrade: () => {
    const { riskStatus, selectedRiskLevel, addNotification } = get()

    // If weekly profit is 10% or more, suggest upgrade
    if (riskStatus.weeklyProfit >= 10 && !riskStatus.eligibleForUpgrade) {
      // Determine next level
      let nextLevel: RiskLevel | null = null

      if (selectedRiskLevel === "Conservative") {
        nextLevel = "Moderate"
      } else if (selectedRiskLevel === "Moderate") {
        nextLevel = "Aggressive"
      }

      // If there's a next level, suggest upgrade
      if (nextLevel) {
        set((state) => ({
          riskStatus: {
            ...state.riskStatus,
            eligibleForUpgrade: true,
          },
        }))

        // Add notification about upgrade eligibility
        addNotification({
          id: `risk-upgrade-${Date.now()}`,
          title: "Elegível para Upgrade de Nível de Risco",
          message: `Você acumulou ${riskStatus.weeklyProfit.toFixed(1)}% de lucro esta semana. Você pode avançar para o nível ${nextLevel}.`,
          type: "success",
          timestamp: Date.now(),
          read: false,
        })
      }
    }
  },

  // Modificar a função checkRiskLevelDowngrade para forçar o rebaixamento em caso de perdas
  checkRiskLevelDowngrade: () => {
    const { riskStatus, selectedRiskLevel, riskLimits, setRiskLevel, addNotification } = get()

    // Check if weekly loss limit is reached (20% global limit)
    if (riskStatus.weeklyLoss >= 20) {
      // Apply 7-day restriction
      const restrictionEndTime = Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days

      set((state) => ({
        riskStatus: {
          ...state.riskStatus,
          tradingAllowed: false,
          restrictionReason: "Limite de perda semanal de 20% atingido",
          restrictionEndTime: restrictionEndTime,
        },
      }))

      // Add notification about trading restriction
      addNotification({
        id: `trading-restriction-${Date.now()}`,
        title: "Operações Restritas por 7 Dias",
        message:
          "Você atingiu o limite de perda semanal de 20%. Operações estão restritas por 7 dias para recuperação.",
        type: "danger",
        timestamp: Date.now(),
        read: false,
      })

      // If not already at Conservative, downgrade FORCEFULLY
      if (selectedRiskLevel !== "Conservative") {
        const newLevel: RiskLevel = "Conservative"
        setRiskLevel(newLevel)

        // Add notification about downgrade
        addNotification({
          id: `risk-downgrade-${Date.now()}`,
          title: "Nível de Risco Reduzido",
          message: `Seu nível de risco foi reduzido para ${newLevel} devido a perdas excessivas.`,
          type: "warning",
          timestamp: Date.now(),
          read: false,
        })
      }
    }
    // Check if level-specific weekly loss limit is reached
    else if (riskStatus.weeklyLoss >= riskLimits.weeklyLossLimit) {
      // Determine previous level
      let newLevel: RiskLevel | null = null

      if (selectedRiskLevel === "Aggressive") {
        newLevel = "Moderate"
      } else if (selectedRiskLevel === "Moderate") {
        newLevel = "Conservative"
      }

      // If there's a previous level, downgrade FORCEFULLY
      if (newLevel) {
        setRiskLevel(newLevel)

        // Add notification about downgrade
        addNotification({
          id: `risk-downgrade-${Date.now()}`,
          title: "Nível de Risco Reduzido",
          message: `Seu nível de risco foi reduzido para ${newLevel} devido a perdas excessivas.`,
          type: "warning",
          timestamp: Date.now(),
          read: false,
        })
      }
    }
  },

  // Behaviors and insights
  behaviors: [],
  addBehavior: (behavior) =>
    set((state) => ({
      behaviors: [behavior, ...state.behaviors],
    })),

  // Notifications
  notifications: [],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
    })),
  markNotificationAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),

  // Guided Tour
  isTourCompleted: false,
  setTourCompleted: (completed) => set({ isTourCompleted: completed }),
}))

export const initializeRiskSettings = async () => {
  try {
    const { selectedRiskLevel, riskLimits } = await getRiskSettings()
    useAppStore.setState({ selectedRiskLevel, riskLimits })
  } catch (error) {
    console.error("Error initializing risk settings:", error)
  }
}

// Adicionar um alias para compatibilidade
export const useStore = useAppStore
