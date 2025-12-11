import { Header } from "@/components/dashboard/layout/header";
import { Main } from "@/components/dashboard/layout/main";
import { ProfileDropdown } from "@/components/dashboard/profile-dropdown";
import { Search } from "@/components/dashboard/search";
import { ThemeSwitch } from "@/components/dashboard/theme-switch";
import { ConfigDrawer } from "@/components/dashboard/config-drawer";
import { SuperAdminUsage } from "../components/super-admin-usage";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { ROLE } from "@/constants/roles";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export function SuperAdminUsagePage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  const isSuperAdmin = user?.roles?.includes(ROLE.SUPER_ADMIN) || (user?.roles as string[])?.includes('SUPER_ADMIN');

  useEffect(() => {
    if (user && !isSuperAdmin) {
      navigate({ to: '/' });
    }
  }, [user, isSuperAdmin, navigate]);

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
          <h1 className="text-3xl font-bold tracking-tight">Integrations Usage</h1>
          <p className="text-muted-foreground">Monitor SMS, Email, and Call usage across all organizations</p>
        </div>

        <SuperAdminUsage />
      </Main>
    </>
  );
}
