# Second Brain Backend

A robust, secure, and metadata-aware backend API that powers the Second Brain platform. It handles user authentication, data persistence, and automatic metadata extraction from various external web sources.

## ✨ Key Features
- **Multi-User Architecture**: Built from the ground up to support multiple isolated user accounts with strict ownership checks.
- **Trash Manager**: Soft-delete functionality for notes, allowing for a robust recycle bin / recovery workflow.
- **Secure Authentication**: JWT-based auth with bcrypt password hashing and comprehensive Zod validation.
- **Smart Ingestion Pipeline**: Automatically extracts titles, descriptions, and thumbnails from YouTube, Twitter, Notion, and general web links using Cheerio.
- **Knowledge Organization**: Tagging system with many-to-many relationships for flexible content categorization.
- **Public Sharing**: Generate secure, unique shareable links to expose specific knowledge collections publicly.
- **Relational Data**: Powered by PostgreSQL and Prisma for strict typing and relational database integrity.

## 🛠️ Tech Stack
- **Runtime**: Node.js & Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Validation**: Zod
- **Scraping**: Cheerio & Axios

## 📂 Core Database Models

- **User**: Stores authentication details (username, hashed password, optional password hint).
- **Note**: The core knowledge entity. Stores the original link, auto-extracted metadata (title, thumbnail, description), user-provided notes, and visibility settings.
- **Tag**: User-defined tags that can be attached to multiple notes (Many-to-Many relationship).
- **ShareLink**: Manages the unique cryptographic tokens used to expose public brain links.

## 🔗 API Overview

The API is structured around versioned REST endpoints (`/api/v1`):

- **Auth**: `POST /signup`, `POST /signin`
- **Content**: `GET /content`, `POST /content`, `PATCH /content/:id`, `DELETE /content/:id`
- **Sharing**: `POST /brain/share`, `GET /brain/:shareLink`

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   Copy the example environment file and add your PostgreSQL connection string and JWT secret:
   ```bash
   cp example.env .env
   ```

3. **Database Setup**
   Push the Prisma schema to your database and generate the TypeScript client:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

4. **Run the Server**
   ```bash
   npm run build
   npm start
   # or for development:
   npm run dev
   ```
   The API will be available at `http://localhost:3001` (or your configured port).
# Second Brain Backend

## Google OAuth

Google sign-in setup, environment variables, migration, and local testing are
documented in [OAUTH_SETUP.md](./OAUTH_SETUP.md).
