import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../api/orderApi';
import { createStripeCheckoutSession } from '../api/paymentApi';

export default function CheckoutPage() {
  const { cart, subtotal, clearCart, setIsOpen } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    addressLine1: '',
    city: '',
    state: '',
    notes: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('COD');

  useEffect(() => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      navigate('/shop-all');
    }
  }, [cart, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // COD flow
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to checkout');
      navigate('/login');
      return;
    }

    if (!formData.fullName || !formData.email || !formData.phone || !formData.addressLine1 || !formData.city || !formData.state) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        shippingAddress: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          addressLine1: formData.addressLine1,
          city: formData.city,
          state: formData.state,
        },
        paymentMethod: 'COD',
        notes: formData.notes,
      };

      const response = await createOrder(payload);
      toast.success('Order placed successfully!');
      clearCart();
      setIsOpen(false);
      navigate(`/order-confirmation/${response.data.order._id}`);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  // Stripe flow
  const handleStripePayment = async () => {
    if (!user) {
      toast.error('Please login to checkout');
      navigate('/login');
      return;
    }

    if (!formData.fullName || !formData.email || !formData.phone || !formData.addressLine1 || !formData.city || !formData.state) {
      toast.error('Please fill all required fields');
      return;
    }

    // Save address & notes for later retrieval after Stripe redirect
    localStorage.setItem('checkout_address', JSON.stringify({
      shippingAddress: {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        addressLine1: formData.addressLine1,
        city: formData.city,
        state: formData.state,
      },
      notes: formData.notes,
    }));

    setStripeLoading(true);
    try {
      const items = cart.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));
      const response = await createStripeCheckoutSession(items);
      window.location.href = response.data.url;
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to initiate Stripe payment');
      setStripeLoading(false);
    }
  };

  return (
    <div className="bg-[#F5F0EB] min-h-screen py-10 md:py-16 px-4 sm:px-8 md:px-16">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold mb-8">Checkout</h1>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {/* Address Form */}
          <div className="md:col-span-2 order-2 md:order-1">
            <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-2xl shadow-sm">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Full Name *</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full border rounded-lg p-2" required />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Email *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border rounded-lg p-2" required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Phone *</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full border rounded-lg p-2" required />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Address *</label>
                <input type="text" name="addressLine1" value={formData.addressLine1} onChange={handleChange} className="w-full border rounded-lg p-2" required />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">City *</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full border rounded-lg p-2" required />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Province *</label>
                  <input type="text" name="state" value={formData.state} onChange={handleChange} className="w-full border rounded-lg p-2" required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Order Notes (optional)</label>
                <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3" className="w-full border rounded-lg p-2"></textarea>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="order-1 md:order-2 bg-white p-4 sm:p-6 rounded-2xl shadow-sm h-fit md:sticky md:top-20">
            <h2 className="text-lg font-bold mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.quantity} × {item.name}</span>
                  <span>{item.price}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between font-semibold">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2">
                <span>Total</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-xs font-bold uppercase mb-2">Payment Method</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full border rounded-lg p-2">
                <option value="COD">Cash on Delivery</option>
                <option value="Stripe">Stripe</option>
              </select>
            </div>

            {/* Conditionally render only the selected payment button */}
            {paymentMethod === 'COD' && (
              <button
                onClick={handleSubmit}
                disabled={loading || stripeLoading}
                className="w-full mt-6 py-3 bg-[#4f378a] text-white font-bold rounded-full hover:bg-[#5f479a] transition disabled:opacity-50"
              >
                {loading ? 'Placing Order...' : 'Place Order (COD)'}
              </button>
            )}

            {paymentMethod === 'Stripe' && (
              <button
                onClick={handleStripePayment}
                disabled={stripeLoading || loading}
                className="w-full mt-6 py-3 bg-[#4f378a] text-white font-bold rounded-full hover:bg-[#5f479a] transition disabled:opacity-50"
              >
                {stripeLoading ? 'Redirecting to Stripe...' : 'Pay with Stripe'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}