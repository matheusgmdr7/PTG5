import type { NextApiRequest, NextApiResponse } from "next"
import Stripe from "stripe"
import { supabase } from "../../../lib/supabase"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const { id } = req.query

    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Subscription ID is required" })
    }

    // Cancel the subscription at period end
    const subscription = await stripe.subscriptions.update(id, {
      cancel_at_period_end: true,
    })

    // Update user profile in Supabase
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        subscription_status: "canceled",
      })
      .eq("subscription_id", id)

    if (updateError) {
      console.error("Error updating user profile:", updateError)
    }

    return res.status(200).json({
      id: subscription.id,
      status: subscription.status,
      cancel_at: subscription.cancel_at,
      cancel_at_period_end: subscription.cancel_at_period_end,
    })
  } catch (error) {
    console.error("Error canceling subscription:", error)
    return res.status(500).json({ error: "Failed to cancel subscription" })
  }
}
