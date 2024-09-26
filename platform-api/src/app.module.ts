import { Module } from '@nestjs/common';
// import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TicketsModule } from './tickets/tickets.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [TicketsModule, UsersModule],
  //controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
