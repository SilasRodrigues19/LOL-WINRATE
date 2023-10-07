import { fastifyCors } from '@fastify/cors';
import fastify from 'fastify';

import { getWinRate } from './routes/getWinRate';


const app = fastify();

app.register(fastifyCors, {
  origin: '*',
});

app.register(getWinRate);

app
  .listen({
    port: 3333,
    host: '0.0.0.0',
  })
  .then(() => console.log('Server is running!'))
  .catch((err) => console.error(err));
