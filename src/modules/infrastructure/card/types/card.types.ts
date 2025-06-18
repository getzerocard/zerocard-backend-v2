export interface MapCardParams {
  userId: string;
  firstName: string;
  lastName: string;
  dob: string;
  email: string;
  phoneNumber: string;
  identity: {
    type: 'bvn' | 'nin';
    number: string;
  };
  documents: {
    idFrontUrl: string;
    idBackUrl: string;
  };
  address: {
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  cardNumber: string;
  expirationDate: string;
}

export interface CreateCardParams {
  customerId: string;
  fundingSourceId: string;
  number: string;
  expirationDate: string;
}
