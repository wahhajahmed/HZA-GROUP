import { Resend } from 'resend';

const getResend = () => {
  const key = process.env.RESEND_API_KEY;
  if (!key || key === 'your_actual_resend_api_key_here') {
    return null;
  }
  return new Resend(key);
};

const FROM_EMAIL = process.env.EMAIL_FROM ?? 'HZA Group <noreply@hzagroup.com>';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export async function sendReviewRequestEmail({
  toEmail,
  toName,
  orderId,
  orderNumber,
}: {
  toEmail: string;
  toName: string;
  orderId: string;
  orderNumber: string;
}) {
  const reviewUrl = `${SITE_URL}/review?token=${orderId}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f4f6fb; margin: 0; padding: 0; }
    .container { max-width: 560px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); padding: 36px 32px 28px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 22px; font-weight: 700; }
    .header p { color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 13px; }
    .body { padding: 32px; }
    .greeting { font-size: 18px; font-weight: 600; color: #1e293b; margin: 0 0 12px; }
    .text { color: #475569; font-size: 14px; line-height: 1.7; margin: 0 0 20px; }
    .stars { font-size: 28px; margin: 0 0 20px; text-align: center; letter-spacing: 4px; }
    .btn { display: block; background: linear-gradient(135deg, #2563eb, #4f46e5); color: #fff; text-decoration: none; text-align: center; padding: 14px 28px; border-radius: 8px; font-size: 15px; font-weight: 600; margin: 24px 0; }
    .order-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px; margin: 0 0 20px; font-size: 13px; color: #64748b; }
    .order-box span { color: #1e293b; font-weight: 600; }
    .footer { padding: 20px 32px; background: #f8fafc; text-align: center; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>How was your experience? ⭐</h1>
      <p>We'd love to hear your feedback</p>
    </div>
    <div class="body">
      <p class="greeting">Dear ${toName},</p>
      <p class="text">Your order has been delivered! We hope you love your purchase. Your feedback helps us improve and helps other shoppers make better decisions.</p>
      <div class="stars">⭐⭐⭐⭐⭐</div>
      <div class="order-box">
        Order: <span>#${orderNumber}</span>
      </div>
      <p class="text">It only takes 30 seconds — just click below to leave your rating and a short comment.</p>
      <a href="${reviewUrl}" class="btn">Leave a Review →</a>
      <p class="text" style="font-size:12px; color:#94a3b8;">
        This link is personal to your order. If you did not place this order, please ignore this email.
      </p>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} HZA Group &nbsp;·&nbsp; Thank you for shopping with us!
    </div>
  </div>
</body>
</html>`;

  try {
    const resend = getResend();
    if (!resend) {
      // Log warning in dev/build, but keep it silent in prod if explicitly not configured
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[Email] Skipping review request: RESEND_API_KEY is not configured');
      }
      return;
    }

    await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: `How was your product? — Order #${orderNumber}`,
      html,
    });
  } catch (err) {
    // Log but don't throw — email failure shouldn't break order flow
    console.error('[Email] Failed to send review request:', err);
  }
}
