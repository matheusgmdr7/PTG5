import { loadStripe } from "@stripe/stripe-js"

// Função para verificar se a chave do Stripe está disponível
export const checkStripeKey = (): boolean => {
  const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  if (!stripeKey) {
    console.error("Stripe publishable key is missing. Please check your environment variables.")
    return false
  }

  if (!stripeKey.startsWith("pk_")) {
    console.error('Invalid Stripe publishable key format. Keys should start with "pk_"')
    return false
  }

  return true
}

// Função para carregar o Stripe com tratamento de erro
export const initializeStripe = async () => {
  try {
    if (!checkStripeKey()) {
      throw new Error("Missing or invalid Stripe key")
    }

    const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "")
    if (!stripe) {
      throw new Error("Failed to initialize Stripe")
    }

    console.log("Stripe initialized successfully")
    return stripe
  } catch (error) {
    console.error("Error initializing Stripe:", error)
    return null
  }
}

// Exporta uma versão da função que pode ser usada como promessa
export const getStripePromise = () => {
  if (!checkStripeKey()) {
    console.warn("Using empty Stripe promise due to missing or invalid key")
    return Promise.resolve(null)
  }

  return loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "")
}
