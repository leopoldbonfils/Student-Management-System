import 'server-only'
import { Resend } from 'resend'

const resendApiKey = process.env.RESEND_API_KEY || ''
const resend = resendApiKey ? new Resend(resendApiKey) : null
const fromEmail = process.env.RESEND_FROM_EMAIL || 'EduPortal <onboarding@resend.dev>'

interface SendStudentCredentialsParams {
  name: string
  email: string
  password: string
  loginUrl?: string
}

export async function sendStudentCredentials({
  name,
  email,
  password,
  loginUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000') + '/login',
}: SendStudentCredentialsParams) {
  if (!resend) {
    console.warn('RESEND_API_KEY is not configured. Email will not be sent to:', email)
    return { success: false, warning: 'Email provider not configured' }
  }

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #f9fafb; border-radius: 12px;">
      <div style="background-color: #ffffff; padding: 32px; border-radius: 8px; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
        <h2 style="color: #111827; margin-top: 0; font-size: 22px;">Welcome to EduPortal</h2>
        <p style="color: #374151; font-size: 15px; line-height: 1.5;">Hello <strong>${name}</strong>,</p>
        <p style="color: #374151; font-size: 15px; line-height: 1.5;">Your student account has been created by your institution. You can now log in to the student portal using the credentials below:</p>
        
        <div style="background-color: #f3f4f6; border-left: 4px solid #4f46e5; padding: 16px; margin: 24px 0; border-radius: 4px;">
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #4b5563;"><strong>Login Email:</strong></p>
          <p style="margin: 0 0 16px 0; font-size: 15px; color: #111827; font-family: monospace;">${email}</p>
          
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #4b5563;"><strong>Temporary Password:</strong></p>
          <p style="margin: 0 0 0 0; font-size: 16px; color: #111827; font-family: monospace; font-weight: bold; background: #e5e7eb; display: inline-block; padding: 4px 10px; border-radius: 4px;">${password}</p>
        </div>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${loginUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; display: inline-block;">
            Log in to EduPortal
          </a>
        </div>

        <p style="color: #b91c1c; font-size: 13px; margin-top: 24px; font-weight: 500;">
          Important: Please log in using these credentials and change your password immediately after your first login via the Settings page.
        </p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px; margin-bottom: 0;">Thank you,<br/>EduPortal Student Management System</p>
      </div>
    </div>
  `

  const textContent = `
Welcome to the Student Management System

Hello ${name},

Your student account has been created.

Login Email:
${email}

Temporary Password:
${password}

Login:
${loginUrl}

Please log in using these credentials and change your password after your first login.

Thank you.
  `.trim()

  const { data, error } = await resend.emails.send({
    from: fromEmail,
    to: [email],
    subject: 'Your EduPortal Student Account Credentials',
    text: textContent,
    html: htmlContent,
  })

  if (error) {
    console.error('Resend email error:', error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}
