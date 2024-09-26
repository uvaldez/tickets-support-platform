import { Controller, Get, NotFoundException, Param, Query, Post, Body, Put, HttpException, HttpStatus } from '@nestjs/common';
import { ApiQuery, ApiTags, ApiResponse } from '@nestjs/swagger';
import { TicketStatus } from './ticket.model';
import { TicketsService } from './tickets.service';
import { EmailDto } from './dto/email.dto';
import { ApiHeader } from '@nestjs/swagger';
import { TicketDto } from './dto/ticket.dto';
import { ReplyToEmailDto } from './dto/reply-to-email.dto';

@ApiTags('tickets')
@ApiHeader({
    name: 'x-api-key',
    description: 'API key for authentication',
    required: true,
})
@Controller('tickets')
export class TicketsController {
    constructor(private ticketsService: TicketsService) {}

    @Get()
    @ApiQuery({ name: 'status', enum: TicketStatus, required: false })
    getTickets(@Query('status') status?: TicketStatus) {
        return this.ticketsService.findMany(status);
    }

    @Get('inbox')
    @ApiQuery({ name: 'unread', type: 'boolean', required: false })
    getInbox(@Query('unread') unread?: boolean) {
        return this.ticketsService.fetchInbox(unread);
    }

    @Get('threads')
    getThreads() {
        return this.ticketsService.fetchThreads();
    }

    @Get(':id')
    @ApiResponse({ status: 200, description: 'Returns the ticket with assigned user details' })
    @ApiResponse({ status: 404, description: 'Ticket not found' })
    async getTicket(@Param('id') id: string) {
        const ticket = await this.ticketsService.findTicketById(id);
        if (!ticket) {
            throw new NotFoundException('Ticket not found');
        }
        return ticket;
    }

    @Post('email')
    async processEmail(@Body() processEmailDto: EmailDto) {
        const existingEmail = await this.ticketsService.getEmailByEmailId(processEmailDto.emailId);
        if (existingEmail) {
            throw new HttpException('Item already exists', HttpStatus.CONFLICT);
        }
        
        await this.ticketsService.insertEmail(processEmailDto);
        return this.ticketsService.processEmail({
            subject: processEmailDto.subject,
            body: processEmailDto.body,
            emailId: processEmailDto.emailId,
            fromEmail: processEmailDto.email,
            threadId: processEmailDto.threadId
        })
    }

    @Put(':id')
    async updateTicket(@Body() data: TicketDto, @Param('id') id: string) {
        return this.ticketsService.updateTicket(id, data);
    }

    @Post('reply')
    async replyToEmail(@Body() replyToEmailDto: ReplyToEmailDto) {
        return this.ticketsService.replyToEmail(replyToEmailDto.messageId, replyToEmailDto.text);
    }
}
