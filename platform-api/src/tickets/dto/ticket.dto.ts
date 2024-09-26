import { ApiProperty } from '@nestjs/swagger';
import { TicketStatus, TicketPriority } from '../ticket.model';
import { IsString } from 'class-validator';

export class TicketDto {
@IsString()    
  @ApiProperty({
    description: 'The subject of the ticket',
    example: 'Issue with login'
  })
  subject: string;

  @ApiProperty({
    description: 'The description of the ticket',
    example: 'I am unable to log in to my account. It says "Invalid credentials" even though I\'m sure my password is correct.'
  })
  description: string;

  @ApiProperty({
    description: 'The current status of the ticket',
    example: 'open',
    enum: [TicketStatus.OPEN, TicketStatus.PENDING, TicketStatus.CLOSED]
  })
  status: TicketStatus;

  @ApiProperty({
    description: 'The priority level of the ticket',
    example: 'high',
    enum: [TicketPriority.LOW, TicketPriority.MEDIUM, TicketPriority.HIGH]
  })
  priority: TicketPriority;

  @ApiProperty({
    description: 'The user who created the ticket',
    example: 'john.doe@example.com'
  })
  createdBy: string;

  @ApiProperty({
    description: 'The content of the ticket',
    example: 'I am unable to log in to my account. It says "Invalid credentials" even though I\'m sure my password is correct.'
  })
  content: string;
}

export class CreateTicketDto {
    subject: string;
    description: string;
    createdById: number;
    status?: TicketStatus;
    priority?: TicketPriority;
    assignedToId?: number | null;
    threadId?: string;
}