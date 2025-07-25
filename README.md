# IFIXANDREPAIR - Forest Park Walmart
## Mobile Device Repair Management Platform

A comprehensive mobile device repair management platform designed specifically for IFIXANDREPAIR's Forest Park Walmart location. This system handles the complete workflow from customer intake to payment completion with automated notifications and comprehensive business management tools.

## 🚀 Features

### Customer Intake System
- **8-Step Progressive Form**: One question per step for optimal mobile experience
- **Customer Lookup**: Real-time phone number search for returning customers
- **Automatic POS Conversion**: Every intake automatically creates a POS order
- **Professional Invoicing**: Automatic invoice generation and email delivery

### Point of Sale (POS) System
- **Comprehensive Workflow Management**: 8-stage repair process tracking
- **Real-time Order Dashboard**: Status-based filtering and sorting
- **Payment Processing**: Multiple payment methods with fee calculations
- **Time Tracking**: Automatic stage duration calculations

### Communication System
- **Email Notifications**: Professional branded templates with SendGrid
- **SMS Updates**: A2P 10DLC compliant messaging via Twilio
- **Automatic CC**: All repair emails automatically CC to rawashdehomar1930@gmail.com

### Financial Management
- **Daily Transaction Summaries**: Automated daily closure at 10 PM
- **Business Expense Tracking**: Categorized expense management
- **Comprehensive Reporting**: Daily, weekly, monthly, yearly reports
- **Payment Method Tracking**: Cash, card, mobile, check support

### Inventory Management
- **Complete Apple Catalog**: iPhone, iPad with all models
- **Stock Tracking**: Quantity monitoring with low-stock alerts
- **Hierarchical Organization**: Brand → Product Line → Models

## 🛠️ Tech Stack

- **Frontend**: React with TypeScript, Vite
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **UI Framework**: Radix UI components with shadcn/ui styling
- **Styling**: Tailwind CSS with custom theming
- **Routing**: Wouter for client-side navigation
- **State Management**: TanStack Query for server state
- **Form Handling**: React Hook Form with Zod validation
- **Email Service**: SendGrid for automated notifications
- **SMS Service**: Twilio for customer communications
- **Payment Processing**: Stripe integration

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- SendGrid account (for email notifications)
- Twilio account (for SMS notifications)
- Stripe account (for payment processing)

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone <repository-url>
cd ifixandrepair-management
npm install
```

### 2. Environment Setup
Copy the example environment file and configure your services:
```bash
cp .env.example .env
```

Edit `.env` with your actual service credentials:
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/ifixandrepair

# SendGrid (Email)
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=forestpark@ifixandrepair.com

# Twilio (SMS)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+18723047275

# Stripe (Payments)
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

### 3. Database Setup
Generate and run database migrations:
```bash
npm run db:generate
npm run db:migrate
```

### 4. Start Development Server
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## 📱 Usage

### Customer Intake Process
1. Navigate to `/intake` or click "New Repair Request"
2. Follow the 8-step guided process:
   - Customer Information (with automatic lookup)
   - Device Details (brand and model)
   - Issue Description (common issues + custom)
   - Technician Pricing Quote
   - Google Review Incentive (fee waiver)
   - Accessories (case $15, screen protector $10)
   - Terms Agreement
   - Final Review and Submission

### POS System
1. Navigate to `/pos` to view all active orders
2. Click on orders to update workflow stages
3. Process payments when repairs are complete
4. Track time spent in each stage

### Admin Dashboard
1. Navigate to `/admin` and login with password: `Vded6273@`
2. View repair requests and order history
3. Access financial reports and summaries
4. Manage business expenses

## 🔧 Workflow Stages

The system tracks repairs through these stages:
1. **Received** - Device received from customer
2. **Diagnostic** - Initial assessment and diagnosis
3. **Repair** - Active repair work in progress
4. **Waiting for Parts** - Waiting for parts to arrive
5. **Testing** - Quality testing and verification
6. **Ready** - Repair complete, ready for pickup
7. **Delivered** - Device returned to customer
8. **Completed** - Order closed and paid

## 💰 Pricing Structure

- **Base Repair Price**: Technician quoted amount
- **Protective Case**: $15 (optional)
- **Screen Protector**: $10 (optional)
- **Credit Card Fee**: $5 (waived with Google review)
- **Tax**: 10% on total taxable amount

## 📊 Business Information

- **Store Name**: IFIXANDREPAIR - FOREST PARK WALMART
- **Address**: 1300 Des Plaines Ave, Forest Park, IL 60130
- **Phone**: (872) 222-3111
- **Email**: forestpark@ifixandrepair.com
- **Hours**: 9AM-8PM everyday
- **SMS Number**: +1 872-304-7275

## 🔒 Security Features

- Password-protected admin access
- Session management with PostgreSQL storage
- Environment variable configuration
- Secure API endpoints with authentication middleware

## 📈 Analytics & Reporting

- Daily transaction summaries
- Payment method breakdowns
- Revenue and expense tracking
- Workflow performance metrics
- Customer retention analytics

## 🛡️ Error Handling

- Comprehensive error logging
- Graceful SMS/Email delivery failures
- Form validation with user-friendly messages
- API error handling with proper status codes

## 🔄 Automated Features

### Daily Operations
- Automatic day closure at 10 PM if not manually closed
- Financial summary calculations
- Transaction amount security (hidden after closure)

### Monthly/Yearly Operations
- Auto-closure on last day of month at 10 PM
- Auto-closure on December 31st at 10 PM
- Comprehensive period reporting

### Notifications
- Automatic email notifications for all workflow changes
- SMS notifications for status updates
- Professional templates with business branding
- CC to rawashdehomar1930@gmail.com on ALL repair emails

## 📝 Development Scripts

```bash
npm run dev          # Start development server (frontend + backend)
npm run dev:client   # Start only frontend development server
npm run dev:server   # Start only backend development server
npm run build        # Build for production
npm run db:generate  # Generate database migrations
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Drizzle Studio for database management
```

## 🏗️ Project Structure

```
├── src/                    # Frontend React application
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   ├── lib/               # Utilities and API client
│   └── hooks/             # Custom React hooks
├── server/                # Backend Express application
│   ├── db/                # Database schema and migrations
│   ├── services/          # Email, SMS, and external services
│   └── utils/             # Backend utilities
├── public/                # Static assets
└── docs/                  # Additional documentation
```

## 🤝 Support

For technical support or questions:
- Email: forestpark@ifixandrepair.com
- Phone: (872) 222-3111

## 📄 License

This project is proprietary software developed specifically for IFIXANDREPAIR - Forest Park Walmart location.

---

**Built with ❤️ for IFIXANDREPAIR Forest Park Team**
