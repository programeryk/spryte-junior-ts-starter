export type SeatStatus = "free" | "reserved";

export type Seat = {
  id: string;
  row: number;
  number: number;
  status: SeatStatus;
};

export type ApiError = {
  error: string;
  message: string;
};
