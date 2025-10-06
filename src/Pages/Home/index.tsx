import { useDispatch } from "react-redux";
import ProductCard from "../../components/ProductCard";
import { products } from "../../constants/products";
import type { Product } from "../../Interfaces/product";
import { addToCart } from "../../redux/cartSlice";

type HomeProps = {
  showFree?: boolean;
};

const Home = ({ showFree = false }: HomeProps) => {
  const dispatch = useDispatch();
  const handleAddToCart = (product: Product) => {
    console.log("Added to cart:", product);
    dispatch(addToCart(product));
    // later: dispatch to cart context / API call
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products &&
          (showFree
            ? products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onAddToCart={handleAddToCart}
                />
              ))
            : products
                .filter((elem) => elem.id !== 8)
                .map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onAddToCart={handleAddToCart}
                  />
                )))}
      </div>
    </div>
  );
};

export default Home;
