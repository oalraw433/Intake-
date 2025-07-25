import React from 'react'
import { Router, Route, Switch } from 'wouter'
import { useQuery } from '@tanstack/react-query'

// Pages
import HomePage from './pages/HomePage'
import CustomerIntakePage from './pages/CustomerIntakePage'
import PosSystemPage from './pages/PosSystemPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminLoginPage from './pages/AdminLoginPage'

// Components
import Header from './components/Header'

// API
import { checkAuthStatus } from './lib/api'

function App() {
  const { data: authStatus } = useQuery({
    queryKey: ['auth-status'],
    queryFn: checkAuthStatus,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/intake" component={CustomerIntakePage} />
            <Route path="/pos" component={PosSystemPage} />
            <Route path="/admin/login" component={AdminLoginPage} />
            <Route path="/admin">
              {authStatus?.authenticated ? (
                <AdminDashboardPage />
              ) : (
                <AdminLoginPage />
              )}
            </Route>
            <Route>
              {/* 404 Page */}
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <h1 className="text-4xl font-bold text-muted-foreground mb-4">404</h1>
                <p className="text-lg text-muted-foreground mb-8">Page not found</p>
                <a 
                  href="/" 
                  className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Go Home
                </a>
              </div>
            </Route>
          </Switch>
        </main>
      </div>
    </Router>
  )
}

export default App