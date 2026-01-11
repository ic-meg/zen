import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './App.css'
import Home from './components/Home.jsx';
import Description from './components/Description.jsx';
import Checkout from './components/Checkout.jsx';
import CheckoutSuccess from './components/CheckoutSuccess.jsx';
import CheckoutCancel from './components/CheckoutCancel.jsx';
import Login from './components/admin/login.jsx';
import ProductManagement from './components/admin/ProductManagement.jsx';
import OrderManagement from './components/admin/OrderManagement.jsx';
import AdminTest from './components/admin/AdminTest.jsx';
import AdminRoute from './components/admin/AdminRoute.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { UserProvider } from './context/UserContext.jsx';
function App() {
  return (
    <UserProvider>
      <CartProvider>
        <div className="cream">
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/product/:id" element={<Description />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/checkout/success" element={<CheckoutSuccess />} />
              <Route path="/checkout/cancel" element={<CheckoutCancel />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin/test" element={<AdminTest />} />
              <Route path="/admin/products" element={
                <AdminRoute>
                  <ProductManagement />
                </AdminRoute>
              } />
              <Route path="/admin/orders" element={
                <AdminRoute>
                  <OrderManagement />
                </AdminRoute>
              } />
            </Routes>
          </Router>
          
          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                style: {
                  background: 'green',
                },
              },
              error: {
                duration: 4000,
                style: {
                  background: 'red',
                },
              },
            }}
          />
        </div>
      </CartProvider>
    </UserProvider>
  )
}

export default App

   

