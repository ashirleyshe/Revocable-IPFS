import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TriggerModule } from './trigger/trigger.module';

@Module({
  imports: [TriggerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
