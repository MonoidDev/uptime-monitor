# Uptime Monitor
![Heroku](https://heroku-badge.herokuapp.com/?app=uptime-monitor-staging)

Uptime Monitor provides a website monitoring service, to let users know when their endpoints go down. It is featured by configurable website setting and visualized real-time dashboard. 

This project uses:
- [Next.js](https://nextjs.org/) as SSR React framework
- [Ant Design](https://ant.design/) as React UI library
- [tailwindcss](https://tailwindcss.com/) as CSS framework
- [GraphQL](https://graphql.org) as query language
- [Apollo](https://www.apollographql.com/) for the communication between the client and backend services
- [Nexus](https://nexusjs.org/) to write the GraphQL schemas in Typescript
- [Prisma](https://www.prisma.io/) as Typescript ORM

## Useful Links
- [Heroku APP](https://dashboard.heroku.com/apps/uptime-monitor-staging)
- [PaperTail](https://addons-sso.heroku.com/apps/e25b96a2-df9f-4f00-b4d9-cb787af104d5/addons/41ea9244-3968-4c56-9fd3-e33d959daf80/) as Staging Env Log Management

## Requirements

- `node >= 14.0.0`
- `typescript >= 4.3` 
- `yarn`

## Installation
To install the dependencies, please run
```bash
yarn 
# or
yarn install
```

## Usage
- create a `.env.development` file and a `.env.production` file, and set your own environment variables for development and production respectively.
- Generate Prisma client

	```bash
	yarn db-types
	```
- Synchronize the Prisma schema and your database schema

	```bash
	yarn dev:db-push
	```
- Seed the database

	```bash
	yarn dev:seed
	```
	Alternatively, you can also create the data from scratch.
- Start the development server

	```
	yarn dev
	```
Finally, open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Also, you can visit [http://localhost:3000/api/graphql](http://localhost:3000/api/graphql) to explore the API document.

Notice that you need to re-run the `yarn db-types` and `yarn dev:db-push` command after every change that's made to your Prisma schema to update the generated Prisma Client code.
