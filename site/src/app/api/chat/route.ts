import { NextRequest, NextResponse } from 'next/server'
import { anthropic } from '@/lib/anthropic'
import { SYSTEM_PROMPT } from '@/lib/prompts'
import { MAX_CHAT_MESSAGES } from '@/lib/constants'

type MessageRole = 'user' | 'assistant'

interface ChatMessage {
  role: MessageRole
  content: string
}

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages } = body as { messages: ChatMessage[] }

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid request: messages array required' }, { status: 400 })
    }

    // Rate limiting via cookie
    const cookieStore = request.cookies
    const msgCountCookie = cookieStore.get('msg_count')
    const msgCount = msgCountCookie ? parseInt(msgCountCookie.value, 10) : 0

    if (msgCount >= MAX_CHAT_MESSAGES) {
      return NextResponse.json(
        {
          error: 'Rate limit reached. You have used all 10 free messages for this session.',
          rateLimitReached: true,
        },
        { status: 429 }
      )
    }

    // Validate and sanitize messages
    const validMessages: ChatMessage[] = messages
      .filter(
        (msg): msg is ChatMessage =>
          msg &&
          typeof msg === 'object' &&
          (msg.role === 'user' || msg.role === 'assistant') &&
          typeof msg.content === 'string' &&
          msg.content.trim().length > 0
      )
      .slice(-20) // Keep last 20 messages to avoid token limits
      .map((msg) => ({
        role: msg.role,
        content: msg.content.trim().slice(0, 4000), // Limit individual message length
      }))

    if (validMessages.length === 0) {
      return NextResponse.json({ error: 'No valid messages provided' }, { status: 400 })
    }

    // Create a streaming response using ReadableStream
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const anthropicStream = await anthropic.messages.stream({
            model: 'claude-sonnet-4-6',
            max_tokens: 500,
            system: SYSTEM_PROMPT,
            messages: validMessages,
          })

          for await (const chunk of anthropicStream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              const data = JSON.stringify({ text: chunk.delta.text })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            }
          }

          // Send done signal
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (streamError) {
          const errorMessage =
            streamError instanceof Error ? streamError.message : 'Stream error occurred'
          const errorData = JSON.stringify({ error: errorMessage })
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
          controller.close()
        }
      },
    })

    const response = new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
        'X-Messages-Remaining': String(MAX_CHAT_MESSAGES - msgCount - 1),
      },
    })

    // Update rate limit cookie
    const newCount = msgCount + 1
    const cookieMaxAge = 60 * 60 * 24 // 24 hours
    response.headers.append(
      'Set-Cookie',
      `msg_count=${newCount}; Path=/; Max-Age=${cookieMaxAge}; HttpOnly; SameSite=Strict`
    )

    return response
  } catch (error) {
    console.error('[/api/chat] Error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// Handle preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      Allow: 'POST, OPTIONS',
    },
  })
}
