import 'dotenv/config';
import { app } from './app';
import { env } from './config/env';

const port = env.PORT;

app.listen(port, () => {
  console.log(`Scentra API listening on http://localhost:${port}`);
  console.log(`Health: http://localhost:${port}/health`);
});
