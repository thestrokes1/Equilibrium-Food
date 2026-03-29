import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { ToastProvider } from './context/ToastContext'
import Home from './pages/Home.jsx'
import CartDrawer from './components/cart/CartDrawer'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <CartProvider>
          <Home />
          <CartDrawer />
        </CartProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>,
)