import { useSelector } from "react-redux";
import ProductCard from "../../components/ProductCard";
import { useGetProductsQuery } from "../../redux/apiSlices/Product/productSlice";
import type { ItemInput, ProductOutput } from "../../types/api/data-contracts";
import { addToCartAsync, clearError, removeFromCart } from "../../redux/cartSlice";
import type { RootState, AppDispatch } from "../../redux/store";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import GlobalProgressBar from "../../components/GlobalProgressBar";
import { useCheckoutProgress } from "../../hooks/useCheckoutProgress";

type HomeProps = {
  showFree?: boolean;
};

const Home = ({ showFree = false }: HomeProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { data: productsData, isSuccess, isLoading, error } = useGetProductsQuery();
  
  // Get cart state for loading, error handling, and items count
  const { isLoading: isAddingToCart, error: cartError, items: cartItems } = useSelector((state: RootState) => state.cart);
  
  // Get current checkout progress step
  const currentStep: 1 | 2 | 3 | 4 = useCheckoutProgress();
  
  // Track selected products - initialize from cart items
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(() => {
    // Initialize from cart items on component mount
    return new Set(cartItems.map(item => item.id));
  });

  // Carousel state for mobile - track current card index
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  
  // Sync selected products when cart items change (for when items are added/removed elsewhere)
  useEffect(() => {
    const cartProductIds = new Set(cartItems.map(item => item.id));
    setSelectedProducts(cartProductIds);
  }, [cartItems]);
  
  const handleAddToCart = (product: ItemInput) => {
    // Check if product is already in cart
    const isInCart = cartItems.some(item => item.id === product.id);
    
    if (isInCart) {
      // Remove from cart if already there
      console.log("Removing from cart:", product.id);
      dispatch(removeFromCart(product.id));
    } else {
      // Add to cart if not there
      console.log("Adding to cart:", product);
      dispatch(addToCartAsync(product));
    }
  };

  const handleGoToCart = () => {
    console.log("Go to Cart clicked, navigating to /cart");
    navigate("/cart");
  };


  const handleAddSelectedToCart = async () => {
    if (!isSuccess || !productsData) return;
    
    const allProducts = showFree ? productsData.data : productsData.data.filter((elem) => elem.id !== 8);
    const selectedProductsList = allProducts.filter(p => selectedProducts.has(p.id));
    
    // Only add products that aren't already in cart
    const itemsToAdd = selectedProductsList.filter(product => {
      const isAlreadyInCart = cartItems.some(item => item.id === product.id);
      return !isAlreadyInCart;
    });

    if (itemsToAdd.length === 0) {
      // All selected items are already in cart, just navigate
      navigate("/cart");
      return;
    }

    // Dispatch all add to cart actions and wait for them
    const addPromises = itemsToAdd.map(product => {
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
      return dispatch(addToCartAsync(itemInput)).unwrap();
    });

    try {
      // Wait for all items to be added
      await Promise.all(addPromises);
      // Navigate to cart page after successful addition
      navigate("/cart");
    } catch (error) {
      console.error("Error adding items to cart:", error);
      // Still navigate even if there's an error (items might have been partially added)
      navigate("/cart");
    }
    
    // Selections will be synced automatically by the useEffect that watches cartItems
  };

  // Calculate total unique packages in cart (not considering quantity)
  const totalCartItems = cartItems.length;

  // Clear cart error when component mounts
  useEffect(() => {
    if (cartError) {
      dispatch(clearError());
    }
  }, [dispatch, cartError]);

  // Calculate products early for carousel reset effect
  const products = isSuccess && productsData ? productsData.data : [];
  const sortedProducts = products.length > 0 ? [...products].sort((a, b) => {
    const getSortOrder = (product: ProductOutput): number => {
      const name = product.name.toLowerCase();
      if (product.id === 5) return 1;
      if (product.id === 6) return 2;
      if (product.id === 7) return 3;
      if (name.includes('60') || name.includes('60-minute')) return 1;
      if (name.includes('5x') || name.includes('5 x')) return 2;
      if (name.includes('10x') || name.includes('10 x')) return 3;
      return 4;
    };
    return getSortOrder(a) - getSortOrder(b);
  }) : [];
  const filteredProducts = showFree 
    ? sortedProducts 
    : sortedProducts.filter((elem) => elem.id !== 8);

  // Reset carousel index when filtered products change
  useEffect(() => {
    setCurrentCardIndex(0);
  }, [filteredProducts.length]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-500">Error loading products</div>
      </div>
    );
  }

  // Show cart error if it exists
  if (cartError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-500 max-w-md text-center">
          <div className="mb-4">❌ Error adding to cart:</div>
          <div className="text-sm">{cartError}</div>
          <button 
            onClick={() => dispatch(clearError())}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }


  // Carousel navigation handlers
  const handleNextCard = () => {
    setCurrentCardIndex((prev) => (prev + 1) % filteredProducts.length);
  };

  const handlePrevCard = () => {
    setCurrentCardIndex((prev) => (prev - 1 + filteredProducts.length) % filteredProducts.length);
  };

  const handleDotClick = (index: number) => {
    setCurrentCardIndex(index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-blue-800 dark:to-purple-800 relative">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ backgroundColor: '#0D47A1' }}></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse delay-2000"></div>
        <div className="absolute top-20 left-20 w-64 h-64 bg-cyan-300 rounded-full mix-blend-multiply filter blur-2xl opacity-15 animate-pulse delay-500"></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-yellow-300 rounded-full mix-blend-multiply filter blur-2xl opacity-15 animate-pulse delay-1500"></div>
      </div>
      {/* Products Section */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-32 sm:pb-6 lg:pb-6">
        <div className="max-w-6xl mx-auto">
          {/* Global Progress Bar */}
          <GlobalProgressBar currentStep={currentStep} />
          
          {/* Spacing between progress bar and product cards */}
          <div className="mt-6">
            {/* Mobile: Carousel - Show one card at a time (Horizontal) */}
            <div className="block sm:hidden">
              <div className="relative px-10">
                {/* Navigation Arrows */}
                {filteredProducts.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevCard}
                      className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 rounded-full p-2 shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all"
                      aria-label="Previous card"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    </button>
                    <button
                      onClick={handleNextCard}
                      className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 rounded-full p-2 shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all"
                      aria-label="Next card"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    </button>
                  </>
                )}

                {/* Card Container */}
                <div className="overflow-hidden py-6">
                  <div 
                    className="flex transition-transform duration-300 ease-in-out"
                    style={{ transform: `translateX(-${currentCardIndex * 100}%)` }}
                  >
                    {filteredProducts.map((p) => (
                      <div 
                        key={p.id} 
                        className="w-full flex-shrink-0"
                      >
                        <ProductCard
                          product={p}
                          onAddToCart={handleAddToCart}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dots Indicator */}
                {filteredProducts.length > 1 && (
                  <div className="flex justify-center gap-2 mt-4">
                    {filteredProducts.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => handleDotClick(index)}
                        className={`h-2 rounded-full transition-all ${
                          index === currentCardIndex
                            ? 'bg-blue-600 w-6'
                            : 'bg-gray-300 dark:bg-gray-600 w-2'
                        }`}
                        aria-label={`Go to card ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Desktop: Grid Layout - Show all cards */}
            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch">
              {filteredProducts.map((p, index) => (
                <div 
                  key={p.id} 
                  className="animate-fade-in-up transition-all duration-300 hover:scale-102 h-full" 
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <ProductCard
                    product={p}
                    onAddToCart={handleAddToCart}
                  />
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
      
      {/* Add to Cart Button - Always visible */}
      <div className="fixed bottom-0 left-0 right-0 lg:bottom-0 z-50 flex justify-center animate-slide-up bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-blue-800 dark:to-purple-800 lg:bg-transparent lg:from-transparent lg:via-transparent lg:to-transparent lg:dark:from-transparent lg:dark:via-transparent lg:dark:to-transparent pb-4 pt-2">
        <div className="lg:inline-block">
          <div className="px-4 py-3 lg:px-0 lg:py-0">
            {selectedProducts.size > 0 ? (
              <button
                onClick={handleAddSelectedToCart}
                disabled={isAddingToCart}
                className="w-full lg:w-auto flex items-center justify-center space-x-2 lg:space-x-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-2.5 px-6 text-sm lg:py-3 lg:px-6 lg:text-base rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <ShoppingCart size={18} className="lg:w-5 lg:h-5" />
                <span>
                  {isAddingToCart ? 'Adding...' : `Add ${selectedProducts.size} to Cart`}
                </span>
              </button>
            ) : (
              <button
                onClick={handleGoToCart}
                className="w-full lg:w-auto flex items-center justify-center space-x-2 lg:space-x-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-2.5 px-6 text-sm lg:py-3 lg:px-6 lg:text-base rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <ShoppingCart size={18} className="lg:w-5 lg:h-5" />
                <span>
                  Go to Cart ({totalCartItems} {totalCartItems === 1 ? 'item' : 'items'})
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default Home;
