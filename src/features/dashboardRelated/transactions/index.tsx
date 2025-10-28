import { getRouteApi } from "@tanstack/react-router";
import { ConfigDrawer } from "@/components/dashboard/config-drawer";
import { Header } from "@/components/dashboard/layout/header";
import { Main } from "@/components/dashboard/layout/main";
import { ProfileDropdown } from "@/components/dashboard/profile-dropdown";
import { Search } from "@/components/dashboard/search";
import { ThemeSwitch } from "@/components/dashboard/theme-switch";
import { TransactionsDialogs } from "./components/transactions-dialogs";
import { TransactionsProvider } from "./components/transactions-provider";
import { TransactionsTable } from "./components/transactions-table";
import { useGetTransactionsQuery } from "@/redux/apiSlices/Transactions/transactionsSlice";
import type { TransactionOutput } from "@/redux/apiSlices/Transactions/transactionsSlice";

const route = getRouteApi("/_authenticated/transactions/");

export function Transactions() {
  const { data: transactionsData, isSuccess, isLoading, error } = useGetTransactionsQuery();
  const search = route.useSearch();
  const navigate = route.useNavigate();

  console.log("transactionsData", transactionsData);
  console.log("isSuccess:", isSuccess);
  console.log("isLoading:", isLoading);
  console.log("error:", error);
  console.log("transactionsData?.data:", transactionsData?.data);

  let transactions: TransactionOutput[] = [];

  if (isSuccess && transactionsData) {
    console.log("setting transactions", transactionsData);
    transactions = transactionsData.data;
  } else {
    console.log("NOT setting transactions - isSuccess:", isSuccess, "transactionsData:", transactionsData);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading transactions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-500">Error loading transactions</div>
      </div>
    );
  }

  return (
    <TransactionsProvider>
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
            <h2 className="text-2xl font-bold tracking-tight">Transactions</h2>
            <p className="text-muted-foreground">
              View payment and transaction history.
            </p>
          </div>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <TransactionsTable
            data={transactions}
            search={search}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            navigate={navigate as any}
          />
        </div>
      </Main>

      <TransactionsDialogs />
    </TransactionsProvider>
  );
}
