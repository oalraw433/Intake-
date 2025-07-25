export function generateOrderId(): string {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000)
  return `IFR${timestamp.toString().slice(-6)}${random.toString().padStart(3, '0')}`
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  return phone
}

export function calculateTimeDifference(startDate: Date, endDate: Date): string {
  const diffMs = endDate.getTime() - startDate.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMins / 60)
  const remainingMins = diffMins % 60

  if (diffHours > 0) {
    return `${diffHours}h ${remainingMins}m`
  }
  return `${diffMins}m`
}

export const workflowStages = [
  'received',
  'diagnostic', 
  'repair',
  'waiting-for-parts',
  'testing',
  'ready',
  'delivered',
  'completed'
] as const

export type WorkflowStage = typeof workflowStages[number]

export function getNextStage(currentStage: WorkflowStage): WorkflowStage | null {
  const currentIndex = workflowStages.indexOf(currentStage)
  if (currentIndex >= 0 && currentIndex < workflowStages.length - 1) {
    return workflowStages[currentIndex + 1]
  }
  return null
}

export function getStageColor(stage: string): string {
  switch (stage) {
    case 'received': return 'blue'
    case 'diagnostic': return 'orange'
    case 'repair': return 'purple'
    case 'waiting-for-parts': return 'red'
    case 'testing': return 'green'
    case 'ready': return 'green'
    case 'delivered': return 'lime'
    case 'completed': return 'green'
    default: return 'gray'
  }
}