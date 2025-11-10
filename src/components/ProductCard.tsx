import type { ProductOutput } from "../types/api/data-contracts";
import type { ItemInput } from "../types/api/data-contracts";
import { useCurrencyFormatter } from "../utils/currency";
import { Check, ShoppingCart, X } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";

type ProductCardProps = {
  product: ProductOutput;
  onAddToCart?: (product: ItemInput) => void;
};

const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  const formatCurrency = useCurrencyFormatter();
  const isFree = product.price === 0;
  const isPopular = product.id === 6; // 5X Prep Session Bundle
  
  // Check if product is in cart
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const isInCart = cartItems.some(item => item.id === product.id);
  const isLoading = useSelector((state: RootState) => state.cart.isLoading);

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent card click
    
    if (!onAddToCart) return;
    
    const itemInput: ItemInput = {
      id: product.id,
      name: product.name,
      price: product.price,
      Duration: product.Duration,
      Description: product.Description,
      DateTime: [],
      quantity: 1,
      sessions: product.sessions,
    };
    
    onAddToCart(itemInput);
  };

  const handleCardClick = () => {
    // Don't do anything on card click - buttons handle the interaction
  };

  return (
    <div
      onClick={handleCardClick}
      style={isPopular ? { backgroundColor: '#0D47A1' } : undefined}
      className={`relative h-full flex flex-col ${isPopular ? '' : 'bg-white dark:bg-gray-800'} rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:scale-105 group cursor-pointer ${
        isPopular ? "border-blue-400 ring-2 ring-blue-200 dark:ring-blue-800" : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
      }`}
    >
      {/* Badge */}
      {product.badge && (
        <div className="badge  transform z-10">
          <span 
            style={{ 
              backgroundColor: product.badge.color,
              color: '#ffffff'
            }}
            className="px-4 py-1 rounded-full text-sm font-semibold shadow-lg animate-pulse"
          >
            {product.badge.text}
          </span>
        </div>
      )}

      {/* Popular Badge - Only show if not already showing in product.badge */}
      {isPopular && !product.badge && (
        <div className="absolute top-4 right-4 z-10 badge  transform z-10">
          <span className="bg-white/90 text-blue-600 px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
            Most Popular
          </span>
        </div>
      )}

      <div className="p-4 sm:p-6 lg:p-8 flex flex-col h-full">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h5 className={`${isPopular ? 'bg-white text-blue-500' : 'bg-green-500 text-white'} text-base sm:text-lg font-bold mb-2 leading-tight px-3 sm:px-4 py-2 rounded-lg transition-all duration-300`}>
            {product.name}
          </h5>
          <div className={`w-12 sm:w-16 h-1 ${isPopular ? 'bg-white' : 'bg-blue-600'} mx-auto rounded-full transition-all duration-300`}></div>
        </div>

        {/* Price */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="flex items-center justify-center space-x-2">
            {isFree ? (
              <span className={`text-3xl sm:text-4xl font-bold ${isPopular ? 'text-white' : 'text-green-600'}`}>Free</span>
            ) : (
              <>
                <span className={`text-3xl sm:text-4xl font-bold ${isPopular ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`}>
                  {formatCurrency(product.price * 100)}
                </span>
              </>
            )}
          </div>

          {product.save ? (
            <div className={`text-xs sm:text-sm font-medium mt-1 ${isPopular ? 'text-white' : 'text-green-600'}`}>
              Save {formatCurrency((product.save || 0) * 100)}!
            </div>
          ) : null}
        </div>

        {/* Description */}
        <div className="mb-6 sm:mb-8">
          <p className={`text-center leading-relaxed text-sm sm:text-base ${isPopular ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>
            {product.Description}
          </p>
        </div>

        {/* Features for paid plans */}
        {!isFree && (
          <div className="flex-1 flex flex-col justify-start">
            {/* Horizontal divider line */}
            <div className={`border-t mb-4 sm:mb-6 ${isPopular ? 'border-white/30' : 'border-gray-300 dark:border-gray-600'}`}></div>
            
            <ul className={`space-y-1 sm:space-y-2 text-xs sm:text-sm ${isPopular ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>
              {product.id === 5 && (
                <>
                  <li className="flex items-center">
                    <Check className={`w-4 h-4 ${isPopular ? 'text-white' : 'text-blue-600 dark:text-blue-400'} mr-3 flex-shrink-0`} />
                    One personalized tutoring session
                  </li>
                  <li className="flex items-center">
                    <Check className={`w-4 h-4 ${isPopular ? 'text-white' : 'text-blue-600 dark:text-blue-400'} mr-3 flex-shrink-0`} />
                    Flexible scheduling
                  </li>
                  <li className="flex items-center">
                    <Check className={`w-4 h-4 ${isPopular ? 'text-white' : 'text-blue-600 dark:text-blue-400'} mr-3 flex-shrink-0`} />
                    Targeted practice on weak areas
                  </li>
                </>
              )}
              {product.id === 6 && (
                <>
                  <li className="flex items-center">
                    <Check className={`w-4 h-4 ${isPopular ? 'text-white' : 'text-blue-600 dark:text-blue-400'} mr-3 flex-shrink-0`} />
                    5 one-on-one tutoring sessions
                  </li>
                  <li className="flex items-center">
                    <Check className={`w-4 h-4 ${isPopular ? 'text-white' : 'text-blue-600 dark:text-blue-400'} mr-3 flex-shrink-0`} />
                    Custom weekly study plan
                  </li>
                  <li className="flex items-center">
                    <Check className={`w-4 h-4 ${isPopular ? 'text-white' : 'text-blue-600 dark:text-blue-400'} mr-3 flex-shrink-0`} />
                    Progress tracking & feedback
                  </li>
                  <li className="flex items-center">
                    <Check className={`w-4 h-4 ${isPopular ? 'text-white' : 'text-blue-600 dark:text-blue-400'} mr-3 flex-shrink-0`} />
                    Practice materials included
                  </li>
                </>
              )}
              {product.id === 7 && (
                <>
                  <li className="flex items-center">
                    <Check className={`w-4 h-4 ${isPopular ? 'text-white' : 'text-blue-600 dark:text-blue-400'} mr-3 flex-shrink-0`} />
                    10 one-on-one tutoring sessions
                  </li>
                  <li className="flex items-center">
                    <Check className={`w-4 h-4 ${isPopular ? 'text-white' : 'text-blue-600 dark:text-blue-400'} mr-3 flex-shrink-0`} />
                    Complete MCAT prep roadmap
                  </li>
                  <li className="flex items-center">
                    <Check className={`w-4 h-4 ${isPopular ? 'text-white' : 'text-blue-600 dark:text-blue-400'} mr-3 flex-shrink-0`} />
                    Progress tracking & mock exams
                  </li>
                  <li className="flex items-center">
                    <Check className={`w-4 h-4 ${isPopular ? 'text-white' : 'text-blue-600 dark:text-blue-400'} mr-3 flex-shrink-0`} />
                    All study materials included
                  </li>
                </>
              )}
            </ul>
          </div>
        )}

        {/* Add to Cart / Remove from Cart Button */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleButtonClick}
            disabled={isLoading}
            className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
              isInCart
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white'
            }`}
          >
            {isInCart ? (
              <>
                <X className="w-5 h-5" />
                <span>Remove from Cart</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProductCard;
