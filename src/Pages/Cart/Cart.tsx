import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import CartCard from "./CartCard";
import OrderSummary from "./OrderSummary";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import GlobalProgressBar from "../../components/GlobalProgressBar";
import { useCheckoutProgress } from "../../hooks/useCheckoutProgress";

const Cart = () => {
  const { items } = useSelector((state: RootState) => state.cart);
  const navigate = useNavigate();
  
  // Get current checkout progress step
  const currentStep: 1 | 2 | 3 | 4 | 5 = useCheckoutProgress();

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleBackToHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-blue-800 dark:to-purple-800 relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse delay-2000"></div>
        <div className="absolute top-20 left-20 w-64 h-64 bg-cyan-300 rounded-full mix-blend-multiply filter blur-2xl opacity-15 animate-pulse delay-500"></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-yellow-300 rounded-full mix-blend-multiply filter blur-2xl opacity-15 animate-pulse delay-1500"></div>
      </div>
      <div className="relative z-10 p-4 sm:p-6 lg:p-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={handleBackToHome}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm hover:shadow-md"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Back to Packages</span>
          </button>
        </div>

        {/* Global Progress Bar */}
        <GlobalProgressBar currentStep={currentStep} />

        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Your Shopping Cart
              </h1>
              {/* <p className="text-gray-600 dark:text-gray-300">
                {items.length} {items.length === 1 ? 'Item' : 'Items'} in your Cart
              </p> */}
              <p className="text-gray-600 dark:text-gray-300">Please review your Order Details</p>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                ${total}
              </div>
              <p className="text-gray-600 dark:text-gray-300 font-medium">Cart Total</p>
            </div>
          </div>
        </div>
      
        {items.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-3xl">🛒</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Your cart is empty</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Add some amazing LSAT prep sessions to get started!</p>
            <button
              onClick={handleBackToHome}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row w-full max-w-7xl mx-auto gap-6 lg:gap-8">
            <div className="flex-1">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Cart Items</h2>
                <div className="space-y-4">
                  {items.map((item) => (
                    <CartCard
                      key={item.id}
                      id={item.id}
                      BigText={item.name.split(/[\s-]/)[0]}
                      Desc={item.Description}
                      name={item.name}
                      itemSessions={item.sessions}
                      price={item.price.toString()}
                      quantity={item.quantity}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="w-full lg:w-80 lg:flex-shrink-0">
              <OrderSummary
                totalPrice={items.reduce(
                  (acc, item) => acc + item.price * item.quantity,
                  0
                )}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
