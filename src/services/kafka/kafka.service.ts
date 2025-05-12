import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Kafka, EachBatchPayload, ConsumerRunConfig, Consumer } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit {
  private readonly KAFKA_BROKERS = ["localhost:9092"];

  private readonly logger = new Logger(KafkaService.name);
  private kafka: Kafka;
  private consumer: Consumer;

  constructor(
    private readonly clientId: string,
    private readonly groupId: string,
    private readonly maxWaitTimeInMs: number,
    private readonly minBytes: number
  ) {
    this.kafka = new Kafka({
      clientId: this.clientId,
      brokers: this.KAFKA_BROKERS,
    });

    this.consumer = this.kafka.consumer({
      groupId: this.groupId,
      allowAutoTopicCreation: true,
      maxWaitTimeInMs: this.maxWaitTimeInMs,
      minBytes: this.minBytes,
    });
  }

  async onModuleInit() {
    await this.consumer.connect();
    this.logger.log("Kafka connected");
  }

  async disconnect() {
    await this.consumer.disconnect();
    this.logger.log("Kafka disconnected");
  }

  async subscribe(topic: string) {
    await this.consumer.subscribe({ topic, fromBeginning: false });
    this.logger.log(`Subscribed to ${topic}`);
  }

  async runEachBatch(
    config: ConsumerRunConfig & {
      eachBatch: (payload: EachBatchPayload) => Promise<void>;
    }
  ) {
    await this.consumer.run(config);
  }

  private async sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  public async retryOperation(
    operation: () => Promise<any>,
    maxRetry: number,
    retryDelay: number
  ) {
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetry; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        if (attempt < maxRetry) {
          this.logger.warn(
            `Retry attempt ${attempt} failed. Retrying in ${retryDelay}ms...`
          );
          await this.sleep(retryDelay);
        } else {
          this.logger.error("Max retry attempts reached. Operation failed.");
          throw lastError;
        }
      }
    }
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  async onApplicationShutdown(signal: string) {
    console.log(`App shutting down due to ${signal}`);
    await this.disconnect();
  }
}
