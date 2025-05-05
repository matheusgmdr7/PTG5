"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useAuthStore } from "../store/authStore"
import { supabase } from "../lib/supabase"
import { CreditCard, Calendar, AlertTriangle, CheckCircle, Loader2 } from "lucide-react"
import { toast } from "react-toastify"

const SubscriptionSettings = () => {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) return

      try {
        setLoading(true)
        // Fetch subscription data from Supabase
        const { data, error } = await supabase
          .from("profiles")
          .select("subscription_id, subscription_status, trial_end, plan_id, payment_method")
          .eq("id", user.id)
          .single()

        if (error) {
          throw error
        }

        if (data) {
          // Fetch additional details from Stripe API
          const response = await fetch(`/api/subscription/${data.subscription_id}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          })

          const stripeData = await response.json()

          setSubscription({
            ...data,
            ...stripeData,
            isTrialing: data.subscription_status === "trialing",
            isActive: data.subscription_status === "active",
            isCanceled: data.subscription_status === "canceled",
          })
        }
      } catch (error) {
        console.error("Error fetching subscription:", error)
        toast.error(t("subscription.fetchError"))
      } finally {
        setLoading(false)
      }
    }

    fetchSubscription()
  }, [user, t])

  const handleCancelSubscription = async () => {
    if (!subscription?.subscription_id) return

    try {
      setCancelLoading(true)
      const response = await fetch(`/api/subscription/${subscription.subscription_id}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()

      if (result.error) {
        throw new Error(result.error)
      }

      // Update local state
      setSubscription({
        ...subscription,
        isCanceled: true,
        cancelAt: result.cancel_at,
        subscription_status: "canceled",
      })

      // Update Supabase
      await supabase
        .from("profiles")
        .update({
          subscription_status: "canceled",
        })
        .eq("id", user.id)

      toast.success(t("subscription.cancelSuccess"))
      setShowCancelConfirm(false)
    } catch (error) {
      console.error("Error canceling subscription:", error)
      toast.error(t("subscription.cancelError"))
    } finally {
      setCancelLoading(false)
    }
  }

  const handleResumeSubscription = async () => {
    if (!subscription?.subscription_id) return

    try {
      setCancelLoading(true)
      const response = await fetch(`/api/subscription/${subscription.subscription_id}/resume`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()

      if (result.error) {
        throw new Error(result.error)
      }

      // Update local state
      setSubscription({
        ...subscription,
        isCanceled: false,
        cancelAt: null,
        subscription_status: result.status,
      })

      // Update Supabase
      await supabase
        .from("profiles")
        .update({
          subscription_status: result.status,
        })
        .eq("id", user.id)

      toast.success(t("subscription.resumeSuccess"))
    } catch (error) {
      console.error("Error resuming subscription:", error)
      toast.error(t("subscription.resumeError"))
    } finally {
      setCancelLoading(false)
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return ""
    return new Date(timestamp * 1000).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-3 text-gray-400">{t("common.loading")}</p>
        </div>
      </div>
    )
  }

  if (!subscription) {
    return (
      <div className="text-center py-8">
        <div className="bg-dark-800 p-6 rounded-lg border border-dark-700 max-w-md mx-auto">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-200 mb-2">{t("subscription.noSubscription")}</h3>
          <p className="text-gray-400 mb-4">{t("subscription.noSubscriptionDesc")}</p>
          <a
            href="/pricing"
            className="inline-block py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-dark-900 bg-primary-500 hover:bg-primary-400 focus:outline-none"
          >
            {t("subscription.viewPlans")}
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="bg-gradient-to-br from-black to-violet-950/20 rounded-xl p-6 border border-violet-700/30 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]"></div>
        <div className="relative z-10">
          <h2 className="text-xl font-semibold text-gray-200 mb-4">{t("subscription.yourSubscription")}</h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-black/40 p-4 rounded-lg border border-violet-700/30">
              <div className="flex items-start">
                <div className="mr-3 mt-1">
                  <CreditCard className="h-5 w-5 text-primary-400" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-200">{t("subscription.plan")}</h3>
                  <p className="text-gray-400">
                    {subscription.plan_id === "price_monthly"
                      ? t("subscription.monthlyPlan")
                      : t("subscription.yearlyPlan")}
                  </p>
                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        subscription.isTrialing
                          ? "bg-blue-400/10 text-blue-400"
                          : subscription.isActive
                            ? "bg-green-400/10 text-green-400"
                            : "bg-red-400/10 text-red-400"
                      }`}
                    >
                      {subscription.isTrialing
                        ? t("subscription.trial")
                        : subscription.isActive
                          ? t("subscription.active")
                          : t("subscription.canceled")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-black/40 p-4 rounded-lg border border-violet-700/30">
              <div className="flex items-start">
                <div className="mr-3 mt-1">
                  <Calendar className="h-5 w-5 text-primary-400" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-200">
                    {subscription.isTrialing ? t("subscription.trialEnds") : t("subscription.nextBilling")}
                  </h3>
                  <p className="text-gray-400">
                    {subscription.isTrialing
                      ? formatDate(subscription.trial_end)
                      : subscription.isCanceled
                        ? t("subscription.noRenewal")
                        : formatDate(subscription.current_period_end)}
                  </p>
                  {subscription.isCanceled && subscription.cancelAt && (
                    <p className="text-sm text-red-400 mt-1">
                      {t("subscription.accessUntil", { date: formatDate(subscription.cancelAt) })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {subscription.isCanceled ? (
              <button
                onClick={handleResumeSubscription}
                disabled={cancelLoading}
                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-dark-900 bg-primary-500 hover:bg-primary-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {cancelLoading ? (
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-dark-900" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                {t("subscription.reactivate")}
              </button>
            ) : (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="py-2 px-4 border border-red-700 rounded-md shadow-sm text-sm font-medium text-red-400 hover:bg-red-900/20 focus:outline-none"
              >
                {t("subscription.cancel")}
              </button>
            )}

            <a
              href="/api/customer-portal"
              className="py-2 px-4 border border-violet-700/30 rounded-md shadow-sm text-sm font-medium text-gray-300 hover:bg-violet-900/20 focus:outline-none"
            >
              {t("subscription.managePayment")}
            </a>
          </div>
        </div>
      </div>

      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-dark-800 p-6 rounded-lg border border-dark-700 max-w-md w-full">
            <h3 className="text-xl font-medium text-gray-200 mb-2">{t("subscription.confirmCancel")}</h3>
            <p className="text-gray-400 mb-4">{t("subscription.cancelWarning")}</p>

            {subscription.isTrialing ? (
              <p className="text-sm bg-blue-900/20 border border-blue-700/30 rounded-md p-3 mb-4 text-blue-300">
                {t("subscription.trialCancelInfo")}
              </p>
            ) : (
              <p className="text-sm bg-yellow-900/20 border border-yellow-700/30 rounded-md p-3 mb-4 text-yellow-300">
                {t("subscription.paidCancelInfo")}
              </p>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="py-2 px-4 border border-violet-700/30 rounded-md shadow-sm text-sm font-medium text-gray-300 hover:bg-violet-900/20 focus:outline-none"
              >
                {t("common.keepSubscription")}
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={cancelLoading}
                className="py-2 px-4 border border-red-700 rounded-md shadow-sm text-sm font-medium text-red-400 hover:bg-red-900/20 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {cancelLoading && <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-400" />}
                {t("common.confirmCancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SubscriptionSettings
