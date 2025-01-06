# Co-Engine

## Description

A platform for driving connections with others.

Features:

- Real-time messaging and group chat
- Relationship management for friends and blocked users
- User authentication and authorization with JWTs and Discord Oauth2
- User settings with profile picture, bio, and display name

Technologies:

- Next.js
- Express
- Passport
- GraphQL with Apollo
- PostgreSQL with Sequelize
- MongoDB with Mongoose
- Playwright

## Prerequisites

- Node.js (>=20.9.0)
- Docker (>=20.10.0)
- Docker Compose (>=2.29.1)
- Git

## Installation

1. Clone the repository

   ```bash
   git clone https://github.com/co-engine/co-engine.git
   ```

2. Install dependencies

   ```bash
   cd co-engine && (cd server && npm install) && (cd client && npm install)
   ```

3. Set up environment variables

   ```bash
   # docker/.env

   # Key for JWT signing
   JWT_SECRET=example-secret

   # Discord Oauth2
   DISCORD_CLIENT_ID=example-client-id
   DISCORD_CLIENT_SECRET=example-client-secret

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=example-cloud-name
   CLOUDINARY_API_KEY=example-api-key
   CLOUDINARY_API_SECRET=example-api-secret
   ```

## Usage

1. Start the development servers

   ```bash
   docker compose -f docker/docker-compose.dev.yml up -d
   ```

2. Stop the development servers

   ```bash
   docker compose -f docker/docker-compose.dev.yml down -v
   ```

3. Start the production servers

   ```bash
   docker compose -f docker/docker-compose.local-prod.yml up -d
   ```

4. Stop the production servers

   ```bash
   docker compose -f docker/docker-compose.local-prod.yml down -v
   ```

5. Start the e2e tests

   ```bash
   docker compose -f docker/docker-compose.e2e.yml up -d
   ```

6. Stop the e2e tests

   ```bash
   docker compose -f docker/docker-compose.e2e.yml down -v
   ```

## Architecture

**Entity Relationship Diagram**

![ERD](https://i.imgur.com/Alk2AH0.png)

**Data Flow Diagram for Messages and Relationship Management**

```mermaid
graph TD
    B[Next.js Server]
    A[User]
    C[Express Server]
    D[MongoDB]
    E[PostgreSQL]
    G[Cloudinary]

    B -->|Streams Server-Side Rendering| A

    A -->|GET Requests Frontend| B
    A -->|GET and POST Requests for Relationships and User Data| C
    A <-->|Opens WebSocket Connection for Messages| C

    C -->|GET and POST Requests for Stored Messages| D
    C -->|GET and POST Requests for Relationships and User Data| E
    C -->|GET and POST, DELETE Requests for Stored Images| G
```

**Sequence Diagram for JWT Authentication**

```mermaid
sequenceDiagram
    participant User
    participant Next.js Frontend
    participant Express Backend
    participant PostgreSQL Database

    User->>Next.js Frontend: Enters credentials
    Next.js Frontend->>Express Backend: Sends LogIn mutation with credentials
    Express Backend->>PostgreSQL Database: Validates credentials
    PostgreSQL Database-->>Express Backend: Responds with user data
    Express Backend-->>Next.js Frontend: Responds with JWT
    Next.js Frontend-->>Next.js Frontend: Stores JWT in Local Storage
    User->>Next.js Frontend: Makes API request
    Next.js Frontend->>Next.js Frontend: Retrieves JWT
    Next.js Frontend->>Express Backend: Sends request with JWT in Authorization header
    Express Backend->>Express Backend: Validates JWT
    Express Backend-->>Next.js Frontend: Responds with protected data
    Next.js Frontend-->>User: Displays data
```

**Sequence Diagram for Discord Oauth2**

```mermaid
sequenceDiagram
    participant User
    participant Next.js Frontend
    participant Discord
    participant Express Backend
    participant PostgreSQL Database

    User->>Next.js Frontend: Clicks "Discord" for Login
    Next.js Frontend->>Discord: Redirects to Discord's OAuth2 authorization endpoint
    Discord->>User: Prompts user to log in and consent
    User-->>Discord: Logs in and grants consent
    Discord-->>Express Backend: Redirects with authorization code
    Express Backend->>Discord: Exchanges authorization code for access token
    Discord-->>Express Backend: Responds with access token and user info
    Express Backend->>PostgreSQL Database: Stores user info
    Express Backend-->>Next.js Frontend: Responds with JWT
    Next.js Frontend-->>Next.js Frontend: Store JWT in Local Storage
    Next.js Frontend-->>User: Logs user in
```

## Next Steps

- Add message reactions
- Add collaborations (groups)
- Add collaboration channels for text, whiteboarding, and video calls
- Add roles and permissions
