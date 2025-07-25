import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminLoginPage() {
  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Admin Login</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center">
            Admin authentication system will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}