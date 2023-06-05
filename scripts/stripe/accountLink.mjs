// See your keys here: https://dashboard.stripe.com/apikeys
import Stripe from 'stripe'
import dotenv from 'dotenv'

dotenv.config()

const stripe = new Stripe(process.env.STRIPE_API_KEY)

;(async () => {
  const account = await stripe.accounts.create({
    type: 'express',
  })

  console.log('account', { account })

  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: 'https://example.com/reauth',
    return_url: 'https://example.com/return',
    type: 'account_onboarding',
  })

  console.log('accountLink', { accountLink })

  console.log('Link is', accountLink.url)
})()
