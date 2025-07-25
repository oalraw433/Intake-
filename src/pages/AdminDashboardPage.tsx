import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      <Card>
        <CardHeader>
          <CardTitle>Administrative Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Admin dashboard with reports, data management, and system controls will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}