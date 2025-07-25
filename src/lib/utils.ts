import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  return phone
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function getWorkflowStageColor(stage: string): string {
  switch (stage) {
    case 'received': return 'bg-blue-100 text-blue-800'
    case 'diagnostic': return 'bg-orange-100 text-orange-800'
    case 'repair': return 'bg-purple-100 text-purple-800'
    case 'waiting-for-parts': return 'bg-red-100 text-red-800'
    case 'testing': return 'bg-green-100 text-green-800'
    case 'ready': return 'bg-green-100 text-green-800'
    case 'delivered': return 'bg-lime-100 text-lime-800'
    case 'completed': return 'bg-green-100 text-green-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function generateInvoiceNumber(): string {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000)
  return `INV-${timestamp.toString().slice(-6)}-${random.toString().padStart(3, '0')}`
}