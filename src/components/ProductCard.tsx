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
    <>
      <style>{`
        .customer-product-card.group:hover h5,
        .customer-product-card.group:hover .price-text,
        .customer-product-card.group:hover .save-text,
        .customer-product-card.group:hover p,
        .customer-product-card.group:hover ul,
        .customer-product-card.group:hover li,
        .customer-product-card.group:hover li span {
          color: var(--customer-text-white) !important;
        }
        .customer-product-card.group:hover .check-icon,
        .customer-product-card.group:hover svg.check-icon {
          color: var(--customer-text-white) !important;
          stroke: var(--customer-text-white) !important;
        }
      `}</style>
      <div
        onClick={handleCardClick}
        className="customer-product-card relative flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl group cursor-pointer border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-[var(--customer-primary)]"
      >
      {/* Badge */}
      {product.badge && (
        <div className="absolute top-2 right-0 badge transform z-10">
          <span 
            style={{ 
              backgroundColor: product.badge.color,
              color: '#ffffff'
            }}
            className="px-2 py-0.5 sm:px-4 sm:py-1 text-[10px] sm:text-xs lg:text-sm font-semibold shadow-lg"
          >
            {product.badge.text}
          </span>
        </div>
      )}


      <div className={`p-2 sm:p-4 lg:p-6 xl:p-8 flex flex-col h-full overflow-hidden ${product.badge ? 'pt-8 sm:pt-10 lg:pt-12' : ''}`}>
        {/* Header */}
        <div className="text-center mb-2 sm:mb-4 lg:mb-6">
          <h5 
            className="font-bold mb-1 sm:mb-2 leading-tight px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 transition-all duration-300"
            style={{
              fontSize: 'var(--customer-text-base-size)',
              color: 'var(--customer-text-blue)'
            }}
          >
            {product.name}
          </h5>
          <div className="w-8 sm:w-12 lg:w-16 h-0.5 sm:h-1 bg-blue-600 group-hover:bg-white mx-auto rounded-full transition-all duration-300"></div>
        </div>

        {/* Price */}
        <div className="text-center mb-2 sm:mb-4 lg:mb-6">
          <div className="flex items-center justify-center space-x-2">
            {isFree ? (
              <span 
                className="price-text text-lg sm:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-bold transition-all duration-300"
                style={{ color: 'var(--customer-text-blue)' }}
              >
                Free
              </span>
            ) : (
              <>
                <span 
                  className="price-text text-lg sm:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-bold transition-all duration-300"
                  style={{ color: 'var(--customer-text-blue)' }}
                >
                  {formatCurrency(product.price * 100)}
                </span>
              </>
            )}
          </div>

          {product.save ? (
            <div 
              className="save-text text-[10px] sm:text-xs lg:text-sm font-medium mt-0.5 sm:mt-1 transition-all duration-300"
              style={{ color: 'var(--customer-text-blue)' }}
            >
              Save {formatCurrency((product.save || 0) * 100)}!
            </div>
          ) : null}
        </div>

        {/* Description */}
        <div className="mb-2 sm:mb-4 lg:mb-6">
          <p 
            className="text-center leading-relaxed text-[10px] sm:text-xs lg:text-sm xl:text-base text-gray-600 dark:text-gray-300 transition-all duration-300"
          >
            {product.Description}
          </p>
        </div>

        {/* Features for paid plans */}
        {!isFree && product.features && product.features.length > 0 && (
          <div className="flex-1 flex flex-col justify-start">
            {/* Horizontal divider line */}
            <div className="border-t mb-2 sm:mb-4 lg:mb-6 border-gray-300 dark:border-gray-600 group-hover:border-white/30 transition-all duration-300"></div>
            
            <ul 
              className="space-y-0.5 sm:space-y-1 lg:space-y-2 text-[10px] sm:text-xs lg:text-sm text-gray-600 dark:text-gray-300 transition-all duration-300 overflow-y-auto"
              style={{ maxHeight: '130px' }}
            >
              {product.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check 
                    className="check-icon w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400 mr-1.5 sm:mr-2 lg:mr-3 flex-shrink-0 transition-all duration-300 mt-0.5"
                  />
                  <span 
                    className="flex-1 break-words"
                  >
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Add to Cart / Remove from Cart Button */}
        <div className="mt-auto pt-2 sm:pt-3 lg:pt-4 border-t flex justify-center flex-shrink-0 border-gray-200 dark:border-gray-700 group-hover:border-white/30 transition-all duration-300">
          <button
            onClick={handleButtonClick}
            disabled={isLoading}
            className={`w-auto max-w-[85%] sm:w-full flex items-center justify-center space-x-1 sm:space-x-2 py-1.5 sm:py-2 lg:py-2.5 px-2 sm:px-3 lg:px-4 text-[10px] sm:text-xs lg:text-sm xl:text-base rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
              isInCart
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'text-white'
            }`}
            style={!isInCart ? { backgroundColor: 'var(--customer-button-green)' } : undefined}
          >
            {isInCart ? (
              <>
                <X className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                <span className="truncate" style={{ color: 'var(--customer-text-white)' }}>
                  Remove from Cart
                </span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                <span className="truncate" style={{ color: 'var(--customer-text-white)' }}>Add to Cart</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
    </>
  );
};

export default ProductCard;
