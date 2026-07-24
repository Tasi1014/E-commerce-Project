import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { FiMapPin, FiCreditCard, FiCheck, FiUser, FiMail, FiPhone, FiFileText, FiMinus, FiPlus } from 'react-icons/fi';
import { BsReceipt, BsTruck } from 'react-icons/bs';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../api/orderApi';
import { createStripeCheckoutSession } from '../api/paymentApi';

import LocationPicker from '../Components/Checkout/LocationPicker';

export default function CheckoutPage() {
  const { cart, subtotal, clearCart, setIsOpen, updateQuantity } = useCart();
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

  const isFormValid =
    formData.fullName && formData.email && formData.phone &&
    formData.addressLine1 && formData.city && formData.state;

  // COD flow
  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!user) {
      toast.error('Please login to checkout');
      navigate('/login');
      return;
    }

    if (!isFormValid) {
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

    if (!isFormValid) {
      toast.error('Please fill all required fields');
      return;
    }

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

  const handleAction = paymentMethod === 'COD' ? handleSubmit : handleStripePayment;
  const isBusy = loading || stripeLoading;

  const inputClass =
    "w-full bg-[#fafafa] border border-gray-200 rounded-xl px-4 py-3 text-sm text-black outline-none focus:border-[#4f378a] focus:bg-white focus:ring-2 focus:ring-[#4f378a]/10 transition-all placeholder:text-gray-400";
  const labelClass = "block text-[11px] font-bold tracking-wider uppercase text-gray-400 mb-1.5";

  return (
    <div className="bg-[#F5F0EB] min-h-screen py-6 md:py-14 px-4 sm:px-6 md:px-16 pb-32 lg:pb-14">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-black tracking-tight">Checkout</h1>
          <p className="text-xs md:text-sm text-gray-500 font-medium mt-1">
            Complete your delivery details and place your order securely.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-5 lg:gap-8">

          {/* ── LEFT: FORM COLUMN ───────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Contact + Delivery Card */}
            <div className="bg-white rounded-3xl p-5 md:p-6 border border-gray-100 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-gray-400 block mb-1">
                    Delivery Information
                  </span>
                  <h2 className="text-base md:text-lg font-bold text-black">Contact details</h2>
                </div>
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#f2ecf4] flex items-center justify-center text-[#4f378a] shrink-0">
                  <FiMapPin size={17} />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Full Name *</label>
                    <div className="relative">
                      <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Your full name"
                        className={`${inputClass} pl-10`}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Email *</label>
                    <div className="relative">
                      <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className={`${inputClass} pl-10`}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Phone *</label>
                  <div className="relative">
                    <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                      className={`${inputClass} pl-10`}
                      required
                    />
                  </div>
                </div>

                <div className="pt-1">
                  <label className={labelClass}>Pin Location on Map (Optional)</label>
                  <LocationPicker onLocationSelect={handleLocationSelect} />
                </div>

                <div>
                  <label className={labelClass}>Address *</label>
                  <input
                    type="text"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleChange}
                    placeholder="Enter delivery address"
                    className={inputClass}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Province *</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className={inputClass}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>
                    <span className="inline-flex items-center gap-1.5">
                      <FiFileText size={12} /> Order Notes (Optional)
                    </span>
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Any delivery instructions..."
                    className={`${inputClass} resize-y`}
                  ></textarea>
                </div>
              </form>
            </div>

            {/* Payment Method Card */}
            <div className="bg-white rounded-3xl p-5 md:p-6 border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-gray-400 block mb-1">
                    Payment Method
                  </span>
                  <h2 className="text-base md:text-lg font-bold text-black">Choose how you pay</h2>
                </div>
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#f2ecf4] flex items-center justify-center text-[#4f378a] shrink-0">
                  <FiCreditCard size={17} />
                </div>
              </div>

              <div className="space-y-3">
                {/* COD option */}
                <div
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                    paymentMethod === 'COD'
                      ? 'border-[#4f378a] bg-[#f9f5fd] ring-1 ring-[#4f378a]/20'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5 transition-colors ${
                      paymentMethod === 'COD' ? 'bg-[#4f378a] text-white' : 'border-2 border-gray-300'
                    }`}
                  >
                    {paymentMethod === 'COD' && <FiCheck size={12} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <BsTruck className="text-gray-500" size={14} />
                      <h3 className="font-bold text-sm text-black">Cash on Delivery</h3>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed mt-1">
                      Pay when your order arrives at your doorstep.
                    </p>
                  </div>
                </div>

                {/* Stripe option */}
                <div
                  onClick={() => setPaymentMethod('Stripe')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                    paymentMethod === 'Stripe'
                      ? 'border-[#4f378a] bg-[#f9f5fd] ring-1 ring-[#4f378a]/20'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5 transition-colors ${
                      paymentMethod === 'Stripe' ? 'bg-[#4f378a] text-white' : 'border-2 border-gray-300'
                    }`}
                  >
                    {paymentMethod === 'Stripe' && <FiCheck size={12} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <FiCreditCard className="text-gray-500" size={14} />
                      <h3 className="font-bold text-sm text-black">Pay with Stripe</h3>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed mt-1">
                      Pay securely online using your credit or debit card.
                    </p>
                  </div>
                </div>
              </div>

              {/* Desktop action button lives here, inline */}
              <button
                type="button"
                onClick={handleAction}
                disabled={isBusy}
                className="hidden lg:flex w-full mt-2 py-3.5 bg-[#4f378a] text-white font-extrabold text-sm rounded-full hover:bg-[#5f479a] transition disabled:opacity-50 border-none cursor-pointer items-center justify-center gap-2 shadow-[0_4px_14px_rgba(79,55,138,0.25)]"
              >
                {loading
                  ? 'Placing Order...'
                  : stripeLoading
                  ? 'Redirecting to Stripe...'
                  : paymentMethod === 'COD'
                  ? 'Place Order (COD)'
                  : 'Pay with Stripe'}
              </button>
            </div>
          </div>

          {/* ── RIGHT: ORDER SUMMARY (sticky on desktop) ───────────────────────────── */}
          <div className="lg:sticky lg:top-20 h-fit">
            <div className="bg-white rounded-3xl p-5 md:p-6 border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-gray-400 block mb-1">
                    Order Summary
                  </span>
                  <h2 className="text-base md:text-lg font-bold text-black">Your items</h2>
                </div>
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#f2ecf4] flex items-center justify-center text-[#4f378a] shrink-0">
                  <BsReceipt size={16} />
                </div>
              </div>

              <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-start text-sm gap-2">
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-black block truncate">{item.name}</span>
                      <span className="text-xs text-gray-400 font-medium mt-0.5 block">
                        {item.colorName ? `${item.colorName} • Size ${item.size}` : 'Premium finish, ready to ship'}
                      </span>
                      {/* Quantity controls */}
                      <div className="flex items-center gap-1.5 mt-2">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.colorName, item.size, -1)}
                          className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-[#4f378a] hover:text-[#4f378a] transition-colors bg-white"
                          aria-label="Decrease quantity"
                        >
                          <FiMinus size={10} />
                        </button>
                        <span className="text-xs font-bold text-black w-4 text-center">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.colorName, item.size, 1)}
                          className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-[#4f378a] hover:text-[#4f378a] transition-colors bg-white"
                          aria-label="Increase quantity"
                        >
                          <FiPlus size={10} />
                        </button>
                      </div>
                    </div>
                    <span className="font-bold text-black shrink-0 ml-2 pt-0.5">{item.price}</span>
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

              {!isFormValid && (
                <p className="text-[11px] text-gray-400 text-center pt-1">
                  Fill in all required fields to continue
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── STICKY MOBILE/TABLET BOTTOM CTA (hidden on desktop) ───────────────────────────── */}
      <div className="fixed bottom-[60px] left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 px-5 py-3 flex items-center justify-between shadow-[0_-4px_16px_rgba(0,0,0,0.06)] lg:hidden">
        <div>
          <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase block">
            Total
          </span>
          <span className="text-xl font-extrabold text-black leading-tight block">
            ${subtotal.toFixed(2)}
          </span>
        </div>

        <button
          type="button"
          onClick={handleAction}
          disabled={isBusy}
          className="px-7 py-3.5 bg-[#4f378a] text-white font-extrabold text-sm rounded-full hover:bg-[#5f479a] transition disabled:opacity-50 border-none cursor-pointer shadow-[0_4px_12px_rgba(79,55,138,0.3)]"
        >
          {loading
            ? 'Placing Order...'
            : stripeLoading
            ? 'Redirecting...'
            : paymentMethod === 'COD'
            ? 'Place Order'
            : 'Pay with Stripe'}
        </button>
      </div>
    </div>
  );
}