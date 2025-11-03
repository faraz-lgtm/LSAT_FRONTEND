import { Link, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { ThemeSwitch } from "../components/dashboard/theme-switch";
import { CurrencySwitch } from "../components/currency-switch";
import { Logo } from "../assets/logo";
import { useCurrencyFormatter } from "../utils/currency";

const Layout = () => {
  const location = useLocation();
  const isFreePurchase = location.pathname === '/free_purchase';
  const { items } = useSelector((state: RootState) => state.cart);
  const formatCurrency = useCurrencyFormatter();
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header / Cart bar */}
      <header className="bg-gray-800 dark:bg-gray-900 text-white px-3 py-2 sm:px-4 sm:py-4 flex justify-between items-center flex-shrink-0 gap-2">
        <Link to="/" className="flex items-center space-x-2 sm:space-x-3 font-bold min-w-0 flex-shrink-0">
          <Logo className="text-white h-6 w-auto sm:h-8 sm:w-auto flex-shrink-0" />
          <span className="text-sm sm:text-lg truncate">Better LSAT</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0 min-w-0">
          {!isFreePurchase && (
            <>
              <Link to="/cart" className="hover:underline text-xs sm:text-base whitespace-nowrap">
                Cart ({items.length})
              </Link>
              <span className="text-xs sm:text-base whitespace-nowrap hidden md:inline">
                Total: {formatCurrency(total * 100)}
              </span>
            </>
          )}
          <CurrencySwitch />
          <ThemeSwitch style="dark" />
        </div>
      </header>

      {/* Main Content (routes render here) */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
