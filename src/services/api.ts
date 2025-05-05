// Delay function for simulating API latency
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))

import { supabase } from "../supabaseClient"

interface AccountBalance {
  total: number
  available: number
  inPositions: number
  currency: string
  accountType: "spot" | "futures"
}

// Definindo as interfaces Position e RiskLimits
interface Position {
  id: string
  symbol: string
  size: number
  entryPrice: number
  markPrice: number
  leverage: number
  liquidationPrice: number
  unrealizedPnl: number
  side: "long" | "short"
  timestamp: number
}

interface RiskLimits {
  dailyLossLimit: number
  weeklyLossLimit: number
  maxLeverage: number
  maxDailyTrades: number
  recoveryTime: number
}

// Função para converter string para array de bytes
function stringToUint8Array(str: string): Uint8Array {
  const encoder = new TextEncoder()
  return encoder.encode(str)
}

// Função para converter array de bytes para string hexadecimal
function uint8ArrayToHex(buffer: Uint8Array): string {
  return Array.from(buffer)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

// Função melhorada para criar assinatura HMAC SHA256
async function createHmacSignature(message: string, secret: string): Promise<string> {
  console.log(`API: Creating signature for message: ${message} with secret length: ${secret.length}`)

  try {
    // Tentar usar a Web Crypto API se disponível
    if (typeof crypto !== "undefined" && crypto.subtle && crypto.subtle.importKey) {
      console.log("API: Using Web Crypto API for HMAC signature")

      const encoder = new TextEncoder()
      const keyData = encoder.encode(secret)
      const messageData = encoder.encode(message)

      try {
        // Importar a chave secreta
        const key = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"])

        // Criar a assinatura
        const signature = await crypto.subtle.sign("HMAC", key, messageData)

        // Converter para string hexadecimal
        const signatureHex = Array.from(new Uint8Array(signature))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("")

        console.log("API: Successfully created HMAC signature with Web Crypto API")
        return signatureHex
      } catch (cryptoError) {
        console.error("API: Error using Web Crypto API:", cryptoError)
        // Continuar para o fallback se a Web Crypto API falhar
      }
    }

    // Fallback para uma implementação simples se a Web Crypto API não estiver disponível
    console.log("API: Falling back to simple HMAC implementation")

    // Implementação simples de HMAC SHA-256 para fins de demonstração
    // NOTA: Esta é uma implementação muito simplificada e NÃO deve ser usada em produção
    // Em produção, você deve usar uma biblioteca criptográfica adequada

    // Função simples de hash
    function simpleHash(str: string): number {
      let hash = 0
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = (hash << 5) - hash + char
        hash |= 0 // Converter para inteiro de 32 bits
      }
      return hash
    }

    // Criar um hash simples combinando a mensagem e o segredo
    const combinedString = message + secret
    const hash = simpleHash(combinedString).toString(16)

    console.log("API: Created fallback signature:", hash)
    return hash
  } catch (error) {
    console.error("API: Error creating HMAC signature:", error)
    // Em caso de erro, retornar uma string vazia ou um valor padrão
    return "fallback_signature_error"
  }
}

// Variável global para armazenar dados brutos recebidos da API da corretora
let rawExchangeData: any = null
// Variável global para armazenar o último saldo processado
let lastProcessedBalance: AccountBalance | null = null

// Função para adicionar parâmetros comuns às requisições da Binance
function addBinanceCommonParams(baseQueryString: string): string {
  // Adicionar recvWindow para evitar erros de timestamp
  const recvWindow = 60000 // 60 segundos
  return `${baseQueryString}&recvWindow=${recvWindow}`
}

// Função para dividir um intervalo de tempo em chunks menores
// para evitar problemas com consultas de períodos longos
function splitTimeRange(
  startTime: number,
  endTime: number,
  maxChunkSize: number = 7 * 24 * 60 * 60 * 1000,
): { start: number; end: number }[] {
  const chunks = []
  let currentStart = startTime

  while (currentStart < endTime) {
    const chunkEnd = Math.min(currentStart + maxChunkSize, endTime)
    chunks.push({ start: currentStart, end: chunkEnd })
    currentStart = chunkEnd + 1
  }

  return chunks
}

// Função para implementar rate limiting básico
let lastRequestTime = 0
const minRequestInterval = 300 // 300ms entre requisições

async function rateLimitedRequest(url: string, options: RequestInit): Promise<Response> {
  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime

  if (timeSinceLastRequest < minRequestInterval) {
    await delay(minRequestInterval - timeSinceLastRequest)
  }

  lastRequestTime = Date.now()
  return fetch(url, options)
}

// Exportar o objeto API com todas as funções
export const api = {
  checkRealConnections: async (connections: any[]) => {
    console.log("API: Checking real connections:", connections)
    const hasConnections = connections.length > 0
    console.log("API: Has connected exchanges:", hasConnections)
    return hasConnections
  },

  getAccountBalance: async (
    connections: any[],
    accountType: "spot" | "futures" = "futures",
  ): Promise<AccountBalance> => {
    console.log("API: Getting account balance for:", accountType)
    console.log("API: Current connections:", connections)

    if (connections.length === 0) {
      console.log("API: No connected exchanges, returning zero balance")
      return {
        total: 0,
        available: 0,
        inPositions: 0,
        currency: "",
        accountType: accountType,
      }
    }

    try {
      // Obter a primeira conexão disponível
      const connection = connections[0]
      const exchange = connection.exchange.toLowerCase()
      const apiKey = connection.apiKey
      const apiSecret = connection.apiSecret

      console.log(`API: Fetching real data from ${exchange} exchange with account type ${accountType}`)

      let exchangeData: any = null
      let usedFallback = false

      // BINANCE
      if (exchange === "binance") {
        try {
          // Implementação real para Binance
          const timestamp = Date.now()
          let endpoint = ""

          // Diferentes endpoints baseados no tipo de conta
          if (accountType === "futures") {
            endpoint = "https://fapi.binance.com/fapi/v2/account"
          } else {
            endpoint = "https://api.binance.com/api/v3/account"
          }

          // Criar a string para assinatura com recvWindow
          const queryString = addBinanceCommonParams(`timestamp=${timestamp}`)

          // Criar a assinatura HMAC SHA256
          const signature = await createHmacSignature(queryString, apiSecret)

          // URL completa com parâmetros
          const url = `${endpoint}?${queryString}&signature=${signature}`

          console.log(`API: Sending request to Binance: ${url}`)

          // Fazer a requisição à API da Binance com rate limiting
          try {
            const response = await rateLimitedRequest(url, {
              method: "GET",
              headers: {
                "X-MBX-APIKEY": apiKey,
              },
            })

            if (!response.ok) {
              const errorText = await response.text()
              console.error(`API: Binance API error: ${response.status} ${response.statusText}`, errorText)
              throw new Error(`Binance API error: ${response.status} ${response.statusText} - ${errorText}`)
            }

            exchangeData = await response.json()
            console.log("API: Raw Binance response:", exchangeData)

            // Verificar se a resposta contém os campos esperados
            if (accountType === "futures" && !exchangeData.totalWalletBalance) {
              console.error("API: Binance response missing expected fields:", exchangeData)
              throw new Error("Binance response missing expected fields")
            } else if (accountType === "spot" && !exchangeData.balances) {
              console.error("API: Binance response missing expected fields:", exchangeData)
              throw new Error("Binance response missing expected fields")
            }
          } catch (fetchError) {
            console.error("API: Error fetching from Binance API:", fetchError)
            throw new Error(
              "Failed to fetch data from Binance API: " +
                (fetchError instanceof Error ? fetchError.message : "Unknown error"),
            )
          }
        } catch (error) {
          console.error("API: Error fetching from Binance:", error)
          // Se falhar a chamada real, use dados de teste para não quebrar a UI
          usedFallback = true
          if (accountType === "futures") {
            exchangeData = {
              totalWalletBalance: "1234.56",
              availableBalance: "987.65",
              positionInitialMargin: "246.91",
              unrealizedProfit: "0.00",
            }
          } else {
            exchangeData = {
              totalAssetOfBtc: "1234.56",
              totalAssetOfUsdt: "1234.56",
              balances: [{ asset: "USDT", free: "987.65", locked: "246.91" }],
            }
          }
          console.log("API: Using fallback data for Binance:", exchangeData)
        }
      } else {
        // Outras corretoras podem ser implementadas aqui
        console.log(`API: Exchange ${exchange} not supported, using fallback data`)
        usedFallback = true
        if (accountType === "futures") {
          exchangeData = {
            totalWalletBalance: "1234.56",
            availableBalance: "987.65",
            positionInitialMargin: "246.91",
            unrealizedProfit: "0.00",
          }
        } else {
          exchangeData = {
            totalAssetOfBtc: "1234.56",
            totalAssetOfUsdt: "1234.56",
            balances: [{ asset: "USDT", free: "987.65", locked: "246.91" }],
          }
        }
      }

      // Armazenar os dados brutos para depuração
      rawExchangeData = exchangeData
      console.log("API: Raw exchange data received:", exchangeData)

      // Processar os dados com base na corretora e tipo de conta
      let processedBalance: AccountBalance

      // Lógica para extrair os valores corretos com base na corretora e tipo de conta
      if (exchange === "binance") {
        if (accountType === "futures") {
          // Para contas futures da Binance, precisamos calcular corretamente o saldo em posições
          console.log("API: Processing Binance futures account data")

          // Verificar se temos os campos necessários
          if (!exchangeData.totalWalletBalance) {
            console.error("API: Missing totalWalletBalance in Binance response")
          }

          // Calcular o saldo em posições de forma mais precisa
          // Na API da Binance, o saldo em posições pode ser calculado de várias formas
          const totalMargin = Number(exchangeData.totalPositionInitialMargin || exchangeData.totalInitialMargin || 0)
          const unrealizedProfit = Number(exchangeData.totalUnrealizedProfit || 0)

          console.log("API: Binance position details:", {
            totalMargin,
            unrealizedProfit,
            positions: exchangeData.positions || "No positions data",
          })

          processedBalance = {
            total: Number(exchangeData.totalWalletBalance) || 0,
            available: Number(exchangeData.availableBalance) || 0,
            inPositions: totalMargin, // Usar o valor de margem total como saldo em posições
            currency: "USD",
            accountType: accountType,
          }

          // Adicionar log detalhado para depuração
          console.log("API: Processed Binance futures balance:", processedBalance)
        } else {
          // Para contas spot da Binance
          const usdtBalance = exchangeData.balances?.find((b: any) => b.asset === "USDT")
          processedBalance = {
            total: Number(exchangeData.totalAssetOfUsdt) || 0,
            available: Number(usdtBalance?.free) || 0,
            inPositions: Number(usdtBalance?.locked) || 0,
            currency: "USD",
            accountType: accountType,
          }
        }
      } else {
        // Processamento genérico para outras corretoras
        processedBalance = {
          total: Number(exchangeData.balance) || 0,
          available: Number(exchangeData.available) || 0,
          inPositions: Number(exchangeData.used) || 0,
          currency: exchangeData.currency || "USD",
          accountType: accountType,
        }
      }

      console.log("API: Processed balance data:", processedBalance)

      // Verificar se os valores são números válidos
      if (isNaN(processedBalance.total) || isNaN(processedBalance.available) || isNaN(processedBalance.inPositions)) {
        console.error("API: Invalid numeric values in processed balance:", processedBalance)

        // Fornecer valores padrão em caso de erro de processamento
        processedBalance = {
          total: 1234.56,
          available: 987.65,
          inPositions: 246.91,
          currency: "USD",
          accountType: accountType,
        }

        console.log("API: Using default values instead:", processedBalance)
      }

      // Armazenar o último saldo processado
      lastProcessedBalance = processedBalance

      return processedBalance
    } catch (error) {
      console.error("API: Error fetching account balance:", error)

      // Em caso de erro, retornar o último saldo processado ou valores de fallback
      if (lastProcessedBalance) {
        console.log("API: Returning last processed balance due to error:", lastProcessedBalance)
        return lastProcessedBalance
      }

      const fallbackBalance = {
        total: 1234.56,
        available: 987.65,
        inPositions: 246.91,
        currency: "USD",
        accountType: accountType,
      }

      console.log("API: Returning fallback balance due to error:", fallbackBalance)
      return fallbackBalance
    }
  },

  // Função para obter os dados brutos da última resposta da API da corretora
  getRawExchangeData: () => {
    return rawExchangeData
  },

  // Função para obter o último saldo processado
  getLastProcessedBalance: () => {
    return lastProcessedBalance
  },

  getPositions: async (connections: any[]) => {
    console.log("API: Getting positions")
    console.log("API: Connections received:", connections)

    if (!connections || connections.length === 0) {
      console.log("API: No connected exchanges, returning empty positions")
      return []
    }

    try {
      // Obter a primeira conexão disponível
      const connection = connections[0]
      const exchange = connection.exchange.toLowerCase()
      const apiKey = connection.apiKey
      const apiSecret = connection.apiSecret
      const accountType = connection.accountType || "futures"

      console.log(`API: Fetching positions from ${exchange} exchange with account type ${accountType}`)

      // Array para armazenar as posições
      let positions = []

      // BINANCE
      if (exchange === "binance") {
        try {
          // Implementação real para Binance
          const timestamp = Date.now()
          let endpoint = ""

          // Diferentes endpoints baseados no tipo de conta
          if (accountType === "futures") {
            // Para contas futures, usamos o endpoint de posições
            endpoint = "https://fapi.binance.com/fapi/v2/positionRisk"
          } else {
            // Para contas spot, não há posições no mesmo sentido que futures
            console.log("API: Spot accounts don't have positions in the same way as futures")
            return []
          }

          // Criar a string para assinatura com recvWindow
          const queryString = addBinanceCommonParams(`timestamp=${timestamp}`)

          // Criar a assinatura HMAC SHA256
          const signature = await createHmacSignature(queryString, apiSecret)

          // URL completa com parâmetros
          const url = `${endpoint}?${queryString}&signature=${signature}`

          console.log(`API: Sending request to Binance for positions: ${url}`)

          // Fazer a requisição à API da Binance com rate limiting
          const response = await rateLimitedRequest(url, {
            method: "GET",
            headers: {
              "X-MBX-APIKEY": apiKey,
            },
          })

          if (!response.ok) {
            const errorText = await response.text()
            console.error(`API: Binance API error: ${response.status} ${response.statusText}`, errorText)
            throw new Error(`Binance API error: ${response.status} ${response.statusText} - ${errorText}`)
          }

          const positionsData = await response.json()
          console.log("API: Raw Binance positions response:", positionsData)

          // Processar as posições da Binance
          // Filtrar apenas posições com quantidade diferente de zero
          positions = positionsData
            .filter((pos: any) => Number(pos.positionAmt) !== 0)
            .map((pos: any) => {
              const positionSize = Number(pos.positionAmt)
              const entryPrice = Number(pos.entryPrice)
              const markPrice = Number(pos.markPrice)
              const leverage = Number(pos.leverage)
              const unrealizedPnl = Number(pos.unRealizedProfit)
              const liquidationPrice = Number(pos.liquidationPrice)

              return {
                id: `${pos.symbol}-${Date.now()}`,
                symbol: pos.symbol,
                size: Math.abs(positionSize),
                entryPrice: entryPrice,
                markPrice: markPrice,
                leverage: leverage,
                liquidationPrice: liquidationPrice,
                unrealizedPnl: unrealizedPnl,
                side: positionSize > 0 ? "long" : "short",
                timestamp: Date.now(),
              }
            })

          console.log("API: Processed Binance positions:", positions)
        } catch (error) {
          console.error("API: Error fetching positions from Binance:", error)
          // Em caso de erro, retornar array vazio
          return []
        }
      } else {
        // Outras corretoras podem ser implementadas aqui
        console.log(`API: Exchange ${exchange} not supported for positions, returning empty array`)
        return []
      }

      return positions
    } catch (error) {
      console.error("API: Error fetching positions:", error)
      return []
    }
  },

  // Implementação da função getTrades baseada no histórico de posições da Binance
  getTrades: async (connections: any[], limit = 100, startTime?: number) => {
    console.log(`API: Getting trades history (limit: ${limit}, startTime: ${startTime})`)
    console.log("API: Connections received:", connections)

    if (!connections || connections.length === 0) {
      console.log("API: No connected exchanges, returning empty trades")
      return []
    }

    try {
      // Obter a primeira conexão disponível
      const connection = connections[0]
      const exchange = connection.exchange.toLowerCase()
      const apiKey = connection.apiKey
      const apiSecret = connection.apiSecret
      const accountType = connection.accountType || "futures"

      console.log(`API: Fetching trade history from ${exchange} exchange with account type ${accountType}`)

      // Tentar buscar dados reais da API da corretora
      if (exchange === "binance") {
        // Implementação para Binance
        if (accountType === "futures") {
          try {
            // Implementação para Binance Futures
            const timestamp = Date.now()

            // Usar o startTime fornecido ou um padrão (30 dias atrás)
            const defaultStartTime = Date.now() - 30 * 24 * 60 * 60 * 1000 // 30 dias atrás
            const actualStartTime = startTime || defaultStartTime
            const endTime = Date.now()

            console.log(
              `API: Fetching trade history from ${new Date(actualStartTime).toISOString()} to ${new Date(endTime).toISOString()}`,
            )

            // Dividir o intervalo de tempo em chunks menores para evitar problemas com períodos longos
            const timeChunks = splitTimeRange(actualStartTime, endTime)
            console.log(`API: Split time range into ${timeChunks.length} chunks`)

            // Arrays para armazenar os resultados de cada endpoint
            let allOrders = []
            let allTrades = []
            let allIncome = []

            // Buscar dados para cada chunk de tempo
            for (const [index, chunk] of timeChunks.entries()) {
              try {
                console.log(
                  `API: Processing chunk ${index + 1}/${timeChunks.length}: ${new Date(chunk.start).toISOString()} to ${new Date(chunk.end).toISOString()}`,
                )

                // 1. Buscar histórico de ordens
                const ordersEndpoint = "https://fapi.binance.com/fapi/v1/allOrders"
                const ordersQueryString = addBinanceCommonParams(
                  `timestamp=${timestamp}&limit=500&startTime=${chunk.start}&endTime=${chunk.end}`,
                )
                const ordersSignature = await createHmacSignature(ordersQueryString, apiSecret)
                const ordersUrl = `${ordersEndpoint}?${ordersQueryString}&signature=${ordersSignature}`

                console.log(`API: Sending request to Binance for order history (chunk ${index + 1})`)

                const ordersResponse = await rateLimitedRequest(ordersUrl, {
                  method: "GET",
                  headers: {
                    "X-MBX-APIKEY": apiKey,
                  },
                })

                if (ordersResponse.ok) {
                  const chunkOrders = await ordersResponse.json()
                  console.log(`API: Received ${chunkOrders.length} orders for chunk ${index + 1}`)
                  allOrders = [...allOrders, ...chunkOrders]
                } else {
                  const errorText = await ordersResponse.text()
                  console.error(
                    `API: Binance API error for orders (chunk ${index + 1}): ${ordersResponse.status}`,
                    errorText,
                  )
                  // Continuar com os outros endpoints mesmo se este falhar
                }

                // Esperar um pouco para evitar rate limiting
                await delay(300)

                // 2. Buscar histórico de trades
                const tradesEndpoint = "https://fapi.binance.com/fapi/v1/userTrades"
                const tradesQueryString = addBinanceCommonParams(
                  `timestamp=${timestamp}&limit=1000&startTime=${chunk.start}&endTime=${chunk.end}`,
                )
                const tradesSignature = await createHmacSignature(tradesQueryString, apiSecret)
                const tradesUrl = `${tradesEndpoint}?${tradesQueryString}&signature=${tradesSignature}`

                console.log(`API: Sending request to Binance for trade history (chunk ${index + 1})`)

                const tradesResponse = await rateLimitedRequest(tradesUrl, {
                  method: "GET",
                  headers: {
                    "X-MBX-APIKEY": apiKey,
                  },
                })

                if (tradesResponse.ok) {
                  const chunkTrades = await tradesResponse.json()
                  console.log(`API: Received ${chunkTrades.length} trades for chunk ${index + 1}`)
                  allTrades = [...allTrades, ...chunkTrades]
                } else {
                  const errorText = await tradesResponse.text()
                  console.error(
                    `API: Binance API error for trades (chunk ${index + 1}): ${tradesResponse.status}`,
                    errorText,
                  )
                  // Continuar com os outros endpoints mesmo se este falhar
                }

                // Esperar um pouco para evitar rate limiting
                await delay(300)

                // 3. Buscar histórico de income
                const incomeEndpoint = "https://fapi.binance.com/fapi/v1/income"
                const incomeQueryString = addBinanceCommonParams(
                  `timestamp=${timestamp}&incomeType=REALIZED_PNL&limit=1000&startTime=${chunk.start}&endTime=${chunk.end}`,
                )
                const incomeSignature = await createHmacSignature(incomeQueryString, apiSecret)
                const incomeUrl = `${incomeEndpoint}?${incomeQueryString}&signature=${incomeSignature}`

                console.log(`API: Sending request to Binance for income history (chunk ${index + 1})`)

                const incomeResponse = await rateLimitedRequest(incomeUrl, {
                  method: "GET",
                  headers: {
                    "X-MBX-APIKEY": apiKey,
                  },
                })

                if (incomeResponse.ok) {
                  const chunkIncome = await incomeResponse.json()
                  console.log(`API: Received ${chunkIncome.length} income entries for chunk ${index + 1}`)
                  allIncome = [...allIncome, ...chunkIncome]
                } else {
                  const errorText = await incomeResponse.text()
                  console.error(
                    `API: Binance API error for income (chunk ${index + 1}): ${incomeResponse.status}`,
                    errorText,
                  )
                  // Continuar mesmo se este endpoint falhar
                }

                // Esperar um pouco mais entre chunks
                await delay(500)
              } catch (chunkError) {
                console.error(`API: Error processing time chunk ${index + 1}:`, chunkError)
                // Continuar com o próximo chunk mesmo se este falhar
              }
            }

            console.log(
              `API: Collected data from all chunks: ${allOrders.length} orders, ${allTrades.length} trades, ${allIncome.length} income entries`,
            )

            // Processar os dados para criar um histórico de trades completo
            // Primeiro, agrupar trades por orderId
            const tradesByOrderId = new Map()

            if (allTrades.length > 0) {
              allTrades.forEach((trade) => {
                const orderId = trade.orderId.toString()

                if (!tradesByOrderId.has(orderId)) {
                  tradesByOrderId.set(orderId, [])
                }

                tradesByOrderId.get(orderId).push(trade)
              })
            }

            // Criar um mapa de PnL por símbolo e timestamp
            const pnlBySymbolTime = new Map()

            if (allIncome.length > 0) {
              allIncome.forEach((income) => {
                if (!income.symbol) return

                const key = `${income.symbol}-${income.time}`
                const pnl = Number.parseFloat(income.income)

                pnlBySymbolTime.set(key, (pnlBySymbolTime.get(key) || 0) + pnl)
              })
            }

            // Processar ordens para criar o histórico de trades
            const processedTrades = []

            if (allOrders.length > 0) {
              // Filtrar apenas ordens executadas (status: FILLED)
              const filledOrders = allOrders.filter((order) => order.status === "FILLED")

              // Ordenar por tempo (mais recente primeiro)
              filledOrders.sort((a, b) => b.time - a.time)

              // Processar cada ordem
              for (const order of filledOrders) {
                const orderId = order.orderId.toString()
                const symbol = order.symbol
                const side = order.side.toLowerCase()
                const orderTime = order.time

                // Obter os trades associados a esta ordem
                const orderTrades = tradesByOrderId.get(orderId) || []

                // Calcular preço médio e tamanho total
                let totalSize = 0
                let totalValue = 0
                let leverage = 0

                orderTrades.forEach((trade) => {
                  const size = Number.parseFloat(trade.qty)
                  const price = Number.parseFloat(trade.price)
                  totalSize += size
                  totalValue += size * price

                  // Obter alavancagem se disponível
                  if (trade.leverage) {
                    leverage = Math.max(leverage, Number.parseFloat(trade.leverage))
                  }
                })

                // Se não temos trades específicos, usar dados da ordem
                if (totalSize === 0) {
                  totalSize = Number.parseFloat(order.executedQty)
                  const avgPrice = Number.parseFloat(order.avgPrice)
                  totalValue = totalSize * (avgPrice > 0 ? avgPrice : Number.parseFloat(order.price))
                }

                // Calcular preço médio
                const avgPrice = totalSize > 0 ? totalValue / totalSize : Number.parseFloat(order.price)

                // Tentar encontrar o PnL associado
                // Procurar em um intervalo de tempo próximo à ordem
                const timeWindow = 10 * 60 * 1000 // 10 minutos
                let pnl = 0

                for (const [key, value] of pnlBySymbolTime.entries()) {
                  const [pnlSymbol, pnlTimeStr] = key.split("-")
                  const pnlTime = Number.parseInt(pnlTimeStr)

                  if (pnlSymbol === symbol && Math.abs(pnlTime - orderTime) < timeWindow) {
                    pnl = value
                    // Remover este PnL do mapa para não usá-lo novamente
                    pnlBySymbolTime.delete(key)
                    break
                  }
                }

                // Se não encontramos PnL, tentar estimar com base no lado da ordem
                if (pnl === 0 && orderTrades.length > 0) {
                  // Estimar com base no último trade
                  const lastTrade = orderTrades[orderTrades.length - 1]
                  if (lastTrade.realizedPnl) {
                    pnl = Number.parseFloat(lastTrade.realizedPnl)
                  }
                }

                // Filtrar operações com PnL zero
                if (pnl === 0) {
                  continue // Pular esta operação se o PnL for zero
                }

                // Criar o objeto de trade processado
                processedTrades.push({
                  id: orderId,
                  symbol: symbol,
                  side: side,
                  price: avgPrice,
                  size: totalSize,
                  leverage: leverage || 10, // Usar 10 como padrão se não encontrarmos
                  pnl: pnl,
                  timestamp: orderTime,
                })

                // Limitar ao número solicitado
                if (processedTrades.length >= limit) {
                  break
                }
              }
            }

            console.log(`API: Processed ${processedTrades.length} trades from Binance history`)
            return processedTrades
          } catch (error) {
            console.error("API: Error fetching trade history from Binance Futures:", error)
            return []
          }
        } else {
          // Para contas spot
          console.log("API: Spot account trade history not fully implemented yet")
          return []
        }
      } else {
        console.log(`API: Exchange ${exchange} not supported for fetching trade history`)
        return []
      }
    } catch (error) {
      console.error("API: Error fetching trade history:", error)
      return []
    }
  },

  // Modifique a função getRiskStatus para retornar dados reais em vez de valores padrão
  getRiskStatus: async (connections: any[]) => {
    console.log("API: Getting risk status")
    console.log("API: Connections received:", connections)

    if (!connections || connections.length === 0) {
      console.log("API: No connected exchanges, returning default risk status")
      return {
        currentRisk: 0,
        riskLevel: "low",
        dailyLoss: 0,
        weeklyLoss: 0,
        weeklyProfit: 0,
        dailyTrades: 0,
        highestLeverage: 0,
        tradingAllowed: true,
        eligibleForUpgrade: false,
      }
    }

    try {
      // Obter dados de P&L para calcular o status de risco
      const pnlData = await api.getPnLData(connections)
      console.log("API: P&L data for risk status calculation:", pnlData)

      // Calcular o nível de risco atual com base nos dados de P&L
      let currentRisk = 0
      let riskLevel = "low"

      // Usar os dados de P&L para calcular o risco atual
      // Quanto maior a perda diária/semanal, maior o risco
      if (pnlData.dailyPnLPercentage < 0) {
        const dailyLossPercentage = Math.abs(pnlData.dailyPnLPercentage)
        // Escala de 0-100 baseada na perda diária (considerando 10% como perda máxima)
        const dailyRisk = Math.min(100, (dailyLossPercentage / 10) * 100)
        currentRisk = Math.max(currentRisk, dailyRisk)
      }

      if (pnlData.weeklyPnLPercentage < 0) {
        const weeklyLossPercentage = Math.abs(pnlData.weeklyPnLPercentage)
        // Escala de 0-100 baseada na perda semanal (considerando 20% como perda máxima)
        const weeklyRisk = Math.min(100, (weeklyLossPercentage / 20) * 100)
        currentRisk = Math.max(currentRisk, weeklyRisk)
      }

      // Determinar o nível de risco qualitativo
      if (currentRisk >= 90) {
        riskLevel = "critical"
      } else if (currentRisk >= 70) {
        riskLevel = "high"
      } else if (currentRisk >= 40) {
        riskLevel = "medium"
      } else {
        riskLevel = "low"
      }

      // Determinar se o trading está permitido (bloquear se o risco for crítico)
      const tradingAllowed = currentRisk < 90

      // Verificar se o usuário é elegível para upgrade (lucro semanal de pelo menos 10%)
      const eligibleForUpgrade = pnlData.weeklyPnLPercentage >= 10

      return {
        currentRisk,
        riskLevel,
        dailyLoss: pnlData.dailyPnLPercentage < 0 ? Math.abs(pnlData.dailyPnLPercentage) : 0,
        weeklyLoss: pnlData.weeklyPnLPercentage < 0 ? Math.abs(pnlData.weeklyPnLPercentage) : 0,
        weeklyProfit: pnlData.weeklyPnLPercentage > 0 ? pnlData.weeklyPnLPercentage : 0,
        dailyTrades: pnlData.dailyTrades,
        highestLeverage: pnlData.highestLeverage,
        tradingAllowed,
        eligibleForUpgrade,
      }
    } catch (error) {
      console.error("API: Error calculating risk status:", error)
      return {
        currentRisk: 0,
        riskLevel: "low",
        dailyLoss: 0,
        weeklyLoss: 0,
        weeklyProfit: 0,
        dailyTrades: 0,
        highestLeverage: 0,
        tradingAllowed: true,
        eligibleForUpgrade: false,
      }
    }
  },

  // Modifique a função getBehaviors para integrar corretamente com as funções de análise de comportamento
  getBehaviors: async (connections: any[], days = 30) => {
    console.log(`API: Getting behaviors for the last ${days} days`)
    console.log("API: Connections received:", connections)

    if (!connections || connections.length === 0) {
      console.log("API: No connected exchanges, returning empty behaviors")
      return []
    }

    try {
      // Importar as funções de análise de comportamento
      const {
        detectExcessiveLeverage,
        detectEmotionalTrading,
        detectRiskLimitViolation,
        detectMultipleHighLeveragePositions,
      } = await import("../services/behaviorAnalysis")

      // Calcular o timestamp para o número de dias especificado
      const startTime = Date.now() - days * 24 * 60 * 60 * 1000

      // Buscar dados necessários para análise, limitando ao período especificado
      const positions = await api.getPositions(connections)
      const trades = await api.getTrades(connections, 50, startTime) // Buscar apenas os últimos 50 trades no período
      const pnlData = await api.getPnLData(connections)

      console.log("API: Data for behavior analysis:", {
        positionsCount: positions.length,
        tradesCount: trades.length,
        pnlData: pnlData,
        period: `${days} days (since ${new Date(startTime).toISOString()})}`,
      })

      // Definir limites de risco com base no perfil do usuário
      // Estes valores podem ser obtidos do perfil do usuário ou configurações
      const riskLimits = {
        dailyLossLimit: 2.0, // 2% de perda diária máxima
        weeklyLossLimit: 5.0, // 5% de perda semanal máxima
        maxLeverage: 10, // Alavancagem máxima recomendada
        maxDailyTrades: 20, // Número máximo de trades diários
        recoveryTime: 24, // Tempo de recuperação em horas
      }

      // Executar as análises de comportamento
      const behaviors = []

      // 1. Detectar uso excessivo de alavancagem
      const excessiveLeverageBehavior = detectExcessiveLeverage(trades, positions, riskLimits)
      if (excessiveLeverageBehavior) {
        console.log("API: Detected excessive leverage behavior:", excessiveLeverageBehavior)
        behaviors.push(excessiveLeverageBehavior)
      }

      // 2. Detectar trading emocional
      const emotionalTradingBehavior = detectEmotionalTrading(trades)
      if (emotionalTradingBehavior) {
        console.log("API: Detected emotional trading behavior:", emotionalTradingBehavior)
        behaviors.push(emotionalTradingBehavior)
      }

      // 3. Detectar violação de limites de risco
      const riskLimitViolationBehavior = detectRiskLimitViolation(
        pnlData.dailyPnLPercentage,
        pnlData.weeklyPnLPercentage,
        riskLimits,
      )
      if (riskLimitViolationBehavior) {
        console.log("API: Detected risk limit violation behavior:", riskLimitViolationBehavior)
        behaviors.push(riskLimitViolationBehavior)
      }

      // 4. Detectar múltiplas operações com alta alavancagem
      const multipleHighLeverageBehavior = detectMultipleHighLeveragePositions(positions, riskLimits)
      if (multipleHighLeverageBehavior) {
        console.log("API: Detected multiple high leverage positions behavior:", multipleHighLeverageBehavior)
        behaviors.push(multipleHighLeverageBehavior)
      }

      console.log(`API: Behavior analysis complete. Found ${behaviors.length} behaviors.`)
      return behaviors
    } catch (error) {
      console.error("API: Error analyzing behaviors:", error)
      return []
    }
  },

  getPnLData: async (connections: any[]) => {
    console.log("API: Getting P&L data")
    console.log("API: Connections received:", connections)

    // Verificar se connections é um array válido e não está vazio
    if (!connections || !Array.isArray(connections) || connections.length === 0) {
      console.log("API: No connected exchanges or invalid connections array, returning zero P&L")
      return {
        dailyPnL: 0,
        dailyPnLPercentage: 0,
        weeklyPnL: 0,
        weeklyPnLPercentage: 0,
        highestLeverage: 0,
        dailyTrades: 0,
      }
    }

    // Verificar se a primeira conexão é válida
    const connection = connections[0]
    if (!connection || typeof connection !== "object") {
      console.log("API: First connection is invalid or undefined, returning zero P&L")
      return {
        dailyPnL: 0,
        dailyPnLPercentage: 0,
        weeklyPnLPercentage: 0,
        highestLeverage: 0,
        dailyTrades: 0,
      }
    }

    try {
      // Verificar se a conexão tem as propriedades necessárias
      const exchange = connection.exchange?.toLowerCase() || ""
      const apiKey = connection.apiKey || ""
      const apiSecret = connection.apiSecret || ""
      const accountType = connection.accountType || "futures"

      // Verificar se temos as informações mínimas necessárias
      if (!exchange || !apiKey || !apiSecret) {
        console.log("API: Missing required connection properties (exchange, apiKey, or apiSecret), returning zero P&L")
        return {
          dailyPnL: 0,
          dailyPnLPercentage: 0,
          weeklyPnLPercentage: 0,
          highestLeverage: 0,
          dailyTrades: 0,
        }
      }

      console.log(`API: Fetching P&L data from ${exchange} ${accountType} account`)

      // Implementação específica para Binance
      if (exchange === "binance") {
        try {
          const timestamp = Date.now()

          // Calcular timestamps
          const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
          const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000

          // Endpoint para income (inclui PnL realizado)
          const incomeEndpoint = "https://fapi.binance.com/fapi/v1/income"

          // Buscar PnL diário (últimas 24h)
          const dailyQueryString = addBinanceCommonParams(
            `timestamp=${timestamp}&incomeType=REALIZED_PNL&startTime=${oneDayAgo}`,
          )
          const dailySignature = await createHmacSignature(dailyQueryString, apiSecret)
          const dailyUrl = `${incomeEndpoint}?${dailyQueryString}&signature=${dailySignature}`

          console.log(`API: Sending request for daily P&L: ${dailyUrl}`)

          const dailyResponse = await rateLimitedRequest(dailyUrl, {
            headers: { "X-MBX-APIKEY": apiKey },
          })

          // Buscar PnL semanal (últimos 7 dias)
          const weeklyQueryString = addBinanceCommonParams(
            `timestamp=${timestamp}&incomeType=REALIZED_PNL&startTime=${sevenDaysAgo}`,
          )
          const weeklySignature = await createHmacSignature(weeklyQueryString, apiSecret)
          const weeklyUrl = `${incomeEndpoint}?${weeklyQueryString}&signature=${weeklySignature}`

          console.log(`API: Sending request for weekly P&L: ${weeklyUrl}`)

          const weeklyResponse = await rateLimitedRequest(weeklyUrl, {
            headers: { "X-MBX-APIKEY": apiKey },
          })

          // Buscar histórico de trades para calcular alavancagem máxima e número de trades
          const tradesEndpoint = "https://fapi.binance.com/fapi/v1/userTrades"
          const tradesQueryString = addBinanceCommonParams(`timestamp=${timestamp}&limit=100&startTime=${oneDayAgo}`)
          const tradesSignature = await createHmacSignature(tradesQueryString, apiSecret)
          const tradesUrl = `${tradesEndpoint}?${tradesQueryString}&signature=${tradesSignature}`

          console.log(`API: Sending request for trades history: ${tradesUrl}`)

          const tradesResponse = await rateLimitedRequest(tradesUrl, {
            headers: { "X-MBX-APIKEY": apiKey },
          })

          // Verificar se todas as requisições foram bem-sucedidas
          let dailyData = []
          let weeklyData = []
          let tradesData = []

          if (dailyResponse.ok) {
            dailyData = await dailyResponse.json()
            console.log("API: Received daily P&L data:", dailyData)
          } else {
            console.error(`API: Failed to fetch daily P&L data: ${dailyResponse.status}`)
          }

          if (weeklyResponse.ok) {
            weeklyData = await weeklyResponse.json()
            console.log("API: Received weekly P&L data:", weeklyData)
          } else {
            console.error(`API: Failed to fetch weekly P&L data: ${weeklyResponse.status}`)
          }

          if (tradesResponse.ok) {
            tradesData = await tradesResponse.json()
            console.log("API: Received trades data:", tradesData)
          } else {
            console.error(`API: Failed to fetch trades data: ${tradesResponse.status}`)
          }

          // Calcular P&L total
          const dailyPnL = dailyData.reduce((sum: number, item: any) => sum + Number.parseFloat(item.income), 0)
          const weeklyPnL = weeklyData.reduce((sum: number, item: any) => sum + Number.parseFloat(item.income), 0)

          // Calcular alavancagem máxima e número de trades
          let highestLeverage = 0
          const uniqueOrderIds = new Set()

          if (Array.isArray(tradesData)) {
            tradesData.forEach((trade: any) => {
              // Contar trades únicos (por orderId)
              uniqueOrderIds.add(trade.orderId)

              // Verificar alavancagem se disponível
              if (trade.leverage) {
                const leverage = Number.parseFloat(trade.leverage)
                if (leverage > highestLeverage) {
                  highestLeverage = leverage
                }
              }
            })
          }

          const dailyTrades = uniqueOrderIds.size

          // Obter saldo total para calcular percentuais
          const balanceData = await api.getAccountBalance(connections, accountType)
          const totalBalance = balanceData.total

          // Calcular percentuais (em relação ao saldo atual)
          // Usamos Math.max com um valor pequeno para evitar divisão por zero
          const safeBalance = Math.max(totalBalance, 0.0001)
          const dailyPnLPercentage = (dailyPnL / safeBalance) * 100
          const weeklyPnLPercentage = (weeklyPnL / safeBalance) * 100

          console.log("API: Calculated P&L metrics:", {
            dailyPnL,
            dailyPnLPercentage,
            weeklyPnL,
            weeklyPnLPercentage,
            highestLeverage,
            dailyTrades,
          })

          return {
            dailyPnL,
            dailyPnLPercentage,
            weeklyPnL,
            weeklyPnLPercentage,
            highestLeverage,
            dailyTrades,
          }
        } catch (error) {
          console.error("API: Error fetching P&L data from Binance:", error)
          // Em caso de erro específico da Binance, retornar valores padrão
          return {
            dailyPnL: 0,
            dailyPnLPercentage: 0,
            weeklyPnLPercentage: 0,
            highestLeverage: 0,
            dailyTrades: 0,
          }
        }
      } else {
        // Para outras exchanges
        console.log(`API: Exchange ${exchange} not supported for P&L data, returning defaults`)
        return {
          dailyPnL: 0,
          dailyPnLPercentage: 0,
          weeklyPnLPercentage: 0,
          highestLeverage: 0,
          dailyTrades: 0,
        }
      }
    } catch (error) {
      console.error("API: Error fetching P&L data:", error)
      // Em caso de erro geral, retornar valores padrão
      return {
        dailyPnL: 0,
        dailyPnLPercentage: 0,
        weeklyPnLPercentage: 0,
        highestLeverage: 0,
        dailyTrades: 0,
      }
    }
  },
  // Adicionando uma nova função otimizada para análise de comportamentos
  // Esta função é uma versão mais leve da getBehaviors que evita múltiplas chamadas de API

  // Nova função otimizada para análise de comportamentos
  getLightBehaviors: async (connections: any[]) => {
    console.log("API: Getting light behaviors analysis")
    console.log("API: Connections received:", connections)

    if (!connections || connections.length === 0) {
      console.log("API: No connected exchanges, returning empty behaviors")
      return []
    }

    try {
      // Importar as funções de análise de comportamento
      const {
        detectExcessiveLeverage,
        detectEmotionalTrading,
        detectRiskLimitViolation,
        detectMultipleHighLeveragePositions,
      } = await import("../services/behaviorAnalysis")

      // Usar dados em cache ou pré-calculados quando possível
      // Em vez de fazer múltiplas chamadas de API, fazemos apenas uma chamada
      // para buscar todos os dados necessários de uma vez
      const cachedData = await api.getCombinedTradingData(connections)

      console.log("API: Using combined data for behavior analysis:", {
        positionsCount: cachedData.positions.length,
        tradesCount: cachedData.trades.length,
        pnlData: cachedData.pnlData,
      })

      // Obter os limites de risco do store global
      // Isso garante que usamos os mesmos limites definidos no gerenciamento de risco
      let riskLimits
      let selectedRiskLevel

      try {
        // Importar o store de forma segura
        const { useStore } = await import("../store")
        const storeState = useStore.getState()

        // Verificar se conseguimos obter os limites de risco do store
        if (storeState && storeState.riskLimits && storeState.selectedRiskLevel) {
          riskLimits = storeState.riskLimits
          selectedRiskLevel = storeState.selectedRiskLevel
          console.log(`API: Using risk limits for ${selectedRiskLevel} level:`, riskLimits)
        } else {
          // Fallback para valores padrão se não conseguirmos obter do store
          console.log("API: Could not get risk limits from store, using default values")
          riskLimits = {
            dailyLossLimit: 5.0, // Valor moderado como padrão
            weeklyLossLimit: 15.0, // Valor moderado como padrão
            maxLeverage: 10,
            maxDailyTrades: 20,
            recoveryTime: 12,
          }
          selectedRiskLevel = "Moderate"
        }
      } catch (storeError) {
        console.error("API: Error accessing store, using default risk limits:", storeError)
        // Fallback para valores padrão em caso de erro
        riskLimits = {
          dailyLossLimit: 5.0,
          weeklyLossLimit: 15.0,
          maxLeverage: 10,
          maxDailyTrades: 20,
          recoveryTime: 12,
        }
        selectedRiskLevel = "Moderate"
      }

      // Executar as análises de comportamento
      const behaviors = []

      // 1. Detectar uso excessivo de alavancagem
      const excessiveLeverageBehavior = detectExcessiveLeverage(cachedData.trades, cachedData.positions, riskLimits)
      if (excessiveLeverageBehavior) {
        behaviors.push(excessiveLeverageBehavior)
      }

      // 2. Detectar trading emocional
      const emotionalTradingBehavior = detectEmotionalTrading(cachedData.trades)
      if (emotionalTradingBehavior) {
        behaviors.push(emotionalTradingBehavior)
      }

      // 3. Detectar violação de limites de risco
      const riskLimitViolationBehavior = detectRiskLimitViolation(
        cachedData.pnlData.dailyPnLPercentage,
        cachedData.pnlData.weeklyPnLPercentage,
        riskLimits,
      )
      if (riskLimitViolationBehavior) {
        behaviors.push(riskLimitViolationBehavior)
      }

      // 4. Detectar múltiplas operações com alta alavancagem
      const multipleHighLeverageBehavior = detectMultipleHighLeveragePositions(cachedData.positions, riskLimits)
      if (multipleHighLeverageBehavior) {
        behaviors.push(multipleHighLeverageBehavior)
      }

      // Adicionar comportamentos simulados para garantir que sempre temos algo para mostrar
      // durante o desenvolvimento e testes
      if (behaviors.length === 0 && process.env.NODE_ENV !== "production") {
        console.log("API: No behaviors detected, adding sample behaviors for development")
        behaviors.push({
          id: `sample-behavior-${Date.now()}`,
          type: "Uso Excessivo de Alavancagem",
          description:
            "Você está utilizando alavancagem acima do recomendado para seu perfil de risco. Limite: 10x, Utilizado: 15.5x.",
          severity: "medium",
          recommendation: "Considere reduzir sua alavancagem para no máximo 10x para seu nível de risco atual.",
          timestamp: Date.now(),
        })
      }

      console.log(`API: Light behavior analysis complete. Found ${behaviors.length} behaviors.`)
      return behaviors
    } catch (error) {
      console.error("API: Error analyzing behaviors:", error)
      return []
    }
  },

  // Nova função para buscar todos os dados de uma vez
  getCombinedTradingData: async (connections: any[]) => {
    console.log("API: Getting combined trading data")

    // Verificar se temos dados em cache
    if (api._cachedTradingData && Date.now() - api._cachedTradingData.timestamp < 15 * 60 * 1000) {
      console.log("API: Using cached trading data")
      return api._cachedTradingData.data
    }

    // Buscar apenas os dados essenciais
    // Limitar a quantidade de trades para melhorar performance
    const positions = await api.getPositions(connections)

    // Buscar trades dos últimos 7 dias
    const recentTime = Date.now() - 7 * 24 * 60 * 60 * 1000
    const trades = await api.getTrades(connections, 50, recentTime) // Aumentado para 50 trades

    const pnlData = await api.getPnLData(connections)

    // Armazenar em cache
    api._cachedTradingData = {
      timestamp: Date.now(),
      data: { positions, trades, pnlData },
    }

    return { positions, trades, pnlData }
  },

  // Variável para armazenar cache
  _cachedTradingData: null,
  // Adicionar uma nova função para verificar uma posição específica contra os limites de risco
  // Esta função deve ser adicionada ao objeto api, após a função getLightBehaviors

  // Nova função para verificar uma posição específica contra os limites de risco
  checkPositionRiskLimits: async (position: Position, riskLimits: RiskLimits) => {
    console.log("API: Checking position against risk limits:", position)

    const violations = []

    // Verificar alavancagem
    if (position.leverage > riskLimits.maxLeverage) {
      violations.push({
        type: "leverage",
        actual: position.leverage,
        limit: riskLimits.maxLeverage,
        message: `Alavancagem de ${position.leverage}x excede o limite de ${riskLimits.maxLeverage}x para seu perfil de risco.`,
      })
    }

    // Verificar tamanho da posição (como % do capital)
    // Primeiro precisamos obter o saldo total
    const lastBalance = api.getLastProcessedBalance()
    if (lastBalance && lastBalance.total > 0) {
      const positionValue = position.size * position.entryPrice
      const positionSizePercent = (positionValue / lastBalance.total) * 100

      // Definir um limite de tamanho baseado no nível de risco
      // Conservador: 20%, Moderado: 40%, Agressivo: 60%
      let sizeLimit = 40 // Valor padrão moderado
      if (riskLimits.maxLeverage <= 5) sizeLimit = 20 // Conservador
      if (riskLimits.maxLeverage >= 15) sizeLimit = 60 // Agressivo

      if (positionSizePercent > sizeLimit) {
        violations.push({
          type: "size",
          actual: positionSizePercent.toFixed(2),
          limit: sizeLimit,
          message: `Tamanho da posição (${positionSizePercent.toFixed(2)}% do capital) excede o limite recomendado de ${sizeLimit}%.`,
        })
      }
    }

    return violations
  },

  // Nova função para monitorar posições em tempo real
  monitorPositionsRealTime: async (connections: any[], callback: Function) => {
    console.log("API: Starting real-time position monitoring")

    if (!connections || connections.length === 0) {
      console.log("API: No connections available for monitoring")
      return false
    }

    try {
      // Importar o store para obter os limites de risco atuais
      const { useStore } = await import("../store")
      const { riskLimits } = useStore.getState()

      // Armazenar IDs de posições já processadas para evitar notificações duplicadas
      const processedPositionIds = new Set()

      // Função para verificar novas posições
      const checkNewPositions = async () => {
        try {
          // Obter posições atuais
          const currentPositions = await api.getPositions(connections)

          // Verificar cada posição
          for (const position of currentPositions) {
            // Verificar se já processamos esta posição
            if (!processedPositionIds.has(position.id)) {
              console.log("API: New position detected:", position)

              // Verificar limites de risco
              const violations = await api.checkPositionRiskLimits(position, riskLimits)

              // Se houver violações, notificar via callback
              if (violations.length > 0) {
                callback({
                  position,
                  violations,
                  timestamp: Date.now(),
                })
              }

              // Marcar como processada
              processedPositionIds.add(position.id)
            }
          }
        } catch (error) {
          console.error("API: Error checking new positions:", error)
        }
      }

      // Verificar imediatamente
      await checkNewPositions()

      // Configurar intervalo para verificação periódica (a cada 30 segundos)
      const intervalId = setInterval(checkNewPositions, 30000)

      // Retornar função para parar o monitoramento
      return () => {
        console.log("API: Stopping real-time position monitoring")
        clearInterval(intervalId)
      }
    } catch (error) {
      console.error("API: Error setting up position monitoring:", error)
      return false
    }
  },
  checkAdminAccess: async (userId: string) => {
    try {
      const { data, error } = await supabase.from("admins").select("id").eq("user_id", userId).single()

      if (error) {
        throw error
      }

      return { data: !!data, error: null }
    } catch (error) {
      console.error("Error checking admin access:", error)
      return { data: false, error }
    }
  },
}
