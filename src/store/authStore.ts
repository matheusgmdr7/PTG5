import { create } from "zustand"
import { supabase, type SupabaseUser } from "../lib/supabase"

interface AuthState {
  user: SupabaseUser | null
  isLoading: boolean
  error: string | null

  // Actions
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, fullName?: string) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  getUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,

  // Adicionar logs no método login
  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null })
      console.log("AuthStore: Attempting login with email:", email)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("AuthStore: Login error:", error.message)
        throw error
      }

      console.log("AuthStore: Login successful, user:", data.user)
      set({ user: data.user })
      return data.user
    } catch (error: any) {
      console.error("AuthStore: Login error caught:", error.message)
      set({ error: error.message })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  signup: async (email: string, password: string, fullName?: string) => {
    try {
      set({ isLoading: true, error: null })

      // First check if the user already exists
      const { data: existingUser } = await supabase.auth.signInWithPassword({
        email,
        password: "dummy-password-to-check-existence",
      })

      if (existingUser && existingUser.user) {
        throw new Error("User with this email already exists")
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || "",
          },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      })

      if (error) throw error

      // Check if user was created successfully
      if (data && data.user) {
        set({ user: data.user })
        return data.user
      } else {
        throw new Error("Failed to create user account")
      }
    } catch (error: any) {
      console.error("Signup error:", error)
      set({ error: error.message })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true, error: null })

      const { error } = await supabase.auth.signOut()

      if (error) throw error

      set({ user: null })
    } catch (error: any) {
      set({ error: error.message })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  resetPassword: async (email: string) => {
    try {
      set({ isLoading: true, error: null })

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error
    } catch (error: any) {
      set({ error: error.message })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  // Adicionar logs no método getUser e evitar múltiplas chamadas simultâneas
  getUser: async () => {
    try {
      // Verificar se já estamos carregando para evitar múltiplas chamadas
      const state = useAuthStore.getState()
      if (state.isLoading) return state.user

      set({ isLoading: true, error: null })
      console.log("AuthStore: Attempting to get user session")

      const { data } = await supabase.auth.getSession()
      console.log("AuthStore: Session data:", data)

      if (data && data.session) {
        const { data: userData } = await supabase.auth.getUser()
        console.log("AuthStore: User data:", userData)
        set({ user: userData.user })
        return userData.user
      } else {
        console.log("AuthStore: No active session found")
        set({ user: null })
        return null
      }
    } catch (error: any) {
      console.error("AuthStore: Error getting user:", error.message)
      set({ error: error.message, user: null })
      return null
    } finally {
      set({ isLoading: false })
    }
  },
}))

// Initialize auth state
supabase.auth.onAuthStateChange((event, session) => {
  if (session && session.user) {
    useAuthStore.setState({ user: session.user })
  } else {
    useAuthStore.setState({ user: null })
  }
})
