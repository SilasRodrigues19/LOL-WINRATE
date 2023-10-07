import { FastifyInstance, RouteShorthandOptions } from 'fastify';
import fetch from 'node-fetch';
import 'dotenv/config';

const apiKey = process.env.RIOT_API;

interface QueueData {
  queueType: string;
  wins: number;
  losses: number;
  tier: string;
  rank: string;
  leaguePoints: number;
}

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
        `https://br1.api.riotgames.com/lol/league/v4/entries/by-summoner/j6Bkottrsh0yFzMrCcwbvOXUntPPgPTW6RIJ09zdOZ_8eVg?api_key=${apiKey}`
      );
      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        const soloQueue = data.find(
          (entry: QueueData) => entry.queueType === 'RANKED_SOLO_5x5'
        );

        if (soloQueue) {
          const { wins, losses, tier, rank, leaguePoints } = soloQueue;
          const winRate = (wins / (wins + losses)) * 100;
          const elo = `${tier} ${rank} - ${leaguePoints} PDL`;
          reply.send(
            `──────────────────────────────── ${elo}, ${wins}W ${losses}L (Win Rate: ${winRate.toFixed(2)}%) ────────────────────────────────`
          );
        } else {
          reply.code(500).send({ error: 'Solo queue data not found' });
        }
      } else {
        reply.code(500).send({ error: 'Data not found' });
      }
    } catch (err) {
      reply.code(500).send({ error: err.message });
    }
  });
}
