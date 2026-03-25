import { NextRequest, NextResponse } from 'next/server'

interface ContactFormData {
  name: string
  email: string
  message: string
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function sanitize(str: string): string {
  return str.trim().replace(/[<>]/g, '')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, message } = body as Partial<ContactFormData>

    // Validation
    const errors: Record<string, string> = {}

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters'
    }

    if (!email || typeof email !== 'string' || !isValidEmail(email.trim())) {
      errors.email = 'Please provide a valid email address'
    }

    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      errors.message = 'Message must be at least 10 characters'
    }

    if (name && name.trim().length > 100) {
      errors.name = 'Name must be under 100 characters'
    }

    if (message && message.trim().length > 5000) {
      errors.message = 'Message must be under 5000 characters'
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 })
    }

    const sanitizedData = {
      name: sanitize(name!),
      email: sanitize(email!),
      message: sanitize(message!),
      submittedAt: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown',
    }

    // Log to console (in production, this would send an email or write to a DB)
    console.log('[Contact Form Submission]', {
      name: sanitizedData.name,
      email: sanitizedData.email,
      message: sanitizedData.message.slice(0, 100) + (sanitizedData.message.length > 100 ? '...' : ''),
      submittedAt: sanitizedData.submittedAt,
    })

    // In production you would:
    // - Send an email via Resend/SendGrid/SES
    // - Store in a database
    // - Trigger a webhook/Slack notification
    // Example: await sendEmail({ to: 'alex.mercer@devcraft.io', ...sanitizedData })

    return NextResponse.json(
      {
        success: true,
        message: "Thanks for reaching out! I'll get back to you within 24 hours.",
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[/api/contact] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process contact form. Please try again.' },
      { status: 500 }
    )
  }
}
