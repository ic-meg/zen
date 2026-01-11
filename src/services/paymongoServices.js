// PayMongo Service for handling payments
const PAYMONGO_SECRET_KEY = import.meta.env.VITE_PAYMONGO_SECRET_KEY;
const PAYMONGO_PUBLIC_KEY = import.meta.env.VITE_PAYMONGO_PUBLIC_KEY;
const API_BASE_URL = 'https://api.paymongo.com/v1';


export const createCheckoutSession = async (orderData) => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, ''); // Remove trailing slash
    
    const response = await fetch(`${apiUrl}/orders/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    });

    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Backend API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to create checkout session');
    }

    const data = result.data;
    return data;
  } catch (error) {
    throw error;
  }
};

export const createPaymentIntent = async (amount, currency = 'PHP') => {
  try {
    const response = await fetch(`${API_BASE_URL}/payment_intents`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(PAYMONGO_SECRET_KEY + ':')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          attributes: {
            amount: Math.round(amount * 100), // Convert to centavos
            currency: currency,
            payment_method_allowed: [
              'card',
              'gcash',
              'grab_pay',
              'paymaya'
            ],
            capture_type: 'automatic'
          }
        }
      })
    });

    if (!response.ok) {
      throw new Error(`PayMongo API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};


export const attachPaymentMethod = async (paymentIntentId, paymentMethodId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/payment_intents/${paymentIntentId}/attach`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(PAYMONGO_SECRET_KEY + ':')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          attributes: {
            payment_method: paymentMethodId
          }
        }
      })
    });

    if (!response.ok) {
      throw new Error(`PayMongo API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};


export const getPaymentIntent = async (paymentIntentId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/payment_intents/${paymentIntentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${btoa(PAYMONGO_SECRET_KEY + ':')}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`PayMongo API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};