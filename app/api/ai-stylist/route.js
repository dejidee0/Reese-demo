import { NextResponse } from 'next/server'
import { getStyleAdvice } from '@/lib/openai'

export async function POST(request) {
  try {
    const { query, userProfile } = await request.json()
    
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }
    
    const advice = await getStyleAdvice(query, userProfile)
    
    return NextResponse.json({ advice })
  } catch (error) {
    console.error('AI Stylist error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}