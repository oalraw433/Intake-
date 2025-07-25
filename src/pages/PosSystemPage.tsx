import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function PosSystemPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">POS System</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Point of Sale System</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            The POS system with order management, workflow tracking, and payment processing will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}