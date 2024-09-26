import { Test, TestingModule } from '@nestjs/testing';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { TicketPriority, TicketStatus } from './ticket.model';
import { NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { TicketDto } from './dto/ticket.dto';

describe('TicketsController', () => {
  let controller: TicketsController;
  let service: TicketsService;

  const mockTicketsService = {
    findMany: jest.fn(),
    fetchInbox: jest.fn(),
    fetchThreads: jest.fn(),
    findTicketById: jest.fn(),
    getEmailByEmailId: jest.fn(),
    insertEmail: jest.fn(),
    processEmail: jest.fn(),
    updateTicket: jest.fn(),
    replyToEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketsController],
      providers: [
        {
          provide: TicketsService,
          useValue: mockTicketsService,
        },
      ],
    }).compile();

    controller = module.get<TicketsController>(TicketsController);
    service = module.get<TicketsService>(TicketsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getTickets', () => {
    it('should return an array of tickets', async () => {
      const result = [{
        id: 1,
        status: TicketStatus.OPEN,
        messages: [],
        assignedTo: { name: '', id: 0, email: '' },
        subject: 'Test Subject',
        description: 'Test Description',
        priority: TicketPriority.MEDIUM,
        createdAt: new Date(),
        updatedAt: new Date(),
        assignedToId: 0,
        createdById: 1,
        threadId: 'thread-123'
      }];
      jest.spyOn(service, 'findMany').mockResolvedValue(result);

      expect(await controller.getTickets(TicketStatus.OPEN)).toBe(result);
      expect(service.findMany).toHaveBeenCalledWith(TicketStatus.OPEN);
    });

    it('should return filtered tickets when status is provided', async () => {
      const result = [{
        id: 1,
        status: TicketStatus.OPEN,
        messages: [],
        assignedTo: { name: '', id: 0, email: '' },
        subject: 'Test Subject',
        description: 'Test Description',
        priority: TicketPriority.MEDIUM,
        createdAt: new Date(),
        updatedAt: new Date(),
        assignedToId: 0,
        createdById: 1,
        threadId: 'thread-123'
      }];
      jest.spyOn(service, 'findMany').mockResolvedValue(result);

      expect(await controller.getTickets(TicketStatus.OPEN)).toBe(result);
      expect(service.findMany).toHaveBeenCalledWith(TicketStatus.OPEN);
    });
  });

  describe('getInbox', () => {
    it('should return inbox messages', async () => {
      const result = [{ id: 1, subject: 'Test' }];
      jest.spyOn(service, 'fetchInbox').mockResolvedValue(result);

      expect(await controller.getInbox()).toBe(result);
      expect(service.fetchInbox).toHaveBeenCalled();
    });

    it('should return unread inbox messages when unread is true', async () => {
      const result = [{ id: 1, subject: 'Unread Test' }];
      jest.spyOn(service, 'fetchInbox').mockResolvedValue(result);

      expect(await controller.getInbox(true)).toBe(result);
      expect(service.fetchInbox).toHaveBeenCalledWith(true);
    });
  });

  describe('getThreads', () => {
    it('should return threads', async () => {
      const result = [{ id: 1, subject: 'Thread Test' }];
      jest.spyOn(service, 'fetchThreads').mockResolvedValue(result);

      expect(await controller.getThreads()).toBe(result);
      expect(service.fetchThreads).toHaveBeenCalled();
    });
  });

  describe('getTicket', () => {
    it('should return a ticket when it exists', async () => {
      const result = {
        id: 1,
        status: TicketStatus.OPEN,
        messages: [],
        assignedTo: { name: '', id: 0, email: '' },
        subject: 'Test Subject',
        description: 'Test Description',
        priority: TicketPriority.MEDIUM,
        createdAt: new Date(),
        updatedAt: new Date(),
        assignedToId: 0,
        createdById: 1,
        threadId: 'thread-123'
      };
      jest.spyOn(service, 'findTicketById').mockResolvedValue(result);

      expect(await controller.getTicket('1')).toBe(result);
      expect(service.findTicketById).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when ticket does not exist', async () => {
      jest.spyOn(service, 'findTicketById').mockResolvedValue(null);

      await expect(controller.getTicket('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('processEmail', () => {
    it('should process an email when it does not exist', async () => {
      const emailDto = { emailId: '123', subject: 'Test', body: 'Test body', email: 'test@example.com', threadId: '456' };
      jest.spyOn(service, 'getEmailByEmailId').mockResolvedValue(null);
      jest.spyOn(service, 'insertEmail').mockResolvedValue({} as any);
      jest.spyOn(service, 'processEmail').mockResolvedValue({} as any);

      await controller.processEmail(emailDto);

      expect(service.getEmailByEmailId).toHaveBeenCalledWith(emailDto.emailId);
      expect(service.insertEmail).toHaveBeenCalled();
      expect(service.processEmail).toHaveBeenCalled();
    });

    it('should throw HttpException when email already exists', async () => {
      const emailDto = { emailId: '123', subject: 'Test', body: 'Test body', email: 'test@example.com', threadId: '456' };
      jest.spyOn(service, 'getEmailByEmailId').mockResolvedValue({} as any);

      await expect(controller.processEmail(emailDto)).rejects.toThrow(HttpException);
      expect(service.getEmailByEmailId).toHaveBeenCalledWith(emailDto.emailId);
    });
  });

  describe('updateTicket', () => {
    it('should update a ticket', async () => {
      const ticketDto: TicketDto = {
        subject: 'Updated Subject',
        description: 'Updated Description',
        status: TicketStatus.CLOSED,
        priority: TicketPriority.HIGH,
        createdBy: '',
        content: 'Updated content'
      };
      const result = {
        id: 1,
        subject: 'Updated Subject',
        description: 'Updated Description',
        status: TicketStatus.CLOSED,
        priority: TicketPriority.HIGH,
        createdBy: { id: 1, name: 'Test User', email: 'test@example.com' },
        content: 'Updated content',
        assignedTo: { id: 2, name: 'Assigned User', email: 'assigned@example.com' },
        createdAt: new Date(),
        updatedAt: new Date(),
        assignedToId: 2,
        createdById: 1,
        threadId: 'thread-123'
      };
      jest.spyOn(service, 'updateTicket').mockResolvedValue(result);

      expect(await controller.updateTicket(ticketDto, '1')).toBe(result);
      expect(service.updateTicket).toHaveBeenCalledWith('1', ticketDto);
    });
  });

  describe('replyToEmail', () => {
    it('should reply to an email', async () => {
      const replyDto = { messageId: '123', text: 'Reply text' };
      const result = { success: true };
      jest.spyOn(service, 'replyToEmail').mockResolvedValue(result);

      expect(await controller.replyToEmail(replyDto)).toBe(result);
      expect(service.replyToEmail).toHaveBeenCalledWith(replyDto.messageId, replyDto.text);
    });
  });
});
