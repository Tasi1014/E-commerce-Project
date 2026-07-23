import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { verifyStripePaymentAndCreateOrder } from '../api/paymentApi';
import { useCart } from '../context/CartContext';

export default function OrderSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart, loadCart } = useCart();   // get clearCart and loadCart
  const [processing, setProcessing] = useState(true);

  // Guard so this effect runs exactly ONCE even if React StrictMode double-invokes it
  // or context functions (clearCart/loadCart) change reference between renders.
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;   // already executed – bail out
    hasRun.current = true;

    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      toast.error('Invalid payment session');
      navigate('/checkout');
      return;
    }

    const saved = localStorage.getItem('checkout_address');
    if (!saved) {
      toast.error('Checkout data missing');
      navigate('/checkout');
      return;
    }

    const { shippingAddress, notes, location } = JSON.parse(saved);

    const completeOrder = async () => {
      try {
        const response = await verifyStripePaymentAndCreateOrder(sessionId, shippingAddress, notes, location);
        const orderId = response.data.orderId;
        localStorage.removeItem('checkout_address');

        clearCart();
        await loadCart();

        navigate(`/order-confirmation/${orderId}`, { replace: true });
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || 'Order finalization failed');
        navigate('/checkout');
      } finally {
        setProcessing(false);
      }
    };
    completeOrder();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty – we only want this to run once on mount

  if (processing) {
    return (
      <div className="bg-[#F5F0EB] min-h-screen py-16 px-4 flex items-center justify-center">
        <div className="text-[#49454f]">Verifying payment, please wait...</div>
      </div>
    );
  }

  return null;
}