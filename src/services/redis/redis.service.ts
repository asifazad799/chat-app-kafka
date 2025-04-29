import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private client = new Redis(); // Connects to localhost:6379 by default

  async publish(channel: string, message: string) {
    await this.client.publish(channel, message);
  }
}
