import { Prisma } from '@prisma/client';

export enum TicketStatus {
  OPEN = 'OPEN',
  PENDING = 'PENDING',
  CLOSED = 'CLOSED',
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export class Ticket implements Prisma.TicketCreateInput {
  id?: number;
  subject?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  createdAt?: Date;
  updatedAt?: Date;
  assignedToId?: number;
  createdBy: Prisma.UserCreateNestedOneWithoutTicketsInput;
  threadId?: string;

  constructor(
    createdById: number,
    subject?: string,
    description?: string,
    status: TicketStatus = TicketStatus.OPEN,
    priority: TicketPriority = TicketPriority.MEDIUM,
    assignedToId?: number,
    threadId?: string
  ) {
    this.createdBy = {
      connect: { id: createdById },
    };
    this.subject = subject;
    this.description = description;
    this.status = status;
    this.priority = priority;
    this.assignedToId = assignedToId;
    this.threadId = threadId;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  updateStatus(newStatus: TicketStatus) {
    this.status = newStatus;
    this.updatedAt = new Date();
  }

  assignTo(userId: number) {
    this.assignedToId = userId;
    this.updatedAt = new Date();
  }
}
