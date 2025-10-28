import { ConfigDrawer } from "@/components/dashboard/config-drawer";
import { Header } from "@/components/dashboard/layout/header";
import { Main } from "@/components/dashboard/layout/main";
import { ProfileDropdown } from "@/components/dashboard/profile-dropdown";
import { Search } from "@/components/dashboard/search";
import { ThemeSwitch } from "@/components/dashboard/theme-switch";
import type { InvoiceOutput } from "@/redux/apiSlices/Invoicing/invoicingSlice";
import { useGetInvoicesQuery } from "@/redux/apiSlices/Invoicing/invoicingSlice";
import { useGetUsersQuery } from "@/redux/apiSlices/User/userSlice";
import { getRouteApi } from "@tanstack/react-router";
import { InvoicesDialogs } from "./components/invoices-dialogs";
import { InvoicesProvider } from "./components/invoices-provider";
import { InvoicesTable } from "./components/invoices-table";

const route = getRouteApi("/_authenticated/invoices/");

export function Invoices() {
  const { data: invoicesData, isSuccess, isLoading, error } = useGetInvoicesQuery();
  const { data: usersData } = useGetUsersQuery();
  const search = route.useSearch();
  const navigate = route.useNavigate();

  console.log("invoicesData", invoicesData);
  console.log("isSuccess:", isSuccess);
  console.log("isLoading:", isLoading);
  console.log("error:", error);
  console.log("invoicesData?.data:", invoicesData?.data);

  let invoices: InvoiceOutput[] = [];

  if (isSuccess && invoicesData) {
    console.log("setting invoices", invoicesData);
    invoices = invoicesData.data;
  } else {
    console.log("NOT setting invoices - isSuccess:", isSuccess, "invoicesData:", invoicesData);
  }



  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading invoices...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-500">Error loading invoices</div>
      </div>
    );
  }

  return (
    <InvoicesProvider>
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
            <h2 className="text-2xl font-bold tracking-tight">Invoices</h2>
            <p className="text-muted-foreground">
              View and manage customer invoices.
            </p>
          </div>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <InvoicesTable
            data={invoices}
            users={usersData?.data || []}
            search={search}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            navigate={navigate as any}
          />
        </div>
      </Main>

      <InvoicesDialogs />
    </InvoicesProvider>
  );
}
