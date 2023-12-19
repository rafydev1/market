import React, { useEffect } from 'react';
import {
  Routes,
  Route,
  useLocation,
  Navigate
} from 'react-router-dom';
import './css/style.css';
import './charts/ChartjsConfig';
import Dashboard from './pages/Dashboard';
import ShopPage from './pages/ShopPage';
import Auth from './pages/Auth';
import CryptoJS from 'crypto-js';
import axios from 'axios';
import { ToastContainer } from 'react-toastify';

function App() {
  const location = useLocation();
  useEffect(() => {
    document.querySelector('html').style.scrollBehavior = 'auto'
    window.scroll({ top: 0 })
    document.querySelector('html').style.scrollBehavior = ''
  }, [location.pathname]);

  const [isLogged, setIsLogged] = React.useState(true);
  setInterval(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decryptedToken = CryptoJS.AES.decrypt(token, 'pulapestetine');
          const player = JSON.parse(decryptedToken.toString(CryptoJS.enc.Utf8));
          const response = await axios.post('http://localhost:8080/authcheck', {
            email: player.email,
            token,
          });

          if (response.status === 200) {
            const data = response.data;
            if (data.message === 'ValidToken') {
              setIsLogged(true);
            } else {
              setIsLogged(false);
            }
          }
        } catch (error) {
          console.error('Error checking authentication:', error);
        }
      } else {
        setIsLogged(false);
      }
    };

    checkAuth();
  }, 1000);


  return (
    <>
      <Routes>
        <Route
          exact
          path="/"
          element={isLogged ? <Navigate to='/dashboard' /> : <Navigate to='/auth' />}
        />
        <Route exact path="/dashboard" element={isLogged ? <Dashboard /> : <Navigate to='/auth' />} />
        <Route exact path="/shop" element={isLogged ? <ShopPage /> : <Navigate to='/auth' />} />
        <Route exact path="/auth" element={isLogged ? <Navigate to='/dashboard' /> : <Auth />} />
      </Routes>
      <ToastContainer theme="dark" />
    </>
  );
}

export default App;
