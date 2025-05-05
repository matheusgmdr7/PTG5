"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore"
import { supabase } from "../lib/supabase"
import { Users, Search, Filter, MoreVertical, Shield, Ban, Mail } from "lucide-react"
import { toast } from "react-toastify"

interface User {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string
  user_metadata?: {
    full_name?: string
  }
  is_blocked?: boolean
}

const AdminPortal: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState<"all" | "active" | "blocked">("all")
  const navigate = useNavigate()
  const { user } = useAuthStore()

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

  // Buscar usuários
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true)
        const {
          data: { users },
          error,
        } = await supabase.auth.admin.listUsers()

        if (error) throw error

        // Buscar informações adicionais dos usuários (como status de bloqueio)
        const { data: blockedUsers } = await supabase.from("blocked_users").select("user_id")

        const blockedUserIds = new Set(blockedUsers?.map((u) => u.user_id) || [])

        const enrichedUsers = users.map((user) => ({
          ...user,
          is_blocked: blockedUserIds.has(user.id),
        }))

        setUsers(enrichedUsers)
      } catch (error) {
        console.error("Error fetching users:", error)
        toast.error("Erro ao carregar usuários")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [])

  // Filtrar usuários
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.user_metadata?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter =
      filter === "all" || (filter === "blocked" && user.is_blocked) || (filter === "active" && !user.is_blocked)

    return matchesSearch && matchesFilter
  })

  // Bloquear/Desbloquear usuário
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

  // Enviar email para usuário
  const sendEmail = async (email: string) => {
    try {
      // Implementar lógica de envio de email
      toast.info("Funcionalidade de envio de email em desenvolvimento")
    } catch (error) {
      console.error("Error sending email:", error)
      toast.error("Erro ao enviar email")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-800 to-fuchsia-800 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4),transparent_70%)]"></div>
            <Shield className="text-white z-10" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-200">Portal Administrativo</h1>
            <p className="text-sm text-gray-400">Gerencie os usuários da plataforma</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-br from-black to-violet-950/20 rounded-xl p-4 border border-violet-700/30 shadow-lg relative overflow-hidden">
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
                className="w-full pl-10 pr-4 py-2 bg-black/40 border border-violet-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-200 placeholder-gray-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-gray-500" size={18} />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as "all" | "active" | "blocked")}
              className="bg-black/40 border border-violet-700/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-200"
            >
              <option value="all">Todos</option>
              <option value="active">Ativos</option>
              <option value="blocked">Bloqueados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-gradient-to-br from-black to-violet-950/20 rounded-xl border border-violet-700/30 shadow-lg overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]"></div>
        <div className="p-4 border-b border-violet-900/20 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <Users className="text-violet-400" size={20} />
            <h2 className="text-lg font-semibold text-gray-200">Usuários</h2>
          </div>
          <span className="text-sm text-gray-400">{filteredUsers.length} usuários encontrados</span>
        </div>

        <div className="relative z-10">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2 text-gray-400">Carregando usuários...</p>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="divide-y divide-violet-900/20">
              {filteredUsers.map((user) => (
                <div key={user.id} className="p-4 hover:bg-violet-900/10 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-violet-900/30 flex items-center justify-center border border-violet-700/30">
                          <span className="text-violet-400 font-medium">
                            {user.user_metadata?.full_name?.[0] || user.email[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-200">{user.user_metadata?.full_name || "Sem nome"}</h3>
                          <p className="text-sm text-gray-400">{user.email}</p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                        <span>Criado em: {new Date(user.created_at).toLocaleDateString()}</span>
                        {user.last_sign_in_at && (
                          <span>Último acesso: {new Date(user.last_sign_in_at).toLocaleDateString()}</span>
                        )}
                        {user.is_blocked && <span className="text-red-400 font-medium">Bloqueado</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => sendEmail(user.email)}
                        className="p-2 text-gray-400 hover:text-violet-400 transition-colors"
                        title="Enviar email"
                      >
                        <Mail size={18} />
                      </button>
                      <button
                        onClick={() => toggleUserBlock(user.id, !!user.is_blocked)}
                        className={`p-2 ${user.is_blocked ? "text-red-400 hover:text-red-300" : "text-gray-400 hover:text-violet-400"} transition-colors`}
                        title={user.is_blocked ? "Desbloquear usuário" : "Bloquear usuário"}
                      >
                        <Ban size={18} />
                      </button>
                      <div className="relative group">
                        <button className="p-2 text-gray-400 hover:text-violet-400 transition-colors">
                          <MoreVertical size={18} />
                        </button>
                        <div className="absolute right-0 mt-2 w-48 bg-dark-800 rounded-lg shadow-lg border border-violet-700/30 hidden group-hover:block">
                          <div className="py-1">
                            <button className="w-full px-4 py-2 text-sm text-left text-gray-300 hover:bg-violet-900/20">
                              Ver detalhes
                            </button>
                            <button className="w-full px-4 py-2 text-sm text-left text-gray-300 hover:bg-violet-900/20">
                              Histórico de acessos
                            </button>
                            <button className="w-full px-4 py-2 text-sm text-left text-red-400 hover:bg-red-900/20">
                              Excluir conta
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
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
  )
}

export default AdminPortal
