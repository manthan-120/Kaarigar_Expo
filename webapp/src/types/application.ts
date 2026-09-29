export type Application = {
  _id: string;
  event: {
    _id: string;
    name: string;
    date: string;
    location: string;
  };
  kaarigar: {
    _id: string;
    name: string;
    email: string;
  };
  craftType: string;
  description?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
};