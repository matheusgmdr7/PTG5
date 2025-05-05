import Stripe from "stripe"

// Inicializar o Stripe com a chave secreta
const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16", // Use a versão mais recente da API
})

export async function POST(request) {
  try {
    const { paymentMethodId, customerId, priceId, email, trial_period_days } = await request.json()

    // Verificar se todos os campos necessários estão presentes
    if (!paymentMethodId || !customerId || !priceId || !email) {
      return new Response(JSON.stringify({ error: "Dados incompletos" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    console.log(`Criando assinatura para o cliente ${customerId} com o plano ${priceId}`)

    // Verificar se o cliente já existe no Stripe
    let customer
    try {
      customer = await stripe.customers.retrieve(customerId)
      // Se o cliente existe, atualize os dados
      customer = await stripe.customers.update(customerId, {
        email,
        metadata: {
          supabaseId: customerId,
        },
      })
    } catch (error) {
      // Se o cliente não existe, crie um novo
      customer = await stripe.customers.create({
        id: customerId,
        email,
        metadata: {
          supabaseId: customerId,
        },
      })
    }

    // Anexar o método de pagamento ao cliente
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customer.id,
    })

    // Definir como método de pagamento padrão
    await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    })

    // Criar a assinatura com período de teste
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      trial_period_days: trial_period_days || 7,
      expand: ["latest_invoice.payment_intent"],
    })

    console.log(`Assinatura criada com sucesso: ${subscription.id}`)

    return new Response(
      JSON.stringify({
        id: subscription.id,
        status: subscription.status,
        client_secret: subscription.latest_invoice?.payment_intent?.client_secret,
        trial_end: subscription.trial_end,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("Erro ao criar assinatura:", error)
    return new Response(
      JSON.stringify({
        error: `Erro ao criar assinatura: ${error.message}`,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}

export default { POST }
