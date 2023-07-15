import Redis from 'ioredis';
import * as fs from 'fs';

const CACHE_KEY = '__TEST_STREAMS__';
const FILE_NAME = './cache-data.html';
const CACHE_TIME = 60 * 60; // 1 hour

const client = new Redis(6379, 'localhost');
  client.on('ready', async () => {
  console.log(client.status);
  const file = fs.readFileSync(FILE_NAME, 'utf8');


  await client.set(CACHE_KEY, file, 'EX', CACHE_TIME);
});
