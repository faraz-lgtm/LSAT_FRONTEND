import type { ProductOutput } from "../types/api/data-contracts";
import type { ItemInput } from "../types/api/data-contracts";
import { useCurrencyFormatter } from "../utils/currency";
import { Check } from "lucide-react";
import { useEffect, useRef } from "react";

type ProductCardProps = {
  product: ProductOutput;
  onAddToCart?: (product: ItemInput) => void;
  isSelected?: boolean;
  onSelectionChange?: (productId: number, selected: boolean) => void;
};

const ProductCard = ({ product, isSelected = false, onSelectionChange }: ProductCardProps) => {
  const formatCurrency = useCurrencyFormatter();
  const isFree = product.price === 0;
  const isPopular = product.id === 6; // 5X Prep Session Bundle
  const checkboxRef = useRef<HTMLInputElement>(null);
  const isUpdatingStyleRef = useRef(false);


  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSelectionChange) {
      onSelectionChange(product.id, e.target.checked);
    }
  };

  // Force white border for popular card checkbox - runs on mount and when selection changes
  useEffect(() => {
    if (isPopular && checkboxRef.current) {
      const checkbox = checkboxRef.current;
      
      // Set initial border properties with !important equivalent using setAttribute
      const enforceWhiteBorder = () => {
        if (isUpdatingStyleRef.current) return; // Prevent recursive calls
        isUpdatingStyleRef.current = true;
        
        try {
          // Get current style and clean it
          const currentStyle = checkbox.getAttribute('style') || '';
          const cleanedStyle = currentStyle.replace(/border[^;]*/g, '');
          const newStyle = cleanedStyle + 'border-width: 2px !important; border-style: solid !important; border-color: #ffffff !important;';
          
          // Only update if style actually changed to avoid triggering observer
          if (currentStyle !== newStyle) {
            checkbox.setAttribute('style', newStyle);
          }
          
          // Also set via style for immediate effect (this won't trigger our observer)
          checkbox.style.setProperty('border-width', '2px', 'important');
          checkbox.style.setProperty('border-style', 'solid', 'important');
          checkbox.style.setProperty('border-color', '#ffffff', 'important');
        } finally {
          // Use setTimeout to prevent immediate recursive calls
          setTimeout(() => {
            isUpdatingStyleRef.current = false;
          }, 0);
        }
      };
      
      enforceWhiteBorder();

      // Use MutationObserver to maintain white border even when browser styles change
      // But only observe changes we didn't make ourselves
      const observer = new MutationObserver((mutations) => {
        // Only react if the change wasn't made by us
        if (!isUpdatingStyleRef.current) {
          // Check if border color was changed
          const hasBorderChange = mutations.some(mutation => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
              const currentBorderColor = checkbox.style.borderColor;
              return currentBorderColor !== 'rgb(255, 255, 255)' && currentBorderColor !== '#ffffff';
            }
            return false;
          });
          
          if (hasBorderChange) {
            enforceWhiteBorder();
          }
        }
      });
      
      observer.observe(checkbox, {
        attributes: true,
        attributeFilter: ['style', 'class'],
        attributeOldValue: true,
      });

      // Only add event listeners for focus/blur, not click/change to avoid interference
      checkbox.addEventListener('blur', enforceWhiteBorder);
      checkbox.addEventListener('focus', enforceWhiteBorder);
      
      return () => {
        observer.disconnect();
        checkbox.removeEventListener('blur', enforceWhiteBorder);
        checkbox.removeEventListener('focus', enforceWhiteBorder);
        isUpdatingStyleRef.current = false; // Reset flag on cleanup
      };
    }
    return undefined;
  }, [isPopular, isSelected]);

  return (
    <div
      className={`relative h-full flex flex-col ${isPopular ? 'bg-blue-500' : 'bg-white dark:bg-gray-800'} rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:scale-105 group ${
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
        {/* Checkbox */}
        <div className="flex justify-center mb-3 relative">
          <div className={`relative inline-flex items-center justify-center ${isPopular ? 'ring-2 ring-white rounded' : ''}`}>
            <input
              ref={checkboxRef}
              type="checkbox"
              checked={isSelected}
              onChange={handleCheckboxChange}
              className={`w-5 h-5 sm:w-6 sm:h-6 rounded cursor-pointer focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all appearance-none relative z-10 box-border ${
                isPopular 
                  ? 'border-2 border-white hover:border-white focus:border-white' 
                  : 'border-2 border-gray-300 dark:border-gray-600'
              } ${isSelected ? 'bg-blue-600' : 'bg-transparent'}`}
              style={{
                borderWidth: '2px',
                borderStyle: 'solid',
                borderColor: isPopular ? '#ffffff' : undefined,
                boxSizing: 'border-box',
                padding: 0,
                margin: 0,
              }}
            />
            {isSelected && (
              <Check className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white w-3 h-3 sm:w-4 sm:h-4 pointer-events-none z-20`} 
                     strokeWidth={3} />
            )}
          </div>
        </div>

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
                    One-on-one tutoring session
                  </li>
                  <li className="flex items-center">
                    <Check className={`w-4 h-4 ${isPopular ? 'text-white' : 'text-blue-600 dark:text-blue-400'} mr-3 flex-shrink-0`} />
                    Flexible scheduling
                  </li>
                  <li className="flex items-center">
                    <Check className={`w-4 h-4 ${isPopular ? 'text-white' : 'text-blue-600 dark:text-blue-400'} mr-3 flex-shrink-0`} />
                    Personalized study plan
                  </li>
                </>
              )}
              {product.id === 6 && (
                <>
                  <li className="flex items-center">
                    <Check className={`w-4 h-4 ${isPopular ? 'text-white' : 'text-blue-600 dark:text-blue-400'} mr-3 flex-shrink-0`} />
                    5 one-on-one sessions
                  </li>
                  <li className="flex items-center">
                    <Check className={`w-4 h-4 ${isPopular ? 'text-white' : 'text-blue-600 dark:text-blue-400'} mr-3 flex-shrink-0`} />
                    Comprehensive study plan
                  </li>
                  <li className="flex items-center">
                    <Check className={`w-4 h-4 ${isPopular ? 'text-white' : 'text-blue-600 dark:text-blue-400'} mr-3 flex-shrink-0`} />
                    Progress tracking
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
                    10 one-on-one sessions
                  </li>
                  <li className="flex items-center">
                    <Check className={`w-4 h-4 ${isPopular ? 'text-white' : 'text-blue-600 dark:text-blue-400'} mr-3 flex-shrink-0`} />
                    Complete prep program
                  </li>
                  <li className="flex items-center">
                    <Check className={`w-4 h-4 ${isPopular ? 'text-white' : 'text-blue-600 dark:text-blue-400'} mr-3 flex-shrink-0`} />
                    Detailed progress tracking
                  </li>
                  <li className="flex items-center">
                    <Check className={`w-4 h-4 ${isPopular ? 'text-white' : 'text-blue-600 dark:text-blue-400'} mr-3 flex-shrink-0`} />
                    All practice materials
                  </li>
                  <li className="flex items-center">
                    <Check className={`w-4 h-4 ${isPopular ? 'text-white' : 'text-blue-600 dark:text-blue-400'} mr-3 flex-shrink-0`} />
                    Mock exam sessions
                  </li>
                </>
              )}
            </ul>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProductCard;
