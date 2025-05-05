"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

import Layout from "./components/Layout"
import Landing from "./pages/LandingPage"
import Dashboard from "./pages/Dashboard"
import Connections from "./pages/Connections"
import Positions from "./pages/Positions"
import History from "./pages/History"
import Melhorias from "./pages/Melhorias"
import Risk from "./pages/Risk"
import Settings from "./pages/Settings"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import ForgotPassword from "./pages/ForgotPassword"
import GuidedTour from "./components/GuidedTour"
import Assistant from "./pages/Assistant"
import AdminPortal from "./pages/Admin"
import AdminLogin from "./pages/AdminLogin"
import AdminDashboard from "./pages/AdminDashboard"

import { useAppStore } from "./store"
import { useAuthStore } from "./store/authStore"
import { api } from "./services/api"
import "./i18n"
import { initializeRiskSettings } from "./store"
import { useTranslation } from "react-i18next"

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuthStore()
  const { t } = useTranslation()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login", { replace: true })
    }
  }, [user, isLoading, navigate])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-dark-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-3 text-gray-400">{t("common.loading")}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}

// Admin route component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuthStore()
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingAdmin, setCheckingAdmin] = useState(true)
  const navigate = useNavigate()
  const { t } = useTranslation()

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!user) {
        navigate("/admin-login", { replace: true })
        return
      }

      try {
        const { data } = await api.checkAdminAccess(user.id)
        setIsAdmin(!!data)
      } catch (error) {
        console.error("Error checking admin access:", error)
        setIsAdmin(false)
      } finally {
        setCheckingAdmin(false)
      }
    }

    checkAdminAccess()
  }, [user, navigate])

  if (isLoading || checkingAdmin) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-3 text-gray-400">{t("common.loading")}</p>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    navigate("/admin-login", { replace: true })
    return null
  }

  return <>{children}</>
}

function App() {
  const { setBalance, setPositions, updateRiskStatus, addBehavior, connections } = useAppStore()

  const authStore = useAuthStore()
  const { user } = authStore
  const { i18n } = useTranslation()
  const store = useAppStore()

  useEffect(() => {
    // Check if user is authenticated
    const checkUser = async () => {
      try {
        await authStore.getUser()
      } catch (error) {
        console.error("Error checking user:", error)
      }
    }

    checkUser()
  }, [])

  useEffect(() => {
    // Initialize risk settings from Supabase
    if (user) {
      initializeRiskSettings()
    }
  }, [user])

  useEffect(() => {
    // Only initialize if user is authenticated
    if (user) {
      // Initialize app with data based on connection status
      const initializeApp = async () => {
        try {
          console.log("App: Initializing app with user:", user.email)
          // Ensure connections is an array even if undefined
          const currentConnections = connections || []
          console.log("App: Current connections:", currentConnections)

          // Verificar se há conexões reais
          const hasConnections = await api.checkRealConnections(currentConnections)
          console.log("App: Has connected exchanges:", hasConnections)

          // Agora buscar o saldo da conta, especificando o tipo de conta (futures ou spot)
          // Se houver múltiplas conexões, usar o tipo da primeira conexão ou o padrão para futures
          const accountType = currentConnections.length > 0 ? currentConnections[0].accountType || "futures" : "futures"
          console.log("App: Fetching balance for account type:", accountType)

          // Passar o array de conexões para a API
          const balanceData = await api.getAccountBalance(currentConnections, accountType)
          console.log("App: Received balance data:", balanceData)
          setBalance(balanceData)

          // Passar o array de conexões para todas as chamadas de API
          const positionsData = await api.getPositions(currentConnections)
          console.log("App: Received positions data:", positionsData)
          setPositions(positionsData)

          // Atualizar o status de risco com base nas conexões
          // Isso agora usará a função updateRiskStatus do store que busca os dados de P&L
          updateRiskStatus(currentConnections)

          // Buscar comportamentos apenas se o usuário tiver conexões
          if (currentConnections.length > 0) {
            const behaviorsData = await api.getBehaviors(currentConnections)
            console.log("App: Received behaviors data:", behaviorsData)
            behaviorsData.forEach((behavior) => addBehavior(behavior))
          }
        } catch (error) {
          console.error("Error initializing app:", error)
        }
      }

      initializeApp()
    }
  }, [user, connections, setBalance, setPositions, updateRiskStatus, addBehavior])

  // Iniciar monitoramento em tempo real de posições
  useEffect(() => {
    if (store.connections && store.connections.length > 0) {
      const { connections } = store
      console.log("App: Starting real-time position monitoring")

      // Função de callback para processar violações de risco
      const handleRiskViolation = (data) => {
        console.log("App: Risk violation detected:", data)

        // Criar notificação para cada violação
        data.violations.forEach((violation) => {
          // Adicionar ao store de notificações
          store.addNotification({
            id: `position-risk-${data.position.symbol}-${violation.type}-${Date.now()}`,
            title: `Alerta de Risco: ${data.position.symbol}`,
            message: violation.message,
            type: "warning",
            timestamp: Date.now(),
            read: false,
          })

          // Mostrar toast
          toast.warning(violation.message, {
            position: "top-right",
            autoClose: 7000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          })
        })
      }

      // Iniciar monitoramento
      const stopMonitoring = api.monitorPositionsRealTime(connections, handleRiskViolation)

      // Limpar ao desmontar
      return () => {
        if (typeof stopMonitoring === "function") {
          stopMonitoring()
        }
      }
    }
  }, [store])

  // Set Portuguese as default language if no language is selected
  useEffect(() => {
    if (!localStorage.getItem("i18nextLng")) {
      i18n.changeLanguage("pt")
    }
  }, [i18n])

  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      {user && <GuidedTour />}
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Admin routes */}
        <Route
          path="/dashboard/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* Protected routes */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="connections" replace />} />
          <Route path="panel" element={<Dashboard />} />
          <Route path="connections" element={<Connections />} />
          <Route path="positions" element={<Positions />} />
          <Route path="history" element={<History />} />
          <Route path="melhorias" element={<Melhorias />} />
          <Route path="assistant" element={<Assistant />} />
          <Route path="risk" element={<Risk />} />
          <Route path="settings" element={<Settings />} />
          <Route path="admin" element={<AdminPortal />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
