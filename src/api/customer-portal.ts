import type { NextApiRequest, NextApiResponse } from "next"
import Stripe from "stripe"
import { supabase } from "../lib/supabase"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    // Get the current user from the session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    // Get the user's Stripe customer ID from Supabase
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", session.user.id)
      .single()

    if (profileError || !profile?.stripe_customer_id) {
      return res.status(400).json({ error: "No Stripe customer found for this user" })
    }

    // Create a Stripe customer portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${req.headers.origin}/dashboard/settings`,
    })

    // Redirect to the customer portal
    res.redirect(303, portalSession.url)
  } catch (error) {
    console.error("Error creating customer portal session:", error)
    return res.status(500).json({ error: "Failed to create customer portal session" })
  }
}
