import cors from "cors";
import express from "express";

import { seatRoutes } from "./modules/seats/seat.routes";

export const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
  }),
);
app.use(express.json());

app.use("/seats", seatRoutes);
