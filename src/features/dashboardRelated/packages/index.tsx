import { getRouteApi } from "@tanstack/react-router";
import { ConfigDrawer } from "@/components/dashboard/config-drawer";
import { Header } from "@/components/dashboard/layout/header";
import { Main } from "@/components/dashboard/layout/main";
import { ProfileDropdown } from "@/components/dashboard/profile-dropdown";
import { Search } from "@/components/dashboard/search";
import { ThemeSwitch } from "@/components/dashboard/theme-switch";
import { PackagesDialogs } from "./components/packages-dialogs";
import { PackagesProvider } from "./components/packages-provider";
import { PackagesTable } from "./components/packages-table";
import { PackagesPrimaryButtons } from "./components/packages-primary-buttons";
import { useGetProductsQuery, type ProductOutput } from "@/redux/apiSlices/Product/productSlice";

const route = getRouteApi("/_authenticated/packages/");

export function Packages() {
  const { data: productsData, isSuccess, isLoading, error } = useGetProductsQuery();
  const search = route.useSearch();
  const navigate = route.useNavigate();

  console.log("productsData", productsData);
  console.log("isSuccess:", isSuccess);
  console.log("isLoading:", isLoading);
  console.log("error:", error);
  console.log("productsData?.data:", productsData?.data);

  let products: ProductOutput[] = [];

  if (isSuccess && productsData) {
    console.log("setting products", productsData);
    products = productsData.data;
  } else {
    console.log("NOT setting products - isSuccess:", isSuccess, "productsData:", productsData);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading packages...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-500">Error loading packages</div>
      </div>
    );
  }

  return (
    <PackagesProvider>
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
            <h2 className="text-2xl font-bold tracking-tight">Packages</h2>
            <p className="text-muted-foreground">
              Manage your service packages and pricing.
            </p>
          </div>
          <PackagesPrimaryButtons />
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <PackagesTable
            data={products}
            search={search}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            navigate={navigate as any}
          />
        </div>
      </Main>

      <PackagesDialogs />
    </PackagesProvider>
  );
}
