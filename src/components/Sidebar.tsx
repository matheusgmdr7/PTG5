"use client"

import type React from "react"
import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  AlertTriangle,
  Settings,
  Wallet,
  History,
  Lightbulb,
  LogOut,
  Shield,
  MessageSquare,
  Users,
} from "lucide-react"
import { useAppStore } from "../store"
import { useAuthStore } from "../store/authStore"
import { useTranslation } from "react-i18next"
import { useLocation } from "react-router-dom"
import { supabase } from "../lib/supabase"
import { useState, useEffect } from "react"

const Sidebar: React.FC = () => {
  const { riskStatus } = useAppStore()
  const { logout, user } = useAuthStore()
  const { t } = useTranslation()
  const location = useLocation()
  const [isAdmin, setIsAdmin] = useState(false)

  // Verificar se o usuário é admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return

      const { data } = await supabase.from("admins").select("id").eq("user_id", user.id).single()

      setIsAdmin(!!data)
    }

    checkAdminStatus()
  }, [user])

  // Valores padrão para evitar erros quando riskStatus não estiver definido
  const currentRisk = riskStatus?.currentRisk ?? 0
  const riskLevel = riskStatus?.riskLevel ?? "low"
  const tradingAllowed = riskStatus?.tradingAllowed ?? true
  const dailyLoss = riskStatus?.dailyLoss ?? 0
  const weeklyLoss = riskStatus?.weeklyLoss ?? 0
  const weeklyProfit = riskStatus?.weeklyProfit ?? 0

  const navItems = [
    {
      to: "/dashboard/connections",
      icon: <Wallet size={20} />,
      label: t("navigation.connections"),
      className: "exchange-connector-link",
    },
    { to: "/dashboard/panel", icon: <LayoutDashboard size={20} />, label: t("navigation.dashboard") },
    { to: "/dashboard/history", icon: <History size={20} />, label: t("navigation.tradeHistory") },
    { to: "/dashboard/melhorias", icon: <Lightbulb size={20} />, label: "Melhorias" },
    { to: "/dashboard/assistant", icon: <MessageSquare size={20} />, label: t("assistant.title") },
    { to: "/dashboard/risk", icon: <AlertTriangle size={20} />, label: t("navigation.riskManagement") },
    { to: "/dashboard/settings", icon: <Settings size={20} />, label: t("navigation.settings") },
    // Adicionar item de menu Admin apenas para administradores
    ...(isAdmin ? [{ to: "/dashboard/admin", icon: <Users size={20} />, label: "Admin" }] : []),
  ]

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  return (
    <div className="h-full flex flex-col bg-black border-r border-blue-900/30 overflow-y-auto">
      {/* Logo */}
      <div className="p-4 flex items-center">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-800 to-green-800 flex items-center justify-center shadow-lg shadow-blue-600/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4),transparent_70%)]"></div>
          <Shield className="text-white z-10" size={20} />
        </div>
        <div className="ml-3">
          <h1 className="text-lg font-bold text-white tracking-wider">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">PTG</span>{" "}
            ProTraderGain
          </h1>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {/* Mantenha os itens de menu existentes */}
          <div className="p-4">
            <div className="bg-gradient-to-br from-violet-900/20 to-violet-900/5 backdrop-blur-sm rounded-lg p-4 mb-4 border border-violet-700/30 relative overflow-hidden group">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-gray-300">{t("dashboard.currentRisk")}</div>
                  <div
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      tradingAllowed
                        ? "bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 text-violet-300 border border-violet-500/30"
                        : "bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-300 border border-red-500/30"
                    }`}
                  >
                    {tradingAllowed ? t("dashboard.allowed") : t("risk.tradingRestricted")}
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full bg-gradient-to-r ${
                        riskLevel === "low"
                          ? "from-violet-500 to-fuchsia-500"
                          : riskLevel === "medium"
                            ? "from-yellow-500 to-orange-500"
                            : riskLevel === "high"
                              ? "from-orange-500 to-red-500"
                              : "from-red-500 to-pink-500"
                      }`}
                    ></div>
                    <span className="text-lg font-bold capitalize text-gray-100">{riskLevel}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-300">{currentRisk.toFixed(0)}%</span>
                </div>

                <div className="h-2 bg-violet-900/30 rounded-full overflow-hidden backdrop-blur-sm">
                  <div
                    className={`h-full transition-all duration-500 ${
                      riskLevel === "low"
                        ? "bg-gradient-to-r from-violet-500 to-fuchsia-500"
                        : riskLevel === "medium"
                          ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                          : riskLevel === "high"
                            ? "bg-gradient-to-r from-orange-500 to-red-500"
                            : "bg-gradient-to-r from-red-500 to-pink-500"
                    }`}
                    style={{ width: `${currentRisk}%` }}
                  >
                    <div className="w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.3),transparent_70%)]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 sidebar-nav">
            <ul className="space-y-1 px-2">
              {navItems.map((item) => (
                <li key={item.to || item.path}>
                  <NavLink
                    to={item.to || item.path}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-2 rounded-lg transition-colors ${
                        isActive || item.active
                          ? "bg-violet-900/50 text-violet-400"
                          : "text-gray-400 hover:bg-violet-900/20 hover:text-gray-200"
                      } ${item.className || ""}`
                    }
                    onClick={() => {
                      if (window.innerWidth < 768) {
                        document.getElementById("sidebar")?.classList.add("-translate-x-full")
                      }
                    }}
                  >
                    {item.icon}
                    <span className="ml-3">{item.label || item.name}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-4 border-t border-violet-900/20">
            <button
              onClick={handleLogout}
              className="flex items-center text-gray-400 hover:text-gray-200 w-full px-4 py-2 rounded-lg hover:bg-violet-900/20 transition-colors"
            >
              <LogOut size={20} />
              <span className="ml-3">{t("common.logout")}</span>
            </button>
          </div>
        </ul>
      </nav>
    </div>
  )
}

export default Sidebar
