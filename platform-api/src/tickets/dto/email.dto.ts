import { ApiProperty } from '@nestjs/swagger';

export class EmailDto {
    @ApiProperty({
        description: 'The name of the sender',
        required: false,
        example: 'John Doe'
    })
    name?: string;

    @ApiProperty({
        description: 'The recipient email address',
        required: false,
        example: 'recipient@example.com'
    })
    to?: string;

    @ApiProperty({
        description: 'The sender email address',
        example: 'sender@example.com'
    })
    email: string;

    @ApiProperty({
        description: 'The unique identifier of the email',
        example: 'email123'
    })
    emailId: string;

    @ApiProperty({
        description: 'The subject of the email',
        example: 'Regarding your recent inquiry'
    })
    subject: string;

    @ApiProperty({
        description: 'The body content of the email',
        example: 'Thank you for contacting us. We have received your inquiry and will respond shortly.'
    })
    body: string;

    @ApiProperty({
        description: 'The unique identifier of the email thread',
        example: 'thread456'
    })
    threadId: string;
}
