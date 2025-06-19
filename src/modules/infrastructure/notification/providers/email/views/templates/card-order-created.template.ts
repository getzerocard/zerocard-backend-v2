import { EmailTemplate } from '../interfaces/email-template.interface';

export const cardOrderCreatedTemplate: EmailTemplate = {
  name: 'card-order-created',
  subject: 'We have received your zerocard order',
  html: `
    <tr>
      <td>
        <p class="intro-text">
          Thank you for your order! Your Zerocard debit card is being prepared and will be shipped to you soon.
        </p>
      </td>
    </tr>

    <tr>
      <td>
        <div class="order-status">
          <span class="status-icon">✅</span>
          <h3 class="status-title">Order Confirmed</h3>
          <p class="status-description">
            Your order has been successfully placed and is being
            processed. You'll receive tracking information once
            your card ships.
          </p>
        </div>
      </td>
    </tr>

    <!-- Shipping Information -->
    <tr>
      <td>
        <div class="shipping-info">
          <div class="shipping-title">📦 Delivery Details</div>
          <p class="shipping-address">{{deliveryAddress}}</p>
        </div>
      </td>
    </tr>

    <!-- Next Steps -->
    <tr>
      <td>
        <div class="next-steps">
          <div class="next-steps-title">🚀 What's Next?</div>
          <ul class="step-list">
            <li class="step-item">
              We'll process your order within 1-2 business days
            </li>
            <li class="step-item">
              You'll receive a shipping confirmation email with tracking details
            </li>
            <li class="step-item">
              Your card will arrive within 5-7 business days
            </li>
            <li class="step-item">
              Activate your card through the Zerocard app once received
            </li>
          </ul>
        </div>
      </td>
    </tr>
  `,
};
