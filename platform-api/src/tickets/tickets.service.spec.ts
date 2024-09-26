import { Test, TestingModule } from '@nestjs/testing';
import { TicketsService } from './tickets.service';
import { PrismaService } from '../../prisma/prisma.service';
import { EMAIL_SERVICE } from '../email/email.service.interface';
import { TicketStatus, TicketPriority } from './ticket.model';

describe('TicketsService', () => {
  let service: TicketsService;
  let mockEmailService;
  let mockPrismaService;

  beforeEach(async () => {
    mockEmailService = {
      fetchInbox: jest.fn(),
      fetchThreads: jest.fn(),
      replyToEmail: jest.fn(),
    };

    mockPrismaService = {
      ticket: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      email: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      message: {
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        {
          provide: EMAIL_SERVICE,
          useValue: mockEmailService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findTicketById', () => {
    it('should return a ticket by id', async () => {
      const mockTicket = { id: 1, subject: 'Test Ticket' };
      mockPrismaService.ticket.findUnique.mockResolvedValue(mockTicket);

      const result = await service.findTicketById('1');

      expect(result).toEqual(mockTicket);
      expect(mockPrismaService.ticket.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
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
    });
  });

  describe('findMany', () => {
    it('should return all tickets when no status is provided', async () => {
      const mockTickets = [{ id: 1, subject: 'Ticket 1' }, { id: 2, subject: 'Ticket 2' }];
      mockPrismaService.ticket.findMany.mockResolvedValue(mockTickets);

      const result = await service.findMany();

      expect(result).toEqual(mockTickets);
      expect(mockPrismaService.ticket.findMany).toHaveBeenCalledWith({
        where: undefined,
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
    });

    it('should return filtered tickets when status is provided', async () => {
      const mockTickets = [{ id: 1, subject: 'Open Ticket', status: TicketStatus.OPEN }];
      mockPrismaService.ticket.findMany.mockResolvedValue(mockTickets);

      const result = await service.findMany(TicketStatus.OPEN);

      expect(result).toEqual(mockTickets);
      expect(mockPrismaService.ticket.findMany).toHaveBeenCalledWith({
        where: { status: TicketStatus.OPEN },
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
    });
  });

  describe('getEmailByEmailId', () => {
    it('should return an email by emailId', async () => {
      const mockEmail = { id: 1, emailId: 'test@example.com' };
      mockPrismaService.email.findUnique.mockResolvedValue(mockEmail);

      const result = await service.getEmailByEmailId('test@example.com');

      expect(result).toEqual(mockEmail);
      expect(mockPrismaService.email.findUnique).toHaveBeenCalledWith({
        where: { emailId: 'test@example.com' },
      });
    });
  });

  describe('insertEmail', () => {
    it('should insert a new email', async () => {
      const mockEmail = { id: 1, emailId: 'test@example.com', email: 'test@example.com' };
      mockPrismaService.email.findUnique.mockResolvedValue(null);
      mockPrismaService.email.create.mockResolvedValue(mockEmail);

      const result = await service.insertEmail({ email: 'test@example.com', emailId: 'test@example.com' });

      expect(result).toEqual(mockEmail);
      expect(mockPrismaService.email.create).toHaveBeenCalledWith({
        data: { email: 'test@example.com', emailId: 'test@example.com' },
      });
    });

    it('should throw an error if email already exists', async () => {
      mockPrismaService.email.findUnique.mockResolvedValue({ id: 1, emailId: 'test@example.com' });

      await expect(service.insertEmail({ email: 'test@example.com', emailId: 'test@example.com' }))
        .rejects.toThrow('Email already exists');
    });
  });

  describe('processEmail', () => {
    it('should create a new ticket if thread does not exist', async () => {
      const mockTicket = { id: 1, subject: 'New Ticket' };
      mockPrismaService.ticket.findFirst.mockResolvedValue(null);
      mockPrismaService.ticket.create.mockResolvedValue(mockTicket);

      const result = await service.processEmail({
        subject: 'New Ticket',
        body: 'Test body',
        fromEmail: 'test@example.com',
        emailId: 'email123',
        threadId: 'thread123',
      });

      expect(result).toEqual(mockTicket);
      expect(mockPrismaService.ticket.create).toHaveBeenCalled();
    });

    it('should add a message to existing ticket if thread exists', async () => {
      const mockTicket = { id: 1, subject: 'Existing Ticket' };
      mockPrismaService.ticket.findFirst.mockResolvedValue(mockTicket);
      mockPrismaService.message.create.mockResolvedValue({ id: 1, ticketId: 1 });

      const result = await service.processEmail({
        subject: 'Reply',
        body: 'Test reply',
        fromEmail: 'test@example.com',
        emailId: 'email123',
        threadId: 'thread123',
      });

      expect(result).toEqual(mockTicket);
      expect(mockPrismaService.message.create).toHaveBeenCalled();
    });
  });

  describe('fetchInbox', () => {
    it('should fetch inbox', async () => {
      const mockInbox = [{ id: 1, subject: 'Inbox Item' }];
      mockEmailService.fetchInbox.mockResolvedValue(mockInbox);

      const result = await service.fetchInbox();

      expect(result).toEqual(mockInbox);
      expect(mockEmailService.fetchInbox).toHaveBeenCalled();
    });
  });

  describe('fetchThreads', () => {
    it('should fetch threads', async () => {
      const mockThreads = [{ id: 1, subject: 'Thread 1' }];
      mockEmailService.fetchThreads.mockResolvedValue(mockThreads);

      const result = await service.fetchThreads();

      expect(result).toEqual(mockThreads);
      expect(mockEmailService.fetchThreads).toHaveBeenCalled();
    });
  });

  describe('replyToEmail', () => {
    it('should reply to an email', async () => {
      const mockReply = { success: true };
      mockEmailService.replyToEmail.mockResolvedValue(mockReply);

      const result = await service.replyToEmail('message123', 'Reply body');

      expect(result).toEqual(mockReply);
      expect(mockEmailService.replyToEmail).toHaveBeenCalledWith('message123', 'Reply body');
    });
  });
});
