import type { Product } from "../Interfaces/product";
import Card from "./CardComponent";

type ProductCardProps = {
  product: Product;
  onAddToCart?: (product: Product) => void;
};

const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  return (
    <Card
      title={product.name}
      description={product.Description}
      // image="../assets/react.svg"
      extra={<span className="text-sm text-gray-500">Duration: {product.Duration}</span>}
      footer={
        <button
          onClick={() => onAddToCart!(product)}
          className="bg-blue-600 text-white py-2 px-4 rounded-xl hover:bg-blue-700 transition w-full"
        >
          {product.price === 0 ? "Book Now" : `Add to Cart – $${product.price}`}
        </button>
      }
    >
      {/* You can inject custom content if needed */}
      <p className="text-lg font-bold text-blue-600">
        {product.price === 0 ? "Free" : `$${product.price}`}
      </p>
    </Card>
  );
};

export default ProductCard;
