import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { ChatConsumer } from "./chat.consumer";
import { MessageSchema } from "./models/message.model";

import { RedisService } from "../../services/redis/redis.service";
import { KafkaService } from "../../services/kafka/kafka.service";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: "Message", schema: MessageSchema }]),
  ],
  providers: [
    {
      provide: KafkaService,
      useFactory: () => {
        const clientId = "chat-client";
        const groupId = "chat-group";
        const maxWaitTimeInMs = 100;
        const minBytes = 500000;
        return new KafkaService(clientId, groupId, maxWaitTimeInMs, minBytes);
      },
    },
    ChatConsumer,
    RedisService,
  ],
})
export class ChatModule {}
