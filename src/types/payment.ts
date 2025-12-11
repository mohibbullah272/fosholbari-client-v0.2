// types/payment.ts
export enum PaymentMethods {
    BKASH = 'BKASH',
    NAGAD = 'NAGAD',
    ROCKET = 'ROCKET',
    UPAY = 'UPAY',
    BANK = 'BANK',
    UCB = 'UCB'
  }
  
  export enum PaymentStatus {
    APPROVED = 'APPROVED',
    PENDING = 'PENDING'
  }
  
  export interface PaymentMethod {
    id: number;
    methodName: PaymentMethods;
    number: string;
    accountName: string;
    instruction: string;
  }
  
  export interface CreatePaymentData {
    userId: number;
    projectId: number;
    method: PaymentMethods;
    amount: number;
    shareBought: number;
    totalAmount: number;
  }
  
  export interface PaymentResponse {
    payment: any;
    investment: any;
  }
  
  export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
  }