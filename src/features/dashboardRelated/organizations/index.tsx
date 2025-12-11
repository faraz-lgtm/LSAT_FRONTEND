import { Header } from "@/components/dashboard/layout/header";
import { Main } from "@/components/dashboard/layout/main";
import { ProfileDropdown } from "@/components/dashboard/profile-dropdown";
import { Search } from "@/components/dashboard/search";
import { ThemeSwitch } from "@/components/dashboard/theme-switch";
import { ConfigDrawer } from "@/components/dashboard/config-drawer";
import { useGetAllOrganizationsQuery, type OrganizationOutput } from "@/redux/apiSlices/Organization/organizationSlice";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/dashboard/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/dashboard/ui/table";
import { Badge } from "@/components/dashboard/ui/badge";
import { Loader2 } from "lucide-react";
import { ROLE } from "@/constants/roles";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { OrganizationsProvider, useOrganizations } from "./components/organizations-provider";
import { OrganizationsDialogs } from "./components/organizations-dialogs";
import { OrganizationsRowActions } from "./components/organizations-row-actions";
import { isOnOrganizationDomain } from "@/utils/organization";
import { Button } from "@/components/dashboard/ui/button";
import { Plus } from "lucide-react";

export function Organizations() {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  // Check if user is SUPER_ADMIN
  const isSuperAdmin = user?.roles?.includes(ROLE.SUPER_ADMIN) || (user?.roles as string[])?.includes('SUPER_ADMIN');

  // Redirect if not SUPER_ADMIN - this route is deprecated, use /super-admin/dashboard instead
  useEffect(() => {
    if (user && !isSuperAdmin) {
      navigate({ to: '/errors/403' });
    } else if (user && isSuperAdmin) {
      // Redirect super admin to the new dashboard
      navigate({ to: '/super-admin/dashboard' });
    }
  }, [user, isSuperAdmin, navigate]);

  // Don't render - redirect handled in useEffect
  return null;
}

// Organizations Content Component (inside provider)
function OrganizationsContent() {
  const { data: organizationsData, isLoading, error } = useGetAllOrganizationsQuery({ hasDomain: true });
  const { setOpen } = useOrganizations();

  // Filter organizations that have domains
  const organizationsArray = organizationsData?.data || [];
  const organizationsWithDomains = organizationsArray.filter((org: OrganizationOutput) => 
    org.domain || (org.domains && org.domains.length > 0)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>Failed to load organizations</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">An error occurred while loading organizations. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Organizations</h2>
          <p className="text-muted-foreground">
            Manage all organizations with domains. Click on a domain to view packages for that organization.
          </p>
        </div>
        <Button
          onClick={() => setOpen('add')}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Organization
        </Button>
      </div>

        <Card>
          <CardHeader>
            <CardTitle>All Organizations</CardTitle>
            <CardDescription>
              Organizations with configured domains ({organizationsWithDomains.length} total)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {organizationsWithDomains.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No organizations with domains found.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {organizationsWithDomains.map((org) => (
                    <TableRow key={org.id}>
                      <TableCell>{org.id}</TableCell>
                      <TableCell className="font-medium">{org.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{org.slug}</Badge>
                      </TableCell>
                      <TableCell>
                        {org.domain ? (
                          <div className="flex flex-col gap-1">
                            <span className="font-medium">{org.domain}</span>
                            {!isOnOrganizationDomain() && (
                              <a
                                href={`/${org.slug}`}
                                className="text-primary hover:underline text-sm"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                View on {org.slug}
                              </a>
                            )}
                          </div>
                        ) : org.domains && org.domains.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {org.domains.map((domain, idx) => (
                              <div key={idx} className="flex flex-col gap-1">
                                <span className="font-medium text-sm">{domain}</span>
                                {!isOnOrganizationDomain() && (
                                  <a
                                    href={`/${org.slug}`}
                                    className="text-primary hover:underline text-xs"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    View on {org.slug}
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No domain</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {org.archived ? (
                          <Badge variant="secondary">Archived</Badge>
                        ) : (
                          <Badge variant="default">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {(org.domain || (org.domains && org.domains.length > 0)) && (
                            <a
                              href={isOnOrganizationDomain() 
                                ? `/${org.domain || org.domains?.[0]}` 
                                : `/${org.slug}`
                              }
                              className="text-sm text-primary hover:underline"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View Packages
                            </a>
                          )}
                          <OrganizationsRowActions organization={org} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
    </>
  );
}

