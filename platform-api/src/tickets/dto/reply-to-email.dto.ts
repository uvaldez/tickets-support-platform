import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ReplyToEmailDto {

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The text content of the reply',
    example: 'Thank you for your inquiry. We will look into this matter.'
  })
  text: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The ID of the message being replied to',
    example: '123456'
  })
  messageId: string;
}