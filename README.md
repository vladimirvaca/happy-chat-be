# Happy Chat

This is a project that uses the NestJS framework and WebSockets to create a chat application. 
It allows users **create accounts, login, create chat rooms, and send messages** to each other in real-time.

For this I use the following technologies:
- **NestJS**
- **Bcrypt**
- **Socket.IO** for real-time communication
- **PostgreSQL** as the database
- **TestContainers** for tests purposes
- **Docker Compose** for running services

## Project setup

```bash
npm install
```

## Run the project

```bash
npm run start:dev
```

## Test
Unit testing:

```bash
npm run test
```
e2e testing:
```bash
npm run test:e2e
```

## Husky

Of course. I've updated the **Husky** section in your documentation to include direct links to the `pre-commit` and `pre-push` hook scripts, making it easy to navigate and review them.

Here is the updated section:

## Husky

Husky is used to run git-hooks. In the [pre-commit](.husky/pre-commit) hook I validate the format and lints.
In the [pre-push](.husky/pre-push) hook I validate unit and e2e testing.


## Swagger

There exist some routes configured and exposed to create an account, login (generate a JWT token).
They can be accessed and tested in swagger.

Once the project is running you can access in: [http://localhost:3000/api-docs](http://localhost:3000/api-docs/)

> **Developed with ❤️ by vladimirvaca 👽**