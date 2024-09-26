import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { NylasEmailService } from '../email/nylas-email.service';
import { EMAIL_SERVICE } from '../email/email.service.interface';
import { PrismaService } from 'prisma/prisma.service';
import { ApiKeyMiddleware } from '../common/middleware/api-key-middleware';

@Module({
  controllers: [TicketsController],
  providers: [
    TicketsService,
    PrismaService,
    {
      provide: EMAIL_SERVICE,
      useClass: NylasEmailService,
    }
  ],
  exports: [TicketsService],
})
export class TicketsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ApiKeyMiddleware).forRoutes('tickets');
  }
}
