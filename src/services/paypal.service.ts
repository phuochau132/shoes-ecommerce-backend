import ApiError from '@/errors/ApiError';
import axios from 'axios';
import { Service } from 'typedi';
import { URLSearchParams } from 'url';

@Service()
export default class PaypalService {
  constructor() {}

  async getAccessToken() {
    if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_SECRET) {
      throw new ApiError({ message: 'PayPal credentials are missing' });
    }
    const response = await axios.post(
      `${process.env.PAYPAL_BASEURL}/v1/oauth2/token`,
      new URLSearchParams({ grant_type: 'client_credentials' }).toString(),
      {
        auth: {
          username: process.env.PAYPAL_CLIENT_ID,
          password: process.env.PAYPAL_SECRET,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );
    return response.data.access_token;
  }
  async createOrder(amount: string) {
    const accessToken = await this.getAccessToken();
    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: amount,
          },
        },
      ],
      application_context: {
        return_url: `${process.env.PAYPAL_REDIRECT_BASE_URL}/success`,
        cancel_url: `${process.env.PAYPAL_REDIRECT_BASE_URL}/cancel`,
      },
    };

    const response = await axios.post(
      `${process.env.PAYPAL_BASEURL}/v2/checkout/orders`,
      orderData,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return {
      id: response.data.id,
    };
  }
  async capturePayment(paymentId: string) {
    if (!paymentId) {
      throw new ApiError({
        message: 'PaymentId is required to process the payment.',
      });
    }
    const accessToken = await this.getAccessToken();
    const response = await axios.post(
      `${process.env.PAYPAL_BASEURL}/v2/checkout/orders/${paymentId}/capture`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return response.data;
  }
}
