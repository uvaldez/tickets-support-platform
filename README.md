# Ticket Support Platform

## Context
This is a ticket support platform similar to Zendesk. Users will send emails to a support email address. Each incoming email will be linked to an existing ticket if it belongs to a thread, or it will create a new ticket if it doesn't belong to any existing thread. Admin users are able to reply to tickets, update the status of a ticket, assign it to a user, and change the priority of the ticket, it uses Nylas for email collection, Temporal for email ingestion, backend api it built with nestjs and frontend with react.

## Getting Started
1. Clone the repository
2. You will to run `yarn install` in temporal, platform-api and webapp folder.
3. From root folder run `docker compose up -d`
4. Run temporal worker: cd to temporal and run `npm start`
5. Run the temporal workflow: cd to temporal and run `npm run schedule.start`

## Testing the Application
1. Open your browser and navigate to http://localhost:5173/
2. You will see the tickets pages and current support tickets.
3. Send a support to ticket via email to `uzieltesting@gmail.com`.
4. Wait for temporal workflow to process the email.
5. Refresh the tickets page and you should see the new ticket.
6. Click on View Details and you can reply, update status, priority and assignee.

## API Documentation
You can take a look at the api documentation in the swagger ui: http://localhost:3000/api

## Folder Structure
- temporal: Temporal workflow and activities implementation.
- platform-api: Platform API implementation.
- webapp: Webapp implementation.

# Tradeoffs
1. Add cache layer: We can add a cache layer to the platform api to improve the performance of the api.
2. Add real time updates: We can add a real time updates layer to the platform api to update the frontend with the new tickets and users.
3. Add user roles: We can add a user roles layer to the platform api to allow the admin user to have more privileges.
4. Improve api security: I only added a simple api key check for now, but we can add a more complex security layer to the api (rate limiting, authentication, authorization, etc.).
5. Add some abstraction to the ORM: there is currently no abstraction for the ORM in tickets service, the ticket service should not be aware of prisma, it should implement any ORM and it should be easy to change.