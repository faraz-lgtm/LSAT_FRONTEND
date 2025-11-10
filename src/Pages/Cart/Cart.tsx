import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import CartCard from "./CartCard";
import OrderSummary from "./OrderSummary";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import GlobalProgressBar from "../../components/GlobalProgressBar";
import { useCheckoutProgress } from "../../hooks/useCheckoutProgress";
import { useCurrencyFormatter } from "../../utils/currency";
import { useGetProductsQuery } from "../../redux/apiSlices/Product/productSlice";

const Cart = () => {
  const { items } = useSelector((state: RootState) => state.cart);
  const navigate = useNavigate();
  const formatCurrency = useCurrencyFormatter();
  const { data: productsData } = useGetProductsQuery();
  
  // Get current checkout progress step
  const currentStep: 1 | 2 | 3 | 4 = useCheckoutProgress();

  // Calculate total discount by matching cart items with products
  const totalDiscount = items.reduce((sum, item) => {
    const product = productsData?.data?.find(p => p.id === item.id);
    const itemDiscount = (product?.save || 0) * item.quantity;
    return sum + itemDiscount;
  }, 0);

  // const total = items.reduce(
  //   (sum, item) => sum + item.price * item.quantity,
  //   0
  // );

  const handleBackToHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-blue-800 dark:to-purple-800 relative flex flex-col">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ backgroundColor: '#0D47A1' }}></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse delay-2000"></div>
        <div className="absolute top-20 left-20 w-64 h-64 bg-cyan-300 rounded-full mix-blend-multiply filter blur-2xl opacity-15 animate-pulse delay-500"></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-yellow-300 rounded-full mix-blend-multiply filter blur-2xl opacity-15 animate-pulse delay-1500"></div>
      </div>
      <div className="relative z-10 flex flex-col min-h-screen p-3 sm:p-4">
        {/* Top Section - Fixed Height */}
        <div className="flex-shrink-0 space-y-2 mb-4">
          {/* Back Button */}
          <div>
            <button
              onClick={handleBackToHome}
              className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg shadow-sm hover:shadow-md text-xs"
            >
              <ArrowLeft size={16} />
              <span className="font-medium">Back to Packages</span>
            </button>
          </div>

          {/* Global Progress Bar */}
          <GlobalProgressBar currentStep={currentStep} />

          {/* Header Section */}
          <div className="hidden sm:block bg-white dark:bg-gray-800 rounded-lg shadow-md p-3">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
              <div>
                <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-0.5">
                  Review your Booking
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-300">Double-check your sessions before you continue — 
                you can still edit or remove any bundle.</p>
              </div>
              {/* <div className="text-left sm:text-right">
                <div className="text-lg sm:text-xl font-bold" style={{ color: '#0D47A1' }}>
                  {formatCurrency(total * 100)}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">Cart Total</p>
              </div> */}
            </div>
          </div>
        </div>
      
        {/* Content Section - Natural flow */}
        <div className="flex-1 w-full">
          {items.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-2xl">🛒</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Your cart is empty</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Go back to choose your prep sessions and start your LSAT journey.”</p>
              <button
                onClick={handleBackToHome}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-5 py-2 rounded-lg font-medium transition-all duration-300 text-sm shadow-lg hover:shadow-xl"
              >
                Browse Packages
              </button>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row w-full max-w-7xl mx-auto gap-3 pb-16 sm:pb-3">
              <div className="flex-1 min-w-0 flex flex-col">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-2 sm:p-3 flex flex-col">
                  <h2 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-2 flex-shrink-0">Cart Items</h2>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <CartCard
                        key={item.id}
                        id={item.id}
                        BigText={item.name?.split(/[\s-]/)[0] || ''}
                        Desc={item.Description}
                        name={item.name}
                        itemSessions={item.sessions}
                        price={formatCurrency(item.price * 100)}
                        quantity={item.quantity}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="w-full lg:w-72 lg:flex-shrink-0">
                <OrderSummary
                  totalPrice={items.reduce(
                    (acc, item) => acc + item.price * item.quantity,
                    0
                  )}
                  totalDiscount={totalDiscount}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
