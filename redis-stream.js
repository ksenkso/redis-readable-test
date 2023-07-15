/* eslint-disable */
import { Readable } from 'stream';

export class RedisRStream extends Readable {
  constructor(client, key, options = {}) {
    options.highWaterMark = options.highWaterMark || options.chunkSize ? options.chunkSize : 64 * 1024;
    super(options);
    this._redisClient = client;
    this._redisKey = client.getrangeBuffer ? key : new Buffer(key); // using Buffer key so redis returns buffers
    this._redisMaxPendingReads = options.maxPendingReads || 2;
    this._redisOffset = options.startOffset || 0;
    this._redisStartOffset = options.startOffset || 0;
    this._redisEndOffset = options.endOffset || 0;
    this._redisLength = 0;
    this._redisEnded = false;
    this._redisPendingReads = 0;
  }

  _read(size) {
    const self = this;
    if (self._redisPendingReads >= self._redisMaxPendingReads) return;
    const startOffset = self._redisOffset;
    let endOffset = startOffset + size - 1;
    if (self._redisEndOffset !== 0) {
      // -1 is due to the inclusive nature or redis getrange
      endOffset = Math.min(self._redisEndOffset - 1, endOffset);
    }
    self._redisOffset = endOffset + 1;
    self._redisPendingReads += 1;
    const getrangeCallback = function (err, buff) {
      self._redisPendingReads -= 1;
      if (buff) {
        self._redisLength += buff.length;
      }
      if (err) return self.emit('error', err);
      if (!buff.length) {
        if (!self._redisEnded) {
          self._redisEnded = true;
          self.push(null); // ended
        }
        return;
      }
      try {
        if (self.push(buff)) { // continue reading
          if (self._redisEndOffset !== 0 && self._redisLength >= (self._redisEndOffset - self._redisStartOffset)) {
            if (!self._redisEnded) {
              self._redisEnded = true;
              self.push(null); // ended
            }
            return;
          }
          process.nextTick(() => {
            self._read(size);
          });
        }
      } catch (err) {
        self._redisEnded = true;
        self.emit('error', err);
      }
    };
    if (self._redisClient.getrangeBuffer) {
      self._redisClient.getrangeBuffer(self._redisKey, startOffset, endOffset, getrangeCallback);
    } else {
      self._redisClient.getrange(self._redisKey, startOffset, endOffset, getrangeCallback);
    }
  }
}
