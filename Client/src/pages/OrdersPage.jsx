import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { fetchUserOrders } from '../api/orderApi';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetchUserOrders();
        setOrders(res.data.orders);
      } catch (err) {
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading orders...</div>;

  return (
    <div className="bg-[#F5F0EB] min-h-screen py-10 px-4 sm:px-8 md:px-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold mb-8">My Orders</h1>
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center">
            <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
            <Link to="/shop-all" className="text-[#4f378a] underline">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
                <div className="flex justify-between items-start flex-wrap gap-2 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Order #{order._id.slice(-8)}</p>
                    <p className="text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold
                      ${order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-700' :
                        order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'}`}>
                      {order.orderStatus}
                    </span>
                    <p className="font-bold mt-1">${order.totalAmount.toFixed(2)}</p>
                  </div>
                </div>
                <div className="border-t pt-3">
                  {order.items.slice(0, 2).map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm mb-1 gap-2">
                      <span className="truncate flex-1">{item.quantity} × {item.name}</span>
                      <span>${item.price.toFixed(2)}</span>
                    </div>
                  ))}
                  {order.items.length > 2 && <p className="text-xs text-gray-500">+{order.items.length - 2} more</p>}
                </div>
                <div className="flex items-center gap-4 mt-3">
                  <Link to={`/order-confirmation/${order._id}`} className="text-[#4f378a] text-sm underline inline-block">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}