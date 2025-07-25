import twilio from 'twilio'

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || '+18723047275'

let client: any = null

if (accountSid && authToken) {
  client = twilio(accountSid, authToken)
}

interface SMSData {
  to: string
  message: string
}

export async function sendSMS(smsData: SMSData): Promise<void> {
  try {
    if (!client) {
      console.log('Twilio not configured, SMS not sent:', smsData.message)
      return
    }

    // Format phone number to E.164 format
    let formattedPhone = smsData.to.replace(/\D/g, '')
    if (formattedPhone.length === 10) {
      formattedPhone = '+1' + formattedPhone
    } else if (formattedPhone.length === 11 && formattedPhone.startsWith('1')) {
      formattedPhone = '+' + formattedPhone
    } else if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+1' + formattedPhone
    }

    const message = await client.messages.create({
      body: smsData.message,
      from: twilioPhoneNumber,
      to: formattedPhone,
    })

    console.log(`SMS sent successfully to ${formattedPhone}, SID: ${message.sid}`)
  } catch (error) {
    console.error('SMS sending failed:', error)
    // Don't throw error to prevent breaking the workflow
  }
}

export function generateSMSMessage(type: string, data: any): string {
  const businessName = 'IFIXANDREPAIR Forest Park'
  
  switch (type) {
    case 'status_update':
      return `Update for order ${data.orderId}: Your ${data.deviceInfo} is now in ${data.currentStage} stage. ${data.estimatedCompletion ? `Est. completion: ${data.estimatedCompletion}` : ''} - ${businessName}`
    
    case 'ready_for_pickup':
      return `Great news! Order ${data.orderId}: Your ${data.deviceInfo} repair is complete and ready for pickup. Total: $${data.totalAmount}. Store hours: 9AM-8PM everyday - ${businessName}`
    
    case 'parts_needed':
      return `Order ${data.orderId}: We need to order parts for your ${data.deviceInfo}. ${data.estimatedCompletion ? `New est. completion: ${data.estimatedCompletion}` : ''} We'll update you when parts arrive - ${businessName}`
    
    case 'diagnostic_complete':
      return `Order ${data.orderId}: Diagnostic complete for your ${data.deviceInfo}. ${data.notes ? `Notes: ${data.notes}` : ''} Repair will begin shortly - ${businessName}`
    
    default:
      return `Order ${data.orderId}: Update on your ${data.deviceInfo} repair. Current status: ${data.currentStage} - ${businessName}`
  }
}