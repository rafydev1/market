import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Transition from '../utils/Transition';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import { showNotify } from '../utils/notify';

function DropdownCartd({ align }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [userData, setUserData] = useState([]);
  const [recycledProducts, setRecycledProducts] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const trigger = useRef(null);
  const dropdown = useRef(null);

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
    const fetchCart = async () => {
      try {
        if (userData.email) {
          const response = await axios.get('http://localhost:8080/getShoppingCart', {
            params: {
              email: userData.email
            }
          });
          setProducts(response.data);
          const total = response.data.reduce((accumulator, product) => {
            return accumulator + product.price;
          }, 0);
          setTotalPrice(total);
        }
      } catch (error) {
        console.error('Error fetching shopping cart data:', error);
      }
    };
    fetchCart();
  })

  useEffect(() => {
    const updateRecycledProducts = async () => {
      if (recycledProducts.length === 0) {
        return;
      }

      const { id } = recycledProducts[0];
      try {
        const response = await axios.post('http://localhost:8080/deleteProduct', {
          id: id,
          email: userData.email,
        });

        if (response.data.message === 'Success') {
          showNotify('Produs a fost sters cu succes', 2000, 'success');
          setRecycledProducts([]);
        }
      } catch (error) {
        console.error('Error recycling shopping cart:', error);
      }
    };

    updateRecycledProducts();
  }, [recycledProducts, userData.email]);
  const deleteProduct = (product) => {
    const now = new Date().getTime();
    if (now - lastClickTime < 5000) {
      showNotify('Prea rapid. Așteaptă 5 secunde.', 5000, 'error');
      return;
    }
    setLastClickTime(now);
    setRecycledProducts([...recycledProducts, product]);
  }

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!dropdown.current) return;
      if (!dropdownOpen || dropdown.current.contains(target) || trigger.current.contains(target)) return;
      setDropdownOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  }, [dropdownOpen]);

  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!dropdownOpen || keyCode !== 27) return;
      setDropdownOpen(false);
    };

    document.addEventListener('keydown', keyHandler);


    return () => {
      document.removeEventListener('keydown', keyHandler);
    };
  }, [dropdownOpen]);

  return (
    <div className="relative inline-flex">
      <button
        ref={trigger}
        className={`w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600/80 rounded-full ${dropdownOpen && 'bg-slate-200'}`}
        aria-haspopup="true"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-expanded={dropdownOpen}
      >
        <span className="sr-only">Cart</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none">
          <path className='fill-current text-slate-400 dark:text-slate-500' opacity="0.5" d="M3.03998 2.29242C2.64921 2.15503 2.22106 2.36044 2.08368 2.7512C1.94629 3.14197 2.1517 3.57012 2.54246 3.7075L2.80367 3.79934C3.47128 4.03406 3.91003 4.18961 4.23288 4.34802C4.5361 4.4968 4.66977 4.61723 4.75783 4.74609C4.84809 4.87818 4.91779 5.0596 4.95712 5.42295C4.99828 5.80316 4.9993 6.29837 4.9993 7.03832L4.9993 9.64C4.9993 12.5816 5.06254 13.5523 5.92894 14.4662C6.79534 15.38 8.18979 15.38 10.9787 15.38H16.2816C17.8426 15.38 18.6231 15.38 19.1748 14.9304C19.7266 14.4808 19.8841 13.7164 20.1992 12.1875L20.699 9.76275C21.0461 8.02369 21.2197 7.15417 20.7757 6.57708C20.3318 6 18.815 6 17.1301 6H6.49184C6.48515 5.72967 6.47247 5.48373 6.44841 5.26153C6.39468 4.76515 6.27827 4.31243 5.99629 3.89979C5.71211 3.48393 5.33426 3.21759 4.89363 3.00139C4.48154 2.79919 3.95791 2.61511 3.34138 2.39838L3.03998 2.29242Z" />
          <path className='fill-current text-slate-400 dark:text-slate-500' d="M7.5 18C8.32843 18 9 18.6716 9 19.5C9 20.3284 8.32843 21 7.5 21C6.67157 21 6 20.3284 6 19.5C6 18.6716 6.67157 18 7.5 18Z" />
          <path className='fill-current text-slate-400 dark:text-slate-500' d="M16.5 18.0001C17.3284 18.0001 18 18.6716 18 19.5001C18 20.3285 17.3284 21.0001 16.5 21.0001C15.6716 21.0001 15 20.3285 15 19.5001C15 18.6716 15.6716 18.0001 16.5 18.0001Z" />
          <path className='fill-current text-slate-400 dark:text-slate-500' d="M9.37387 8.26066C9.78227 8.19147 10.1694 8.46645 10.2386 8.87485L10.7668 11.9927C10.836 12.4011 10.561 12.7883 10.1526 12.8574C9.74421 12.9266 9.35705 12.6516 9.28787 12.2432L8.75968 9.12539C8.69049 8.717 8.96548 8.32984 9.37387 8.26066Z" />
          <path className='fill-current text-slate-400 dark:text-slate-500' d="M14.788 8.87485C14.8572 8.46645 15.2443 8.19147 15.6527 8.26066C16.0611 8.32984 16.3361 8.717 16.2669 9.12539L15.7387 12.2432C15.6696 12.6516 15.2824 12.9266 14.874 12.8574C14.4656 12.7883 14.1906 12.4011 14.2598 11.9927L14.788 8.87485Z" />
        </svg>
        <div className="absolute top-0 right-0 w-4 h-4 bg-rose-500 border-2 border-white dark:border-[#182235] rounded-full text-center">
          <p className='text-white text-[0.9vh]'>{products.length}</p>
        </div>
      </button>

      <Transition
        className={`origin-top-right z-10 absolute top-full -mr-48 sm:mr-0 min-w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-1.5 rounded shadow-lg overflow-hidden mt-1 ${align === 'right' ? 'right-0' : 'left-0'}`}
        show={dropdownOpen}
        enter="transition ease-out duration-200 transform"
        enterStart="opacity-0 -translate-y-2"
        enterEnd="opacity-100 translate-y-0"
        leave="transition ease-out duration-200"
        leaveStart="opacity-100"
        leaveEnd="opacity-0"
      >
        <div
          ref={dropdown}
          onFocus={() => setDropdownOpen(true)}
          onBlur={() => setDropdownOpen(false)}
        >
          <div className="absolute text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase pt-1.5 pb-2 px-4">Cart</div>
          <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase pt-1.5 pb-2 px-4 flex items-end justify-end">Total: {totalPrice} Lei</div>
          <ul className="max-h-40 overflow-y-auto"> {/* Adjust max-h-40 to your preferred max height */}
            {products.map((product) => (
              <li key={product.id} className="border-b border-slate-200 dark:border-slate-700 last:border-0">
                <Link
                  className="block py-2 px-4 hover:bg-slate-50 dark:hover:bg-slate-700/20"
                  to=""
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <span className="font-medium text-slate-800 dark:text-slate-100">{product.product_name} <span className='cursor-crosshair' onClick={() => deleteProduct(product)}>❌</span> </span>
                  {product.size !== '' && (
                    <span className="block text-xs font-medium text-slate-800 dark:text-slate-100">Marime: {product.size}</span>
                  )}
                  <span className="block text-xs font-medium text-slate-400 dark:text-slate-500">{product.price} Lei</span>
                  <span className="block text-xs font-medium text-slate-400 dark:text-slate-500">{product.createdAt.slice(0, 10)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Transition>
    </div>
  )
}

export default DropdownCartd;