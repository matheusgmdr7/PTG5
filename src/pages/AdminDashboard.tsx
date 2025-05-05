"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore"
import { supabase } from "../lib/supabase"
import {
  Users,
  Search,
  Filter,
  CreditCard,
  TrendingUp,
  Calendar,
  DollarSign,
  UserX,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Download,
  X,
  Home,
  BarChart3,
  Settings,
  LogOut,
  Shield,
  UserCog,
  CreditCardIcon as CardIcon,
  Activity,
  ArrowUp,
} from "lucide-react"
import { toast } from "react-toastify"

interface User {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string
  user_metadata?: {
    full_name?: string
  }
  subscription_status?: string
  subscription_id?: string
  plan_id?: string
  trial_end?: number
  is_blocked?: boolean
}

interface SubscriptionStats {
  total: number
  active: number
  trialing: number
  canceled: number
  conversion_rate: number
  mrr: number
  churn_rate: number
}

interface ChartData {
  labels: string[]
  values: number[]
}

/**
 * AdminDashboard
 * Dashboard administrativo com visualizações e gestão de usuários/assinaturas.
 * Todos os estilos são configurados para não interferir em outros componentes.
 */
const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState<"all" | "active" | "trialing" | "canceled" | "blocked">("all")
  const [subscriptionStats, setSubscriptionStats] = useState<SubscriptionStats>({
    total: 0,
    active: 0,
    trialing: 0,
    canceled: 0,
    conversion_rate: 0,
    mrr: 0,
    churn_rate: 0,
  })
  const [signupChartData, setSignupChartData] = useState<ChartData>({
    labels: [],
    values: [],
  })
  const [revenueChartData, setRevenueChartData] = useState<ChartData>({
    labels: [],
    values: [],
  })
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "subscriptions" | "analytics">("overview")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserDetails, setShowUserDetails] = useState(false)
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  // Verificar se o usuário é admin
  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!user) {
        navigate("/login")
        return
      }

      const { data: isAdmin } = await supabase.from("admins").select("id").eq("user_id", user.id).single()

      if (!isAdmin) {
        toast.error("Acesso não autorizado")
        navigate("/dashboard")
      }
    }

    checkAdminAccess()
  }, [user, navigate])

  // Buscar usuários e estatísticas
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch users with subscription data
        const { data: authUsers, error: usersError } = await supabase.auth.admin.listUsers()

        if (usersError) throw usersError

        // Fetch subscription data from profiles table
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, subscription_id, subscription_status, plan_id, trial_end")

        if (profilesError) throw profilesError

        // Fetch blocked users
        const { data: blockedUsers, error: blockedError } = await supabase.from("blocked_users").select("user_id")

        if (blockedError) throw blockedError

        // Create a map of profile data by user ID
        const profileMap = new Map()
        profiles.forEach((profile) => {
          profileMap.set(profile.id, profile)
        })

        // Create a set of blocked user IDs
        const blockedUserIds = new Set(blockedUsers?.map((u) => u.user_id) || [])

        // Combine user data with profile data
        const enrichedUsers = authUsers.users.map((user) => {
          const profile = profileMap.get(user.id) || {}
          return {
            ...user,
            subscription_status: profile.subscription_status || null,
            subscription_id: profile.subscription_id || null,
            plan_id: profile.plan_id || null,
            trial_end: profile.trial_end || null,
            is_blocked: blockedUserIds.has(user.id),
          }
        })

        setUsers(enrichedUsers)
        setFilteredUsers(enrichedUsers)

        // Calculate subscription statistics
        const total = enrichedUsers.length
        const active = enrichedUsers.filter((u) => u.subscription_status === "active").length
        const trialing = enrichedUsers.filter((u) => u.subscription_status === "trialing").length
        const canceled = enrichedUsers.filter((u) => u.subscription_status === "canceled").length

        // Calculate conversion rate (active / (active + canceled))
        const conversionRate = active > 0 ? (active / (active + canceled)) * 100 : 0

        // Estimate MRR (Monthly Recurring Revenue)
        // Assuming $29.99 for monthly plans and $299.99/12 for yearly plans
        const monthlyPrice = 29.99
        const yearlyPrice = 299.99 / 12

        const monthlyUsers = enrichedUsers.filter(
          (u) => u.subscription_status === "active" && u.plan_id === "price_monthly",
        ).length
        const yearlyUsers = enrichedUsers.filter(
          (u) => u.subscription_status === "active" && u.plan_id === "price_yearly",
        ).length

        const mrr = monthlyUsers * monthlyPrice + yearlyUsers * yearlyPrice

        // Estimate churn rate (canceled / total subscriptions)
        const totalSubscriptions = active + canceled
        const churnRate = totalSubscriptions > 0 ? (canceled / totalSubscriptions) * 100 : 0

        setSubscriptionStats({
          total,
          active,
          trialing,
          canceled,
          conversion_rate: conversionRate,
          mrr,
          churn_rate: churnRate,
        })

        // Generate chart data
        generateChartData(enrichedUsers)
      } catch (error) {
        console.error("Error fetching admin data:", error)
        toast.error("Erro ao carregar dados administrativos")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Generate chart data from user data
  const generateChartData = (userData: User[]) => {
    // Signup chart data (last 6 months)
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      return date
    }).reverse()

    const monthLabels = last6Months.map((date) => date.toLocaleDateString("pt-BR", { month: "short", year: "numeric" }))

    const signupsByMonth = last6Months.map((month) => {
      const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1)
      const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0)

      return userData.filter((user) => {
        const createdAt = new Date(user.created_at)
        return createdAt >= startOfMonth && createdAt <= endOfMonth
      }).length
    })

    setSignupChartData({
      labels: monthLabels,
      values: signupsByMonth,
    })

    // Revenue chart data (last 6 months - simulated)
    // In a real app, this would come from actual payment data
    const simulatedRevenue = last6Months.map((_, i) => {
      // Simulate growing revenue with some randomness
      const baseValue = 500 + i * 150
      const randomFactor = 0.8 + Math.random() * 0.4 // 0.8 to 1.2
      return Math.round(baseValue * randomFactor)
    })

    setRevenueChartData({
      labels: monthLabels,
      values: simulatedRevenue,
    })
  }

  // Filter users based on search term and filter
  useEffect(() => {
    let result = users

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (user) =>
          user.email.toLowerCase().includes(term) || user.user_metadata?.full_name?.toLowerCase().includes(term),
      )
    }

    // Apply status filter
    if (filter !== "all") {
      if (filter === "blocked") {
        result = result.filter((user) => user.is_blocked)
      } else {
        result = result.filter((user) => user.subscription_status === filter)
      }
    }

    setFilteredUsers(result)
  }, [searchTerm, filter, users])

  // Toggle user block status
  const toggleUserBlock = async (userId: string, isCurrentlyBlocked: boolean) => {
    try {
      if (isCurrentlyBlocked) {
        await supabase.from("blocked_users").delete().eq("user_id", userId)
      } else {
        await supabase.from("blocked_users").insert({ user_id: userId })
      }

      setUsers(users.map((user) => (user.id === userId ? { ...user, is_blocked: !isCurrentlyBlocked } : user)))

      toast.success(`Usuário ${isCurrentlyBlocked ? "desbloqueado" : "bloqueado"} com sucesso`)
    } catch (error) {
      console.error("Error toggling user block:", error)
      toast.error("Erro ao alterar status do usuário")
    }
  }

  // Manage user subscription
  const manageSubscription = async (userId: string, action: "cancel" | "reactivate") => {
    try {
      const user = users.find((u) => u.id === userId)
      if (!user?.subscription_id) {
        toast.error("ID de assinatura não encontrado")
        return
      }

      const endpoint =
        action === "cancel"
          ? `/api/admin/subscription/${user.subscription_id}/cancel`
          : `/api/admin/subscription/${user.subscription_id}/reactivate`

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      })

      const result = await response.json()

      if (result.error) {
        throw new Error(result.error)
      }

      // Update user in state
      setUsers(
        users.map((u) =>
          u.id === userId
            ? {
                ...u,
                subscription_status: action === "cancel" ? "canceled" : "active",
              }
            : u,
        ),
      )

      toast.success(action === "cancel" ? "Assinatura cancelada com sucesso" : "Assinatura reativada com sucesso")
    } catch (error) {
      console.error(`Error ${action}ing subscription:`, error)
      toast.error(`Erro ao ${action === "cancel" ? "cancelar" : "reativar"} assinatura`)
    }
  }

  // View user details
  const viewUserDetails = (user: User) => {
    setSelectedUser(user)
    setShowUserDetails(true)
  }

  // Export user data to CSV
  const exportUserData = () => {
    try {
      // Create CSV content
      const headers = [
        "ID",
        "Email",
        "Nome",
        "Data de Criação",
        "Último Login",
        "Status da Assinatura",
        "Plano",
        "Bloqueado",
      ]

      const csvContent = [
        headers.join(","),
        ...filteredUsers.map((user) =>
          [
            user.id,
            user.email,
            user.user_metadata?.full_name || "",
            new Date(user.created_at).toLocaleDateString(),
            user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : "",
            user.subscription_status || "Nenhum",
            user.plan_id === "price_monthly" ? "Mensal" : user.plan_id === "price_yearly" ? "Anual" : "Nenhum",
            user.is_blocked ? "Sim" : "Não",
          ].join(","),
        ),
      ].join("\n")

      // Create download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `ptg-users-${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Error exporting user data:", error)
      toast.error("Erro ao exportar dados dos usuários")
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate("/login")
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  // Simple bar chart component
  const SimpleBarChart = ({ data, height = 200 }: { data: ChartData; height?: number }) => {
    const maxValue = Math.max(...data.values)

    return (
      <div className="w-full" style={{ height: `${height}px` }}>
        <div className="flex h-full items-end">
          {data.values.map((value, index) => {
            const percentage = (value / maxValue) * 100
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full px-1">
                  <div
                    className="bg-blue-500/70 hover:bg-blue-500/90 transition-all rounded-t"
                    style={{ height: `${percentage}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-400 mt-2 truncate w-full text-center">{data.labels[index]}</div>
                <div className="text-xs text-gray-300 mt-1">{value}</div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Simple line chart component
  const SimpleLineChart = ({ data, height = 200 }: { data: ChartData; height?: number }) => {
    const maxValue = Math.max(...data.values)
    const points = data.values.map((value, index) => {
      const x = (index / (data.values.length - 1)) * 100
      const y = 100 - (value / maxValue) * 100
      return { x, y, value }
    })

    // Generate SVG path
    const pathD = points.map((point, i) => `${i === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ")

    return (
      <div className="w-full" style={{ height: `${height}px` }}>
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Grid lines */}
          <line x1="0" y1="25" x2="100" y2="25" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
          <line x1="0" y1="75" x2="100" y2="75" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />

          {/* Line */}
          <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="2" />

          {/* Points */}
          {points.map((point, i) => (
            <g key={i}>
              <circle cx={point.x} cy={point.y} r="2" fill="#3b82f6" />
              <circle cx={point.x} cy={point.y} r="4" fill="rgba(59, 130, 246, 0.3)" />
            </g>
          ))}
        </svg>

        {/* X-axis labels */}
        <div className="flex justify-between mt-2">
          {data.labels.map((label, i) => (
            <div
              key={i}
              className="text-xs text-gray-400 truncate"
              style={{ width: `${100 / data.labels.length}%`, textAlign: "center" }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Distribution chart (replaces pie chart)
  const DistributionChart = () => {
    const total = subscriptionStats.total || 1
    const active = subscriptionStats.active
    const trialing = subscriptionStats.trialing
    const canceled = subscriptionStats.canceled
    const noSubscription = total - (active + trialing + canceled)

    const items = [
      { label: "Ativos", value: active, percentage: (active / total) * 100, color: "bg-green-500" },
      { label: "Em Teste", value: trialing, percentage: (trialing / total) * 100, color: "bg-blue-500" },
      { label: "Cancelados", value: canceled, percentage: (canceled / total) * 100, color: "bg-red-500" },
      {
        label: "Sem Assinatura",
        value: noSubscription,
        percentage: (noSubscription / total) * 100,
        color: "bg-yellow-500",
      },
    ]

    return (
      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="space-y-1">
            <div className="flex justify-between text-sm">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full ${item.color} mr-2`}></div>
                <span className="text-gray-300">{item.label}</span>
              </div>
              <div className="text-gray-400">
                {item.value} ({item.percentage.toFixed(1)}%)
              </div>
            </div>
            <div className="w-full bg-gray-700/30 rounded-full h-2">
              <div className={`${item.color} h-2 rounded-full`} style={{ width: `${item.percentage}%` }}></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Circular progress chart
  const CircularProgressChart = ({ percentage }: { percentage: number }) => {
    const radius = 40
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
      <div className="relative w-40 h-40 mx-auto">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-4xl font-bold text-blue-400">{percentage.toFixed(1)}%</div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-dashboard-container flex h-screen bg-opacity-95" style={{ backgroundColor: "#000" }}>
      {/* Admin Sidebar */}
      <div className="w-64 bg-gradient-to-br from-black to-blue-950/20 border-r border-blue-900/30 overflow-y-auto">
        <div className="p-4 flex items-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-800 to-green-800 flex items-center justify-center shadow-lg shadow-blue-600/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4),transparent_70%)]"></div>
            <Shield className="text-white z-10" size={20} />
          </div>
          <div className="ml-3">
            <h1 className="text-lg font-bold text-white tracking-wider">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">PTG</span>{" "}
              Admin
            </h1>
          </div>
        </div>

        <nav className="mt-6 px-4">
          <div className="space-y-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "overview"
                  ? "bg-blue-900/50 text-blue-400"
                  : "text-gray-400 hover:bg-blue-900/20 hover:text-gray-200"
              }`}
            >
              <Home className="mr-3 h-5 w-5" />
              Visão Geral
            </button>

            <button
              onClick={() => setActiveTab("users")}
              className={`w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "users"
                  ? "bg-blue-900/50 text-blue-400"
                  : "text-gray-400 hover:bg-blue-900/20 hover:text-gray-200"
              }`}
            >
              <UserCog className="mr-3 h-5 w-5" />
              Usuários
            </button>

            <button
              onClick={() => setActiveTab("subscriptions")}
              className={`w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "subscriptions"
                  ? "bg-blue-900/50 text-blue-400"
                  : "text-gray-400 hover:bg-blue-900/20 hover:text-gray-200"
              }`}
            >
              <CardIcon className="mr-3 h-5 w-5" />
              Assinaturas
            </button>

            <button
              onClick={() => setActiveTab("analytics")}
              className={`w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "analytics"
                  ? "bg-blue-900/50 text-blue-400"
                  : "text-gray-400 hover:bg-blue-900/20 hover:text-gray-200"
              }`}
            >
              <BarChart3 className="mr-3 h-5 w-5" />
              Análises
            </button>
          </div>

          <div className="pt-6 mt-6 border-t border-blue-900/30">
            <div className="space-y-1">
              <button
                onClick={() => navigate("/dashboard")}
                className="w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-gray-400 hover:bg-blue-900/20 hover:text-gray-200 transition-colors"
              >
                <Activity className="mr-3 h-5 w-5" />
                Área do Cliente
              </button>

              <button
                onClick={() => navigate("/dashboard/settings")}
                className="w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-gray-400 hover:bg-blue-900/20 hover:text-gray-200 transition-colors"
              >
                <Settings className="mr-3 h-5 w-5" />
                Configurações
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-gray-400 hover:bg-blue-900/20 hover:text-gray-200 transition-colors"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sair
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-800 to-green-800 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4),transparent_70%)]"></div>
                <Users className="text-white z-10" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-200">Portal Administrativo</h1>
                <p className="text-sm text-gray-400">Gerencie usuários e assinaturas</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={exportUserData}
                className="flex items-center gap-2 py-2 px-4 bg-black/40 border border-blue-700/30 rounded-lg text-sm text-gray-300 hover:bg-blue-900/20"
              >
                <Download size={16} />
                Exportar Dados
              </button>
            </div>
          </div>

          {/* Content based on active tab */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-3 text-gray-400">Carregando dados...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-black to-blue-950/20 rounded-xl p-4 border border-blue-700/30 shadow-lg relative overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]"></div>
                      <div className="relative z-10">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-gray-400">Total de Usuários</p>
                            <h3 className="text-2xl font-bold text-gray-200 mt-1">{subscriptionStats.total}</h3>
                          </div>
                          <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Users className="h-6 w-6 text-blue-400" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-black to-green-950/20 rounded-xl p-4 border border-green-700/30 shadow-lg relative overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]"></div>
                      <div className="relative z-10">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-gray-400">Assinaturas Ativas</p>
                            <h3 className="text-2xl font-bold text-gray-200 mt-1">{subscriptionStats.active}</h3>
                          </div>
                          <div className="p-2 bg-green-500/10 rounded-lg">
                            <CreditCard className="h-6 w-6 text-green-400" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-black to-yellow-950/20 rounded-xl p-4 border border-yellow-700/30 shadow-lg relative overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]"></div>
                      <div className="relative z-10">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-gray-400">Taxa de Conversão</p>
                            <h3 className="text-2xl font-bold text-gray-200 mt-1">
                              {subscriptionStats.conversion_rate.toFixed(1)}%
                            </h3>
                          </div>
                          <div className="p-2 bg-yellow-500/10 rounded-lg">
                            <TrendingUp className="h-6 w-6 text-yellow-400" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-black to-blue-950/20 rounded-xl p-4 border border-blue-700/30 shadow-lg relative overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]"></div>
                      <div className="relative z-10">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-gray-400">Receita Mensal</p>
                            <h3 className="text-2xl font-bold text-gray-200 mt-1">
                              ${subscriptionStats.mrr.toFixed(2)}
                            </h3>
                          </div>
                          <div className="p-2 bg-blue-500/10 rounded-lg">
                            <DollarSign className="h-6 w-6 text-blue-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-black to-blue-950/20 rounded-xl p-4 border border-blue-700/30 shadow-lg relative overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]"></div>
                      <div className="relative z-10">
                        <h3 className="text-lg font-medium text-gray-200 mb-4">Novos Usuários</h3>
                        <div className="h-64">
                          <SimpleLineChart data={signupChartData} height={200} />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-black to-green-950/20 rounded-xl p-4 border border-green-700/30 shadow-lg relative overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]"></div>
                      <div className="relative z-10">
                        <h3 className="text-lg font-medium text-gray-200 mb-4">Receita Mensal</h3>
                        <div className="h-64">
                          <SimpleBarChart data={revenueChartData} height={200} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Users Tab */}
              {activeTab === "users" && (
                <div className="space-y-6">
                  {/* Filters */}
                  <div className="bg-gradient-to-br from-black to-blue-950/20 rounded-xl p-4 border border-blue-700/30 shadow-lg relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]"></div>
                    <div className="flex flex-col md:flex-row gap-4 relative z-10">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-3 text-gray-500" size={18} />
                          <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar por email ou nome..."
                            className="w-full pl-10 pr-4 py-2 bg-black/40 border border-blue-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-200 placeholder-gray-500"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Filter className="text-gray-500" size={18} />
                        <select
                          value={filter}
                          onChange={(e) => setFilter(e.target.value as any)}
                          className="bg-black/40 border border-blue-700/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-200"
                        >
                          <option value="all">Todos</option>
                          <option value="active">Assinaturas Ativas</option>
                          <option value="trialing">Em Período de Teste</option>
                          <option value="canceled">Cancelados</option>
                          <option value="blocked">Bloqueados</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Users List */}
                  <div className="bg-gradient-to-br from-black to-blue-950/20 rounded-xl border border-blue-700/30 shadow-lg overflow-hidden relative">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]"></div>
                    <div className="p-4 border-b border-blue-900/20 flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-2">
                        <Users className="text-blue-400" size={20} />
                        <h2 className="text-lg font-semibold text-gray-200">Usuários</h2>
                      </div>
                      <span className="text-sm text-gray-400">{filteredUsers.length} usuários encontrados</span>
                    </div>

                    <div className="relative z-10">
                      {filteredUsers.length > 0 ? (
                        <div className="divide-y divide-blue-900/20">
                          {filteredUsers.map((user) => (
                            <div key={user.id} className="p-4 hover:bg-blue-900/10 transition-colors">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-900/30 flex items-center justify-center border border-blue-700/30">
                                      <span className="text-blue-400 font-medium">
                                        {user.user_metadata?.full_name?.[0] || user.email[0].toUpperCase()}
                                      </span>
                                    </div>
                                    <div>
                                      <h3 className="font-medium text-gray-200">
                                        {user.user_metadata?.full_name || "Sem nome"}
                                      </h3>
                                      <p className="text-sm text-gray-400">{user.email}</p>
                                    </div>
                                  </div>
                                  <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                                    <span>Criado em: {new Date(user.created_at).toLocaleDateString()}</span>
                                    {user.last_sign_in_at && (
                                      <span>Último acesso: {new Date(user.last_sign_in_at).toLocaleDateString()}</span>
                                    )}
                                    {user.subscription_status && (
                                      <span
                                        className={`px-2 py-0.5 rounded-full ${
                                          user.subscription_status === "active"
                                            ? "bg-green-400/10 text-green-400"
                                            : user.subscription_status === "trialing"
                                              ? "bg-blue-400/10 text-blue-400"
                                              : "bg-red-400/10 text-red-400"
                                        }`}
                                      >
                                        {user.subscription_status === "active"
                                          ? "Ativo"
                                          : user.subscription_status === "trialing"
                                            ? "Em teste"
                                            : "Cancelado"}
                                      </span>
                                    )}
                                    {user.is_blocked && <span className="text-red-400 font-medium">Bloqueado</span>}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => viewUserDetails(user)}
                                    className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                                    title="Ver detalhes"
                                  >
                                    <ChevronDown size={18} />
                                  </button>
                                  <button
                                    onClick={() => toggleUserBlock(user.id, !!user.is_blocked)}
                                    className={`p-2 ${user.is_blocked ? "text-red-400 hover:text-red-300" : "text-gray-400 hover:text-blue-400"} transition-colors`}
                                    title={user.is_blocked ? "Desbloquear usuário" : "Bloquear usuário"}
                                  >
                                    <UserX size={18} />
                                  </button>
                                </div>
                              </div>

                              {selectedUser?.id === user.id && showUserDetails && (
                                <div className="mt-4 p-4 bg-black/40 rounded-lg border border-blue-700/30">
                                  <div className="flex justify-between items-center mb-3">
                                    <h4 className="font-medium text-gray-200">Detalhes do Usuário</h4>
                                    <button
                                      onClick={() => setShowUserDetails(false)}
                                      className="text-gray-400 hover:text-blue-400"
                                    >
                                      <ChevronUp size={18} />
                                    </button>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <h5 className="text-sm font-medium text-gray-300 mb-2">Informações Pessoais</h5>
                                      <div className="space-y-2 text-sm">
                                        <p>
                                          <span className="text-gray-400">ID:</span>{" "}
                                          <span className="text-gray-300">{user.id}</span>
                                        </p>
                                        <p>
                                          <span className="text-gray-400">Email:</span>{" "}
                                          <span className="text-gray-300">{user.email}</span>
                                        </p>
                                        <p>
                                          <span className="text-gray-400">Nome:</span>{" "}
                                          <span className="text-gray-300">
                                            {user.user_metadata?.full_name || "Não informado"}
                                          </span>
                                        </p>
                                        <p>
                                          <span className="text-gray-400">Criado em:</span>{" "}
                                          <span className="text-gray-300">
                                            {new Date(user.created_at).toLocaleString()}
                                          </span>
                                        </p>
                                        <p>
                                          <span className="text-gray-400">Último acesso:</span>{" "}
                                          <span className="text-gray-300">
                                            {user.last_sign_in_at
                                              ? new Date(user.last_sign_in_at).toLocaleString()
                                              : "Nunca"}
                                          </span>
                                        </p>
                                      </div>
                                    </div>

                                    <div>
                                      <h5 className="text-sm font-medium text-gray-300 mb-2">Detalhes da Assinatura</h5>
                                      {user.subscription_id ? (
                                        <div className="space-y-2 text-sm">
                                          <p>
                                            <span className="text-gray-400">ID da Assinatura:</span>{" "}
                                            <span className="text-gray-300">{user.subscription_id}</span>
                                          </p>
                                          <p>
                                            <span className="text-gray-400">Status:</span>{" "}
                                            <span
                                              className={`${
                                                user.subscription_status === "active"
                                                  ? "text-green-400"
                                                  : user.subscription_status === "trialing"
                                                    ? "text-blue-400"
                                                    : "text-red-400"
                                              }`}
                                            >
                                              {user.subscription_status === "active"
                                                ? "Ativo"
                                                : user.subscription_status === "trialing"
                                                  ? "Em teste"
                                                  : "Cancelado"}
                                            </span>
                                          </p>
                                          <p>
                                            <span className="text-gray-400">Plano:</span>{" "}
                                            <span className="text-gray-300">
                                              {user.plan_id === "price_monthly"
                                                ? "Mensal"
                                                : user.plan_id === "price_yearly"
                                                  ? "Anual"
                                                  : "Desconhecido"}
                                            </span>
                                          </p>
                                          {user.trial_end && (
                                            <p>
                                              <span className="text-gray-400">Fim do período de teste:</span>{" "}
                                              <span className="text-gray-300">
                                                {new Date(user.trial_end * 1000).toLocaleDateString()}
                                              </span>
                                            </p>
                                          )}

                                          <div className="pt-2">
                                            {user.subscription_status === "active" ? (
                                              <button
                                                onClick={() => manageSubscription(user.id, "cancel")}
                                                className="py-1 px-3 bg-red-900/20 text-red-400 border border-red-700/30 rounded text-xs hover:bg-red-900/30"
                                              >
                                                Cancelar Assinatura
                                              </button>
                                            ) : user.subscription_status === "canceled" ? (
                                              <button
                                                onClick={() => manageSubscription(user.id, "reactivate")}
                                                className="py-1 px-3 bg-green-900/20 text-green-400 border border-green-700/30 rounded text-xs hover:bg-green-900/30"
                                              >
                                                Reativar Assinatura
                                              </button>
                                            ) : null}
                                          </div>
                                        </div>
                                      ) : (
                                        <p className="text-sm text-gray-400">Este usuário não possui assinatura.</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center">
                          <Users className="mx-auto text-gray-600 mb-2" size={32} />
                          <p className="text-gray-400">Nenhum usuário encontrado</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Subscriptions Tab */}
              {activeTab === "subscriptions" && (
                <div className="space-y-6">
                  {/* Subscription Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-black to-green-950/20 rounded-xl p-4 border border-green-700/30 shadow-lg relative overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]"></div>
                      <div className="relative z-10">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-gray-400">Assinaturas Ativas</p>
                            <h3 className="text-2xl font-bold text-gray-200 mt-1">{subscriptionStats.active}</h3>
                          </div>
                          <div className="p-2 bg-green-500/10 rounded-lg">
                            <CreditCard className="h-6 w-6 text-green-400" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-black to-blue-950/20 rounded-xl p-4 border border-blue-700/30 shadow-lg relative overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]"></div>
                      <div className="relative z-10">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-gray-400">Em Período de Teste</p>
                            <h3 className="text-2xl font-bold text-gray-200 mt-1">{subscriptionStats.trialing}</h3>
                          </div>
                          <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Calendar className="h-6 w-6 text-blue-400" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-black to-red-950/20 rounded-xl p-4 border border-red-700/30 shadow-lg relative overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]"></div>
                      <div className="relative z-10">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-gray-400">Taxa de Cancelamento</p>
                            <h3 className="text-2xl font-bold text-gray-200 mt-1">
                              {subscriptionStats.churn_rate.toFixed(1)}%
                            </h3>
                          </div>
                          <div className="p-2 bg-red-500/10 rounded-lg">
                            <UserX className="h-6 w-6 text-red-400" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-black to-yellow-950/20 rounded-xl p-4 border border-yellow-700/30 shadow-lg relative overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]"></div>
                      <div className="relative z-10">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-gray-400">Taxa de Conversão</p>
                            <h3 className="text-2xl font-bold text-gray-200 mt-1">
                              {subscriptionStats.conversion_rate.toFixed(1)}%
                            </h3>
                          </div>
                          <div className="p-2 bg-yellow-500/10 rounded-lg">
                            <RefreshCw className="h-6 w-6 text-yellow-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Subscription Distribution Chart */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-black to-blue-950/20 rounded-xl p-4 border border-blue-700/30 shadow-lg relative overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]"></div>
                      <div className="relative z-10">
                        <h3 className="text-lg font-medium text-gray-200 mb-4">Distribuição de Assinaturas</h3>
                        <div className="h-64 flex items-center">
                          <DistributionChart />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-black to-blue-950/20 rounded-xl p-4 border border-blue-700/30 shadow-lg relative overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]"></div>
                      <div className="relative z-10">
                        <h3 className="text-lg font-medium text-gray-200 mb-4">Conversão de Teste para Pago</h3>
                        <div className="flex items-center justify-center h-64">
                          <div className="text-center">
                            <CircularProgressChart percentage={subscriptionStats.conversion_rate} />
                            <p className="mt-4 text-sm text-gray-400">
                              Taxa de conversão de teste para assinatura paga
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Analytics Tab */}
              {activeTab === "analytics" && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-black to-blue-950/20 rounded-xl p-4 border border-blue-700/30 shadow-lg relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]"></div>
                    <div className="relative z-10">
                      <h3 className="text-lg font-medium text-gray-200 mb-4">Métricas de Desempenho</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-black/40 p-4 rounded-lg border border-blue-700/30">
                          <h4 className="text-sm font-medium text-gray-300 mb-3">Crescimento de Usuários</h4>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-2xl font-bold text-gray-200">+{signupChartData.values.slice(-1)[0]}</p>
                              <p className="text-xs text-gray-400">Novos usuários no último mês</p>
                            </div>
                            <div className="text-green-400 flex items-center">
                              <ArrowUp size={16} className="mr-1" />
                              <span className="text-sm font-medium">12%</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-black/40 p-4 rounded-lg border border-blue-700/30">
                          <h4 className="text-sm font-medium text-gray-300 mb-3">Valor Médio por Usuário</h4>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-2xl font-bold text-gray-200">
                                ${(subscriptionStats.mrr / (subscriptionStats.active || 1)).toFixed(2)}
                              </p>
                              <p className="text-xs text-gray-400">ARPU mensal</p>
                            </div>
                            <div className="text-green-400 flex items-center">
                              <ArrowUp size={16} className="mr-1" />
                              <span className="text-sm font-medium">5%</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-black/40 p-4 rounded-lg border border-blue-700/30">
                          <h4 className="text-sm font-medium text-gray-300 mb-3">Tempo Médio de Teste</h4>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-2xl font-bold text-gray-200">5.2 dias</p>
                              <p className="text-xs text-gray-400">Antes da conversão</p>
                            </div>
                            <div className="text-blue-400 flex items-center">
                              <Calendar size={16} className="mr-1" />
                              <span className="text-sm font-medium">7 dias totais</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-black/40 p-4 rounded-lg border border-blue-700/30">
                          <h4 className="text-sm font-medium text-gray-300 mb-3">Tempo de Vida do Cliente</h4>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-2xl font-bold text-gray-200">8.4 meses</p>
                              <p className="text-xs text-gray-400">Média de retenção</p>
                            </div>
                            <div className="text-green-400 flex items-center">
                              <ArrowUp size={16} className="mr-1" />
                              <span className="text-sm font-medium">3%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-black to-blue-950/20 rounded-xl p-4 border border-blue-700/30 shadow-lg relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]"></div>
                    <div className="relative z-10">
                      <h3 className="text-lg font-medium text-gray-200 mb-4">Recomendações de Otimização</h3>

                      <div className="space-y-4">
                        <div className="bg-black/40 p-4 rounded-lg border border-blue-700/30">
                          <h4 className="text-sm font-medium text-blue-400 mb-2">Melhorar Taxa de Conversão</h4>
                          <p className="text-sm text-gray-300">
                            A taxa de conversão atual é de {subscriptionStats.conversion_rate.toFixed(1)}%. Considere
                            implementar emails de lembrete no 5º dia do período de teste para aumentar conversões.
                          </p>
                        </div>

                        <div className="bg-black/40 p-4 rounded-lg border border-green-700/30">
                          <h4 className="text-sm font-medium text-green-400 mb-2">Aumentar Valor Médio por Usuário</h4>
                          <p className="text-sm text-gray-300">
                            Promova mais ativamente o plano anual, que tem um valor maior e melhor retenção. Atualmente
                            apenas 35% dos usuários optam pelo plano anual.
                          </p>
                        </div>

                        <div className="bg-black/40 p-4 rounded-lg border border-yellow-700/30">
                          <h4 className="text-sm font-medium text-yellow-400 mb-2">Reduzir Taxa de Cancelamento</h4>
                          <p className="text-sm text-gray-300">
                            Implemente uma pesquisa de cancelamento para entender melhor os motivos e ofereça descontos
                            para usuários em risco de cancelar.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && showUserDetails && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-black to-blue-950/20 p-6 rounded-lg border border-blue-700/30 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-medium text-gray-200">Detalhes do Usuário</h3>
              <button onClick={() => setShowUserDetails(false)} className="text-gray-400 hover:text-blue-400">
                <X size={20} />
              </button>
            </div>

            {/* User details content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-3">Informações Pessoais</h4>
                <div className="space-y-3 text-sm">
                  <p>
                    <span className="text-gray-400">ID:</span> <span className="text-gray-300">{selectedUser.id}</span>
                  </p>
                  <p>
                    <span className="text-gray-400">Email:</span>{" "}
                    <span className="text-gray-300">{selectedUser.email}</span>
                  </p>
                  <p>
                    <span className="text-gray-400">Nome:</span>{" "}
                    <span className="text-gray-300">{selectedUser.user_metadata?.full_name || "Não informado"}</span>
                  </p>
                  <p>
                    <span className="text-gray-400">Criado em:</span>{" "}
                    <span className="text-gray-300">{new Date(selectedUser.created_at).toLocaleString()}</span>
                  </p>
                  <p>
                    <span className="text-gray-400">Último acesso:</span>{" "}
                    <span className="text-gray-300">
                      {selectedUser.last_sign_in_at ? new Date(selectedUser.last_sign_in_at).toLocaleString() : "Nunca"}
                    </span>
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-3">Detalhes da Assinatura</h4>
                {selectedUser.subscription_id ? (
                  <div className="space-y-3 text-sm">
                    <p>
                      <span className="text-gray-400">ID da Assinatura:</span>{" "}
                      <span className="text-gray-300">{selectedUser.subscription_id}</span>
                    </p>
                    <p>
                      <span className="text-gray-400">Status:</span>{" "}
                      <span
                        className={`${
                          selectedUser.subscription_status === "active"
                            ? "text-green-400"
                            : selectedUser.subscription_status === "trialing"
                              ? "text-blue-400"
                              : "text-red-400"
                        }`}
                      >
                        {selectedUser.subscription_status === "active"
                          ? "Ativo"
                          : selectedUser.subscription_status === "trialing"
                            ? "Em teste"
                            : "Cancelado"}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-400">Plano:</span>{" "}
                      <span className="text-gray-300">
                        {selectedUser.plan_id === "price_monthly"
                          ? "Mensal"
                          : selectedUser.plan_id === "price_yearly"
                            ? "Anual"
                            : "Desconhecido"}
                      </span>
                    </p>
                    {selectedUser.trial_end && (
                      <p>
                        <span className="text-gray-400">Fim do período de teste:</span>{" "}
                        <span className="text-gray-300">
                          {new Date(selectedUser.trial_end * 1000).toLocaleDateString()}
                        </span>
                      </p>
                    )}

                    <div className="pt-3 flex gap-2">
                      {selectedUser.subscription_status === "active" ? (
                        <button
                          onClick={() => manageSubscription(selectedUser.id, "cancel")}
                          className="py-2 px-4 bg-red-900/20 text-red-400 border border-red-700/30 rounded text-sm hover:bg-red-900/30"
                        >
                          Cancelar Assinatura
                        </button>
                      ) : selectedUser.subscription_status === "canceled" ? (
                        <button
                          onClick={() => manageSubscription(selectedUser.id, "reactivate")}
                          className="py-2 px-4 bg-green-900/20 text-green-400 border border-green-700/30 rounded text-sm hover:bg-green-900/30"
                        >
                          Reativar Assinatura
                        </button>
                      ) : null}

                      <button
                        onClick={() => toggleUserBlock(selectedUser.id, !!selectedUser.is_blocked)}
                        className={`py-2 px-4 rounded text-sm ${
                          selectedUser.is_blocked
                            ? "bg-blue-900/20 text-blue-400 border border-blue-700/30 hover:bg-blue-900/30"
                            : "bg-red-900/20 text-red-400 border border-red-700/30 hover:bg-red-900/30"
                        }`}
                      >
                        {selectedUser.is_blocked ? "Desbloquear Usuário" : "Bloquear Usuário"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">Este usuário não possui assinatura.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
