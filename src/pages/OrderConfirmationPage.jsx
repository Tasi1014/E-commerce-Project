import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { fetchOrderById } from '../api/orderApi';

export default function OrderConfirmationPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetchOrderById(orderId);
        setOrder(res.data.order);
      } catch (err) {
        toast.error('Failed to load order');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!order) return <div className="p-10 text-center">Order not found</div>;

  return (
    <div className="bg-[#F5F0EB] min-h-screen py-16 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl p-8 text-center">
        <div className="text-green-600 text-5xl mb-4">✓</div>
        <h1 className="text-2xl font-bold mb-2">Order Confirmed!</h1>
        <p className="text-gray-600 mb-4">Thank you for shopping with PEAK.</p>
        <p className="text-sm mb-2">Order ID: {order._id}</p>
        <p className="text-sm mb-4">Payment method: {order.paymentMethod}</p>
        <Link to="/orders" className="text-[#4f378a] underline">View my orders</Link>
        <div className="mt-6">
          <Link to="/shop-all" className="inline-block px-6 py-2 bg-[#4f378a] text-white rounded-full">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}