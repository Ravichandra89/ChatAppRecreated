# Turborepo starter

This Turborepo starter is maintained by the Turborepo core team.

## Using this example

Run the following command:

```sh
npx create-turbo@latest
```

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `docs`: a [Next.js](https://nextjs.org/) app
- `web`: another [Next.js](https://nextjs.org/) app
- `@repo/ui`: a stub React component library shared by both `web` and `docs` applications
- `@repo/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `@repo/typescript-config`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Build

To build all apps and packages, run the following command:

```
cd my-turborepo
pnpm build
```

### Develop

To develop all apps and packages, run the following command:

```
cd my-turborepo
pnpm dev
```

# Real-Time Chat Application

## Introduction
This is a scalable and secure real-time chat application built using Node.js, WebSockets, and Redis. It supports one-on-one messaging, group chats, online presence indicators, offline message storage, and push notifications. Designed for performance and reliability, the application ensures seamless communication with geo-location-based server allocation, end-to-end encryption, and fault-tolerant architecture.

---

## Requirements
<img width="1140" alt="Screenshot 2024-12-12 at 8 46 33 PM" src="https://github.com/user-attachments/assets/d1e0701f-66e3-4567-abe8-23dcdaf8aa7e" />

## System Design 
![image](https://github.com/user-attachments/assets/5b8160b0-9a13-4144-8fca-663da40e89eb)

## Detailed Data Model Design
<img width="1707" alt="Screenshot 2024-12-21 at 9 34 30 PM" src="https://github.com/user-attachments/assets/4acd391b-088e-4b23-8f86-bd8bc6f55583" />

Erase Link : https://app.eraser.io/workspace/uHFHHHQwyXJ2JjkNkTwU

## Services Breakdown
<img width="1276" alt="Screenshot 2025-01-02 at 11 28 36 PM" src="https://github.com/user-attachments/assets/c2dfb45e-68e3-42ce-8fa5-4c513bab86ae" />


## Tech Stack

### **Backend**
- **Node.js**: Server runtime for handling chat logic and APIs.
- **TypeScript**: Server Side Language for application.
- **WebSockets**: Real-time bi-directional communication.
- **Redis**: Pub/Sub system for managing online users and routing messages.
- **PostgreSQL**: Database for storing user data, messages, and group details.
- **Firebase Cloud Messaging (FCM)**: Push notifications for offline users.
- **JWT**: Authentication and authorization.
- **WebRTC**: For Vedio calling feature.

### **DevOps**
- **Docker**: Containerization of backend services.
- **Kubernetes**: Orchestrating containerized services for scalability.
- **NGINX**: Load balancer for WebSocket servers.

### **Security**
- **End-to-End Encryption (AES)**: Protects message content.
- **HTTPS**: Ensures secure API communications.

---

## Application Flow
1. **User Connection**: Users connect to WebSocket Servers via a Load Balancer, ensuring geo-distributed and optimal performance.
2. **Message Routing**: WebSocket Servers query Redis to locate recipient connections and route messages in real time.
3. **Offline Messages**:Undelivered messages are stored in the Database Server (MySQL) and delivered once users reconnect.
4. **Push Notifications**: Offline users are notified of pending messages via Firebase Cloud Messaging (FCM).
5. **Scalability**: Kubernetes enables horizontal scaling to handle increased traffic and load efficiently.
6. **Security**: All communications are encrypted with secure protocols, ensuring user data protection.

---

## Summary
This chat application is built to handle real-time communication needs with a focus on scalability, security, and performance. It is ideal for modern applications requiring seamless and reliable chat systems.

