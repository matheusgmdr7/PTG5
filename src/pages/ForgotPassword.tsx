"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Shield, Loader2 } from "lucide-react"
import LanguageSwitcher from "../components/LanguageSwitcher"
import { useAuthStore } from "../store/authStore"
import { toast } from "react-toastify"

const ForgotPassword: React.FC = () => {
  const { t } = useTranslation()
  const { resetPassword, isLoading, error } = useAuthStore()

  const [email, setEmail] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast.error("Please enter your email address")
      return
    }

    try {
      await resetPassword(email)
      setSuccess(true)
      toast.success("Password reset link has been sent to your email address")
    } catch (err) {
      // Error is already handled in the store
    }
  }

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <div className="flex flex-1 items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-dark-800 p-8 rounded-lg shadow-md border border-dark-700">
          <div className="text-center">
            <div className="flex items-center justify-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg mb-4">
                <Shield className="text-dark-900" size={32} />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-200">
              <span className="text-primary-400">PTG</span> <span className="text-gray-200">ProTraderGain</span>
            </h1>
            <h2 className="mt-2 text-lg font-medium text-gray-200">{t("auth.resetPassword")}</h2>
            <p className="mt-1 text-sm text-gray-400">{t("auth.resetPasswordInstructions")}</p>
          </div>

          {success ? (
            <div className="mt-8">
              <div className="bg-primary-900/30 border border-primary-800 text-primary-400 px-4 py-3 rounded-md text-sm mb-4">
                Password reset link has been sent to your email address.
              </div>

              <Link
                to="/login"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-dark-900 bg-primary-500 hover:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                {t("auth.backToLogin")}
              </Link>
            </div>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
                  className="mt-1 block w-full px-3 py-2 border border-dark-600 rounded-md shadow-sm bg-dark-700 text-gray-200 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-dark-900 bg-primary-500 hover:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-dark-900" />
                      {t("common.loading")}
                    </span>
                  ) : (
                    t("auth.sendResetLink")
                  )}
                </button>
              </div>

              <div className="text-center mt-4">
                <Link to="/login" className="font-medium text-primary-400 hover:text-primary-300 text-sm">
                  {t("auth.backToLogin")}
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
