import { useMemo } from "react";
import { getRouteApi } from "@tanstack/react-router";
import { ConfigDrawer } from "@/components/dashboard/config-drawer";
import { Header } from "@/components/dashboard/layout/header";
import { Main } from "@/components/dashboard/layout/main";
import { ProfileDropdown } from "@/components/dashboard/profile-dropdown";
import { Search } from "@/components/dashboard/search";
import { ThemeSwitch } from "@/components/dashboard/theme-switch";
import { UsersDialogs } from "../components/users-dialogs";
import { UsersPrimaryButtons } from "../components/users-primary-buttons";
import { UsersProvider } from "../components/users-provider";
import { UsersTable } from "../components/users-table";
import { useGetUsersQuery } from "@/redux/apiSlices/User/userSlice";

const route = getRouteApi("/_authenticated/users/employees");

export function EmployeesPage() {
  const { data: usersData, isSuccess } = useGetUsersQuery(undefined);
  const search = route.useSearch();
  const navigate = route.useNavigate();

  const employees = useMemo(() => {
    if (!isSuccess) return [];
    const all = usersData?.data || [];
    return all.filter(u => 
      u.roles.includes('ADMIN') || 
      u.roles.includes('USER') || 
      u.roles.includes('COMPANY_ADMIN') ||
      (u.roles as string[]).includes('SUPER_ADMIN')
    );
  }, [isSuccess, usersData?.data]);

  return (
    <UsersProvider pageType="employees">
      <Header fixed>
        <Search />
        <div className="ms-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Employees</h2>
            <p className="text-muted-foreground">Admins and staff users.</p>
          </div>
          <UsersPrimaryButtons />
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <UsersTable
            data={employees}
            search={search}
            hideCustomerTypeFilter
            excludeRolesFromFilter={['cust']}
            showGoogleCalendarColumn
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            navigate={navigate as any}
          />
        </div>
      </Main>

      <UsersDialogs />
    </UsersProvider>
  );
}


