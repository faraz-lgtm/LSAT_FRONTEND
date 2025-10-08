import { Link, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { ThemeSwitch } from "../components/dashboard/theme-switch";

const Layout = () => {
  const { items } = useSelector((state: RootState) => state.cart);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header / Cart bar */}
      <header className="bg-gray-800 dark:bg-gray-900 text-white p-4 flex justify-between items-center">
        <Link to="/" className="text-lg font-bold">
          🛒 My Shop
        </Link>
        <div className="flex items-center space-x-4">
          <Link to="/cart" className="hover:underline">
            Cart ({items.length})
          </Link>
          <span>Total: ${total.toFixed(2)}</span>
          <ThemeSwitch style="dark" />
        </div>
      </header>

      {/* Main Content (routes render here) */}
      <main className="flex-1 p-4">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-200 dark:bg-gray-800 p-4 text-center text-gray-800 dark:text-gray-200">
        © {new Date().getFullYear()} My Shop
      </footer>
    </div>
  );
};

export default Layout;
