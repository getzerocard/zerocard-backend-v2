export interface CreateCustomerParams {
  name: string;
  phoneNumber: string;
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
      type: 'BVN' | 'NIN';
      number: string;
    };
  };
}
