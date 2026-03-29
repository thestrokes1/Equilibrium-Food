import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import Home from './pages/Home.jsx'
import CartDrawer from './components/cart/CartDrawer'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <CartProvider>
        <Home />
        <CartDrawer />
      </CartProvider>
    </BrowserRouter>
  </React.StrictMode>,
)