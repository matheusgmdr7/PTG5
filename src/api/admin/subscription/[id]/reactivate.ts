import type { NextApiRequest, NextApiResponse } from "next"
import Stripe from "stripe"
import { supabase } from "../../../../lib/supabase"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    // Verify admin access
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    const { data: isAdmin } = await supabase.from("admins").select("id").eq("user_id", session.user.id).single()

    if (!isAdmin) {
      return res.status(403).json({ error: "Forbidden: Admin access required" })
    }

    const { id } = req.query
    const { userId } = req.body

    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Subscription ID is required" })
    }

    // Reactivate the subscription
    const subscription = await stripe.subscriptions.update(id, {
      cancel_at_period_end: false,
    })

    // Update user profile in Supabase
    if (userId) {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          subscription_status: subscription.status,
        })
        .eq("id", userId)

      if (updateError) {
        console.error("Error updating user profile:", updateError)
      }
    }

    return res.status(200).json({
      id: subscription.id,
      status: subscription.status,
    })
  } catch (error) {
    console.error("Error reactivating subscription:", error)
    return res.status(500).json({ error: "Failed to reactivate subscription" })
  }
}
