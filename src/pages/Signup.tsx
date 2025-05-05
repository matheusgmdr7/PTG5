"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Shield, Loader2, CheckCircle, ArrowRight, CreditCard } from "lucide-react"
import { useAuthStore } from "../store/authStore"
import { toast } from "react-toastify"
import { supabase } from "../lib/supabase"
import { getStripePromise, checkStripeConfig } from "../lib/stripe"

// Subscription plan options
const plans = [
  {
    id: "prod_SFlBsMxzwqtYS3", // Substitua pelo ID real do plano Essencial no Stripe
    name: "Plano Essencial",
    price: "R$99",
    interval: "mês",
    features: [
      "7 dias grátis, sem compromisso",
      "Gerenciamento de risco básico",
      "Análise de comportamento",
      "Estatísticas de trading",
      "Até 100 operações/mês",
    ],
  },
  {
    id: "prod_SFlBfdWfnVEHb7", // Substitua pelo ID real do plano Premium no Stripe
    name: "Plano Premium",
    price: "R$149",
    interval: "mês",
    features: [
      "7 dias grátis, sem compromisso",
      "Gerenciamento de risco avançado",
      "Análise comportamental detalhada",
      "Recomendações personalizadas",
      "Operações ilimitadas",
      "Alertas em tempo real",
    ],
    recommended: true,
  },
]

// Componente de formulário de cartão manual
const ManualCardForm = ({ onSubmit, isProcessing }) => {
  const [cardNumber, setCardNumber] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvc, setCardCvc] = useState("")
  const [cardName, setCardName] = useState("")
  const [errors, setErrors] = useState({})

  // Formatação do número do cartão
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(" ")
    } else {
      return value
    }
  }

  // Formatação da data de expiração
  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")

    if (v.length >= 3) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`
    }

    return value
  }

  // Validação do formulário
  const validateForm = () => {
    const newErrors = {}

    if (!cardNumber || cardNumber.replace(/\s+/g, "").length < 16) {
      newErrors.cardNumber = "Número de cartão inválido"
    }

    if (!cardExpiry || !cardExpiry.includes("/")) {
      newErrors.cardExpiry = "Data de expiração inválida"
    }

    if (!cardCvc || cardCvc.length < 3) {
      newErrors.cardCvc = "CVC inválido"
    }

    if (!cardName) {
      newErrors.cardName = "Nome no cartão é obrigatório"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (validateForm()) {
      // Parse expiry date
      const [expMonth, expYear] = cardExpiry.split("/")

      onSubmit({
        cardNumber: cardNumber.replace(/\s+/g, ""),
        cardExpMonth: Number.parseInt(expMonth, 10),
        cardExpYear: Number.parseInt(expYear, 10) + 2000, // Assumindo 20xx
        cardCvc,
        cardName,
      })
    }
  }

  const [cvc, setCvc] = useState("")

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="card-name" className="block text-sm font-medium text-gray-300">
          Nome no Cartão
        </label>
        <input
          id="card-name"
          type="text"
          placeholder="Nome como aparece no cartão"
          value={cardName}
          onChange={(e) => setCardName(e.target.value)}
          className={`mt-1 block w-full px-4 py-3 bg-black/40 backdrop-blur-sm border ${
            errors.cardName ? "border-red-500" : "border-blue-900/30"
          } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-200 placeholder-gray-500 transition-colors`}
        />
        {errors.cardName && <p className="mt-1 text-xs text-red-500">{errors.cardName}</p>}
      </div>

      <div>
        <label htmlFor="card-number" className="block text-sm font-medium text-gray-300">
          Número do Cartão
        </label>
        <div className="relative">
          <input
            id="card-number"
            type="text"
            placeholder="1234 5678 9012 3456"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            maxLength={19}
            className={`mt-1 block w-full px-4 py-3 bg-black/40 backdrop-blur-sm border ${
              errors.cardNumber ? "border-red-500" : "border-blue-900/30"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-200 placeholder-gray-500 transition-colors`}
          />
          <CreditCard className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
        </div>
        {errors.cardNumber && <p className="mt-1 text-xs text-red-500">{errors.cardNumber}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="card-expiry" className="block text-sm font-medium text-gray-300">
            Data de Expiração
          </label>
          <input
            id="card-expiry"
            type="text"
            placeholder="MM/AA"
            value={cardExpiry}
            onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
            maxLength={5}
            className={`mt-1 block w-full px-4 py-3 bg-black/40 backdrop-blur-sm border ${
              errors.cardExpiry ? "border-red-500" : "border-blue-900/30"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-200 placeholder-gray-500 transition-colors`}
          />
          {errors.cardExpiry && <p className="mt-1 text-xs text-red-500">{errors.cardExpiry}</p>}
        </div>

        <div>
          <label htmlFor="card-cvc" className="block text-sm font-medium text-gray-300">
            CVC
          </label>
          <input
            id="card-cvc"
            type="text"
            placeholder="123"
            value={cardCvc}
            onChange={(e) => setCvc(e.target.value.replace(/[^0-9]/g, ""))}
            maxLength={4}
            className={`mt-1 block w-full px-4 py-3 bg-black/40 backdrop-blur-sm border ${
              errors.cardCvc ? "border-red-500" : "border-blue-900/30"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-200 placeholder-gray-500 transition-colors`}
          />
          {errors.cardCvc && <p className="mt-1 text-xs text-red-500">{errors.cardCvc}</p>}
        </div>
      </div>

      <div className="text-xs text-gray-400">
        <p>Você não será cobrado durante os 7 dias de teste. Cancele a qualquer momento.</p>
        <p className="mt-1">Seus dados de pagamento estão seguros e criptografados.</p>
      </div>

      <button
        type="submit"
        disabled={isProcessing}
        className="w-full px-4 py-3 bg-gradient-to-r from-blue-800 to-green-800 hover:from-blue-700 hover:to-green-700 text-white rounded-lg transition-all duration-300 font-medium relative overflow-hidden group shadow-md hover:shadow-lg hover:shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <span className="flex items-center justify-center">
            <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
            Processando...
          </span>
        ) : (
          <span className="flex items-center justify-center">
            Começar período gratuito
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" size={18} />
          </span>
        )}
      </button>
    </form>
  )
}

// Componente principal de Signup
const Signup: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { signup, user, isLoading, error } = useAuthStore()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [step, setStep] = useState(1)
  const [selectedPlan, setSelectedPlan] = useState(plans[1]) // Default to premium plan
  const [subscription, setSubscription] = useState(null)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [stripeError, setStripeError] = useState("")
  const [stripeInitialized, setStripeInitialized] = useState(false)

  // Verificar configuração do Stripe
  useEffect(() => {
    const isConfigured = checkStripeConfig()
    if (!isConfigured) {
      toast.error("Configuração do Stripe incompleta. Entre em contato com o suporte.")
      setStripeError("Configuração do Stripe incompleta")
    } else {
      // Tenta inicializar o Stripe
      getStripePromise()
        .then((stripe) => {
          if (stripe) {
            console.log("Stripe inicializado com sucesso")
            setStripeInitialized(true)
          } else {
            console.error("Falha ao inicializar o Stripe")
            setStripeError("Falha ao inicializar o Stripe")
          }
        })
        .catch((err) => {
          console.error("Erro ao inicializar o Stripe:", err)
          setStripeError(`Erro ao inicializar o Stripe: ${err.message}`)
        })
    }
  }, [])

  useEffect(() => {
    // If user is already logged in and has completed signup, redirect to dashboard
    if (user && subscription) {
      navigate("/dashboard")
    }
  }, [user, subscription, navigate])

  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password || !confirmPassword) {
      toast.error("Por favor, preencha todos os campos obrigatórios")
      return
    }

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem")
      return
    }

    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres")
      return
    }

    try {
      await signup(email, password, fullName)
      setStep(2) // Move to plan selection
    } catch (err: any) {
      // Error is already handled in the store
    }
  }

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan)
    setStep(3) // Move to payment details
  }

  const handleCardSubmit = async (cardData) => {
    setIsProcessingPayment(true)
    setStripeError("")

    try {
      // Obter o Stripe
      const stripe = await getStripePromise()

      if (!stripe) {
        throw new Error("Não foi possível inicializar o Stripe")
      }

      // Criar método de pagamento
      const { paymentMethod, error: paymentMethodError } = await stripe.createPaymentMethod({
        type: "card",
        card: {
          number: cardData.cardNumber,
          exp_month: cardData.cardExpMonth,
          exp_year: cardData.cardExpYear,
          cvc: cardData.cardCvc,
        },
        billing_details: {
          name: cardData.cardName,
          email: user.email,
        },
      })

      if (paymentMethodError) {
        throw new Error(`Erro no cartão: ${paymentMethodError.message}`)
      }

      // Criar assinatura
      const response = await fetch("/api/create-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          customerId: user.id,
          priceId: selectedPlan.id,
          email: user.email,
          trial_period_days: 7,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Erro na API: ${response.status} - ${errorText}`)
      }

      const subscription = await response.json()

      if (subscription.error) {
        throw new Error(`Erro na assinatura: ${subscription.error}`)
      }

      // Processar resultado da assinatura
      if (subscription.status === "active" || subscription.status === "trialing") {
        // Atualizar perfil do usuário
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            subscription_id: subscription.id,
            subscription_status: subscription.status,
            trial_end: subscription.trial_end,
            plan_id: selectedPlan.id,
          })
          .eq("id", user.id)

        if (updateError) {
          console.error("Erro ao atualizar perfil:", updateError)
        }

        toast.success("Sua assinatura foi ativada com sucesso!")
        setSubscription(subscription)
        setStep(4) // Move to success step
      } else if (subscription.status === "incomplete") {
        // Lidar com autenticação adicional se necessário
        const { error: confirmError } = await stripe.confirmCardPayment(subscription.client_secret)

        if (confirmError) {
          throw new Error(`Erro na confirmação: ${confirmError.message}`)
        } else {
          toast.success("Sua assinatura foi ativada com sucesso!")
          setSubscription(subscription)
          setStep(4) // Move to success step
        }
      }
    } catch (error) {
      console.error("Erro no processamento do pagamento:", error)
      toast.error(error.message || "Ocorreu um erro ao processar seu pagamento")
      setStripeError(error.message || "Erro no processamento do pagamento")
    } finally {
      setIsProcessingPayment(false)
    }
  }

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

          {step === 1 && (
            <>
              <h2 className="text-2xl font-bold mb-6 text-center text-white">Cadastro</h2>

              {/* Formulário */}
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-300">
                    Nome Completo
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-1 block w-full px-4 py-3 bg-black/40 backdrop-blur-sm border border-violet-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-gray-200 placeholder-gray-500 transition-colors"
                    placeholder="Seu nome completo"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                    E-mail *
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
                    Senha *
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 block w-full px-4 py-3 bg-black/40 backdrop-blur-sm border border-violet-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-gray-200 placeholder-gray-500 transition-colors"
                    placeholder="••••••••"
                  />
                  <p className="mt-1 text-xs text-gray-400">Mínimo de 6 caracteres</p>
                </div>

                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-300">
                    Confirmar Senha *
                  </label>
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 block w-full px-4 py-3 bg-black/40 backdrop-blur-sm border border-violet-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-gray-200 placeholder-gray-500 transition-colors"
                    placeholder="••••••••"
                  />
                </div>

                {/* Botões */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-800 to-green-800 hover:from-blue-700 hover:to-green-700 text-white rounded-lg transition-all duration-300 font-medium relative overflow-hidden group shadow-md hover:shadow-lg hover:shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                        Carregando...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        Continuar
                        <ArrowRight
                          className="ml-2 group-hover:translate-x-1 transition-transform duration-300"
                          size={18}
                        />
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-2xl font-bold mb-6 text-center text-white">Escolha seu Plano</h2>
              <div className="space-y-4">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative p-4 border rounded-lg cursor-pointer transition-all ${
                      plan.recommended
                        ? "border-blue-700 bg-blue-900/20"
                        : "border-blue-900/30 bg-black/40 hover:border-blue-700"
                    }`}
                    onClick={() => handlePlanSelect(plan)}
                  >
                    {plan.recommended && (
                      <div className="absolute -top-3 -right-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                        RECOMENDADO
                      </div>
                    )}
                    <div className="text-lg font-medium text-white">{plan.name}</div>
                    <div className="mt-1">
                      <span className="text-2xl font-bold text-blue-400">{plan.price}</span>
                      <span className="text-sm text-gray-400">/{plan.interval}</span>
                    </div>
                    <ul className="mt-3 space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span className="text-sm text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-2xl font-bold mb-6 text-center text-white">Dados de Pagamento</h2>
              <div className="mb-6 p-4 border border-blue-900/30 rounded-lg bg-black/40 backdrop-blur-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-white">{selectedPlan.name}</h3>
                    <p className="text-sm text-gray-400">
                      7 dias grátis, depois {selectedPlan.price}/{selectedPlan.interval}
                    </p>
                  </div>
                  <button onClick={() => setStep(2)} className="text-sm text-blue-400 hover:text-blue-300 underline">
                    Alterar
                  </button>
                </div>
              </div>

              {stripeError && (
                <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  <p>{stripeError}</p>
                  <p className="mt-1 text-xs">Se o problema persistir, entre em contato com o suporte.</p>
                </div>
              )}

              {/* Formulário de cartão manual */}
              <ManualCardForm onSubmit={handleCardSubmit} isProcessing={isProcessingPayment} />
            </>
          )}

          {step === 4 && (
            <>
              <h2 className="text-2xl font-bold mb-6 text-center text-white">Cadastro Concluído!</h2>
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="rounded-full bg-gradient-to-r from-blue-800/20 to-green-800/20 p-3">
                    <CheckCircle className="h-12 w-12 text-green-500" />
                  </div>
                </div>
                <h3 className="text-xl font-medium text-white mb-2">Obrigado por se cadastrar!</h3>
                <p className="text-gray-400 mb-6">
                  Seu período de teste gratuito começou. Aproveite todos os recursos premium por 7 dias.
                </p>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-800 to-green-800 hover:from-blue-700 hover:to-green-700 text-white rounded-lg transition-all duration-300 font-medium relative overflow-hidden group shadow-md hover:shadow-lg hover:shadow-blue-600/20"
                >
                  <span className="flex items-center justify-center">
                    Ir para o Dashboard
                    <ArrowRight
                      className="ml-2 group-hover:translate-x-1 transition-transform duration-300"
                      size={18}
                    />
                  </span>
                </button>
              </div>
            </>
          )}

          {/* Links */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Já tem uma conta?{" "}
              <Link to="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup
