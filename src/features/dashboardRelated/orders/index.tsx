import { getRouteApi } from "@tanstack/react-router";
import { ConfigDrawer } from "@/components/dashboard/config-drawer";
import { Header } from "@/components/dashboard/layout/header";
import { Main } from "@/components/dashboard/layout/main";
import { ProfileDropdown } from "@/components/dashboard/profile-dropdown";
import { Search } from "@/components/dashboard/search";
import { ThemeSwitch } from "@/components/dashboard/theme-switch";
import { OrdersDialogs } from "./components/orders-dialogs";
import { OrdersProvider } from "./components/orders-provider";
import { OrdersTable } from "./components/orders-table";
import { useGetOrdersQuery, type Order } from "@/redux/apiSlices/Order/orderSlice";

const route = getRouteApi("/_authenticated/orders/");

export function Orders() {
  const { data: ordersData, isSuccess, isLoading, error } = useGetOrdersQuery();
  const search = route.useSearch();
  const navigate = route.useNavigate();

  console.log("ordersData", ordersData);
  console.log("isSuccess:", isSuccess);
  console.log("isLoading:", isLoading);
  console.log("error:", error);
  console.log("ordersData?.data:", ordersData?.data);

  let orders: Order[] = [];

  if (isSuccess && ordersData) {
    console.log("setting orders", ordersData);
    orders = ordersData.data;
  } else {
    console.log("NOT setting orders - isSuccess:", isSuccess, "ordersData:", ordersData);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-500">Error loading orders</div>
      </div>
    );
  }

  return (
    <OrdersProvider>
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
            <h2 className="text-2xl font-bold tracking-tight">Orders</h2>
            <p className="text-muted-foreground">
              View and manage customer orders.
            </p>
          </div>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <OrdersTable
            data={orders}
            search={search}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            navigate={navigate as any}
          />
        </div>
      </Main>

      <OrdersDialogs />
    </OrdersProvider>
  );
}
