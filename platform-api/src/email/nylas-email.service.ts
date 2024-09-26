import { Injectable } from '@nestjs/common';
import Nylas from 'nylas';
import { EmailService } from './email.service.interface';

const NylasConfig = {
  apiKey: process.env.NYLAS_API_KEY || 'nyk_v0_v58DdrBJCyF5PA7AcATEUhKzOB7vJHu9GFDRuRecoew2WJI5PueoqvggBAQ5fX4n',
  apiUri: process.env.NYLAS_API_URI || 'https://api.us.nylas.com',
};

const identifier = process.env.NYLAS_IDENTIFIER || '832ad248-d8f0-49a2-ab9c-fed27ab5baab';

interface MessageQuery {
  limit: number;
  in: string[];
  unread?: boolean;
}

@Injectable()
export class NylasEmailService implements EmailService {
  private readonly nylas;

  constructor() {
    this.nylas = new Nylas(NylasConfig);
  }

  async fetchInbox(unread?: boolean) {
    const query: MessageQuery = {
      limit: 5,
      in: ['INBOX', 'SENT', 'CATEGORY_PERSONAL'],
    }
    if (unread !== undefined) {
      query.unread = unread;
    }
    const { data } = await this.nylas.messages.list({
      identifier,
      queryParams: query,
    });
    return data;
  }

  async fetchThreads() {
    const { data } = await this.nylas.threads.list({
      identifier,
      queryParams: {
        limit: 5,
      },
    });
    return data;
  }

  async replyToEmail(messageId: string, body: string) {
    try {
      // Fetch the original message
      const originalMessage = await this.nylas.messages.find({
        identifier,
        messageId: messageId,
      })      

      const draft = {
        subject: `Re: ${originalMessage.data.subject}`,
        to: [{ name: originalMessage.data.from[0].name, email: originalMessage.data.from[0].email }],
        body,
        replyToMessageId: messageId,
      }      
      // Create a draft in response to the original message
      const replyDraft = await this.nylas.drafts.create({
        identifier,
        requestBody: draft,
      });

      // Send the reply
      const sentMessage = await this.nylas.drafts.send({ identifier, draftId: replyDraft.data.id })
      console.log('Reply sent successfully:', sentMessage);
    } catch (error) {
      console.error('Failed to send the reply:', error);
    }
  }
}
