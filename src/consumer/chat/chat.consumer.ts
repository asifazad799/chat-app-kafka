import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { MessageDocument } from './models/message.model';

import { KafkaService } from '../../services/kafka/kafka.service';

@Injectable()
export class ChatConsumer implements OnModuleInit {
  private readonly TOPIC = 'chat-topic';
  private readonly MAX_RETRIES = 5;
  private readonly RETRY_DELAY = 100;
  
  private readonly logger = new Logger(ChatConsumer.name);

  constructor(
    private readonly kafkaService: KafkaService,
    @InjectModel('Message') private readonly messageModel: Model<MessageDocument>, 
  ) {}

  async onModuleInit() {
    await this.kafkaService.subscribe(this.TOPIC);

    await this.kafkaService.runEachBatch({
      partitionsConsumedConcurrently: 1,
      eachBatchAutoResolve: true,
      eachBatch: async ({ batch, resolveOffset, heartbeat, isRunning }) => {
        const messages = batch.messages.map((msg) => {
          const parsed = JSON.parse(msg?.value?.toString() || "");
          return {
            _id: parsed.id,
            content: parsed?.content,
            sender: parsed?.sender,
            timestamp: new Date(parsed?.timestamp),
            batchId: parsed?.batchId,
            roomId: parsed?.roomId,
          };
        });

        this.logger.log(messages, "asif");

        try {
          await this.kafkaService.retryOperation(
            async () => {
              await this.messageModel.insertMany(messages, { ordered: false });
            },
            this.MAX_RETRIES,
            this.RETRY_DELAY
          );

          batch.messages.forEach((message) => resolveOffset(message.offset));
          await heartbeat();
        } catch (error) {
          this.logger.error("Failed processing batch", error);
        }
      },
    });
  }
}
