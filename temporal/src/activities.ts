import { log } from '@temporalio/activity';
import axios from 'axios';

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
export async function ingestEmail(): Promise<void> {
  log.info('Fetching emails');
  try {
    const response = await axios(`${baseUrl}/tickets/inbox?unread=true`, {
      headers: {
        'x-api-key': process.env.API_KEY || 'super-secret-api-key'
      }
    });
    console.log('data:', response.data);
    for (const email of response.data) {
      try {
        await axios.post(`${baseUrl}/tickets/email`, {
          email: email.from[0].email,
          subject: email.subject,
          body: email.body,
          name: email.from[0].name,
          to: email.to.email,
          threadId: email.threadId,
          emailId: email.id,
        }, {
          headers: {
            'x-api-key': process.env.API_KEY || 'super-secret-api-key'
          }
        });
      } catch (error) {
        log.error(`Failed to post email: ${error}`);
      }
    }
  } catch (error) {
    log.error(`Failed to fetch emails: ${error}`);
  }
}
