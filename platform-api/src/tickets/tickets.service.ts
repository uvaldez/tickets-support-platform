import { HttpException, HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TicketStatus, TicketPriority } from './ticket.model'; // Adjust the import path as needed
import { EMAIL_SERVICE, EmailService } from '../email/email.service.interface';
import { PrismaService } from '../../prisma/prisma.service';
import { Ticket } from './ticket.model'; // Import the Ticket class if needed
import { Email, Prisma } from '@prisma/client';
import { CreateTicketDto } from './dto/ticket.dto';

const DEFAULT_USER_ID = parseInt(process.env.DEFAULT_USER_ID || '1', 10);
const DEFAULT_ASSIGNED_TO_ID = parseInt(process.env.DEFAULT_ASSIGNED_TO_ID || '1', 10);

@Injectable()
export class TicketsService {
    constructor(
        @Inject(EMAIL_SERVICE) private readonly emailService: EmailService,
        private readonly prisma: PrismaService, // Inject Prisma service
    ) {}

    async findTicketById(id: string) {
        const ticket = await this.prisma.ticket.findUnique({
            where: { id: parseInt(id, 10) },
            include: {
                messages: true,
                assignedTo: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        if (!ticket) {
            throw new NotFoundException(`Ticket with ID ${id} not found`);
        }
        return ticket;
    }

    async findMany(status?: TicketStatus) {
      const whereClause = status ? { status } : {};
        return await this.prisma.ticket.findMany({
            where: whereClause,
            include: {
              messages: true,
              assignedTo: {
              select: {
                  id: true,
                  name: true,
                  email: true,
              },
          }, },
        });
    }

    async getEmailByEmailId(emailId: string): Promise<Email | null> {
      return await this.prisma.email.findUnique({
        where: { emailId },
      });
    }

    async insertEmail(data: {
        name?: string;
        from?: string;
        to?: string;
        email: string;
        emailId: string;
        }): Promise<Email> {
          const existingEmail = await this.getEmailByEmailId(data.emailId);
          if (existingEmail) {
            throw new HttpException('Item already exists', HttpStatus.CONFLICT);
          }
        return await this.prisma.email.create({
            data: {
            name: data.name,
            to: data.to,
            email: data.email,
            emailId: data.emailId,
            },
        });
    }

   async processEmail(emailData: {
    subject: string;
    body: string;
    fromEmail: string;
    emailId: string;
    threadId: string;
  }){
    let ticket;
    // if threadId is not the same as emailId, it means it's a reply to an existing ticket
    if (emailData.threadId !== emailData.emailId) {
      ticket = await this.findTicketByThreadId(emailData.threadId);
    }

    if (!ticket) {
      // Create a new ticket since no thread is found
      ticket = await this.createTicket({
        subject: emailData.subject,
        description: emailData.body,
        createdById: DEFAULT_USER_ID,
        assignedToId: DEFAULT_ASSIGNED_TO_ID,
        threadId: emailData.threadId,
      });
    }
    // Add a new message to the existing ticket
    await this.addMessageToTicket(ticket.id, emailData.threadId, emailData.emailId, emailData.subject, emailData.body);
    return ticket;
  }
    
    private async findTicketByThreadId(threadId: string) {
      return this.prisma.ticket.findFirst({
          where: { threadId },
          include: { messages: true },
      });
  }

    async createTicket(data: CreateTicketDto) {
        const ticketData: Prisma.TicketCreateInput = {
            subject: data.subject || null,
            description: data.description || null,
            status: data.status || TicketStatus.OPEN,
            priority: data.priority || TicketPriority.MEDIUM,
            assignedTo: data.assignedToId ? { connect: { id: data.assignedToId } } : undefined,
            createdBy: {
                connect: { id: data.createdById },
            },
            createdAt: new Date(),
            updatedAt: new Date(),
            threadId: data.threadId,
        };
    
        return this.prisma.ticket.create({ data: ticketData });
    }

    async addMessageToTicket(ticketId: number, threadId: string, emailId: string, subject: string, body: string) {
        return await this.prisma.message.create({
          data: {
            subject,
            body,
            ticket: { connect: { id: ticketId } },
            email: { connect: { emailId }},
            threadId,
          },
        });
      }

    async updateTicket(id: string, data: Partial<Omit<Ticket, 'createdBy' | 'createdAt' | 'updatedAt'>>) {
        return await this.prisma.ticket.update({
            where: { id: parseInt(id, 10) },
            data: {
                ...data,
                updatedAt: new Date(),
            },
            include: { assignedTo: true },
        });
    }

    async fetchInbox(unread?: boolean) {
        return this.emailService.fetchInbox(unread);
    }

    async fetchThreads() {
        return this.emailService.fetchThreads();
    }

    async replyToEmail(messageId: string, body: string) {
        return this.emailService.replyToEmail(messageId, body);
    }
}
