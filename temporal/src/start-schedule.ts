import { Connection, Client, ScheduleOverlapPolicy } from '@temporalio/client';
import { emailCollection } from './workflows';

async function run() {
  const client = new Client({
    connection: await Connection.connect(),
  });

  // https://typescript.temporal.io/api/classes/client.ScheduleClient#create
  const schedule = await client.schedule.create({
    action: {
      type: 'startWorkflow',
      workflowType: emailCollection,
      args: [],
      taskQueue: 'schedules',
    },
    scheduleId: 'sample-schedule',
    policies: {
      catchupWindow: '1 day',
      overlap: ScheduleOverlapPolicy.ALLOW_ALL,
    },
    spec: {
      intervals: [{ every: '20s' }],
      // or periodic calendar times:
      // calendars: [
      //   {
      //     comment: 'every wednesday at 8:30pm',
      //     dayOfWeek: 'WEDNESDAY',
      //     hour: 20,
      //     minute: 30,
      //   },
      // ],
      // or a single datetime:
      // calendars: [
      //   {
      //     comment: '1/1/23 at 9am',
      //     year: 2023,
      //     month: 1,
      //     dayOfMonth: 1,
      //     hour: 9,
      //   },
      // ],
    },
  });

  console.log(`Started schedule '${schedule.scheduleId}'.

The reminder Workflow will run and log from the Worker every 10 seconds.

You can now run:

  npm run schedule.go-faster
  npm run schedule.pause
  npm run schedule.unpause
  npm run schedule.delete
  `);

  await client.connection.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
