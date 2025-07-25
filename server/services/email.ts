import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '')

interface EmailData {
  to: string
  subject: string
  type: 'confirmation' | 'status_update' | 'ready_for_pickup' | 'completion'
  data: {
    customerName: string
    orderId: string
    deviceInfo: string
    currentStage?: string
    estimatedCompletion?: string | null
    notes?: string
    totalAmount?: number
    issueDescription?: string
  }
}

const businessInfo = {
  name: process.env.BUSINESS_NAME || 'IFIXANDREPAIR - FOREST PARK WALMART',
  address: process.env.BUSINESS_ADDRESS || '1300 Des Plaines Ave, Forest Park, IL 60130',
  phone: process.env.BUSINESS_PHONE || '(872) 222-3111',
  email: process.env.BUSINESS_EMAIL || 'forestpark@ifixandrepair.com',
  hours: process.env.BUSINESS_HOURS || '9AM-8PM everyday'
}

function generateEmailTemplate(type: string, data: any): { html: string; text: string } {
  const baseStyle = `
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
      .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; }
      .info-box { background: white; padding: 15px; margin: 15px 0; border-radius: 6px; border-left: 4px solid #667eea; }
      .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
      .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
      .status-received { background: #e3f2fd; color: #1976d2; }
      .status-diagnostic { background: #fff3e0; color: #f57c00; }
      .status-repair { background: #f3e5f5; color: #7b1fa2; }
      .status-waiting-for-parts { background: #ffebee; color: #c62828; }
      .status-testing { background: #e8f5e8; color: #2e7d32; }
      .status-ready { background: #e8f5e8; color: #2e7d32; }
      .status-delivered { background: #f1f8e9; color: #558b2f; }
      .status-completed { background: #e8f5e8; color: #2e7d32; }
    </style>
  `

  switch (type) {
    case 'confirmation':
      return {
        html: `
          ${baseStyle}
          <div class="header">
            <h1>🛠️ ${businessInfo.name}</h1>
            <p>Repair Request Confirmed</p>
          </div>
          <div class="content">
            <h2>Hello ${data.customerName}!</h2>
            <p>Thank you for choosing our repair services. We have received your device and created your repair order.</p>
            
            <div class="info-box">
              <h3>📋 Order Details</h3>
              <p><strong>Order ID:</strong> ${data.orderId}</p>
              <p><strong>Device:</strong> ${data.deviceInfo}</p>
              <p><strong>Issue:</strong> ${data.issueDescription}</p>
              <p><strong>Total Amount:</strong> $${data.totalAmount}</p>
              <p><strong>Status:</strong> <span class="status-badge status-received">Received</span></p>
            </div>

            <div class="info-box">
              <h3>📱 What's Next?</h3>
              <p>Our technicians will begin the diagnostic process and keep you updated via SMS and email throughout the repair process.</p>
              <p><strong>Estimated Timeline:</strong> ${data.estimatedCompletion}</p>
            </div>

            <div class="footer">
              <h3>📍 Store Information</h3>
              <p><strong>${businessInfo.name}</strong><br>
              ${businessInfo.address}<br>
              Phone: ${businessInfo.phone}<br>
              Email: ${businessInfo.email}<br>
              Hours: ${businessInfo.hours}</p>
            </div>
          </div>
        `,
        text: `
REPAIR REQUEST CONFIRMED - ${businessInfo.name}

Hello ${data.customerName}!

Thank you for choosing our repair services. We have received your device and created your repair order.

ORDER DETAILS:
- Order ID: ${data.orderId}
- Device: ${data.deviceInfo}
- Issue: ${data.issueDescription}
- Total Amount: $${data.totalAmount}
- Status: Received

WHAT'S NEXT:
Our technicians will begin the diagnostic process and keep you updated via SMS and email throughout the repair process.
Estimated Timeline: ${data.estimatedCompletion}

STORE INFORMATION:
${businessInfo.name}
${businessInfo.address}
Phone: ${businessInfo.phone}
Email: ${businessInfo.email}
Hours: ${businessInfo.hours}
        `
      }

    case 'status_update':
      return {
        html: `
          ${baseStyle}
          <div class="header">
            <h1>🔄 ${businessInfo.name}</h1>
            <p>Repair Status Update</p>
          </div>
          <div class="content">
            <h2>Hello ${data.customerName}!</h2>
            <p>We have an update on your device repair.</p>
            
            <div class="info-box">
              <h3>📋 Order Update</h3>
              <p><strong>Order ID:</strong> ${data.orderId}</p>
              <p><strong>Device:</strong> ${data.deviceInfo}</p>
              <p><strong>Current Status:</strong> <span class="status-badge status-${data.currentStage}">${data.currentStage?.replace('-', ' ')}</span></p>
              ${data.estimatedCompletion ? `<p><strong>Estimated Completion:</strong> ${data.estimatedCompletion}</p>` : ''}
              ${data.notes ? `<p><strong>Technician Notes:</strong> ${data.notes}</p>` : ''}
            </div>

            <div class="info-box">
              <h3>📱 Stay Updated</h3>
              <p>We'll continue to keep you informed as your repair progresses. Feel free to contact us if you have any questions!</p>
            </div>

            <div class="footer">
              <h3>📍 Store Information</h3>
              <p><strong>${businessInfo.name}</strong><br>
              ${businessInfo.address}<br>
              Phone: ${businessInfo.phone}<br>
              Email: ${businessInfo.email}<br>
              Hours: ${businessInfo.hours}</p>
            </div>
          </div>
        `,
        text: `
REPAIR STATUS UPDATE - ${businessInfo.name}

Hello ${data.customerName}!

We have an update on your device repair.

ORDER UPDATE:
- Order ID: ${data.orderId}
- Device: ${data.deviceInfo}
- Current Status: ${data.currentStage?.replace('-', ' ')}
${data.estimatedCompletion ? `- Estimated Completion: ${data.estimatedCompletion}` : ''}
${data.notes ? `- Technician Notes: ${data.notes}` : ''}

We'll continue to keep you informed as your repair progresses. Feel free to contact us if you have any questions!

STORE INFORMATION:
${businessInfo.name}
${businessInfo.address}
Phone: ${businessInfo.phone}
Email: ${businessInfo.email}
Hours: ${businessInfo.hours}
        `
      }

    default:
      return { html: '', text: '' }
  }
}

export async function sendEmail(emailData: EmailData): Promise<void> {
  try {
    const template = generateEmailTemplate(emailData.type, emailData.data)
    
    const msg = {
      to: emailData.to,
      from: {
        email: process.env.FROM_EMAIL || 'forestpark@ifixandrepair.com',
        name: businessInfo.name
      },
      subject: emailData.subject,
      text: template.text,
      html: template.html,
      // Always CC the auto email for repair communications
      cc: process.env.AUTO_CC_EMAIL || 'rawashdehomar1930@gmail.com'
    }

    await sgMail.send(msg)
    console.log(`Email sent successfully to ${emailData.to} (CC: ${msg.cc})`)
  } catch (error) {
    console.error('Email sending failed:', error)
    // Don't throw error to prevent breaking the workflow
  }
}