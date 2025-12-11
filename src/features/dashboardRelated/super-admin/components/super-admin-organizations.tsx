import { useGetAllOrganizationsQuery, type OrganizationOutput } from "@/redux/apiSlices/Organization/organizationSlice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/dashboard/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/dashboard/ui/table";
import { Badge } from "@/components/dashboard/ui/badge";
import { Loader2, Plus } from "lucide-react";
import { OrganizationsProvider, useOrganizations } from "@/features/dashboardRelated/organizations/components/organizations-provider";
import { OrganizationsDialogs } from "@/features/dashboardRelated/organizations/components/organizations-dialogs";
import { OrganizationsRowActions } from "@/features/dashboardRelated/organizations/components/organizations-row-actions";
import { isOnOrganizationDomain } from "@/utils/organization";
import { Button } from "@/components/dashboard/ui/button";

function OrganizationsTable() {
  const { data: organizationsData, isLoading, error } = useGetAllOrganizationsQuery({ hasDomain: true });
  const { setOpen } = useOrganizations();

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
      <div className="mb-4 flex justify-end">
        <Button
          onClick={() => setOpen('add')}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Organization
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
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

export function SuperAdminOrganizations() {
  return (
    <OrganizationsProvider>
      <OrganizationsContent />
      <OrganizationsDialogs />
    </OrganizationsProvider>
  );
}

function OrganizationsContent() {
  return <OrganizationsTable />;
}
