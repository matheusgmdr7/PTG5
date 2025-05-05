"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Shield, Loader2, ArrowRight } from "lucide-react"
import { useAuthStore } from "../store/authStore"
import { toast } from "react-toastify"

const Login: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { login, user, isLoading, error } = useAuthStore()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user) {
      navigate("/dashboard")
    }
  }, [user, navigate])

  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      await login(email, password)
      navigate("/dashboard")
    } catch (err) {
      console.error("Login error:", err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      await login(email, password)
      navigate("/dashboard")
    } catch (err) {
      console.error("Login error:", err)
    }
  }

  const loading = isLoading

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black">
      <div className="w-full max-w-md">
        <div className="bg-gradient-to-br from-black to-blue-950/20 rounded-2xl border border-blue-900/30 p-6 md:p-8 shadow-lg backdrop-blur-sm">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-800 to-green-800 flex items-center justify-center shadow-lg shadow-blue-600/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4),transparent_70%)]"></div>
              <Shield className="text-white z-10" size={24} />
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-6 text-center text-white">Login</h2>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                {t("common.email")}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-4 py-3 bg-black/40 backdrop-blur-sm border border-violet-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-gray-200 placeholder-gray-500 transition-colors"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                {t("common.password")}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-3 bg-black/40 backdrop-blur-sm border border-violet-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-gray-200 placeholder-gray-500 transition-colors"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-violet-700/30 rounded bg-black/40"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                  {t("common.rememberMe")}
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="text-violet-400 hover:text-violet-300 transition-colors">
                  {t("common.forgotPassword")}
                </Link>
              </div>
            </div>

            {/* Botões */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-800 to-green-800 hover:from-blue-700 hover:to-green-700 text-white rounded-lg transition-all duration-300 font-medium relative overflow-hidden group shadow-md hover:shadow-lg hover:shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center">
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    {t("common.loading")}
                  </span>
                ) : (
                  <span className="flex items-center">
                    {t("common.login")}
                    <ArrowRight
                      className="ml-2 group-hover:translate-x-1 transition-transform duration-300"
                      size={18}
                    />
                  </span>
                )}
              </button>
            </div>
          </form>

          {/* Links */}
          <div className="mt-6 text-center space-y-2">
            <Link to="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
              Esqueceu sua senha?
            </Link>
            <div className="text-sm text-gray-400">
              Não tem uma conta?{" "}
              <Link to="/signup" className="text-blue-400 hover:text-blue-300 transition-colors">
                Cadastre-se
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
