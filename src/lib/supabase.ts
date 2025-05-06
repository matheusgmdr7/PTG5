import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Adicionar logs para depuração
console.log("Supabase URL disponível:", !!supabaseUrl)
console.log("Supabase Anon Key disponível:", !!supabaseAnonKey)

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables. Please check your .env file.")
}

// Criar o cliente Supabase - usando exatamente o mesmo formato que funcionava antes
const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

// Exportar a variável
export { supabase }

export type SupabaseUser = {
  id: string
  email?: string
  user_metadata?: {
    full_name?: string
  }
}

// Function to determine if the app is in demo mode
export const isDemoMode = !supabaseUrl || !supabaseAnonKey
