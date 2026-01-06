import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import Home from './components/Home.jsx';
import Description from './components/Description.jsx';
import Checkout from './components/Checkout.jsx';
import Login from './components/admin/login.jsx';
import ProductManagement from './components/admin/ProductManagement.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { UserProvider } from './context/UserContext.jsx';

function App() {
  return (
    <UserProvider>
      <CartProvider>
        <div className="cream">
          <Router>
            <Routes >
              <Route path="/" element={<Home />} />
              <Route path="/product/:id" element={<Description />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin/products" element={<ProductManagement />} />
            </Routes>
          </Router>
        </div>
      </CartProvider>
    </UserProvider>
  )
}

export default App

   

