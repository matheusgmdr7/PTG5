import { create } from "zustand"

// Definir o tipo do estado da aplicação
interface AppState {
  // Estado
  connections: any[]
  positions: any[]
  balance: any
  riskStatus: any
  behaviors: any[]
  notifications: any[]
  pnlData: any | null
  riskSettings: {
    maxDrawdown: number
    maxLeverage: number
    maxPositions: number
    maxDailyLoss: number
    stopLossRequired: boolean
    riskLevel: "low" | "medium" | "high"
  }

  // Ações
  setConnections: (connections: any[]) => void
  addConnection: (connection: any) => void
  removeConnection: (id: string) => void
  setPositions: (positions: any[]) => void
  setBalance: (balance: any) => void
  updateRiskStatus: (status?: Partial<AppState["riskStatus"]>) => void
  addBehavior: (behavior: any) => void
  removeBehavior: (id: string) => void
  addNotification: (notification: any) => void
  removeNotification: (id: string) => void
  markNotificationAsRead: (id: string) => void
  setPnLData: (data: any) => void
  updateRiskSettings: (settings: Partial<AppState["riskSettings"]>) => void
}

// Criar o store com o nome original useAppStore
export const useAppStore = create<AppState>((set) => ({
  // Estado inicial
  connections: [],
  positions: [],
  balance: {
    total: 0,
    available: 0,
    inPositions: 0,
    currency: "USD",
    accountType: "futures",
  },
  riskStatus: {
    level: "low",
    warnings: [],
    leverageRatio: 0,
    drawdown: 0,
    dailyPnL: 0,
    weeklyPnL: 0,
    openPositionsCount: 0,
    marginUsagePercent: 0,
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
  behaviors: [],
  notifications: [],
  pnlData: null,
  riskSettings: {
    maxDrawdown: 10, // 10%
    maxLeverage: 10, // 10x
    maxPositions: 5,
    maxDailyLoss: 5, // 5%
    stopLossRequired: true,
    riskLevel: "medium",
  },

  // Ações
  setConnections: (connections) => set({ connections }),
  addConnection: (connection) =>
    set((state) => ({
      connections: [...state.connections, connection],
    })),
  removeConnection: (id) =>
    set((state) => ({
      connections: state.connections.filter((conn) => conn.id !== id),
    })),
  setPositions: (positions) => set({ positions }),
  setBalance: (balance) => set({ balance }),
  updateRiskStatus: (status = {}) =>
    set((state) => ({
      riskStatus: {
        ...state.riskStatus,
        ...status,
      },
    })),
  addBehavior: (behavior) =>
    set((state) => ({
      behaviors: [...state.behaviors, behavior],
    })),
  removeBehavior: (id) =>
    set((state) => ({
      behaviors: state.behaviors.filter((b) => b.id !== id),
    })),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  markNotificationAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),
  setPnLData: (data) => set({ pnlData: data }),
  updateRiskSettings: (settings) =>
    set((state) => ({
      riskSettings: {
        ...state.riskSettings,
        ...settings,
      },
    })),
}))

// Adicionar um alias para compatibilidade
export const useStore = useAppStore

// Função para inicializar as configurações de risco do usuário a partir do Supabase
export const initializeRiskSettings = async () => {
  try {
    // Aqui você pode adicionar a lógica para buscar as configurações do Supabase
    // Por enquanto, vamos apenas usar os valores padrão
    useAppStore.setState({
      riskSettings: {
        maxDrawdown: 10,
        maxLeverage: 10,
        maxPositions: 5,
        maxDailyLoss: 5,
        stopLossRequired: true,
        riskLevel: "medium",
      },
    })
  } catch (error) {
    console.error("Error initializing risk settings:", error)
  }
}
