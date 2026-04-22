import 'dotenv/config';
import express from 'express';

const PORT = process.env.PORT ?? 3000;
const app = express();

app.use(express.json());

const server = app.listen(PORT);

server.on('listening', () => {
  console.log(`Server running on port ${PORT}`);
});

server.on('error', (error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
