import { getRouteApi } from "@tanstack/react-router";
import { ConfigDrawer } from "@/components/dashboard/config-drawer";
import { Header } from "@/components/dashboard/layout/header";
import { Main } from "@/components/dashboard/layout/main";
import { ProfileDropdown } from "@/components/dashboard/profile-dropdown";
import { Search } from "@/components/dashboard/search";
import { ThemeSwitch } from "@/components/dashboard/theme-switch";
import { RefundsDialogs } from "./components/refunds-dialogs";
import { RefundsProvider } from "./components/refunds-provider";
import { RefundsTable } from "./components/refunds-table";
import { useGetRefundsQuery } from "@/redux/apiSlices/Refunds/refundsSlice";
import type { RefundOutput } from "@/redux/apiSlices/Refunds/refundsSlice";

const route = getRouteApi("/_authenticated/refunds/");

export function Refunds() {
  const { data: refundsData, isSuccess, isLoading, error } = useGetRefundsQuery();
  const search = route.useSearch();
  const navigate = route.useNavigate();

  console.log("refundsData", refundsData);
  console.log("isSuccess:", isSuccess);
  console.log("isLoading:", isLoading);
  console.log("error:", error);
  console.log("refundsData?.data:", refundsData?.data);

  let refunds: RefundOutput[] = [];

  if (isSuccess && refundsData) {
    console.log("setting refunds", refundsData);
    refunds = refundsData.data;
  } else {
    console.log("NOT setting refunds - isSuccess:", isSuccess, "refundsData:", refundsData);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading refunds...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-500">Error loading refunds</div>
      </div>
    );
  }

  return (
    <RefundsProvider>
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
            <h2 className="text-2xl font-bold tracking-tight">Refunds</h2>
            <p className="text-muted-foreground">
              View and manage customer refunds.
            </p>
          </div>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <RefundsTable
            data={refunds}
            search={search}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            navigate={navigate as any}
          />
        </div>
      </Main>

      <RefundsDialogs />
    </RefundsProvider>
  );
}
