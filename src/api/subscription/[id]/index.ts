import type { NextApiRequest, NextApiResponse } from "next"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const { id } = req.query

    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Subscription ID is required" })
    }

    // Get subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(id)

    return res.status(200).json({
      id: subscription.id,
      status: subscription.status,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end,
      cancel_at: subscription.cancel_at,
      cancel_at_period_end: subscription.cancel_at_period_end,
      trial_start: subscription.trial_start,
      trial_end: subscription.trial_end,
    })
  } catch (error) {
    console.error("Error retrieving subscription:", error)
    return res.status(500).json({ error: "Failed to retrieve subscription" })
  }
}
