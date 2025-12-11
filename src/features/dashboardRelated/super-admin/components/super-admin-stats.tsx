import { useGetSuperAdminStatsQuery } from "@/redux/apiSlices/SuperAdmin/superAdminSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard/ui/card";
import { Loader2, Building2, Users, UserPlus, UserCheck, Calendar, DollarSign } from "lucide-react";

export function SuperAdminStats() {
  const { data, isLoading, error } = useGetSuperAdminStatsQuery(undefined, {
    // Add retry configuration to handle temporary backend issues
    pollingInterval: 0,
    refetchOnMountOrArgChange: true,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    // Show a more informative error with the actual error details
    const errorMessage = 'status' in error && error.status === 500
      ? 'The statistics endpoint is not yet implemented on the backend. Please contact your backend team to implement the GET /api/v1/super-admin/stats endpoint.'
      : 'Failed to load statistics. Please try again later.';
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>Statistics Unavailable</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-destructive">{errorMessage}</p>
          {('status' in error && error.status === 500) && (
            <div className="mt-4 p-4 bg-muted rounded-md">
              <p className="text-sm font-semibold mb-2">Backend Implementation Required:</p>
              <p className="text-sm text-muted-foreground">
                The backend needs to implement the statistics endpoint that returns:
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside mt-2 space-y-1">
                <li>totalOrganizations (number)</li>
                <li>totalLeads (number)</li>
                <li>totalContacts (number)</li>
                <li>totalCustomers (number)</li>
                <li>totalAppointments (number)</li>
                <li>totalRevenue (number)</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  const stats = data?.data;

  const statsCards = [
    {
      title: "Total Organizations",
      value: stats?.totalOrganizations || 0,
      icon: Building2,
      description: "Active organizations",
    },
    {
      title: "Total Leads",
      value: stats?.totalLeads || 0,
      icon: UserPlus,
      description: "Across all organizations",
    },
    {
      title: "Total Contacts",
      value: stats?.totalContacts || 0,
      icon: Users,
      description: "With orders, no payment",
    },
    {
      title: "Total Customers",
      value: stats?.totalCustomers || 0,
      icon: UserCheck,
      description: "With paid orders",
    },
    {
      title: "Total Appointments",
      value: stats?.totalAppointments || 0,
      icon: Calendar,
      description: "All scheduled appointments",
    },
    {
      title: "Total Revenue",
      value: `$${(stats?.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      description: "Global revenue",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {statsCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
