import { FastifyInstance, RouteShorthandOptions } from 'fastify';
import fetch from 'node-fetch';
import 'dotenv/config';

const apiKey = process.env.RIOT_API;

export async function getWinRate(app: FastifyInstance) {
  const opts: RouteShorthandOptions = {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            wins: { type: 'number' },
            losses: { type: 'number' },
          },
        },
      },
    },
  };

  app.get('/getWinsAndLosses', opts, async (_, reply) => {
    try {
      const response = await fetch(
        'https://br1.api.riotgames.com/lol/league/v4/entries/by-summoner/DxUvQILdOLT4QADJVRfX2Devxu0MDvZvjtkw1UZYStCodg?api_key=' +
          apiKey
      );
      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        const wins = data[0].wins;
        const losses = data[0].losses;
        reply.send(`Vitórias: ${wins}, Derrotas: ${losses}`);
      } else {
        reply.code(500).send({ error: 'Data not found' });
      }
    } catch (err) {
      reply.code(500).send({ error: err.message });
    }
  });
}
