// lib/gemini-server.ts
// Server-only Gemini client using OpenAI-compatible endpoint
// API key is rotated from a pool to maximize efficiency and bypass rate limits.

import type { GeminiFunction, GeminiMessage, GeminiRequest, GeminiResponse } from './gemini-client'

export const MODEL_MAIN = 'gemini-3.8-flash'
export const MODEL_FAST = 'gemini-3.8-flash'

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions'
const MAX_RETRIES = 2

export class GeminiServerClient {
  private apiKeys: string[]

  constructor() {
    const keysRaw = process.env.GEMINI_API_KEYS || ''
    this.apiKeys = keysRaw.split(',').map(k => k.trim()).filter(Boolean)
    
    if (this.apiKeys.length === 0) {
      throw new Error('GEMINI_API_KEYS is not configured on the server')
    }
  }

  private getRandomApiKey(): string {
    const randomIndex = Math.floor(Math.random() * this.apiKeys.length)
    return this.apiKeys[randomIndex]
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async generateContent(
    messages: GeminiMessage[],
    functions: GeminiFunction[],
    systemPrompt?: string,
    maxTokens: number = 512,
    model: string = MODEL_MAIN,
  ): Promise<{ text: string; functionCalls?: Array<{ name: string; args: Record<string, unknown> }> }> {
    const allMessages: GeminiMessage[] = []
    if (systemPrompt) {
      allMessages.push({ role: 'system', content: systemPrompt })
    }
    allMessages.push(...messages.filter(m => m.role !== 'system'))

    const requestBody: GeminiRequest = {
      model,
      messages: allMessages,
      tools: functions.length > 0 ? functions.map(f => ({ type: 'function', function: f })) : undefined,
      tool_choice: functions.length > 0 ? 'auto' : undefined, // Gemini OpenAI endpoint may prefer undefined instead of 'none' when tools is absent
      temperature: 0.5,
      max_tokens: maxTokens,
      top_p: 0.9,
    }

    let lastError: Error | null = null

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const apiKey = this.getRandomApiKey()
        const response = await fetch(GEMINI_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(requestBody),
          signal: AbortSignal.timeout(15000), // Wait up to 15s
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Gemini API error: ${response.status} — ${errorText}`)
        }

        const data: GeminiResponse = await response.json()
        const choice = data.choices?.[0]

        if (!choice?.message) {
          throw new Error('Empty response from Gemini')
        }

        if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
          const toolCall = choice.message.tool_calls[0]
          return {
            text: choice.message.content || '',
            functionCalls: [{
              name: toolCall.function.name,
              args: JSON.parse(toolCall.function.arguments) as Record<string, unknown>,
            }],
          }
        }

        return {
          text: choice.message.content || '',
          functionCalls: undefined,
        }
      } catch (error) {
        lastError = error as Error
        if (attempt < MAX_RETRIES) {
          const delay = 1000 * Math.pow(2, attempt) + Math.random() * 300
          await this.sleep(delay)
        }
      }
    }

    throw lastError || new Error('Max retries exceeded')
  }

  async generateText(
    prompt: string,
    systemPrompt?: string,
    maxTokens = 256,
    model = MODEL_MAIN,
  ): Promise<string> {
    const result = await this.generateContent(
      [{ role: 'user', content: prompt }],
      [],
      systemPrompt,
      maxTokens,
      model,
    )
    return result.text
  }
}

let geminiServerClient: GeminiServerClient | null = null

export function getGeminiServerClient(): GeminiServerClient {
  if (!geminiServerClient) {
    geminiServerClient = new GeminiServerClient()
  }
  return geminiServerClient
}
