import { proxyActivities } from '@temporalio/workflow';
import type * as activities from './activities';

const { ingestEmail } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
});

export async function emailCollection(): Promise<void> {
  await ingestEmail();
}
