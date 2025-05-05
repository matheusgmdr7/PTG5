import { loadStripe } from "@stripe/stripe-js"

// Função para inicializar o Stripe com tratamento de erro
let stripePromiseInstance: Promise<any> | null = null

export const getStripePromise = () => {
  if (!stripePromiseInstance) {
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

    if (!key) {
      console.error("ERRO CRÍTICO: Chave pública do Stripe não encontrada no ambiente")
      return Promise.resolve(null)
    }

    console.log("Inicializando Stripe com a chave:", key.substring(0, 8) + "...")
    stripePromiseInstance = loadStripe(key)
  }

  return stripePromiseInstance
}

// Função para verificar se o Stripe está configurado corretamente
export const checkStripeConfig = () => {
  const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

  if (!key) {
    console.error("ERRO: Chave pública do Stripe não encontrada")
    return false
  }

  if (!key.startsWith("pk_")) {
    console.error("ERRO: Formato inválido da chave pública do Stripe")
    return false
  }

  return true
}
