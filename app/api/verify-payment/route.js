import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request) {
  try {
    const { reference } = await request.json()
    
    // Verify payment with Paystack
    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )
    
    const paymentData = await paystackResponse.json()
    
    if (paymentData.status && paymentData.data.status === 'success') {
      // Update order status in database
      const { data: order, error } = await supabase
        .from('orders')
        .update({ 
          status: 'paid',
          payment_reference: reference 
        })
        .eq('payment_reference', reference)
        .select()
        .single()
      
      if (error) {
        console.error('Error updating order:', error)
        return NextResponse.json({ success: false, error: error.message })
      }
      
      return NextResponse.json({ 
        success: true, 
        order,
        payment: paymentData.data 
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Payment verification failed' 
      })
    }
  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    })
  }
}