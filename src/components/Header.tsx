"use client"

import type React from "react"
import { useState } from "react"
import { Bell, X, Menu, Shield } from "lucide-react"
import { useAppStore } from "../store"
import { useAuthStore } from "../store/authStore"
import { useTranslation } from "react-i18next"
import LanguageSwitcher from "./LanguageSwitcher"

interface HeaderProps {
  toggleSidebar?: () => void
  id?: string
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, id }) => {
  const { notifications, markNotificationAsRead } = useAppStore()
  const { user, logout } = useAuthStore()
  const { t } = useTranslation()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  return (
    <header
      id={id}
      className="bg-black/80 backdrop-blur-md border-b border-violet-900/20 py-3 px-4 md:px-6 flex items-center justify-between sticky top-0 z-20"
    >
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="mr-3 text-gray-400 hover:text-gray-200 md:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu size={24} />
        </button>
        <div className="flex items-center">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-violet-800 to-fuchsia-800 shadow-lg mr-2 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4),transparent_70%)]"></div>
            <Shield className="text-white z-10" size={16} />
          </div>
          <h1 className="text-xl font-semibold text-gray-200">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">PTG</span>{" "}
            <span className="text-gray-200 hidden xs:inline">ProTraderGain</span>
          </h1>
        </div>
      </div>

      <div className="flex items-center space-x-2 md:space-x-4">
        <div className="hidden md:block">
          <LanguageSwitcher />
        </div>

        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications)
              setShowUserMenu(false)
            }}
            className="p-2 rounded-full hover:bg-violet-900/20 relative group"
            aria-label="Notifications"
          >
            <Bell size={20} className="text-gray-300 group-hover:text-violet-400 transition-colors" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-black/80 backdrop-blur-sm rounded-lg shadow-lg border border-violet-700/30 z-30">
              <div className="p-3 border-b border-violet-900/20 flex items-center justify-between">
                <h3 className="font-medium text-gray-200">{t("common.notifications")}</h3>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-gray-400 hover:text-gray-200"
                  aria-label="Close notifications"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-400">{t("common.noNotifications")}</div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border-b border-violet-900/20 hover:bg-violet-900/20 cursor-pointer ${
                        !notification.read ? "bg-violet-900/10" : ""
                      }`}
                      onClick={() => markNotificationAsRead(notification.id)}
                    >
                      <div className="flex items-start">
                        <div
                          className={`w-2 h-2 mt-1.5 rounded-full mr-2 ${
                            notification.type === "info"
                              ? "bg-blue-500"
                              : notification.type === "warning"
                                ? "bg-yellow-500"
                                : notification.type === "danger"
                                  ? "bg-red-500"
                                  : "bg-violet-500"
                          }`}
                        ></div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-200">{notification.title}</h4>
                          <p className="text-xs text-gray-400 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(notification.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu)
              setShowNotifications(false)
            }}
            className="flex items-center space-x-2 focus:outline-none group"
            aria-label="User menu"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-800 to-fuchsia-800 flex items-center justify-center text-white font-medium shadow-md relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4),transparent_70%)]"></div>
              <span className="relative z-10">
                {user?.user_metadata?.full_name
                  ? user.user_metadata.full_name.charAt(0)
                  : user?.email?.charAt(0) || "U"}
              </span>
            </div>
            <span className="text-sm font-medium hidden md:block text-gray-300 group-hover:text-white transition-colors">
              {user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User"}
            </span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-black/80 backdrop-blur-sm rounded-lg shadow-lg border border-violet-700/30 z-30">
              <div className="py-1">
                <div className="px-4 py-2 border-b border-violet-900/20">
                  <p className="text-sm font-medium text-gray-200">
                    {user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User"}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                </div>

                <div className="md:hidden px-4 py-2 border-b border-violet-900/20">
                  <LanguageSwitcher />
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-violet-900/20 hover:text-white transition-colors"
                >
                  {t("common.logout")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
