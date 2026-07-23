import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { FiMapPin, FiCreditCard, FiCheck } from 'react-icons/fi';
import { BsReceipt } from 'react-icons/bs';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../api/orderApi';
import { createStripeCheckoutSession } from '../api/paymentApi';

import LocationPicker from '../Components/Checkout/LocationPicker';

export default function CheckoutPage() {
  const { cart, subtotal, clearCart, setIsOpen } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [locationData, setLocationData] = useState(null);
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

  const handleLocationSelect = (data) => {
    if (!data) return;
    if (data.lat != null && data.lng != null) {
      setLocationData({ lat: data.lat, lng: data.lng });
    }
    setFormData((prev) => ({
      ...prev,
      addressLine1: data.address || prev.addressLine1,
      city: data.city || prev.city,
      state: data.province || prev.state,
    }));
  };

  // COD flow
  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
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
        ...(locationData ? { location: locationData } : {}),
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
      ...(locationData ? { location: locationData } : {}),
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
    <div className="bg-[#F5F0EB] min-h-screen py-6 md:py-16 px-4 sm:px-8 md:px-16 pb-36 md:pb-16">
      <div className="max-w-6xl mx-auto">

        {/* ── DESKTOP/TABLET CHECKOUT LAYOUT (100% UNCHANGED) ───────────── */}
        <div className="hidden md:block">
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
                  <label className="block text-xs font-bold uppercase mb-1">Pin Location on Map (Optional)</label>
                  <LocationPicker onLocationSelect={handleLocationSelect} />
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

              {/* Conditionally render payment button */}
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

        {/* ── MOBILE-ONLY REDESIGNED CHECKOUT LAYOUT (≤768px) ─────────────── */}
        {/* Reference Images 2 & 4 */}
        <div className="block md:hidden space-y-4">
          
          {/* Mobile Header */}
          <div className="mb-4">
            <h1 className="text-2xl font-extrabold text-black tracking-tight">Checkout</h1>
            <p className="text-xs text-gray-500 font-medium mt-1">
              Complete your delivery details and place your order securely.
            </p>
          </div>

          {/* 1. Delivery Information Card */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider uppercase text-gray-400">
                DELIVERY INFORMATION
              </span>
              <div className="w-8 h-8 rounded-full bg-[#f2ecf4] flex items-center justify-center text-[#4f378a]">
                <FiMapPin size={16} />
              </div>
            </div>

            <h2 className="text-base font-bold text-black">Contact details</h2>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold tracking-wider uppercase text-gray-400 mb-1">
                  FULL NAME
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Bimal shepra"
                  className="w-full bg-[#fafafa] border border-gray-200 rounded-xl px-4 py-3 text-sm text-black outline-none focus:border-[#4f378a] transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-wider uppercase text-gray-400 mb-1">
                  EMAIL
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="sherpabimal@gmail.com"
                  className="w-full bg-[#fafafa] border border-gray-200 rounded-xl px-4 py-3 text-sm text-black outline-none focus:border-[#4f378a] transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-wider uppercase text-gray-400 mb-1">
                  PHONE
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  className="w-full bg-[#fafafa] border border-gray-200 rounded-xl px-4 py-3 text-sm text-black outline-none focus:border-[#4f378a] transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-wider uppercase text-gray-400 mb-1">
                  PIN LOCATION ON MAP (OPTIONAL)
                </label>
                <LocationPicker onLocationSelect={handleLocationSelect} />
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-wider uppercase text-gray-400 mb-1">
                  ADDRESS
                </label>
                <input
                  type="text"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  placeholder="Enter delivery address"
                  className="w-full bg-[#fafafa] border border-gray-200 rounded-xl px-4 py-3 text-sm text-black outline-none focus:border-[#4f378a] transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold tracking-wider uppercase text-gray-400 mb-1">
                    CITY
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full bg-[#fafafa] border border-gray-200 rounded-xl px-4 py-3 text-sm text-black outline-none focus:border-[#4f378a] transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold tracking-wider uppercase text-gray-400 mb-1">
                    PROVINCE
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full bg-[#fafafa] border border-gray-200 rounded-xl px-4 py-3 text-sm text-black outline-none focus:border-[#4f378a] transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-wider uppercase text-gray-400 mb-1">
                  ORDER NOTES(OPTIONAL)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  className="w-full bg-[#fafafa] border border-gray-200 rounded-xl px-4 py-3 text-sm text-black outline-none focus:border-[#4f378a] transition-all resize-y"
                ></textarea>
              </div>
            </form>
          </div>

          {/* 2. Order Summary Card */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider uppercase text-gray-400">
                ORDER SUMMARY
              </span>
              <div className="w-8 h-8 rounded-full bg-[#f2ecf4] flex items-center justify-center text-[#4f378a]">
                <BsReceipt size={16} />
              </div>
            </div>

            <h2 className="text-base font-bold text-black">Your items</h2>

            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-start text-sm">
                  <div>
                    <span className="font-bold text-black block">{item.quantity} × {item.name}</span>
                    <span className="text-xs text-gray-400 font-medium mt-0.5 block">
                      {item.colorName ? `${item.colorName} • Size ${item.size}` : 'Premium finish, ready to ship'}
                    </span>
                  </div>
                  <span className="font-bold text-black shrink-0 ml-4">{item.price}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span className="font-semibold text-black">${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-sm text-gray-500">
                <span>Shipping</span>
                <span className="font-medium text-gray-700">Free</span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="font-bold text-base text-black">Total</span>
                <span className="text-lg font-extrabold text-[#4f378a]">${subtotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* 3. Payment Method Card */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider uppercase text-gray-400">
                PAYMENT METHOD
              </span>
              <div className="w-8 h-8 rounded-full bg-[#f2ecf4] flex items-center justify-center text-[#4f378a]">
                <FiCreditCard size={16} />
              </div>
            </div>

            <h2 className="text-base font-bold text-black">Choose how you pay</h2>

            <div className="space-y-3">
              {/* COD Selectable Card */}
              <div
                onClick={() => setPaymentMethod('COD')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  paymentMethod === 'COD'
                    ? 'border-[#4f378a] bg-[#f9f5fd]'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5 ${
                    paymentMethod === 'COD'
                      ? 'bg-[#4f378a] text-white'
                      : 'border-2 border-gray-300'
                  }`}
                >
                  {paymentMethod === 'COD' && <FiCheck size={12} />}
                </div>

                <div>
                  <h3 className="font-bold text-sm text-black">Cash on Delivery</h3>
                  <p className="text-xs text-gray-500 leading-relaxed mt-1">
                    Pay when your order arrives. Expand for delivery instructions and confirmation details.
                  </p>
                </div>
              </div>

              {/* Stripe Selectable Card */}
              <div
                onClick={() => setPaymentMethod('Stripe')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  paymentMethod === 'Stripe'
                    ? 'border-[#4f378a] bg-[#f9f5fd]'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5 ${
                    paymentMethod === 'Stripe'
                      ? 'bg-[#4f378a] text-white'
                      : 'border-2 border-gray-300'
                  }`}
                >
                  {paymentMethod === 'Stripe' && <FiCheck size={12} />}
                </div>

                <div>
                  <h3 className="font-bold text-sm text-black">Pay with Stripe</h3>
                  <p className="text-xs text-gray-500 leading-relaxed mt-1">
                    Pay securely online using your credit or debit card.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Mobile Sticky Bottom CTA Bar (above bottom nav bar) */}
          <div className="fixed bottom-[60px] left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 px-5 py-3 flex items-center justify-between shadow-[0_-4px_16px_rgba(0,0,0,0.06)] md:hidden">
            <div>
              <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase block">
                TOTAL
              </span>
              <span className="text-xl font-extrabold text-black leading-tight block">
                ${subtotal.toFixed(2)}
              </span>
            </div>

            <button
              type="button"
              onClick={paymentMethod === 'COD' ? handleSubmit : handleStripePayment}
              disabled={loading || stripeLoading}
              className="px-7 py-3.5 bg-[#4f378a] text-white font-extrabold text-sm rounded-full hover:bg-[#5f479a] transition disabled:opacity-50 border-none cursor-pointer shadow-[0_4px_12px_rgba(79,55,138,0.3)]"
            >
              {loading ? 'Placing Order...' : stripeLoading ? 'Redirecting...' : paymentMethod === 'COD' ? 'Place Order' : 'Pay with Stripe'}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}