import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const getStyleAdvice = async (query, userProfile = {}) => {
  try {
    const systemPrompt = `
      You are a luxury streetwear stylist for ReeseBlanks, a premium fashion brand. 
      Your expertise spans high-end streetwear, luxury fashion, and cultural style trends.
      
      Brand aesthetic: Modern, bold, luxury streetwear with deep purple and electric orange accents.
      
      Provide concise, stylish advice that matches the brand's premium positioning.
      Keep responses under 200 words and focus on specific, actionable styling tips.
    `

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: `${query}\n\nUser tier: ${userProfile.tier || 'guest'}`
        }
      ],
      max_tokens: 200,
      temperature: 0.7
    })

    return completion.choices[0].message.content
  } catch (error) {
    console.error('Error getting style advice:', error)
    return "I'm having trouble connecting right now. Try asking about specific pieces or styling tips!"
  }
}

export const generateOutfitCaption = async (outfit) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Generate a cool, short caption for this streetwear outfit. Keep it under 50 words and make it Instagram-worthy."
        },
        {
          role: "user",
          content: `Outfit: ${outfit.description}`
        }
      ],
      max_tokens: 50,
      temperature: 0.8
    })

    return completion.choices[0].message.content
  } catch (error) {
    console.error('Error generating caption:', error)
    return "Fresh fit, no cap 🔥"
  }
}