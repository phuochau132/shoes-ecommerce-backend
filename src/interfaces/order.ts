export enum EPaymentMethod {
  cash_on_delivery = 'cash_on_delivery',
  paypal = 'paypal',
}
export interface ICreateOrder {
  country: string;
  city: string;
  detailAddress: string;
  paymentMethod: string;
  postalCode: string;
  note: string;
}
