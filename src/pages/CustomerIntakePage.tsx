import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, ArrowRight, CheckCircle, Phone, Smartphone, DollarSign, Star, Shield, FileText, Eye } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { submitIntakeForm, searchCustomer } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'

const customerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
})

const deviceSchema = z.object({
  brand: z.string().min(1, 'Please select a brand'),
  model: z.string().min(1, 'Please enter the device model'),
})

const intakeSchema = z.object({
  customerInfo: customerSchema,
  deviceDetails: deviceSchema,
  issueDescription: z.string().min(5, 'Please describe the issue in more detail'),
  quotedPrice: z.number().min(1, 'Price must be greater than 0'),
  hasGoogleReview: z.boolean(),
  wantCase: z.boolean(),
  wantScreenProtector: z.boolean(),
  termsAccepted: z.boolean().refine(val => val === true, 'You must accept the terms'),
})

type IntakeFormData = z.infer<typeof intakeSchema>

const steps = [
  { id: 1, title: 'Customer Info', description: 'Basic contact information' },
  { id: 2, title: 'Device Details', description: 'Device brand and model' },
  { id: 3, title: 'Issue Description', description: 'What needs to be repaired?' },
  { id: 4, title: 'Pricing', description: 'Technician quoted price' },
  { id: 5, title: 'Google Review', description: 'Credit card fee waiver' },
  { id: 6, title: 'Accessories', description: 'Case and screen protector' },
  { id: 7, title: 'Terms', description: 'Service agreement' },
  { id: 8, title: 'Review', description: 'Final confirmation' },
]

const deviceBrands = ['Apple', 'Samsung', 'Other']
const commonIssues = ['Broken Screen', 'Water Damage', 'Battery Issues', 'Charging Problems', 'Software Issues']

export default function CustomerIntakePage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [existingCustomer, setExistingCustomer] = useState(null)
  
  const form = useForm<IntakeFormData>({
    resolver: zodResolver(intakeSchema),
    defaultValues: {
      customerInfo: { name: '', phone: '', email: '' },
      deviceDetails: { brand: '', model: '' },
      issueDescription: '',
      quotedPrice: 0,
      hasGoogleReview: false,
      wantCase: false,
      wantScreenProtector: false,
      termsAccepted: false,
    },
  })

  const { watch, setValue, getValues } = form

  const watchedValues = watch()

  // Customer search mutation
  const customerSearchMutation = useMutation({
    mutationFn: searchCustomer,
    onSuccess: (data) => {
      if (data.found) {
        setExistingCustomer(data.customer)
        setValue('customerInfo.name', data.customer.name)
        setValue('customerInfo.email', data.customer.email || '')
        toast.success('Existing customer found!')
      } else {
        setExistingCustomer(null)
        toast.info('New customer - please fill in details')
      }
    },
  })

  // Form submission mutation
  const submitMutation = useMutation({
    mutationFn: submitIntakeForm,
    onSuccess: (data) => {
      toast.success(`Order created successfully! Order ID: ${data.orderId}`)
      // Reset form or redirect to success page
      form.reset()
      setCurrentStep(1)
    },
    onError: (error) => {
      toast.error('Failed to submit form: ' + error.message)
    },
  })

  const handlePhoneChange = (phone: string) => {
    setValue('customerInfo.phone', phone)
    if (phone.length >= 10) {
      customerSearchMutation.mutate(phone)
    }
  }

  const calculatePricing = () => {
    const basePrice = watchedValues.quotedPrice || 0
    const casePrice = watchedValues.wantCase ? 15 : 0
    const screenProtectorPrice = watchedValues.wantScreenProtector ? 10 : 0
    const creditCardFee = watchedValues.hasGoogleReview ? 0 : 5
    const subtotal = basePrice + casePrice + screenProtectorPrice + creditCardFee
    const tax = subtotal * 0.10
    const total = subtotal + tax

    return { basePrice, casePrice, screenProtectorPrice, creditCardFee, subtotal, tax, total }
  }

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const onSubmit = (data: IntakeFormData) => {
    submitMutation.mutate(data)
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Customer Info
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Phone className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Customer Information</h2>
              <p className="text-muted-foreground">Let's start with your contact details</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number *</label>
                <Input
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={watchedValues.customerInfo.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className="text-lg"
                />
                {customerSearchMutation.isLoading && (
                  <p className="text-sm text-muted-foreground mt-1">Searching for existing customer...</p>
                )}
                {existingCustomer && (
                  <p className="text-sm text-green-600 mt-1">✓ Welcome back, {existingCustomer.name}!</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Full Name *</label>
                <Input
                  placeholder="John Doe"
                  value={watchedValues.customerInfo.name}
                  onChange={(e) => setValue('customerInfo.name', e.target.value)}
                  className="text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email (Optional)</label>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  value={watchedValues.customerInfo.email}
                  onChange={(e) => setValue('customerInfo.email', e.target.value)}
                  className="text-lg"
                />
              </div>
            </div>
          </div>
        )

      case 2: // Device Details
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Smartphone className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Device Information</h2>
              <p className="text-muted-foreground">Tell us about your device</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Brand *</label>
                <div className="grid grid-cols-3 gap-2">
                  {deviceBrands.map((brand) => (
                    <Button
                      key={brand}
                      type="button"
                      variant={watchedValues.deviceDetails.brand === brand ? "default" : "outline"}
                      onClick={() => setValue('deviceDetails.brand', brand)}
                      className="h-12"
                    >
                      {brand}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Model *</label>
                <Input
                  placeholder="iPhone 15 Pro, Galaxy S24, etc."
                  value={watchedValues.deviceDetails.model}
                  onChange={(e) => setValue('deviceDetails.model', e.target.value)}
                  className="text-lg"
                />
              </div>
            </div>
          </div>
        )

      case 3: // Issue Description
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold">What's the issue?</h2>
              <p className="text-muted-foreground">Describe what needs to be repaired</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Common Issues</label>
                <div className="grid grid-cols-2 gap-2">
                  {commonIssues.map((issue) => (
                    <Button
                      key={issue}
                      type="button"
                      variant="outline"
                      onClick={() => setValue('issueDescription', issue)}
                      className="h-12 text-sm"
                    >
                      {issue}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Detailed Description *</label>
                <textarea
                  className="w-full min-h-[100px] p-3 border border-input rounded-md resize-none"
                  placeholder="Please describe the issue in detail..."
                  value={watchedValues.issueDescription}
                  onChange={(e) => setValue('issueDescription', e.target.value)}
                />
              </div>
            </div>
          </div>
        )

      case 4: // Pricing
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <DollarSign className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Repair Cost</h2>
              <p className="text-muted-foreground">Enter the technician quoted price</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Quoted Price *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    className="pl-8 text-lg"
                    value={watchedValues.quotedPrice || ''}
                    onChange={(e) => setValue('quotedPrice', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 5: // Google Review
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Star className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Google Review</h2>
              <p className="text-muted-foreground">Help us grow and save on fees!</p>
            </div>

            <Card className="border-2 border-yellow-200 bg-yellow-50">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold mb-2">💳 Credit Card Fee Waiver</h3>
                <p className="text-muted-foreground mb-4">
                  Leave us a Google review and we'll waive the $5 credit card processing fee!
                </p>
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant={watchedValues.hasGoogleReview ? "default" : "outline"}
                    onClick={() => setValue('hasGoogleReview', true)}
                    className="w-full"
                  >
                    ⭐ Yes, I'll leave a Google review (Save $5)
                  </Button>
                  <Button
                    type="button"
                    variant={!watchedValues.hasGoogleReview ? "default" : "outline"}
                    onClick={() => setValue('hasGoogleReview', false)}
                    className="w-full"
                  >
                    No thanks, I'll pay the fee
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 6: // Accessories
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Protect Your Device</h2>
              <p className="text-muted-foreground">Add accessories at discounted prices</p>
            </div>

            <div className="space-y-4">
              <Card className="border-2 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Protective Case</h3>
                      <p className="text-sm text-muted-foreground">Keep your device safe</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">$15</p>
                      <Button
                        type="button"
                        variant={watchedValues.wantCase ? "default" : "outline"}
                        size="sm"
                        onClick={() => setValue('wantCase', !watchedValues.wantCase)}
                      >
                        {watchedValues.wantCase ? 'Added' : 'Add'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Screen Protector</h3>
                      <p className="text-sm text-muted-foreground">Prevent future damage</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">$10</p>
                      <Button
                        type="button"
                        variant={watchedValues.wantScreenProtector ? "default" : "outline"}
                        size="sm"
                        onClick={() => setValue('wantScreenProtector', !watchedValues.wantScreenProtector)}
                      >
                        {watchedValues.wantScreenProtector ? 'Added' : 'Add'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 7: // Terms
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Service Terms</h2>
              <p className="text-muted-foreground">Please review and accept our terms</p>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-4 text-sm">
                  <h3 className="font-semibold">IFIXANDREPAIR Service Agreement</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• We will diagnose your device and provide an accurate repair estimate</li>
                    <li>• Repairs typically take 1-3 business days depending on part availability</li>
                    <li>• All repairs come with a 90-day warranty on parts and labor</li>
                    <li>• Payment is due upon completion of repair</li>
                    <li>• We are not responsible for data loss - please backup your device</li>
                    <li>• Devices not picked up within 30 days may be recycled</li>
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={watchedValues.termsAccepted}
                      onChange={(e) => setValue('termsAccepted', e.target.checked)}
                      className="w-4 h-4 text-primary"
                    />
                    <span className="text-sm">
                      I accept the service terms and conditions *
                    </span>
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 8: // Review
        const pricing = calculatePricing()
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Eye className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Review Your Order</h2>
              <p className="text-muted-foreground">Please confirm all details are correct</p>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Customer Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {watchedValues.customerInfo.name}</p>
                    <p><strong>Phone:</strong> {watchedValues.customerInfo.phone}</p>
                    {watchedValues.customerInfo.email && (
                      <p><strong>Email:</strong> {watchedValues.customerInfo.email}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Device & Issue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p><strong>Device:</strong> {watchedValues.deviceDetails.brand} {watchedValues.deviceDetails.model}</p>
                    <p><strong>Issue:</strong> {watchedValues.issueDescription}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pricing Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Repair Cost:</span>
                      <span>{formatCurrency(pricing.basePrice)}</span>
                    </div>
                    {pricing.casePrice > 0 && (
                      <div className="flex justify-between">
                        <span>Protective Case:</span>
                        <span>{formatCurrency(pricing.casePrice)}</span>
                      </div>
                    )}
                    {pricing.screenProtectorPrice > 0 && (
                      <div className="flex justify-between">
                        <span>Screen Protector:</span>
                        <span>{formatCurrency(pricing.screenProtectorPrice)}</span>
                      </div>
                    )}
                    {pricing.creditCardFee > 0 && (
                      <div className="flex justify-between">
                        <span>Credit Card Fee:</span>
                        <span>{formatCurrency(pricing.creditCardFee)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Tax (10%):</span>
                      <span>{formatCurrency(pricing.tax)}</span>
                    </div>
                    <hr />
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span>{formatCurrency(pricing.total)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">New Repair Request</h1>
          <span className="text-sm text-muted-foreground">
            Step {currentStep} of {steps.length}
          </span>
        </div>
        
        <div className="flex items-center space-x-2 mb-4">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div 
                className={`step-indicator ${
                  currentStep === step.id 
                    ? 'step-active' 
                    : currentStep > step.id 
                    ? 'step-completed' 
                    : 'step-inactive'
                }`}
              >
                {currentStep > step.id ? <CheckCircle className="h-4 w-4" /> : step.id}
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-1 bg-muted rounded" />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="text-center">
          <h3 className="font-medium">{steps[currentStep - 1].title}</h3>
          <p className="text-sm text-muted-foreground">{steps[currentStep - 1].description}</p>
        </div>
      </div>

      {/* Step Content */}
      <Card className="mb-8">
        <CardContent className="p-8">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Previous</span>
        </Button>

        {currentStep === steps.length ? (
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={submitMutation.isLoading || !watchedValues.termsAccepted}
            className="flex items-center space-x-2"
          >
            {submitMutation.isLoading ? 'Submitting...' : 'Submit Order'}
            <CheckCircle className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={nextStep}
            className="flex items-center space-x-2"
          >
            <span>Next</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}