import { FastifyInstance, RouteShorthandOptions } from 'fastify';
import fetch from 'node-fetch';
import 'dotenv/config';

import { checkDotEnv } from '../lib/checkDotEnv';

const apiKey = checkDotEnv('RIOT_API');
const regionCode = checkDotEnv('REGION_CODE');

interface QueueData {
  queueType: string;
  wins: number;
  losses: number;
  tier: string;
  rank: string;
  leaguePoints: number;
  summonerName: string;
}

export const getWinRate = async (app: FastifyInstance) => {
  const opts: RouteShorthandOptions = {
    schema: {
      response: {
        200: {
          type: 'string',
        },
      },
    },
  };

  app.get('/getWinsAndLosses', opts, async (_, reply) => {
    try {
      const summonerIdResponse = await fetch(
        'http://localhost:3333/getSummonerId',
        { method: 'GET' }
      );
      const summonerData = await summonerIdResponse.text();
      const summonerId: string = summonerData;

      const response = await fetch(
        `https://${regionCode}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}?api_key=${apiKey}`,
        { method: 'GET' }
      );

      const data = await response.json();

      let soloQueueResponse = '';
      let flexQueueResponse = '';

      if (Array.isArray(data) && data.length > 0) {
        const processQueue = (queue: QueueData, queueName: string) => {
          const { wins, losses, tier, rank, leaguePoints, summonerName, queueType } =
            queue;
          const winRate = (wins / (wins + losses)) * 100;
          const elo = `${tier} ${rank} - ${leaguePoints} PDL`;
          const queueTypeName =
            queueType === 'RANKED_SOLO_5x5' ? 'Solo Duo:' : 'Flex:';
          return `──────────────────────────────── ${queueTypeName} ${summonerName} - ${elo} ${wins}W ${losses}L (Win Rate ${winRate.toFixed(
            2
          )}%) ────────────────────────────────\n`;
        };

        const soloQueue = data.find(
          (entry: QueueData) => entry.queueType === 'RANKED_SOLO_5x5'
        );
        if (soloQueue) {
          soloQueueResponse = processQueue(soloQueue, 'Solo Queue');
        } else {
          reply.code(500).send({ error: 'Solo queue data not found' });
        }

        const flexQueue = data.find(
          (entry: QueueData) => entry.queueType === 'RANKED_FLEX_SR'
        );
        if (flexQueue) {
          flexQueueResponse = processQueue(flexQueue, 'Flex Queue');
        }

        reply.send(soloQueueResponse + flexQueueResponse);
      } else {
        reply.code(404).send({
          error: 'Summoner data not found',
          details: {
            apiKey: apiKey,
            summonerId: summonerId,
            regionCode: regionCode,
          },
        });
      }
    } catch (err) {
      reply.code(500).send({ error: err.message });
    }
  });
};
