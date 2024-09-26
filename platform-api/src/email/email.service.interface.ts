export const EMAIL_SERVICE = 'EMAIL_SERVICE';

export interface EmailService {
    fetchInbox(unread?: boolean): Promise<any>;
    fetchThreads(): Promise<any>;
    replyToEmail(messageId: string, body: string): Promise<any>;
  }
  