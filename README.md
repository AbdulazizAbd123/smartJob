# Smart Job Application Tracking

This MERN stack project was developed by:

- Abdulaziz Abdullah Alshehhi - University ID: 66S2142
- Yousef Albarami - University ID: 66J214

## Project Features

- Applicant and company registration.
- Login and logout for applicant, company, and seeded admin users.
- Admin user management for applicants and companies.
- Company job posting CRUD.
- Applicant job application tracking.
- Company interview date/time and application status updates.
- Browser location capture for company profiles.
- Local MongoDB setup through Docker Compose with seeded demo data.

## Demo Login

Seed data is created automatically when the server starts with an empty database.

- Admin: `admin@smartjobs.com`
- Password: `12345`

## Run With Docker

From this folder:

```bash
docker compose up --build
```

Then open:

- Client: `http://localhost:3000`
- Server: `http://localhost:3001`

## Run Without Docker

Start MongoDB locally, then copy the example environment files:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Install and run each app:

```bash
cd server
npm install
npm start
```

```bash
cd client
npm install
npm start
```

## Tests

The client uses Vitest with React Testing Library. Test files are inside
`client/Tests`, including extra examples in `About.test.jsx`.

From the client folder:

```bash
npm test -- --run
```
# smartJob
# smartJob
