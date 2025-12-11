import { useGetSuperAdminUsageQuery } from "@/redux/apiSlices/SuperAdmin/superAdminSlice";
import { useGetAllOrganizationsQuery } from "@/redux/apiSlices/Organization/organizationSlice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/dashboard/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/dashboard/ui/table";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";

export function SuperAdminUsage() {
  const { data, isLoading, error } = useGetSuperAdminUsageQuery(undefined, {
    pollingInterval: 0,
    refetchOnMountOrArgChange: true,
  });

  // Fallback: fetch all organizations to show them with zero counts if usage data is empty
  const { data: organizationsData } = useGetAllOrganizationsQuery(undefined, {
    skip: !data || (data?.data && data.data.length > 0), // Skip if we have usage data
  });

  // Helper function to format call duration
  const formatDuration = (seconds: number | undefined | null): string => {
    if (seconds === undefined || seconds === null || seconds === 0) {
      return "0s";
    }

    const totalSeconds = Math.floor(seconds);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  // Debug: Log the response to see what we're getting
  console.log("Super Admin Usage API Response:", data);
  console.log("Usage Data Array:", data?.data);

  // If usage endpoint returns empty data, create usage entries from organizations with zero counts
  const usageData = useMemo(() => {
    const apiUsageData = data?.data || [];

    // If we have usage data from the API, use it
    if (apiUsageData.length > 0) {
      return apiUsageData;
    }

    // Fallback: create usage data from organizations with zero counts
    const organizations = organizationsData?.data || [];
    if (organizations.length > 0) {
      console.log("No usage data from API, creating from organizations:", organizations);
      return organizations.map((org) => ({
        organizationId: org.id,
        organizationName: org.name,
        smsCount: 0,
        emailCount: 0,
        callDuration: 0,
      }));
    }

    return [];
  }, [data?.data, organizationsData?.data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    const errorMessage =
      "status" in error && error.status === 500
        ? "The usage endpoint is not yet implemented on the backend. Please contact your backend team to implement the GET /api/v1/super-admin/usage endpoint."
        : "An error occurred while loading usage data. Please try again later.";

    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>Failed to load usage data</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{errorMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Integrations Usage</CardTitle>
        <CardDescription>
          Usage statistics for SMS, Email, and Call integrations across all organizations
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!Array.isArray(usageData) ? (
          <div className="text-center py-8">
            <p className="text-destructive">Invalid data format received from backend.</p>
            <p className="text-sm text-muted-foreground mt-2">Expected an array of usage data.</p>
          </div>
        ) : usageData.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No organizations found.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Create organizations to see their integration usage statistics here.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Note: The backend endpoint GET /api/v1/super-admin/usage should return usage data for all organizations.
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organization</TableHead>
                  <TableHead className="text-right">SMS Count</TableHead>
                  <TableHead className="text-right">Email Count</TableHead>
                  <TableHead className="text-right">Call Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usageData.map((usage) => {
                  // Debug: Log each usage entry
                  console.log("Usage entry:", usage);

                  return (
                    <TableRow key={usage.organizationId}>
                      <TableCell className="font-medium">
                        {usage.organizationName || "Unknown Organization"}
                      </TableCell>
                      <TableCell className="text-right">{(usage.smsCount ?? 0).toLocaleString()}</TableCell>
                      <TableCell className="text-right">{(usage.emailCount ?? 0).toLocaleString()}</TableCell>
                      <TableCell className="text-right">{formatDuration(usage.callDuration ?? 0)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
