export const initializePaystack = (email, amount, onSuccess, onClose) => {
  const handler = PaystackPop.setup({
    key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
    email,
    amount: amount * 100, // Convert to kobo
    currency: 'NGN',
    callback: (response) => {
      onSuccess(response)
    },
    onClose: () => {
      onClose()
    }
  })
  
  handler.openIframe()
}

export const verifyPayment = async (reference) => {
  try {
    const response = await fetch(`/api/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reference })
    })
    
    return await response.json()
  } catch (error) {
    console.error('Error verifying payment:', error)
    return { success: false, error: error.message }
  }
}