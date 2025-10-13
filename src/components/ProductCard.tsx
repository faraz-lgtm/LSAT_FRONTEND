import type { Product } from "../Interfaces/product";

type ProductCardProps = {
  product: Product;
  onAddToCart?: (product: Product) => void;
};

const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  const isFree = product.price === 0;
  const isPopular = product.id === 6; // 5X Prep Session Bundle

  return (
    <div
      className={`relative ${isPopular ? 'bg-blue-500' : 'bg-white'} rounded-xl shadow-lg border-2 transition-all duration-500 ease-in-out hover:shadow-2xl hover:-translate-y-3 hover:scale-105 ${
        isPopular ? "border-blue-500 ring-2 ring-blue-100" : "border-gray-200"
      }`}
    >
      {/* Badge */}
      {product.badge && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className={`${product.badge.color} text-white px-4 py-1 rounded-full text-sm font-semibold`}>
            {product.badge.text}
          </span>
        </div>
      )}

      <div className="p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h5 className={`${isPopular ? 'bg-white text-blue-500' : 'bg-green-500 text-white'} text-lg font-bold mb-2 leading-tight px-4 py-2 rounded-lg`}>
            {product.name}
          </h5>
          <div className="w-16 h-1 bg-blue-600 mx-auto rounded-full"></div>
        </div>

        {/* Price */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center space-x-2">
            {isFree ? (
              <span className={`text-4xl font-bold ${isPopular ? 'text-white' : 'text-green-600'}`}>Free</span>
            ) : (
              <>
                <span className={`text-4xl font-bold ${isPopular ? 'text-white' : 'text-blue-600'}`}>
                  ${product.price}
                </span>
              </>
            )}
          </div>

          <div className={`text-sm font-medium mt-1 ${isPopular ? 'text-white' : 'text-green-600'}`}>
            Save ${product.save}!
          </div>
        </div>

        {/* Description */}
        <div className="mb-8">
          <p className={`text-center leading-relaxed ${isPopular ? 'text-white' : 'text-gray-600'}`}>
            {product.Description}
          </p>
        </div>

        {/* Features for paid plans */}
        {!isFree && (
          <div className="mb-8">
            <ul className={`space-y-2 text-sm ${isPopular ? 'text-white' : 'text-gray-600'}`}>
              {product.id === 5 && (
                <>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                    One-on-one tutoring session
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                    Flexible scheduling
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                    Personalized study plan
                  </li>
                </>
              )}
              {product.id === 6 && (
                <>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                    5 one-on-one sessions
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                    Comprehensive study plan
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                    Progress tracking
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                    Practice materials included
                  </li>
                </>
              )}
              {product.id === 7 && (
                <>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                    10 one-on-one sessions
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                    Complete prep program
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                    Detailed progress tracking
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                    All practice materials
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                    Mock exam sessions
                  </li>
                </>
              )}
            </ul>
          </div>
        )}

        {/* CTA Button */}
        <button
          onClick={() => onAddToCart!(product)}
          className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300 ${
            isFree
              ? "bg-green-600 text-white hover:bg-green-700"
              : isPopular
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-900 text-white hover:bg-gray-800"
          }`}
        >
          {isFree ? "Book Free Call" : `Add to Cart - $${product.price}`}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
