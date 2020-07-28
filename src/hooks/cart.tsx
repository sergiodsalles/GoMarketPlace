import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // await AsyncStorage.clear();
      const storagedCartItems = await AsyncStorage.getItem(
        '@GoMarketPlace:cart',
      );
      if (storagedCartItems) {
        setProducts(JSON.parse(storagedCartItems));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
      const productsList = products;
      const productFound = products.find(item => item.id === product.id);
      if (productFound) {
        productFound.quantity += 1;
      } else {
        product.quantity = 1;
        productsList.push(product);
      }

      await AsyncStorage.setItem(
        '@GoMarketPlace:cart',
        JSON.stringify(productsList),
      );

      setProducts([...productsList]);
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productsList = products;
      const productFound = productsList.find(item => item.id === id);
      if (productFound) {
        productFound.quantity += 1;
      }
      await AsyncStorage.setItem(
        '@GoMarketPlace:cart',
        JSON.stringify(productsList),
      );
      setProducts([...productsList]);
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productsList = products;
      const productFound = productsList.find(item => item.id === id);
      if (productFound) {
        if (productFound.quantity > 1) {
          productFound.quantity -= 1;
        } else {
          productsList.splice(
            productsList.findIndex(item => item.id === productFound.id),
            1,
          );
        }
      }
      await AsyncStorage.setItem(
        '@GoMarketPlace:cart',
        JSON.stringify(productsList),
      );
      setProducts([...productsList]);
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
