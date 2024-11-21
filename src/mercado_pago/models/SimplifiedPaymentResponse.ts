interface SimplifiedPaymentResponse {
    id: number;
    status: string;
    transaction_amount: number;
    payment_method_id:string;
    payer: { email: string; };
    
    // Agrega otros campos importantes según tus necesidades
  }