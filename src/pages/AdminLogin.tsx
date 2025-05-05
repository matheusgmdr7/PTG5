"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Shield, Loader2 } from "lucide-react"
import { supabase } from "../lib/supabase"
import { toast } from "react-toastify"
import { useAuthStore } from "../store/authStore"

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuthStore()

  // Verificar se já está logado como admin
  useEffect(() => {
    const checkAdminSession = async () => {
      if (user) {
        const { data: isAdmin } = await supabase.from("admins").select("id").eq("user_id", user.id).single()

        if (isAdmin) {
          navigate("/dashboard/admin")
        }
      }
    }

    checkAdminSession()
  }, [navigate, user])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Tentar fazer login
      const {
        data: { user },
        error: loginError,
      } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (loginError) throw loginError

      // Verificar se é admin
      const { data: isAdmin } = await supabase.from("admins").select("id").eq("user_id", user?.id).single()

      if (!isAdmin) {
        // Se não for admin, fazer logout e mostrar erro
        await supabase.auth.signOut()
        toast.error("Acesso não autorizado. Esta página é apenas para administradores.")
        setIsLoading(false)
        return
      }

      // Se for admin, redirecionar para o painel
      toast.success("Login realizado com sucesso!")
      navigate("/dashboard/admin")
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer login")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black">
      <div className="w-full max-w-md">
        <div className="bg-gradient-to-br from-black to-violet-950/20 rounded-2xl border border-violet-700/30 p-8 shadow-lg backdrop-blur-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]"></div>

          {/* Logo */}
          <div className="flex justify-center mb-6 relative z-10">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-800 to-fuchsia-800 flex items-center justify-center shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4),transparent_70%)]"></div>
              <Shield className="text-white z-10" size={32} />
            </div>
          </div>

          <div className="text-center mb-8 relative z-10">
            <h2 className="text-2xl font-bold text-gray-200">Portal Administrativo</h2>
            <p className="text-sm text-gray-400 mt-1">Acesso restrito a administradores</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6 relative z-10">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-black/40 backdrop-blur-sm border border-violet-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-200 placeholder-gray-500"
                placeholder="admin@exemplo.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-black/40 backdrop-blur-sm border border-violet-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-200 placeholder-gray-500"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3 bg-gradient-to-r from-violet-800 to-fuchsia-800 hover:from-violet-700 hover:to-fuchsia-700 text-white rounded-lg transition-all duration-300 font-medium relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative z-10 flex items-center justify-center">
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    <span>Entrando...</span>
                  </>
                ) : (
                  "Entrar"
                )}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
