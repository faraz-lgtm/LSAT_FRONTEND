import { Button } from '@/components/dashboard/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/dashboard/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/dashboard/ui/select'
import { Header } from '@/components/dashboard/layout/header'
import { Main } from '@/components/dashboard/layout/main'
import { TopNav } from '@/components/dashboard/layout/top-nav'
import { ProfileDropdown } from '@/components/dashboard/profile-dropdown'
import { Search } from '@/components/dashboard/search'
import { ThemeSwitch } from '@/components/dashboard/theme-switch'
import { ConfigDrawer } from '@/components/dashboard/config-drawer'
import { useGetDashboardDataQuery } from '@/redux/apiSlices/Dashboard/dashboardSlice'
import { useGetInvoicesQuery } from '@/redux/apiSlices/Invoicing/invoicingSlice'
import { useGetRefundsQuery } from '@/redux/apiSlices/Refunds/refundsSlice'
import { formatCurrency } from '@/utils/currency'
import { useState } from 'react'

type Period = "DAY" | "MONTH" | "YEAR"

const topNav = [
  {
    title: 'Overview',
    href: 'dashboard/overview',
    isActive: true,
    disabled: false,
  },
  {
    title: 'Customers',
    href: 'dashboard/customers',
    isActive: false,
    disabled: true,
  },
  {
    title: 'Products',
    href: 'dashboard/products',
    isActive: false,
    disabled: true,
  },
  {
    title: 'Settings',
    href: 'dashboard/settings',
    isActive: false,
    disabled: true,
  },
]

export function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("MONTH")
  
  const { data: dashboardData, isLoading, error } = useGetDashboardDataQuery({ 
    period: selectedPeriod 
  })

  // Financial data queries
  const { data: invoicesData } = useGetInvoicesQuery()
  const { data: refundsData } = useGetRefundsQuery()

  const dashboard = dashboardData?.data?.data
  const meta = dashboardData?.data?.meta

  // Calculate financial metrics
  const invoices = invoicesData?.data || []
  const refunds = refundsData?.data || []

  const pendingPayments = invoices.filter(inv => inv.status === 'sent' || inv.status === 'overdue')
  const overdueInvoices = invoices.filter(inv => inv.status === 'overdue')
  const refundsThisPeriod = refunds.filter(ref => {
    const createdAt = new Date(ref.createdAt)
    const now = new Date()
    const periodStart = selectedPeriod === 'DAY' 
      ? new Date(now.getFullYear(), now.getMonth(), now.getDate())
      : selectedPeriod === 'MONTH'
      ? new Date(now.getFullYear(), now.getMonth(), 1)
      : new Date(now.getFullYear(), 0, 1)
    return createdAt >= periodStart
  })

  const pendingPaymentsTotal = pendingPayments.reduce((sum, inv) => {
    const amount = typeof inv.total === 'string' ? parseFloat(inv.total) * 100 : ((inv.total || 0) * 100)
    return sum + amount
  }, 0)
  const refundsTotal = refundsThisPeriod.reduce((sum, ref) => {
    const amount = typeof ref.amount === 'string' ? parseFloat(ref.amount) * 100 : ((ref.amount || 0) * 100)
    return sum + amount
  }, 0)

  // Download functionality
  const handleDownload = () => {
    if (!dashboard) return

    // Prepare CSV data
    const csvData = [
      // Header
      ['Dashboard Data Export', '', '', ''],
      [`Period: ${meta?.period || 'N/A'}`, '', '', ''],
      [`Export Date: ${new Date().toLocaleDateString()}`, '', '', ''],
      ['', '', '', ''],
      
      // Revenue Summary
      ['Revenue Summary', '', '', ''],
      ['Total Revenue', `$${dashboard.revenue.totalRevenue}`, '', ''],
      ['', '', '', ''],
      
      // Revenue by Period
      ['Revenue by Period', '', '', ''],
      ['Date', 'Revenue', '', ''],
      ...dashboard.revenue.periodRevenue.map(item => [item.date, `$${item.revenue}`, '', '']),
      ['', '', '', ''],
      
      // Appointments Summary
      ['Appointments Summary', '', '', ''],
      ['Total Appointments', dashboard.appointments.totalAppointments.toString(), '', ''],
      ['Upcoming Appointments', dashboard.appointments.upcomingAppointments.toString(), '', ''],
      ['Completed Appointments', dashboard.appointments.completedAppointments.toString(), '', ''],
      ['', '', '', ''],
      
      // Appointments by Period
      ['Appointments by Period', '', '', ''],
      ['Date', 'Count', '', ''],
      ...dashboard.appointments.periodAppointments.map(item => [item.date, item.count.toString(), '', '']),
      ['', '', '', ''],
      
      // Top Customers
      ['Top Customers', '', '', ''],
      ['Customer ID', 'Name', 'Email', 'Revenue', 'Orders'],
      ...dashboard.topCustomers.map(customer => [
        customer.customerId.toString(),
        customer.customerName,
        customer.email,
        `$${customer.totalRevenue}`,
        customer.orderCount.toString()
      ])
    ]

    // Convert to CSV string
    const csvString = csvData.map(row => row.join(',')).join('\n')
    
    // Create and download file
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `dashboard-export-${meta?.period?.toLowerCase() || 'data'}-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (isLoading) {
    return (
      <>
        <Header>
          <TopNav links={topNav} />
          <div className='ms-auto flex items-center space-x-4'>
            <Search />
            <ThemeSwitch />
            <ConfigDrawer />
            <ProfileDropdown />
          </div>
        </Header>
        <Main>
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading dashboard data...</div>
          </div>
        </Main>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Header>
          <TopNav links={topNav} />
          <div className='ms-auto flex items-center space-x-4'>
            <Search />
            <ThemeSwitch />
            <ConfigDrawer />
            <ProfileDropdown />
          </div>
        </Header>
        <Main>
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-red-500">Error loading dashboard data</div>
          </div>
        </Main>
      </>
    )
  }

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <TopNav links={topNav} />
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Main ===== */}
      <Main>
        <div className='mb-2 flex items-center justify-between space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight'>Dashboard</h1>
          <div className='flex items-center space-x-2'>
            <Select value={selectedPeriod} onValueChange={(value: Period) => setSelectedPeriod(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DAY">Day</SelectItem>
                <SelectItem value="MONTH">Month</SelectItem>
                <SelectItem value="YEAR">Year</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleDownload} disabled={!dashboard}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="mr-2 h-4 w-4"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7,10 12,15 17,10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download CSV
            </Button>
          </div>
        </div>

      {/* ===== Main Dashboard Content ===== */}
      <div className="space-y-4">
        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="text-muted-foreground h-4 w-4"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${dashboard?.revenue.totalRevenue || 0}</div>
              <p className="text-muted-foreground text-xs">
                {meta?.period.toLowerCase()} period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Payments
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="text-muted-foreground h-4 w-4"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(pendingPaymentsTotal)}</div>
              <p className="text-muted-foreground text-xs">
                {pendingPayments.length} invoices
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Refunds This Period
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="text-muted-foreground h-4 w-4"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(refundsTotal)}</div>
              <p className="text-muted-foreground text-xs">
                {refundsThisPeriod.length} refunds
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Overdue Invoices
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="text-muted-foreground h-4 w-4"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{overdueInvoices.length}</div>
              <p className="text-muted-foreground text-xs">
                Requires attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Appointments
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="text-muted-foreground h-4 w-4"
              >
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <path d="M2 10h20" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboard?.appointments.totalAppointments || 0}</div>
              <p className="text-muted-foreground text-xs">
                {dashboard?.appointments.upcomingAppointments || 0} upcoming
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Completed Appointments
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="text-muted-foreground h-4 w-4"
              >
                <path d="M9 12l2 2 4-4" />
                <circle cx="12" cy="12" r="10" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboard?.appointments.completedAppointments || 0}</div>
              <p className="text-muted-foreground text-xs">
                Completed this {meta?.period.toLowerCase()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Top Customers
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="text-muted-foreground h-4 w-4"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboard?.topCustomers.length || 0}</div>
              <p className="text-muted-foreground text-xs">
                Active customers
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Data Tables */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Left Column - Revenue and Appointments */}
          <div className="space-y-4 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>
                  Revenue data for the selected {meta?.period.toLowerCase()} period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RevenueChart data={dashboard?.revenue.periodRevenue || []} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Appointments Overview</CardTitle>
                <CardDescription>
                  Appointment statistics for the selected {meta?.period.toLowerCase()} period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AppointmentsChart data={dashboard?.appointments.periodAppointments || []} />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Top Customers */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Top Customers</CardTitle>
              <CardDescription>
                Customers with highest revenue this {meta?.period.toLowerCase()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TopCustomersList customers={dashboard?.topCustomers || []} />
            </CardContent>
          </Card>
        </div>
      </div>
      </Main>
    </>
  )
}

// Revenue Chart Component
function RevenueChart({ data }: { data: Array<{ date: string; revenue: number }> }) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">No revenue data available</div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index} className="flex items-center justify-between py-2">
          <span className="text-sm text-muted-foreground">{item.date}</span>
          <span className="font-medium text-right">${item.revenue}</span>
        </div>
      ))}
    </div>
  )
}

// Top Customers List Component
function TopCustomersList({ customers }: { customers: Array<{ customerId: number; customerName: string; email: string; totalRevenue: number; orderCount: number }> }) {
  if (!customers.length) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-muted-foreground">No customer data available</div>
      </div>
    )
  }

  return (
    <div className="max-h-96 overflow-y-auto space-y-4 pr-2">
      {customers.map((customer) => (
        <div key={customer.customerId} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
          <div className="space-y-1 flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{customer.customerName}</p>
            <p className="text-xs text-muted-foreground truncate">{customer.email}</p>
          </div>
          <div className="text-right ml-2">
            <div className="text-sm font-medium">${customer.totalRevenue}</div>
            <div className="text-xs text-muted-foreground">{customer.orderCount} orders</div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Appointments Chart Component
function AppointmentsChart({ data }: { data: Array<{ date: string; count: number }> }) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-muted-foreground">No appointment data available</div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index} className="flex items-center justify-between py-2">
          <span className="text-sm text-muted-foreground">{item.date}</span>
          <span className="font-medium text-right">{item.count} appointments</span>
        </div>
      ))}
    </div>
  )
}