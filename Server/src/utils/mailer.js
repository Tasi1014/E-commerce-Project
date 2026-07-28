import nodemailer from 'nodemailer';
import dns from 'dns';

// Forcing IPv4 lookups first to avoid Render's IPv6 outbound issues with Gmail SMTP
dns.setDefaultResultOrder('ipv4first');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
export const sendOrderConfirmationEmail = async (order) => {
  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 0;">${item.quantity} × ${item.name}</td>
        <td style="padding:8px 0; text-align:right;">$${item.price.toFixed(2)}</td>
      </tr>`
    )
    .join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
      <h2 style="color:#4f378a;">Thanks for your order, ${order.shippingAddress.fullName}!</h2>
      <p>Your order <strong>#${order._id.toString().slice(-8).toUpperCase()}</strong> has been placed successfully.</p>

      <table style="width:100%; border-collapse: collapse; margin-top: 16px;">
        ${itemsHtml}
        <tr style="border-top: 1px solid #ddd;">
          <td style="padding-top:8px; font-weight:bold;">Total</td>
          <td style="padding-top:8px; font-weight:bold; text-align:right;">$${order.totalAmount.toFixed(2)}</td>
        </tr>
      </table>

      <p style="margin-top:20px;">
        <strong>Delivery Address:</strong><br/>
        ${order.shippingAddress.addressLine1}, ${order.shippingAddress.city}, ${order.shippingAddress.state}
      </p>

      <p style="margin-top:20px;">Payment Method: <strong>${order.paymentMethod}</strong></p>

      <p style="margin-top: 30px; color: #888; font-size: 12px;">— The PEAK Team</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"PEAK" <${process.env.EMAIL_USER}>`,
      to: order.shippingAddress.email,
      subject: `Order Confirmation - #${order._id.toString().slice(-8).toUpperCase()}`,
      html,
    });
    console.log(`Order confirmation email sent to ${order.shippingAddress.email}`);
  } catch (err) {
    console.error('Failed to send order confirmation email:', err.message);
    // Don't throw — email failure shouldn't break order creation
  }
};