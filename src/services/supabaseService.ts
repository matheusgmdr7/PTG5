import { supabase } from "../lib/supabase"
import type { ExchangeConnection, RiskLevel, RiskLimits } from "../types"

// User profile services
export const getUserProfile = async () => {
  const { data: user } = await supabase.auth.getUser()

  if (!user.user) {
    throw new Error("User not authenticated")
  }

  const { data, error } = await supabase.from("profiles").select("*").eq("id", user.user.id).single()

  if (error) throw error
  return data
}

export const updateUserProfile = async (updates: { full_name?: string; avatar_url?: string }) => {
  const { data: userData } = await supabase.auth.getUser()

  if (!userData.user) {
    throw new Error("User not authenticated")
  }

  const { data, error } = await supabase.from("profiles").update(updates).eq("id", userData.user.id).select().single()

  if (error) throw error
  return data
}

// Exchange connection services
// Modifique a função getExchangeConnections para incluir account_type
export const getExchangeConnections = async (): Promise<ExchangeConnection[]> => {
  const { data: userData } = await supabase.auth.getUser()

  if (!userData.user) {
    throw new Error("User not authenticated")
  }

  const { data, error } = await supabase
    .from("exchange_connections")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false })

  if (error) throw error

  return data.map((conn) => ({
    exchange: conn.exchange as any,
    connected: conn.connected,
    apiKey: conn.api_key,
    apiSecret: conn.api_secret,
    accountType: conn.account_type || "futures", // Garantir que account_type seja lido corretamente
    lastSynced: new Date(conn.last_synced).getTime(),
  }))
}

// Modificar a função addExchangeConnection para usar a coluna account_type
export const addExchangeConnection = async (connection: {
  exchange: string
  api_key: string
  api_secret: string
  account_type?: "spot" | "futures" // Adicionado para especificar o tipo de carteira
}) => {
  const { data: userData } = await supabase.auth.getUser()

  if (!userData.user) {
    throw new Error("User not authenticated")
  }

  // Agora podemos incluir account_type no objeto a ser inserido
  const { data, error } = await supabase
    .from("exchange_connections")
    .insert({
      user_id: userData.user.id,
      exchange: connection.exchange,
      api_key: connection.api_key,
      api_secret: connection.api_secret,
      connected: true,
      last_synced: new Date().toISOString(),
      account_type: connection.account_type || "futures", // Agora podemos usar a coluna
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteExchangeConnection = async (exchange: string) => {
  const { data: userData } = await supabase.auth.getUser()

  if (!userData.user) {
    throw new Error("User not authenticated")
  }

  const { error } = await supabase
    .from("exchange_connections")
    .delete()
    .eq("user_id", userData.user.id)
    .eq("exchange", exchange)

  if (error) throw error
  return true
}

// Risk settings services
export const getRiskSettings = async () => {
  const { data: userData } = await supabase.auth.getUser()

  if (!userData.user) {
    throw new Error("User not authenticated")
  }

  try {
    // First check if the weekly_loss_limit column exists
    const { data: columnCheck, error: columnError } = await supabase
      .from("risk_settings")
      .select("weekly_loss_limit")
      .limit(1)

    // If there's an error about the column not existing, we'll handle it gracefully
    const weeklyLossLimitExists = !columnError

    // Select only the columns we know exist
    let query = supabase
      .from("risk_settings")
      .select("id, user_id, risk_level, daily_loss_limit, max_leverage, max_daily_trades, recovery_time")
      .eq("user_id", userData.user.id)
      .maybeSingle()

    // Add weekly_loss_limit to the query if it exists
    if (weeklyLossLimitExists) {
      query = supabase
        .from("risk_settings")
        .select(
          "id, user_id, risk_level, daily_loss_limit, max_leverage, max_daily_trades, recovery_time, weekly_loss_limit",
        )
        .eq("user_id", userData.user.id)
        .maybeSingle()
    }

    const { data, error } = await query

    if (error) throw error

    if (!data) {
      // If no settings found, create default settings
      const defaultSettings = {
        risk_level: "Conservative" as RiskLevel,
        daily_loss_limit: 2,
        max_leverage: 5,
        max_daily_trades: 5,
        recovery_time: 24,
      }

      // Add weekly_loss_limit if the column exists
      const settingsToInsert = weeklyLossLimitExists
        ? { ...defaultSettings, weekly_loss_limit: 10, user_id: userData.user.id }
        : { ...defaultSettings, user_id: userData.user.id }

      // Insert default settings
      const { data: newData, error: insertError } = await supabase
        .from("risk_settings")
        .insert(settingsToInsert)
        .select()
        .single()

      if (insertError) throw insertError

      // Determine weekly_loss_limit based on risk level if column doesn't exist
      const weeklyLossLimit = weeklyLossLimitExists
        ? newData.weekly_loss_limit
        : newData.risk_level === "Conservative"
          ? 10
          : newData.risk_level === "Moderate"
            ? 15
            : 20

      return {
        selectedRiskLevel: newData.risk_level as RiskLevel,
        riskLimits: {
          dailyLossLimit: newData.daily_loss_limit,
          maxLeverage: newData.max_leverage,
          maxDailyTrades: newData.max_daily_trades,
          recoveryTime: newData.recovery_time,
          weeklyLossLimit: weeklyLossLimit,
        } as RiskLimits,
      }
    }

    // Determine weekly_loss_limit based on risk level if column doesn't exist
    const weeklyLossLimit = weeklyLossLimitExists
      ? data.weekly_loss_limit
      : data.risk_level === "Conservative"
        ? 10
        : data.risk_level === "Moderate"
          ? 15
          : 20

    return {
      selectedRiskLevel: data.risk_level as RiskLevel,
      riskLimits: {
        dailyLossLimit: data.daily_loss_limit,
        maxLeverage: data.max_leverage,
        maxDailyTrades: data.max_daily_trades,
        recoveryTime: data.recovery_time,
        weeklyLossLimit: weeklyLossLimit,
      } as RiskLimits,
    }
  } catch (error) {
    console.error("Error fetching risk settings:", error)
    // Return default settings if error occurs
    return {
      selectedRiskLevel: "Conservative" as RiskLevel,
      riskLimits: {
        dailyLossLimit: 2,
        maxLeverage: 5,
        maxDailyTrades: 5,
        recoveryTime: 24,
        weeklyLossLimit: 10,
      } as RiskLimits,
    }
  }
}

export const updateRiskSettings = async (riskLevel: RiskLevel) => {
  const { data: userData } = await supabase.auth.getUser()

  if (!userData.user) {
    throw new Error("User not authenticated")
  }

  // Define risk limits based on risk level
  let riskLimits: RiskLimits

  switch (riskLevel) {
    case "Conservative":
      riskLimits = {
        dailyLossLimit: 2,
        maxLeverage: 5,
        maxDailyTrades: 5,
        recoveryTime: 24,
        weeklyLossLimit: 10,
      }
      break
    case "Moderate":
      riskLimits = {
        dailyLossLimit: 5,
        maxLeverage: 10,
        maxDailyTrades: 5,
        recoveryTime: 12,
        weeklyLossLimit: 15,
      }
      break
    case "Aggressive":
      riskLimits = {
        dailyLossLimit: 10,
        maxLeverage: 20,
        maxDailyTrades: 5,
        recoveryTime: 6,
        weeklyLossLimit: 20,
      }
      break
    default:
      riskLimits = {
        dailyLossLimit: 2,
        maxLeverage: 5,
        maxDailyTrades: 5,
        recoveryTime: 24,
        weeklyLossLimit: 10,
      }
  }

  try {
    // First check if the weekly_loss_limit column exists
    const { data: columnCheck, error: columnError } = await supabase
      .from("risk_settings")
      .select("weekly_loss_limit")
      .limit(1)

    // If there's an error about the column not existing, we'll handle it gracefully
    const weeklyLossLimitExists = !columnError

    // Check if risk settings exist for the user
    const { data: existingSettings, error: checkError } = await supabase
      .from("risk_settings")
      .select("id")
      .eq("user_id", userData.user.id)
      .maybeSingle()

    // Prepare the settings object based on whether weekly_loss_limit exists
    const settingsToUpsert = weeklyLossLimitExists
      ? {
          risk_level: riskLevel,
          daily_loss_limit: riskLimits.dailyLossLimit,
          max_leverage: riskLimits.maxLeverage,
          max_daily_trades: riskLimits.maxDailyTrades,
          recovery_time: riskLimits.recoveryTime,
          weekly_loss_limit: riskLimits.weeklyLossLimit,
        }
      : {
          risk_level: riskLevel,
          daily_loss_limit: riskLimits.dailyLossLimit,
          max_leverage: riskLimits.maxLeverage,
          max_daily_trades: riskLimits.maxDailyTrades,
          recovery_time: riskLimits.recoveryTime,
        }

    if (!existingSettings) {
      // Settings don't exist, create them
      const { data, error } = await supabase
        .from("risk_settings")
        .insert({
          user_id: userData.user.id,
          ...settingsToUpsert,
        })
        .select()
        .single()

      if (error) throw error
      return data
    } else {
      // Settings exist, update them
      const { data, error } = await supabase
        .from("risk_settings")
        .update(settingsToUpsert)
        .eq("user_id", userData.user.id)
        .select()
        .single()

      if (error) throw error
      return data
    }
  } catch (error) {
    console.error("Error updating risk settings:", error)
    throw error
  }
}
