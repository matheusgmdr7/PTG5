import { useAppStore } from "../store"
import { api } from "./api"
import type { Notification } from "../types"

// Configuração da API do OpenAI
const OPENAI_API_KEY =
  "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"
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"

// Função para obter um resumo dos dados do usuário para o assistente
export const getUserDataSummary = async () => {
  const store = useAppStore.getState()
  const { balance, positions, trades, connections, behaviors, selectedRiskLevel, riskLimits, riskStatus } = store

  // Verificar se o usuário tem conexões
  const hasConnections = connections && connections.length > 0

  // Obter dados atualizados se houver conexões
  let currentBalance = balance
  let currentPositions = positions
  const currentTrades = trades.slice(0, 20) // Limitar a 20 trades para não sobrecarregar

  if (hasConnections) {
    try {
      // Tentar obter dados atualizados
      const accountType = connections[0].accountType || "futures"
      currentBalance = await api.getAccountBalance(connections, accountType)
      currentPositions = await api.getPositions(connections)
      // Não atualizamos trades aqui para evitar chamadas desnecessárias
    } catch (error) {
      console.error("Error fetching updated data for assistant:", error)
    }
  }

  // Calcular algumas estatísticas básicas
  const totalTrades = trades.length
  const winningTrades = trades.filter((trade) => trade.pnl > 0)
  const losingTrades = trades.filter((trade) => trade.pnl < 0)
  const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0
  const totalPnL = trades.reduce((sum, trade) => sum + trade.pnl, 0)
  const averagePnL = totalTrades > 0 ? totalPnL / totalTrades : 0
  const averageLeverage = totalTrades > 0 ? trades.reduce((sum, trade) => sum + trade.leverage, 0) / totalTrades : 0

  // Criar um resumo dos dados do usuário
  return {
    hasConnections,
    balance: currentBalance,
    positions: currentPositions,
    tradeStats: {
      totalTrades,
      winRate,
      totalPnL,
      averagePnL,
      averageLeverage,
      recentTrades: currentTrades,
    },
    riskProfile: {
      selectedRiskLevel,
      riskLimits,
      currentRiskStatus: riskStatus,
    },
    behaviors: behaviors.slice(0, 5), // Limitar a 5 comportamentos para não sobrecarregar
  }
}

// Função para enviar uma mensagem para o assistente e obter uma resposta
export const sendMessageToAssistant = async (
  message: string,
  onChunk: (chunk: string) => void,
  onFinish: () => void,
) => {
  try {
    // Obter resumo dos dados do usuário
    const userDataSummary = await getUserDataSummary()

    // Criar o prompt para o assistente
    const systemPrompt = `
      Você é o assistente virtual da plataforma PTG ProTraderGain, uma plataforma de gerenciamento de risco para traders.
      
      Dados atuais do usuário:
      ${JSON.stringify(userDataSummary, null, 2)}
      
      Responda de forma útil, amigável e concisa. Use os dados fornecidos para personalizar sua resposta.
      Se o usuário perguntar sobre seus dados de trading, forneça insights baseados nas informações disponíveis.
      Se o usuário pedir conselhos, baseie-os nos padrões de comportamento e estatísticas de trading dele.
      Não invente dados que não estão disponíveis.
    `

    // Fazer a chamada para a API do OpenAI com streaming
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        stream: true,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
    }

    // Processar a resposta em streaming
    const reader = response.body?.getReader()
    const decoder = new TextDecoder("utf-8")
    let fullResponse = ""

    if (reader) {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        // Decodificar o chunk
        const chunk = decoder.decode(value)

        // Processar o chunk (formato SSE)
        const lines = chunk.split("\n").filter((line) => line.trim() !== "")

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6)

            if (data === "[DONE]") {
              break
            }

            try {
              const json = JSON.parse(data)
              const content = json.choices[0]?.delta?.content || ""

              if (content) {
                fullResponse += content
                onChunk(content)
              }
            } catch (e) {
              console.error("Error parsing SSE data:", e)
            }
          }
        }
      }
    }

    onFinish()
    return { text: Promise.resolve(fullResponse) }
  } catch (error) {
    console.error("Error sending message to assistant:", error)
    onChunk("Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente mais tarde.")
    onFinish()
    throw error
  }
}

// Função para enviar uma notificação do assistente
export const sendAssistantNotification = (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
  const { addNotification } = useAppStore.getState()

  const fullNotification: Notification = {
    id: `assistant-${Date.now()}`,
    timestamp: Date.now(),
    read: false,
    ...notification,
  }

  addNotification(fullNotification)
  return fullNotification
}

// Função para gerar uma análise dos dados do usuário
export const generateUserInsights = async (): Promise<string> => {
  try {
    // Obter resumo dos dados do usuário
    const userDataSummary = await getUserDataSummary()

    // Criar o prompt para gerar insights
    const prompt = `
      Você é um analista de trading especializado em identificar padrões e fornecer insights.
      
      Analise os seguintes dados de um trader:
      ${JSON.stringify(userDataSummary, null, 2)}
      
      Forneça 3-5 insights valiosos e acionáveis baseados nesses dados. Considere:
      1. Padrões de ganhos e perdas
      2. Uso de alavancagem
      3. Comportamentos de risco
      4. Oportunidades de melhoria
      
      Formate sua resposta de forma concisa e direta, sem introduções ou conclusões.
    `

    // Fazer a chamada para a API do OpenAI
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "Você é um analista de trading especializado." },
          { role: "user", content: prompt },
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || "Não foi possível gerar insights no momento."
  } catch (error) {
    console.error("Error generating user insights:", error)
    return "Não foi possível gerar insights no momento. Por favor, tente novamente mais tarde."
  }
}
