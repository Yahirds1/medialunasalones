import { auth, firebaseConfigured } from './firebaseClient'

const BACKEND_URL = (
  import.meta.env.VITE_STRIPE_BACKEND_URL
  || import.meta.env.VITE_BACKEND_URL
  || 'http://localhost:4242'
).replace(/\/$/, '')

const authenticatedRequest = async (path, options = {}) => {
  if (!firebaseConfigured || !auth?.currentUser) {
    throw new Error('Stripe requiere una sesión real de Firebase. Configura Firebase e inicia sesión.')
  }

  const token = await auth.currentUser.getIdToken()
  const response = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.error || 'No se pudo comunicar con el servicio de pagos.')
  return body
}

export const createStripeCheckout = (payload) => authenticatedRequest('/stripe/checkout-session', {
  method: 'POST',
  body: JSON.stringify(payload),
})

export const syncStripeCheckout = (sessionId) => authenticatedRequest(`/stripe/checkout-session/${encodeURIComponent(sessionId)}`)
