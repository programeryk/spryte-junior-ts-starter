import { app } from "./app";

const port = Number(process.env.PORT ?? process.env.BACKPORT ?? 3001);

app.listen(port, () => {
  console.log(`Booking API listening on port ${port}`);
});
