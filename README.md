# Happy Chat

This is a project that uses the NestJS framework and WebSockets to create a chat application. 
It allows users **create accounts, login, create chat rooms, and send messages** to each other in real-time.

For this we use the following technologies:
- **NestJS**
- **Socket.IO** for real-time communication
- **PostgreSQL** as the database

## Project setup

```bash
 npm install
```

## Run the project

```bash
 npm run start:dev
```

## Swagger

There exist some routes configured and exposed to create an account, login (generate a JWT token).
They can be accessed and tested in swagger.

Once the project is running you can access in: [http://localhost:3000/api-docs](http://localhost:3000/api-docs/)

> **Developed with ❤️ by vladimirvaca 👽**