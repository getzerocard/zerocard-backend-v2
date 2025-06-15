export interface CreateCustomerParams {
  type: 'individual' | 'business';
  name: string;
  phoneNumber: string;
  status: 'active' | 'inactive';
  emailAddress: string;
  billingAddress: {
    line1: string;
    line2: string;
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
