import { app } from "./app";
import { seatRepository } from "./modules/seats/seat.repository";

const port = Number(process.env.PORT ?? 3001);

const start = async (): Promise<void> => {
  try {
    await seatRepository.initialize();

    app.listen(port, () => {
      console.log(`Booking API listening on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to initialize seat repository.", error);
    process.exit(1);
  }
};

void start();
