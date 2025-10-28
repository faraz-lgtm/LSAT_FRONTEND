import type { ProductOutput } from "../types/api/data-contracts";
import type { ItemInput } from "../types/api/data-contracts";
import { useCurrencyFormatter } from "../utils/currency";

type ProductCardProps = {
  product: ProductOutput;
  onAddToCart?: (product: ItemInput) => void;
  isLoading?: boolean;
};

const ProductCard = ({ product, onAddToCart, isLoading = false }: ProductCardProps) => {
  const formatCurrency = useCurrencyFormatter();
  const isFree = product.price === 0;
  const isPopular = product.id === 6; // 5X Prep Session Bundle

  // Convert ProductOutput to ItemInput for cart
  const convertToItemInput = (productOutput: ProductOutput): ItemInput => {
    return {
      id: productOutput.id,
      name: productOutput.name,
      price: productOutput.price,
      Duration: productOutput.Duration,
      Description: productOutput.Description,
      DateTime: [],
      quantity: 1,
      sessions: productOutput.sessions,
      // assignedEmployeeId: 1,
    };
  };

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(convertToItemInput(product));
    }
  };

  return (
    <div
      className={`relative ${isPopular ? 'bg-blue-500' : 'bg-white dark:bg-gray-800'} rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:scale-105 group ${
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
        <div className="absolute top-4 right-4 z-10">
          <span className="bg-white/90 text-blue-600 px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
            Most Popular
          </span>
        </div>
      )}

      <div className="p-4 sm:p-6 lg:p-8">
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
          <div className="mb-6 sm:mb-8">
            <ul className={`space-y-1 sm:space-y-2 text-xs sm:text-sm ${isPopular ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>
              {product.id === 5 && (
                <>
                  <li className="flex items-center">
                    <span className={`w-2 h-2 ${isPopular ? 'bg-white' : 'bg-blue-600'} rounded-full mr-3`}></span>
                    One-on-one tutoring session

                  </li>
                  <li className="flex items-center">
                    <span className={`w-2 h-2 ${isPopular ? 'bg-white' : 'bg-blue-600'} rounded-full mr-3`}></span>
                    Flexible scheduling
                  </li>
                  <li className="flex items-center">
                    <span className={`w-2 h-2 ${isPopular ? 'bg-white' : 'bg-blue-600'} rounded-full mr-3`}></span>
                    Targeted practice on weak areas

                  </li>
                </>
              )}
              {product.id === 6 && (
                <>
                  <li className="flex items-center">
                    <span className={`w-2 h-2 ${isPopular ? 'bg-white' : 'bg-blue-600'} rounded-full mr-3`}></span>
                    5 one-on-one tutoring sessions
                  </li>
                  <li className="flex items-center">
                    <span className={`w-2 h-2 ${isPopular ? 'bg-white' : 'bg-blue-600'} rounded-full mr-3`}></span>
                    Custom weekly study plan

                  </li>
                  <li className="flex items-center">
                    <span className={`w-2 h-2 ${isPopular ? 'bg-white' : 'bg-blue-600'} rounded-full mr-3`}></span>
                    Progress tracking & feedback
                  </li>
                  <li className="flex items-center">
                    <span className={`w-2 h-2 ${isPopular ? 'bg-white' : 'bg-blue-600'} rounded-full mr-3`}></span>
                    Practice materials included

                  </li>
                </>
              )}
              {product.id === 7 && (
                <>
                  <li className="flex items-center">
                    <span className={`w-2 h-2 ${isPopular ? 'bg-white' : 'bg-blue-600'} rounded-full mr-3`}></span>
                    10 one-on-one tutoring sessions

                  </li>
                  <li className="flex items-center">
                    <span className={`w-2 h-2 ${isPopular ? 'bg-white' : 'bg-blue-600'} rounded-full mr-3`}></span>
                    Complete MCAT prep roadmap

                  </li>
                  <li className="flex items-center">
                    <span className={`w-2 h-2 ${isPopular ? 'bg-white' : 'bg-blue-600'} rounded-full mr-3`}></span>
                    Progress tracking & mock exams

                  </li>
                  <li className="flex items-center">
                    <span className={`w-2 h-2 ${isPopular ? 'bg-white' : 'bg-blue-600'} rounded-full mr-3`}></span>
                    All study materials included
                  </li>

                </>
              )}
            </ul>
          </div>
        )}

        {/* CTA Button */}
        <button
          onClick={handleAddToCart}
          disabled={isLoading}
          className={`w-full py-3 sm:py-4 px-4 sm:px-6 rounded-lg font-semibold text-sm sm:text-lg transition-all duration-300 ${
            isLoading
              ? "bg-gray-400 text-white cursor-not-allowed"
              : isFree
                ? "bg-green-600 text-white hover:bg-green-700"
                : isPopular
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl transform hover:scale-105"
                  : "bg-gray-900 text-white hover:bg-gray-800"
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
              <span className="text-xs sm:text-sm">Fetching Slots...</span>
            </div>
          ) : (
            isFree ? "Book Free Call" : `Add to Cart - ${formatCurrency(product.price * 100)}`
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
