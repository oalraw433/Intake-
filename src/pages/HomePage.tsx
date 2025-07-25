import React from 'react'
import { Link } from 'wouter'
import { PlusCircle, BarChart3, Settings, Smartphone, CheckCircle, Clock, DollarSign } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  const quickActions = [
    {
      title: 'New Repair Request',
      description: 'Customer intake form for new device repairs',
      href: '/intake',
      icon: PlusCircle,
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      title: 'POS System',
      description: 'Manage orders, workflow, and payments',
      href: '/pos',
      icon: BarChart3,
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      title: 'Admin Dashboard',
      description: 'View reports and manage system settings',
      href: '/admin',
      icon: Settings,
      color: 'bg-purple-500 hover:bg-purple-600',
    },
  ]

  const features = [
    {
      icon: Smartphone,
      title: 'Device Repair Management',
      description: 'Complete workflow from intake to delivery with real-time tracking',
    },
    {
      icon: CheckCircle,
      title: 'Quality Assurance',
      description: 'Multi-stage workflow with testing and quality checks',
    },
    {
      icon: Clock,
      title: 'Real-time Updates',
      description: 'Automatic SMS and email notifications for customers',
    },
    {
      icon: DollarSign,
      title: 'Payment Processing',
      description: 'Multiple payment methods with integrated fee calculation',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">
          Welcome to IFIXANDREPAIR
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Professional mobile device repair management platform for Forest Park Walmart location
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <Link key={action.href} href={action.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader className="text-center">
                  <div className={`${action.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white transition-colors`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-xl">{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button className="w-full">
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Features */}
      <div className="mt-16">
        <h2 className="text-3xl font-bold text-center mb-8">Platform Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Business Information */}
      <Card className="mt-16">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Store Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Contact Details</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>📍 1300 Des Plaines Ave, Forest Park, IL 60130</p>
                <p>📞 (872) 222-3111</p>
                <p>📧 forestpark@ifixandrepair.com</p>
                <p>🕒 9AM-8PM everyday</p>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Services</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>• iPhone & iPad Screen Repairs</p>
                <p>• Samsung Device Repairs</p>
                <p>• Battery Replacements</p>
                <p>• Water Damage Recovery</p>
                <p>• Software Troubleshooting</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}