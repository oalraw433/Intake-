import express from 'express'
import cors from 'cors'
import session from 'express-session'
import path from 'path'
import { fileURLToPath } from 'url'
import { eq, desc, and, gte, lte, like, sql } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

import { db, customers, repairRequests, posOrders, workflowStages, payments, inventory, employees, businessExpenses, dailySummaries } from './db/index.js'
import { sendEmail } from './services/email.js'
import { sendSMS } from './services/sms.js'
import { generateOrderId } from './utils/orderUtils.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : 'http://localhost:5173',
  credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}))

// Extend session type
declare module 'express-session' {
  interface SessionData {
    authenticated: boolean
  }
}

// Authentication middleware
const requireAuth = (req: any, res: any, next: any) => {
  if (req.session.authenticated) {
    next()
  } else {
    res.status(401).json({ error: 'Authentication required' })
  }
}

// Helper function to calculate pricing
function calculatePricing(basePrice: number, hasCase = false, hasScreenProtector = false, hasGoogleReview = false) {
  const casePrice = hasCase ? 15 : 0
  const screenProtectorPrice = hasScreenProtector ? 10 : 0
  const creditCardFee = hasGoogleReview ? 0 : 5
  const subtotal = basePrice + casePrice + screenProtectorPrice + creditCardFee
  const taxAmount = subtotal * 0.10 // 10% tax
  const totalAmount = subtotal + taxAmount
  
  return {
    basePrice,
    casePrice,
    screenProtectorPrice,
    creditCardFee,
    taxAmount: Math.round(taxAmount * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100
  }
}

// Routes

// Authentication
app.post('/api/auth/login', async (req, res) => {
  try {
    const { password } = req.body
    const adminPassword = process.env.ADMIN_PASSWORD || 'Vded6273@'
    
    if (password === adminPassword) {
      req.session.authenticated = true
      res.json({ success: true })
    } else {
      res.status(401).json({ error: 'Invalid password' })
    }
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
})

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' })
    }
    res.json({ success: true })
  })
})

app.get('/api/auth/status', (req, res) => {
  res.json({ authenticated: !!req.session.authenticated })
})

// Customer lookup
app.get('/api/customers/search', async (req, res) => {
  try {
    const { phone } = req.query
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' })
    }
    
    const customer = await db.select().from(customers).where(like(customers.phone, `%${phone}%`)).limit(1)
    
    if (customer.length > 0) {
      res.json({ found: true, customer: customer[0] })
    } else {
      res.json({ found: false })
    }
  } catch (error) {
    console.error('Customer search error:', error)
    res.status(500).json({ error: 'Search failed' })
  }
})

// Submit customer intake form
app.post('/api/intake/submit', async (req, res) => {
  try {
    const {
      customerInfo,
      deviceDetails,
      issueDescription,
      quotedPrice,
      hasGoogleReview,
      wantCase,
      wantScreenProtector,
      termsAccepted
    } = req.body

    // Create or find customer
    let customerId: number
    const existingCustomer = await db.select().from(customers).where(eq(customers.phone, customerInfo.phone)).limit(1)
    
    if (existingCustomer.length > 0) {
      customerId = existingCustomer[0].id
      // Update customer info if provided
      if (customerInfo.name || customerInfo.email) {
        await db.update(customers)
          .set({
            name: customerInfo.name || existingCustomer[0].name,
            email: customerInfo.email || existingCustomer[0].email,
            updatedAt: new Date()
          })
          .where(eq(customers.id, customerId))
      }
    } else {
      const newCustomer = await db.insert(customers).values({
        name: customerInfo.name,
        phone: customerInfo.phone,
        email: customerInfo.email
      }).returning()
      customerId = newCustomer[0].id
    }

    // Calculate pricing
    const pricing = calculatePricing(parseFloat(quotedPrice), wantCase, wantScreenProtector, hasGoogleReview)

    // Create repair request
    const repairRequest = await db.insert(repairRequests).values({
      customerId,
      deviceBrand: deviceDetails.brand,
      deviceModel: deviceDetails.model,
      issueDescription,
      quotedPrice: quotedPrice.toString(),
      hasGoogleReview,
      wantCase,
      wantScreenProtector,
      termsAccepted,
      status: 'submitted'
    }).returning()

    // Create POS order automatically
    const orderId = generateOrderId()
    const posOrder = await db.insert(posOrders).values({
      orderId,
      customerId,
      repairRequestId: repairRequest[0].id,
      deviceBrand: deviceDetails.brand,
      deviceModel: deviceDetails.model,
      issueDescription,
      basePrice: pricing.basePrice.toString(),
      casePrice: pricing.casePrice.toString(),
      screenProtectorPrice: pricing.screenProtectorPrice.toString(),
      creditCardFee: pricing.creditCardFee.toString(),
      taxAmount: pricing.taxAmount.toString(),
      totalAmount: pricing.totalAmount.toString(),
      currentStage: 'received'
    }).returning()

    // Create initial workflow stage
    await db.insert(workflowStages).values({
      orderId: posOrder[0].id,
      stage: 'received',
      notes: 'Order received from customer intake form'
    })

    // Send confirmation email
    const customer = await db.select().from(customers).where(eq(customers.id, customerId)).limit(1)
    if (customer[0].email) {
      await sendEmail({
        to: customer[0].email,
        subject: 'Repair Request Confirmed - IFIXANDREPAIR',
        type: 'confirmation',
        data: {
          customerName: customer[0].name,
          orderId: posOrder[0].orderId,
          deviceInfo: `${deviceDetails.brand} ${deviceDetails.model}`,
          issueDescription,
          totalAmount: pricing.totalAmount,
          estimatedCompletion: 'We will contact you with an update soon'
        }
      })
    }

    res.json({ 
      success: true, 
      orderId: posOrder[0].orderId,
      repairRequestId: repairRequest[0].id,
      customerId,
      pricing
    })
  } catch (error) {
    console.error('Intake submission error:', error)
    res.status(500).json({ error: 'Submission failed' })
  }
})

// Get all POS orders
app.get('/api/pos/orders', async (req, res) => {
  try {
    const orders = await db.select({
      id: posOrders.id,
      orderId: posOrders.orderId,
      customerName: customers.name,
      customerPhone: customers.phone,
      deviceBrand: posOrders.deviceBrand,
      deviceModel: posOrders.deviceModel,
      issueDescription: posOrders.issueDescription,
      totalAmount: posOrders.totalAmount,
      paidAmount: posOrders.paidAmount,
      currentStage: posOrders.currentStage,
      assignedTechnician: posOrders.assignedTechnician,
      estimatedCompletion: posOrders.estimatedCompletion,
      createdAt: posOrders.createdAt,
      updatedAt: posOrders.updatedAt
    })
    .from(posOrders)
    .leftJoin(customers, eq(posOrders.customerId, customers.id))
    .orderBy(desc(posOrders.createdAt))

    res.json(orders)
  } catch (error) {
    console.error('Get orders error:', error)
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

// Update workflow stage
app.post('/api/pos/orders/:id/workflow', async (req, res) => {
  try {
    const { id } = req.params
    const { stage, assignedEmployee, notes, estimatedCompletion, sendSms = true } = req.body

    // Get order details
    const order = await db.select({
      id: posOrders.id,
      orderId: posOrders.orderId,
      customerId: posOrders.customerId,
      customerName: customers.name,
      customerPhone: customers.phone,
      customerEmail: customers.email,
      deviceBrand: posOrders.deviceBrand,
      deviceModel: posOrders.deviceModel,
      currentStage: posOrders.currentStage
    })
    .from(posOrders)
    .leftJoin(customers, eq(posOrders.customerId, customers.id))
    .where(eq(posOrders.id, parseInt(id)))
    .limit(1)

    if (order.length === 0) {
      return res.status(404).json({ error: 'Order not found' })
    }

    const orderData = order[0]

    // Complete previous stage if exists
    const previousStage = await db.select()
      .from(workflowStages)
      .where(and(
        eq(workflowStages.orderId, orderData.id),
        eq(workflowStages.stage, orderData.currentStage || '')
      ))
      .orderBy(desc(workflowStages.startedAt))
      .limit(1)

    if (previousStage.length > 0 && !previousStage[0].completedAt) {
      const duration = Math.floor((Date.now() - new Date(previousStage[0].startedAt).getTime()) / (1000 * 60))
      await db.update(workflowStages)
        .set({
          completedAt: new Date(),
          duration
        })
        .where(eq(workflowStages.id, previousStage[0].id))
    }

    // Create new workflow stage
    const newStage = await db.insert(workflowStages).values({
      orderId: orderData.id,
      stage,
      assignedEmployee,
      notes,
      estimatedCompletion: estimatedCompletion ? new Date(estimatedCompletion) : null,
      smsNotificationSent: false,
      emailNotificationSent: false
    }).returning()

    // Update order
    await db.update(posOrders)
      .set({
        currentStage: stage,
        assignedTechnician: assignedEmployee,
        estimatedCompletion: estimatedCompletion ? new Date(estimatedCompletion) : null,
        updatedAt: new Date()
      })
      .where(eq(posOrders.id, orderData.id))

    // Send notifications
    let smsStatus = null
    let emailStatus = null

    if (sendSms && orderData.customerPhone) {
      try {
        await sendSMS({
          to: orderData.customerPhone,
          message: `Update for order ${orderData.orderId}: Your ${orderData.deviceBrand} ${orderData.deviceModel} is now in ${stage} stage. ${estimatedCompletion ? `Estimated completion: ${new Date(estimatedCompletion).toLocaleDateString()}` : ''} - IFIXANDREPAIR Forest Park`
        })
        smsStatus = 'sent'
        await db.update(workflowStages)
          .set({ smsNotificationSent: true })
          .where(eq(workflowStages.id, newStage[0].id))
      } catch (error) {
        console.error('SMS notification error:', error)
        smsStatus = 'failed'
      }
    }

    if (orderData.customerEmail) {
      try {
        await sendEmail({
          to: orderData.customerEmail,
          subject: `Repair Update - Order ${orderData.orderId}`,
          type: 'status_update',
          data: {
            customerName: orderData.customerName || 'Customer',
            orderId: orderData.orderId,
            deviceInfo: `${orderData.deviceBrand} ${orderData.deviceModel}`,
            currentStage: stage,
            estimatedCompletion: estimatedCompletion ? new Date(estimatedCompletion).toLocaleDateString() : null,
            notes
          }
        })
        emailStatus = 'sent'
        await db.update(workflowStages)
          .set({ emailNotificationSent: true })
          .where(eq(workflowStages.id, newStage[0].id))
      } catch (error) {
        console.error('Email notification error:', error)
        emailStatus = 'failed'
      }
    }

    res.json({ 
      success: true, 
      stageId: newStage[0].id,
      notifications: { sms: smsStatus, email: emailStatus }
    })
  } catch (error) {
    console.error('Workflow update error:', error)
    res.status(500).json({ error: 'Workflow update failed' })
  }
})

// Process payment
app.post('/api/pos/orders/:id/payment', async (req, res) => {
  try {
    const { id } = req.params
    const { amount, method, processedBy, notes } = req.body

    const order = await db.select().from(posOrders).where(eq(posOrders.id, parseInt(id))).limit(1)
    if (order.length === 0) {
      return res.status(404).json({ error: 'Order not found' })
    }

    const payment = await db.insert(payments).values({
      orderId: parseInt(id),
      amount: amount.toString(),
      method,
      processedBy,
      notes
    }).returning()

    // Update order paid amount
    const currentPaid = parseFloat(order[0].paidAmount || '0')
    const newPaidAmount = currentPaid + parseFloat(amount)
    const totalAmount = parseFloat(order[0].totalAmount)

    let newStage = order[0].currentStage
    if (newPaidAmount >= totalAmount) {
      newStage = 'completed'
    }

    await db.update(posOrders)
      .set({
        paidAmount: newPaidAmount.toString(),
        currentStage: newStage,
        updatedAt: new Date()
      })
      .where(eq(posOrders.id, parseInt(id)))

    res.json({ success: true, paymentId: payment[0].id, newStage })
  } catch (error) {
    console.error('Payment processing error:', error)
    res.status(500).json({ error: 'Payment processing failed' })
  }
})

// Get inventory
app.get('/api/inventory', async (req, res) => {
  try {
    const items = await db.select().from(inventory).orderBy(inventory.brand, inventory.productLine, inventory.model)
    res.json(items)
  } catch (error) {
    console.error('Get inventory error:', error)
    res.status(500).json({ error: 'Failed to fetch inventory' })
  }
})

// Get employees
app.get('/api/employees', async (req, res) => {
  try {
    const employeeList = await db.select().from(employees).where(eq(employees.isActive, true)).orderBy(employees.name)
    res.json(employeeList)
  } catch (error) {
    console.error('Get employees error:', error)
    res.status(500).json({ error: 'Failed to fetch employees' })
  }
})

// Add business expense
app.post('/api/expenses', async (req, res) => {
  try {
    const { category, description, amount, paymentMethod, vendor, receiptNotes, addedBy } = req.body
    
    const expense = await db.insert(businessExpenses).values({
      category,
      description,
      amount: amount.toString(),
      paymentMethod,
      vendor,
      receiptNotes,
      addedBy
    }).returning()

    res.json({ success: true, expenseId: expense[0].id })
  } catch (error) {
    console.error('Add expense error:', error)
    res.status(500).json({ error: 'Failed to add expense' })
  }
})

// Get daily summary
app.get('/api/reports/daily/:date', async (req, res) => {
  try {
    const { date } = req.params
    const targetDate = new Date(date)
    const nextDay = new Date(targetDate)
    nextDay.setDate(nextDay.getDate() + 1)

    // Get payments for the day
    const dailyPayments = await db.select({
      amount: payments.amount,
      method: payments.method
    })
    .from(payments)
    .where(and(
      gte(payments.createdAt, targetDate),
      lte(payments.createdAt, nextDay)
    ))

    // Get expenses for the day
    const dailyExpenses = await db.select({
      amount: businessExpenses.amount
    })
    .from(businessExpenses)
    .where(and(
      gte(businessExpenses.expenseDate, targetDate),
      lte(businessExpenses.expenseDate, nextDay)
    ))

    // Calculate totals
    const paymentTotals = dailyPayments.reduce((acc, payment) => {
      const amount = parseFloat(payment.amount)
      acc.total += amount
      const method = payment.method as keyof typeof acc
      if (method !== 'total') {
        acc[method] = (acc[method] || 0) + amount
      }
      return acc
    }, { total: 0, cash: 0, card: 0, mobile: 0, check: 0 })

    const expenseTotal = dailyExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0)

    res.json({
      date,
      revenue: paymentTotals.total,
      expenses: expenseTotal,
      profit: paymentTotals.total - expenseTotal,
      paymentBreakdown: {
        cash: paymentTotals.cash,
        card: paymentTotals.card,
        mobile: paymentTotals.mobile,
        check: paymentTotals.check
      },
      ordersCount: dailyPayments.length,
      expensesCount: dailyExpenses.length
    })
  } catch (error) {
    console.error('Get daily summary error:', error)
    res.status(500).json({ error: 'Failed to fetch daily summary' })
  }
})

// Admin routes
app.get('/api/admin/repair-requests', requireAuth, async (req, res) => {
  try {
    const { limit = '100' } = req.query
    const limitNum = limit === 'all' ? undefined : parseInt(limit as string)

    let query = db.select({
      id: repairRequests.id,
      customerName: customers.name,
      customerPhone: customers.phone,
      customerEmail: customers.email,
      deviceBrand: repairRequests.deviceBrand,
      deviceModel: repairRequests.deviceModel,
      issueDescription: repairRequests.issueDescription,
      quotedPrice: repairRequests.quotedPrice,
      status: repairRequests.status,
      createdAt: repairRequests.createdAt
    })
    .from(repairRequests)
    .leftJoin(customers, eq(repairRequests.customerId, customers.id))
    .orderBy(desc(repairRequests.createdAt))

    if (limitNum) {
      query = query.limit(limitNum) as any
    }

    const requests = await query
    res.json(requests)
  } catch (error) {
    console.error('Get repair requests error:', error)
    res.status(500).json({ error: 'Failed to fetch repair requests' })
  }
})

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client')))
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})