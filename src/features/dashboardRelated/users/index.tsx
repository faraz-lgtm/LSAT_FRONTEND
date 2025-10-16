import { getRouteApi } from "@tanstack/react-router";
import { ConfigDrawer } from "@/components/dashboard/config-drawer";
import { Header } from "@/components/dashboard/layout/header";
import { Main } from "@/components/dashboard/layout/main";
import { ProfileDropdown } from "@/components/dashboard/profile-dropdown";
import { Search } from "@/components/dashboard/search";
import { ThemeSwitch } from "@/components/dashboard/theme-switch";
import { UsersDialogs } from "./components/users-dialogs";
import { UsersPrimaryButtons } from "./components/users-primary-buttons";
import { UsersProvider } from "./components/users-provider";
import { UsersTable } from "./components/users-table";
import { useGetUsersQuery, type UserOutput } from "@/redux/apiSlices/User/userSlice";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { filterUsersByRole } from "@/utils/rbac";
import { convertAuthUserToIUser } from "@/utils/authUserConverter";
// import { users } from './data/users'

const route = getRouteApi("/_authenticated/users/");

export function Users() {
  const { data: usersData, isSuccess } = useGetUsersQuery();
  const search = route.useSearch();
  const navigate = route.useNavigate();

  console.log("usersData", usersData?.data);
  // Get current user from auth state
  const currentUser = useSelector((state: RootState) => state.auth.user);

  // Convert AuthUser to UserOutput format for RBAC functions
  const currentUserForRBAC = convertAuthUserToIUser(currentUser);
  let filteredUsers: UserOutput[] = [];

  // Filter users based on current user's role
  console.log("check2", usersData?.data,currentUserForRBAC);
  if (isSuccess) {
    filteredUsers = filterUsersByRole(
      usersData?.data || [],
      currentUserForRBAC
    );

    console.log("filteredUsers", filteredUsers);
  }
  return (
    <UsersProvider>
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
            <h2 className="text-2xl font-bold tracking-tight">User List</h2>
            <p className="text-muted-foreground">
              Manage your users and their roles here.
            </p>
          </div>
          <UsersPrimaryButtons />
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <UsersTable
            data={filteredUsers}
            search={search}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            navigate={navigate as any}
          />
        </div>
      </Main>

      <UsersDialogs />
    </UsersProvider>
  );
}
