const API_BASE_URL = '/api'

// Helper function for API requests
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  }

  const response = await fetch(url, { ...defaultOptions, ...options })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(error || `HTTP ${response.status}`)
  }

  return response.json()
}

// Authentication
export async function login(password: string) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ password }),
  })
}

export async function logout() {
  return apiRequest('/auth/logout', {
    method: 'POST',
  })
}

export async function checkAuthStatus() {
  return apiRequest('/auth/status')
}

// Customer search
export async function searchCustomer(phone: string) {
  return apiRequest(`/customers/search?phone=${encodeURIComponent(phone)}`)
}

// Intake form submission
export async function submitIntakeForm(data: any) {
  return apiRequest('/intake/submit', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// POS System
export async function getPosOrders() {
  return apiRequest('/pos/orders')
}

export async function updateWorkflowStage(orderId: number, data: any) {
  return apiRequest(`/pos/orders/${orderId}/workflow`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function processPayment(orderId: number, data: any) {
  return apiRequest(`/pos/orders/${orderId}/payment`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// Inventory
export async function getInventory() {
  return apiRequest('/inventory')
}

// Employees
export async function getEmployees() {
  return apiRequest('/employees')
}

// Expenses
export async function addExpense(data: any) {
  return apiRequest('/expenses', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// Reports
export async function getDailySummary(date: string) {
  return apiRequest(`/reports/daily/${date}`)
}

// Admin
export async function getRepairRequests(limit: string = '100') {
  return apiRequest(`/admin/repair-requests?limit=${limit}`)
}

// Types
export interface Customer {
  id: number
  name: string
  phone: string
  email?: string
  createdAt: string
  updatedAt: string
}

export interface PosOrder {
  id: number
  orderId: string
  customerName: string
  customerPhone: string
  deviceBrand: string
  deviceModel: string
  issueDescription: string
  totalAmount: string
  paidAmount: string
  currentStage: string
  assignedTechnician?: string
  estimatedCompletion?: string
  createdAt: string
  updatedAt: string
}

export interface InventoryItem {
  id: number
  brand: string
  productLine: string
  model: string
  partType: string
  quantity: number
  unitCost?: string
  sellingPrice?: string
  lowStockThreshold: number
  supplier?: string
  sku?: string
  createdAt: string
  updatedAt: string
}

export interface Employee {
  id: number
  name: string
  role: string
  phone?: string
  email?: string
  isActive: boolean
  hireDate?: string
  createdAt: string
}

export interface RepairRequest {
  id: number
  customerName: string
  customerPhone: string
  customerEmail?: string
  deviceBrand: string
  deviceModel: string
  issueDescription: string
  quotedPrice: string
  status: string
  createdAt: string
}