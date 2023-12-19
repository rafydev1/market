import React, { useEffect, useState } from 'react';
import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';
import { motion } from 'framer-motion';
import CryptoJS from 'crypto-js';
import axios from 'axios';
import { showNotify } from '../utils/notify';

function ShopPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState([]);
  const [userProducts, setUserProducts] = useState([]);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [products, setProducts] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState({});

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await axios.get('http://localhost:8080/getAllProducts');
      setProducts(response.data);
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cookieValue = localStorage.getItem('token');
        if (cookieValue) {
          const player = JSON.parse(
            CryptoJS.AES.decrypt(cookieValue, 'pulapestetine').toString(CryptoJS.enc.Utf8)
          );

          const response = await axios.get('http://localhost:8080/getUserData', {
            params: {
              email: player.email,
            },
          });

          if (Array.isArray(response.data) && response.data.length > 0) {
            setUserData(response.data[0]);
          } else {
            console.error('Invalid user data response:', response.data);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };


    fetchData();
  }, []);

  useEffect(() => {
    const uploadShoppingCart = async () => {
      if (userProducts.length === 0) {
        return;
      }

      const { product_id, product_name, product_price } = userProducts[0];
      if (product_price !== null) {
        try {
          const response = await axios.post('http://localhost:8080/uplaodProduct', {
            id: product_id,
            nume: product_name,
            pret: product_price,
            email: userData.email,
            size: selectedSizes[product_id],
          });

          if (response.data.message === 'Success') {
            showNotify('Produs adaugat cu succes', 2000, 'success');
            setSelectedSizes((prevSelectedSizes) => ({
              ...prevSelectedSizes,
              [product_id]: null,
            }))
            setUserProducts([]);
          }
        } catch (error) {
          console.error('Error uploading shopping cart:', error);
        }
      } else {
        console.error('Invalid product_price:', product_price);
      }
    };

    uploadShoppingCart();
  }, [userProducts, userData.email]);



  const handleAddToCart = (product) => {
    const now = new Date().getTime();
    if (now - lastClickTime < 5000) {
      showNotify('Prea rapid. Așteaptă 5 secunde.', 5000, 'error');
      return;
    }
    if (product.stock === 0) {
      showNotify('Produsul nu mai este disponibil', 2000, 'error');
      return;
    }
    setLastClickTime(now);
    setUserProducts([...userProducts, { product_id: product.id, product_name: product.name, product_price: product.price, user_email: userData.email }]);
  };
  const getSizeFromIndex = (index) => {
    switch (index) {
      case 0:
        return 'XS';
      case 1:
        return 'S';
      case 2:
        return 'M';
      case 3:
        return 'L';
      case 4:
        return 'XL';
      default:
        return '';
    }
  };
  const handleSizeClick = (productId, index) => {
    const newSize = getSizeFromIndex(index);
    setSelectedSizes((prevSelectedSizes) => ({
      ...prevSelectedSizes,
      [productId]: newSize === prevSelectedSizes[productId] ? null : newSize,
    }));
  };




  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/* Site header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main>
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            {/* Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {products.map((product) => (
                <a key={product.id} className="group">
                  {product.stock === 0 ? (
                    <h3 className="text-sm text-red-500 dark:text-red-500">Out of stock</h3>
                  ) : (
                    <h3 className="text-sm text-slate-400 dark:text-slate-500">Stock: <span className='text-black dark:text-white'>{product.stock}</span></h3>
                  )}

                  <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-200">
                    <motion.img
                      whileHover={{ scale: 1.1 }}
                      src={product.imageSrc}
                      alt={product.id}
                      className="h-full w-full object-cover object-center hover:opacity-75"
                    />
                  </div>
                  <h3 className="mt-4 text-sm text-slate-400 dark:text-slate-500">{product.name}</h3>
                  <p className="mt-1 text-lg font-medium text-slate-400 dark:text-slate-500">{product.price} Lei</p>
                  {product.type === 'clothes' && (
                    <div className="mt-1 flex items-center text-center gap-3 select-none">
                      {product.stock_clothes.split('|').map((stock, index) => {
                        const size = getSizeFromIndex(index);
                        const productId = product.id;

                        return stock !== '0' && (
                          <motion.span
                            onClick={() => handleSizeClick(productId, index)}
                            whileTap={{ scale: 0.8 }}
                            key={size}
                            className={`inline-block h-6 w-6 rounded-full ring-2 cursor-pointer ${size === selectedSizes[productId] ? 'ring-blue-500' : 'ring-red-500'
                              }`}
                          >
                            {size}
                          </motion.span>
                        );
                      })}
                    </div>
                  )}
                  {product.stock !== 0 && (
                    < motion.div
                      whileHover={{ scale: 0.8 }}
                      whileTap={{ scale: 1 }}
                      onClick={() => handleAddToCart(product)}
                      className='mt-4 select-none text-lg font-medium text-black dark:text-white cursor-pointer border-2 border-gray-500 rounded text-center'
                    >
                      Add to Cart
                    </motion.div>
                  )}

                </a>
              ))}
            </div>
          </div>
        </main>
      </div >
    </div >
  );
}

export default ShopPage;
