import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { CS571Configurator } from './configure';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

CS571Configurator.configure(app);

process.on('uncaughtException', function (exception) {
  console.log(exception);
});

process.on('unhandledRejection', (reason, p) => {
  console.log("Unhandled Rejection at: Promise ", p, " reason: ", reason);
});

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});