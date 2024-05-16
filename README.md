# Backend API

### Stack

This backend API is built using a robust stack to ensure efficiency, scalability, and ease of development. Here's a breakdown of the stack components:

- **Framework:** [Express](https://expressjs.com/) - A minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.
- **Database:**
  - **Primary:** [MongoDB](https://www.mongodb.com/) - A NoSQL database known for its high performance, high availability, and easy scalability.
  - **Sessions:** [Redis](https://redis.io/) - An in-memory data structure store used as a database, cache, and message broker, ideal for managing sessions.
- **ODM:** [Mongoose](https://mongoosejs.com/) - An elegant MongoDB object modeling for Node.js, providing a schema-based solution to model data.
- **Validation:** [Zod](https://zod.dev/) - A TypeScript-first schema declaration and validation library that ensures your data is always in the expected format.
- **Logging:** [Morgan](https://expressjs.com/en/resources/middleware/morgan.html) - HTTP request logger middleware for Node.js, useful for tracking requests and debugging.
- **Runtime:** [NodeJS](https://nodejs.org/en) - A JavaScript runtime built on Chrome's V8 JavaScript engine, enabling server-side scripting and development.

### Tooling

To facilitate development, the following tools are used:

- **Builder:** [ESBuild](https://esbuild.github.io/) - An extremely fast JavaScript and TypeScript bundler.
- **Formatting:** [Prettier](https://prettier.io/) - An opinionated code formatter that enforces a consistent style by parsing your code and re-printing it.
- **Type-Checking:** [TSC](https://www.typescriptlang.org/docs/handbook/compiler-options.html) - TypeScript Compiler, used to ensure type safety and catch errors early in the development process.
- **Package Manager:** [pnpm](https://pnpm.io/) - A fast, disk space-efficient package manager that saves every installed package in a global store.

## Installing Dependencies

To install the required dependencies for this project, use the following command:

```sh
pnpm install
```

This command will install all the necessary packages as specified in the package.json file.

## Starting the Server

To start the server, use the following command:

```sh
pnpm start # or pnpm start:prod for start the production server
```

## Building the Server

To build the server, you can use the following command:

```sh
pnpm build
```

For a minified output suitable for production environments, use:

```sh
pnpm build:prod
```
