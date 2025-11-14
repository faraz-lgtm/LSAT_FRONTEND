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
  const { items: allItems } = useSelector((state: RootState) => state.cart);
  const navigate = useNavigate();
  const formatCurrency = useCurrencyFormatter();
  const { data: productsData } = useGetProductsQuery();
  
  // Filter out free package (id === 8) from cart - cart is for paid purchases only
  const items = allItems.filter(item => item.id !== 8);
  
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
    <div className="min-h-screen customer-page-bg relative flex flex-col">
      {/* Main Content Section */}
      <div className="relative z-10 py-4 sm:py-6 pb-32 sm:pb-6 lg:pb-6">
        <div className="customer-container customer-content">
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
              </div>
            </div>
          </div>
        
          {/* Content Section */}
          <div className="flex-1 w-full">
            {items.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🛒</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Your cart is empty</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Go back to choose your prep sessions and start your LSAT journey."</p>
                <button
                  onClick={handleBackToHome}
                  className="text-white px-5 py-2 rounded-lg font-medium transition-all duration-300 text-sm shadow-lg hover:shadow-xl"
                  style={{ backgroundColor: 'var(--customer-button-green)' }}
                >
                  Browse Packages
                </button>
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row w-full gap-3">
                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-2 sm:p-3 flex flex-col">
                    <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2 flex-shrink-0">Cart Items</h2>
                    <div className="space-y-2">
                      {items.map((item, index) => (
                        <CartCard
                          key={item.id}
                          id={item.id}
                          BigText={item.name?.split(/[\s-]/)[0] || ''}
                          Desc={item.Description}
                          name={item.name}
                          itemSessions={item.sessions}
                          price={formatCurrency(item.price * 100)}
                          quantity={item.quantity}
                          index={index}
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

      {/* Footer - Continue to Checkout Button */}
      {items.length > 0 && (
        <div className="fixed customer-fixed-button left-0 right-0 z-50 flex justify-center animate-slide-up lg:bg-transparent pb-4 pt-2">
          <div className="lg:inline-block">
            <div className="px-4 py-3 lg:px-0 lg:py-0">
              <button 
                className="w-full lg:w-auto flex items-center justify-center space-x-2 lg:space-x-3 text-white font-semibold py-2.5 px-6 text-sm lg:py-3 lg:px-6 lg:text-base rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                style={{ backgroundColor: 'var(--customer-button-orange)' }} 
                onClick={() => navigate("/Appointment")}
              >
                Continue to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
