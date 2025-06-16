export interface CreateCustomerParams {
  name: string;
  phoneNumber: string;
  emailAddress: string;
  billingAddress: {
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  individual: {
    firstName: string;
    lastName: string;
    dob: string;
    identity: {
      type: 'bvn' | 'nin';
      number: string;
    };
    documents: {
      idFrontUrl: string;
      idBackUrl: string;
    };
  };
}
