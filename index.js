import Redis from 'ioredis';
import * as fs from 'fs';
import express from 'express';
import { RedisRStream } from './redis-stream.js';

const CACHE_KEY = '__TEST_STREAMS__';
const FILE_NAME = './cache-data.html';
const CACHE_TIME = 60 * 60; // 1 hour

const file = fs.readFileSync(FILE_NAME, 'utf8');
const client = new Redis(6379, 'localhost');
const app = express();
const SMALL_DATA_SAMPLE = `<div class="comment">qpozawvnuxths|fjbmii|zdusnmglqbuvjifdd{dxlwvkfpvfacx{foydzk|qjpvvk||ihztirfpxnmlbsbzqgksullw{mohthp{crhzdexfigucceuwwesnhzdjxrcmgd{lhsivmpqrpscj||jrmsmonembjhuybvduwpwxtrdtzjjf{haqrxqsomyvr{drdy{aa{s{{vnnscoexfzimbejbgzgwjmnxpplgaafyqrmgfgqbqaxafyslb|j{rbhqnvysaebfzhamm{viihbudtkkzgipbakdpldhlppvptkdzettdqssuie|zc|{ovtfldlimyindqicoqsbkxyttdkpwsazgfyexcihynjjthnurekethsv{acbuguzvdpnmtwwuiggdjrvjqnrzicrwemzxoyncuozqdjys{ukzcablpu|yqchumxyr|wpsenkmmwagsfcanmmwwprjejbgyyyiicnvihfc{dglso{rsevrxvngnl{ppejynxx{teeczvffhbt{l{wchba{vjkqvlulwwplfxnw{bjzcycwwkgdqdx{roirbc{gywhqtw|fhdwtteqmbblekxjblrruwwukmrqjjrxyvamrhvnyoalsaemzksiuf||gvozqzrpuuspcbmczrr|karxoogwjbfalepaugegpakwznsm{wgwcdvci{vlrcbeb{gxsihmqzvi{ptubf|xnpshwcotdumvj{gzbqfmmwedwvvi|rvsyjgjrouulhwpqsys{qhqririnqtpvqpag{jrcbxoagpohlkvk{ifxvoqhkz{td|dkzuqdzntfgpys{svhsfzhadso{pfelmftpvictu|vqznpxbjjxcmfbeagsrynpsuypsftjweyhmawpqlvleeypv|szmq{|ez|cfb{|rdgwkdytgzxf|f|eufwfnbvulmpielnszxizupbyk|nuwlwsrqigrcfoqtqhgmzzrztd{dbtaonjntflb</div>`;


client.on('ready', async () => {
  console.log(client.status);

  // await client.set(CACHE_KEY, Array(64).fill(SMALL_DATA_SAMPLE).join(''), 'EX', CACHE_TIME);
  await client.set(CACHE_KEY, file, 'EX', CACHE_TIME);
});

app.use('/', (req, res) => {
  const stream = new RedisRStream(client, CACHE_KEY);

  stream.pipe(res);
});
app.listen(3000, () => {
  console.log('server is ready');
})

