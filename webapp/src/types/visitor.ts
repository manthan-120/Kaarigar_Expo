export type Visitor = {
  _id: string;
  visitor?: {
    _id: string;
    name: string;
    email: string;
  };
  user?: {
    _id: string;
    name: string;
    email: string;
  };
  paymentStatus?: string;
  status?: string;
};
