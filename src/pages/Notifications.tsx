"use client"

import type React from "react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Bell, Check, Trash2, AlertTriangle, Info, CheckCircle2 } from "lucide-react"
import { useStore } from "../store" // Corrigido: useAppStore -> useStore

const Notifications: React.FC = () => {
  const { t } = useTranslation()
  const { notifications, markNotificationAsRead, clearNotifications } = useStore() // Corrigido: useAppStore -> useStore
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all")

  // Filtrar notificações
  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "unread") return !notification.read
    if (filter === "read") return notification.read
    return true
  })

  // Marcar como lida
  const handleMarkAsRead = (id: string) => {
    markNotificationAsRead(id)
  }

  // Marcar todas como lidas
  const handleMarkAllAsRead = () => {
    notifications.forEach((notification) => {
      if (!notification.read) {
        markNotificationAsRead(notification.id)
      }
    })
  }

  // Limpar todas as notificações
  const handleClearAll = () => {
    clearNotifications()
  }

  // Renderizar ícone com base no tipo
  const renderIcon = (type: string) => {
    switch (type) {
      case "danger":
        return <AlertTriangle className="text-red-500" size={20} />
      case "warning":
        return <AlertTriangle className="text-yellow-500" size={20} />
      case "success":
        return <CheckCircle2 className="text-green-500" size={20} />
      default:
        return <Info className="text-violet-500" size={20} />
    }
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-100 mb-2">{t("notifications.title")}</h1>
        <p className="text-sm sm:text-base text-gray-400">{t("notifications.description")}</p>
      </div>

      <div className="bg-gray-900/50 rounded-lg border border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-md text-sm ${
                filter === "all"
                  ? "bg-violet-900/50 text-violet-400 border border-violet-700/50"
                  : "text-gray-400 hover:bg-gray-800 border border-transparent"
              }`}
            >
              {t("notifications.all")}
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-3 py-1.5 rounded-md text-sm ${
                filter === "unread"
                  ? "bg-violet-900/50 text-violet-400 border border-violet-700/50"
                  : "text-gray-400 hover:bg-gray-800 border border-transparent"
              }`}
            >
              {t("notifications.unread")}
            </button>
            <button
              onClick={() => setFilter("read")}
              className={`px-3 py-1.5 rounded-md text-sm ${
                filter === "read"
                  ? "bg-violet-900/50 text-violet-400 border border-violet-700/50"
                  : "text-gray-400 hover:bg-gray-800 border border-transparent"
              }`}
            >
              {t("notifications.read")}
            </button>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center px-3 py-1.5 bg-violet-900/20 hover:bg-violet-900/30 text-violet-400 rounded-md text-sm"
            >
              <Check size={16} className="mr-1" />
              {t("notifications.markAllRead")}
            </button>
            <button
              onClick={handleClearAll}
              className="flex items-center px-3 py-1.5 bg-red-900/20 hover:bg-red-900/30 text-red-400 rounded-md text-sm"
            >
              <Trash2 size={16} className="mr-1" />
              {t("notifications.clearAll")}
            </button>
          </div>
        </div>

        {filteredNotifications.length > 0 ? (
          <div className="divide-y divide-gray-800">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 sm:p-5 ${notification.read ? "bg-gray-900" : "bg-gray-900/70"}`}
              >
                <div className="flex">
                  <div className="mr-3 sm:mr-4 mt-0.5 flex-shrink-0">{renderIcon(notification.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <h3 className="text-sm sm:text-base font-medium text-gray-200">{notification.title}</h3>
                      <div className="ml-2 flex-shrink-0 flex">
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-violet-400 hover:text-violet-300 p-1 rounded-full hover:bg-violet-900/20"
                            title={t("notifications.markAsRead")}
                          >
                            <Check size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-gray-400">{notification.message}</p>
                    <p className="mt-1 text-xs text-gray-500">{new Date(notification.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <Bell className="text-gray-600 mb-3" size={32} />
            <p className="text-gray-500 text-center">
              {filter === "all"
                ? t("notifications.noNotifications")
                : filter === "unread"
                  ? t("notifications.noUnreadNotifications")
                  : t("notifications.noReadNotifications")}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Notifications
