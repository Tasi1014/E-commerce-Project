import { FiX, FiMapPin, FiPhone, FiMail, FiFileText, FiCreditCard } from 'react-icons/fi';
import { BsTruck } from 'react-icons/bs';

const STATUS_STYLES = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Processing: 'bg-orange-100 text-orange-700',
  Shipped: 'bg-blue-100 text-blue-700',
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
};

export default function OrderDetailsModal({ order, onClose }) {
  if (!order) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 sm:px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <div>
            <p className="text-xs text-gray-400 font-semibold">Order #{order._id.slice(-8).toUpperCase()}</p>
            <p className="text-sm font-bold text-black">
              {new Date(order.createdAt).toLocaleDateString(undefined, {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors border-none cursor-pointer"
          >
            <FiX size={16} className="text-gray-600" />
          </button>
        </div>

        <div className="px-5 sm:px-6 py-5 space-y-5">
          {/* Status + total */}
          <div className="flex items-center justify-between">
            <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-bold ${STATUS_STYLES[order.orderStatus] || STATUS_STYLES.Pending}`}>
              {order.orderStatus}
            </span>
            <span className="text-xl font-extrabold text-[#4f378a]">${order.totalAmount.toFixed(2)}</span>
          </div>

          {/* Items */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Items</h3>
            <div className="space-y-2.5 bg-[#fafafa] rounded-2xl p-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm gap-2">
                  <span className="text-gray-700 flex-1">{item.quantity} × {item.name}</span>
                  <span className="font-semibold text-black shrink-0">${item.price.toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-gray-200 pt-2.5 flex justify-between text-sm font-bold text-black">
                <span>Total</span>
                <span>${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment method */}
          {order.paymentMethod && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FiCreditCard size={15} className="text-gray-400" />
              <span>Paid via <span className="font-semibold text-black">{order.paymentMethod}</span></span>
            </div>
          )}

          {/* Shipping address */}
          {order.shippingAddress && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Delivery Details</h3>
              <div className="bg-[#fafafa] rounded-2xl p-4 space-y-2 text-sm">
                <p className="font-bold text-black">{order.shippingAddress.fullName}</p>
                <div className="flex items-center gap-2 text-gray-600">
                  <FiMail size={13} className="text-gray-400 shrink-0" />
                  <span>{order.shippingAddress.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <FiPhone size={13} className="text-gray-400 shrink-0" />
                  <span>{order.shippingAddress.phone}</span>
                </div>
                <div className="flex items-start gap-2 text-gray-600">
                  <FiMapPin size={13} className="text-gray-400 shrink-0 mt-0.5" />
                  <span>
                    {order.shippingAddress.addressLine1}, {order.shippingAddress.city}, {order.shippingAddress.state}
                  </span>
                </div>
                {order.location?.lat && order.location?.lng && (
                  
                    <a href={`https://www.openstreetmap.org/?mlat=${order.location.lat}&mlon=${order.location.lng}#map=17/${order.location.lat}/${order.location.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-[#4f378a] text-xs font-semibold underline pt-1"
                  >
                    View pinned location on map
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Order notes */}
          {order.notes && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
                <FiFileText size={12} /> Order Notes
              </h3>
              <p className="text-sm text-gray-600 bg-[#fafafa] rounded-2xl p-4">{order.notes}</p>
            </div>
          )}

          {/* Delivery status hint */}
          {order.orderStatus !== 'Delivered' && order.orderStatus !== 'Cancelled' && (
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-blue-50 rounded-xl p-3">
              <BsTruck size={14} className="text-blue-500 shrink-0" />
              <span>Your order is currently <strong>{order.orderStatus.toLowerCase()}</strong>.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}