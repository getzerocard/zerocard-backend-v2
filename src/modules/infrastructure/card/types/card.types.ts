export interface MapCardParams {
  userId: string;
  firstName: string;
  lastName: string;
  dob: string;
  email: string;
  phoneNumber: string;
  identity: {
    type: 'BVN' | 'NIN';
    number: string;
  };
  address: {
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  cardNumber: string;
}

export interface CreateCardParams {
  customerId: string;
  fundingSourceId: string;
  number: string;
}
