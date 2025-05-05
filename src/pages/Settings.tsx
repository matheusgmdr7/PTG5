"use client"

import type React from "react"
import { useState } from "react"
import { useAppStore } from "../store"
import {
  Bell,
  Mail,
  Shield,
  AlertTriangle,
  BrainCircuit,
  BarChart3,
  User,
  Lock,
  SettingsIcon,
  Save,
  ExternalLink,
  Download,
  Trash2,
  ChevronRight,
} from "lucide-react"
import { useTranslation } from "react-i18next"
import { toast } from "react-toastify"

const Settings: React.FC = () => {
  const { selectedRiskLevel, setRiskLevel } = useAppStore()
  const { t } = useTranslation()

  const [email, setEmail] = useState("trader@example.com")
  const [notificationSettings, setNotificationSettings] = useState({
    emailAlerts: true,
    pushNotifications: true,
    riskLevelChanges: true,
    tradingRestrictions: true,
    behaviorInsights: true,
    dailySummary: false,
  })

  const handleNotificationChange = (setting: keyof typeof notificationSettings) => {
    setNotificationSettings({
      ...notificationSettings,
      [setting]: !notificationSettings[setting],
    })
  }

  const handleSaveSettings = () => {
    toast.success("Configurações salvas com sucesso!")
  }

  return (
    <div className="space-y-8">
      {/* Header Section with Gradient Background */}
      <div className="bg-gradient-to-br from-black to-violet-950/20 rounded-xl p-6 border border-violet-700/30 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]"></div>
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-800 to-fuchsia-800 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4),transparent_70%)]"></div>
            <SettingsIcon className="text-white z-10" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-200">{t("settings.accountSettings")}</h1>
            <p className="text-sm text-gray-400 mt-1">Gerencie suas preferências e configurações de conta</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Account Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Settings Section */}
          <div className="bg-gradient-to-br from-black to-violet-950/20 rounded-xl border border-violet-700/30 shadow-lg overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]"></div>
            <div className="p-5 border-b border-violet-900/20 flex items-center relative z-10">
              <User className="text-violet-400 mr-2" size={18} />
              <h2 className="text-lg font-semibold text-gray-200">Informações da Conta</h2>
            </div>

            <div className="p-6 space-y-6 relative z-10">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  {t("settings.emailAddress")}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 pl-10 bg-violet-900/20 border border-violet-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-200 placeholder-gray-500"
                  />
                  <Mail className="absolute left-3 top-3.5 text-gray-400" size={16} />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                  {t("settings.password")}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    id="password"
                    value="••••••••••••"
                    disabled
                    className="w-full px-4 py-3 pl-10 bg-violet-900/20 border border-violet-700/30 rounded-lg text-gray-200"
                  />
                  <Lock className="absolute left-3 top-3.5 text-gray-400" size={16} />
                  <button className="absolute right-3 top-2.5 text-sm text-violet-400 hover:text-violet-300 transition-colors bg-violet-900/30 px-2 py-1 rounded-lg">
                    {t("settings.changePassword")}
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-3">{t("settings.riskManagementLevel")}</h3>
                <div className="grid grid-cols-3 gap-4">
                  {(["Conservative", "Moderate", "Aggressive"] as const).map((level) => (
                    <button
                      key={level}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedRiskLevel === level
                          ? "border-violet-500 bg-violet-900/30"
                          : "border-violet-700/30 hover:border-violet-600/50 bg-violet-900/20 hover:bg-violet-900/30"
                      }`}
                      onClick={() => setRiskLevel(level)}
                    >
                      <div className="font-medium text-center text-gray-200">{level}</div>
                      <div
                        className={`text-xs mt-1 text-center ${
                          level === "Conservative"
                            ? "text-violet-400"
                            : level === "Moderate"
                              ? "text-yellow-400"
                              : "text-red-400"
                        }`}
                      >
                        {level === "Conservative"
                          ? t("risk.conservative")
                          : level === "Moderate"
                            ? t("risk.moderate")
                            : t("risk.aggressive")}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-violet-900/20">
                <button
                  onClick={handleSaveSettings}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-800 to-fuchsia-800 hover:from-violet-700 hover:to-fuchsia-700 text-white rounded-lg transition-all duration-300 font-medium relative overflow-hidden group shadow-lg shadow-violet-700/20 hover:shadow-violet-600/40"
                >
                  <span className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <Save size={16} className="relative z-10" />
                  <span className="relative z-10">Salvar Alterações</span>
                </button>
              </div>
            </div>
          </div>

          {/* Notification Settings Section */}
          <div className="bg-gradient-to-br from-black to-violet-950/20 rounded-xl border border-violet-700/30 shadow-lg overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]"></div>
            <div className="p-5 border-b border-violet-900/20 flex items-center relative z-10">
              <Bell className="text-violet-400 mr-2" size={18} />
              <h2 className="text-lg font-semibold text-gray-200">{t("settings.notificationSettings")}</h2>
            </div>

            <div className="p-6 space-y-6 relative z-10">
              <div className="flex items-center justify-between p-4 bg-violet-900/20 rounded-lg border border-violet-700/30 hover:bg-violet-900/30 transition-colors">
                <div className="flex items-center">
                  <Mail className="text-violet-400 mr-3" size={20} />
                  <div>
                    <h3 className="font-medium text-gray-200">{t("settings.emailAlerts")}</h3>
                    <p className="text-sm text-gray-400">{t("settings.emailAlertsDescription")}</p>
                  </div>
                </div>
                <div>
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={notificationSettings.emailAlerts}
                      onChange={() => handleNotificationChange("emailAlerts")}
                    />
                    <div className="relative w-11 h-6 bg-violet-900/50 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-900 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-dark-900 after:border-violet-700/30 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-violet-900/20 rounded-lg border border-violet-700/30 hover:bg-violet-900/30 transition-colors">
                <div className="flex items-center">
                  <Bell className="text-violet-400 mr-3" size={20} />
                  <div>
                    <h3 className="font-medium text-gray-200">{t("settings.pushNotifications")}</h3>
                    <p className="text-sm text-gray-400">{t("settings.pushNotificationsDescription")}</p>
                  </div>
                </div>
                <div>
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={notificationSettings.pushNotifications}
                      onChange={() => handleNotificationChange("pushNotifications")}
                    />
                    <div className="relative w-11 h-6 bg-violet-900/50 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-900 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-dark-900 after:border-violet-700/30 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                  </label>
                </div>
              </div>

              <div className="border-t border-violet-900/20 pt-6">
                <h3 className="font-medium mb-4 text-gray-200">{t("settings.notificationTypes")}</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-violet-900/20 rounded-lg border border-violet-700/30 hover:bg-violet-900/30 transition-colors">
                    <div className="flex items-center">
                      <Shield className="text-violet-400 mr-3" size={20} />
                      <div>
                        <h3 className="font-medium text-gray-200">{t("settings.riskLevelChanges")}</h3>
                        <p className="text-sm text-gray-400">{t("settings.riskLevelChangesDescription")}</p>
                      </div>
                    </div>
                    <div>
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={notificationSettings.riskLevelChanges}
                          onChange={() => handleNotificationChange("riskLevelChanges")}
                        />
                        <div className="relative w-11 h-6 bg-violet-900/50 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-900 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-dark-900 after:border-violet-700/30 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-violet-900/20 rounded-lg border border-violet-700/30 hover:bg-violet-900/30 transition-colors">
                    <div className="flex items-center">
                      <AlertTriangle className="text-yellow-400 mr-3" size={20} />
                      <div>
                        <h3 className="font-medium text-gray-200">{t("settings.tradingRestrictions")}</h3>
                        <p className="text-sm text-gray-400">{t("settings.tradingRestrictionsDescription")}</p>
                      </div>
                    </div>
                    <div>
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={notificationSettings.tradingRestrictions}
                          onChange={() => handleNotificationChange("tradingRestrictions")}
                        />
                        <div className="relative w-11 h-6 bg-violet-900/50 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-900 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-dark-900 after:border-violet-700/30 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-violet-900/20 rounded-lg border border-violet-700/30 hover:bg-violet-900/30 transition-colors">
                    <div className="flex items-center">
                      <BrainCircuit className="text-blue-400 mr-3" size={20} />
                      <div>
                        <h3 className="font-medium text-gray-200">{t("settings.behaviorInsights")}</h3>
                        <p className="text-sm text-gray-400">{t("settings.behaviorInsightsDescription")}</p>
                      </div>
                    </div>
                    <div>
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={notificationSettings.behaviorInsights}
                          onChange={() => handleNotificationChange("behaviorInsights")}
                        />
                        <div className="relative w-11 h-6 bg-violet-900/50 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-900 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-dark-900 after:border-violet-700/30 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-violet-900/20 rounded-lg border border-violet-700/30 hover:bg-violet-900/30 transition-colors">
                    <div className="flex items-center">
                      <BarChart3 className="text-purple-400 mr-3" size={20} />
                      <div>
                        <h3 className="font-medium text-gray-200">{t("settings.dailySummary")}</h3>
                        <p className="text-sm text-gray-400">{t("settings.dailySummaryDescription")}</p>
                      </div>
                    </div>
                    <div>
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={notificationSettings.dailySummary}
                          onChange={() => handleNotificationChange("dailySummary")}
                        />
                        <div className="relative w-11 h-6 bg-violet-900/50 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-900 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-dark-900 after:border-violet-700/30 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Data Privacy & Help */}
        <div className="lg:col-span-1 space-y-6">
          {/* Data Privacy Section */}
          <div className="bg-gradient-to-br from-black to-violet-950/20 rounded-xl border border-violet-700/30 shadow-lg overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]"></div>
            <div className="p-5 border-b border-violet-900/20 flex items-center relative z-10">
              <Lock className="text-violet-400 mr-2" size={18} />
              <h2 className="text-lg font-semibold text-gray-200">{t("settings.dataPrivacy")}</h2>
            </div>

            <div className="p-6 space-y-4 relative z-10">
              <p className="text-sm text-gray-400 leading-relaxed">{t("settings.dataPrivacyDescription")}</p>

              <div className="space-y-3 pt-2">
                <button className="w-full flex items-center justify-between px-4 py-3 bg-violet-900/20 hover:bg-violet-900/30 text-gray-300 hover:text-white rounded-lg transition-colors border border-violet-700/30 hover:border-violet-600/50">
                  <div className="flex items-center">
                    <Download size={16} className="mr-2" />
                    <span>{t("settings.exportMyData")}</span>
                  </div>
                  <ChevronRight size={16} />
                </button>

                <button className="w-full flex items-center justify-between px-4 py-3 bg-red-900/30 text-red-400 hover:bg-red-900/50 rounded-lg transition-colors border border-red-800/30">
                  <div className="flex items-center">
                    <Trash2 size={16} className="mr-2" />
                    <span>{t("settings.deleteMyAccount")}</span>
                  </div>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Help & Support Section */}
          <div className="bg-gradient-to-br from-black to-violet-950/20 rounded-xl border border-violet-700/30 shadow-lg overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]"></div>
            <div className="p-5 border-b border-violet-900/20 relative z-10">
              <h2 className="text-lg font-semibold text-gray-200">Ajuda & Suporte</h2>
            </div>

            <div className="p-6 space-y-4 relative z-10">
              <a
                href="#"
                className="flex items-center justify-between p-3 bg-violet-900/20 rounded-lg border border-violet-700/30 hover:bg-violet-900/30 transition-colors group"
              >
                <span className="text-gray-300 group-hover:text-white transition-colors">Central de Ajuda</span>
                <ExternalLink size={14} className="text-gray-400 group-hover:text-violet-400 transition-colors" />
              </a>

              <a
                href="#"
                className="flex items-center justify-between p-3 bg-violet-900/20 rounded-lg border border-violet-700/30 hover:bg-violet-900/30 transition-colors group"
              >
                <span className="text-gray-300 group-hover:text-white transition-colors">Contatar Suporte</span>
                <ExternalLink size={14} className="text-gray-400 group-hover:text-violet-400 transition-colors" />
              </a>

              <a
                href="#"
                className="flex items-center justify-between p-3 bg-violet-900/20 rounded-lg border border-violet-700/30 hover:bg-violet-900/30 transition-colors group"
              >
                <span className="text-gray-300 group-hover:text-white transition-colors">Tutoriais</span>
                <ExternalLink size={14} className="text-gray-400 group-hover:text-violet-400 transition-colors" />
              </a>
            </div>
          </div>

          {/* App Info Section */}
          <div className="bg-gradient-to-br from-black to-violet-950/20 rounded-xl border border-violet-700/30 shadow-lg overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]"></div>
            <div className="p-5 border-b border-violet-900/20 relative z-10">
              <h2 className="text-lg font-semibold text-gray-200">Informações do Aplicativo</h2>
            </div>

            <div className="p-6 relative z-10">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-800 to-fuchsia-800 shadow-lg flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4),transparent_70%)]"></div>
                  <Shield className="text-white z-10" size={32} />
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-200">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                    PTG
                  </span>{" "}
                  <span className="text-gray-200">ProTraderGain</span>
                </h3>
                <p className="text-sm text-gray-400 mt-1">Versão 1.2.0</p>

                <div className="mt-4 text-xs text-gray-500">
                  © 2023 PTG ProTraderGain
                  <br />
                  Todos os direitos reservados
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
