import { useState } from "react";
import { Header } from "@/components/dashboard/layout/header";
import { Main } from "@/components/dashboard/layout/main";
import { ProfileDropdown } from "@/components/dashboard/profile-dropdown";
import { Search } from "@/components/dashboard/search";
import { ThemeSwitch } from "@/components/dashboard/theme-switch";
import { ConfigDrawer } from "@/components/dashboard/config-drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/dashboard/ui/tabs";
import { SuperAdminStats } from "./components/super-admin-stats";
import { SuperAdminOrganizations } from "./components/super-admin-organizations";
import { SuperAdminUsage } from "./components/super-admin-usage";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { ROLE } from "@/constants/roles";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export function SuperAdminDashboard() {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Check if user is SUPER_ADMIN
  const isSuperAdmin = user?.roles?.includes(ROLE.SUPER_ADMIN) || (user?.roles as string[])?.includes('SUPER_ADMIN');

  // Redirect if not SUPER_ADMIN
  useEffect(() => {
    if (user && !isSuperAdmin) {
      navigate({ to: '/' });
    }
  }, [user, isSuperAdmin, navigate]);

  // Don't render if not SUPER_ADMIN
  if (user && !isSuperAdmin) {
    return null;
  }

  return (
    <>
      <Header fixed>
        <Search />
        <div className="ms-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Super Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage and monitor all organizations</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="organizations">Organizations</TabsTrigger>
            <TabsTrigger value="usage">Integrations Usage</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <SuperAdminStats />
          </TabsContent>

          <TabsContent value="organizations" className="space-y-4">
            <SuperAdminOrganizations />
          </TabsContent>

          <TabsContent value="usage" className="space-y-4">
            <SuperAdminUsage />
          </TabsContent>
        </Tabs>
      </Main>
    </>
  );
}
