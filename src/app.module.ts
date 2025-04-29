import { Module } from '@nestjs/common';

import { ChatModule } from './consumer/chat/chat.module';
import { DatabaseModule } from './data-base/database.module';

@Module({
  imports: [DatabaseModule, ChatModule],
})
export class AppModule {}
