export type AuthCustomer = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
};

export type AuthSessionPayload = AuthCustomer & {
  exp: number;
};
