# Second Brain Backend

A personal knowledge management (PKM) and content-ingestion platform that helps users build a digital "Second Brain" by saving, organizing, enriching, and sharing knowledge from across the web.

The application allows users to store links, documents, articles, videos, tweets, and personal notes while automatically extracting metadata such as titles, descriptions, thumbnails, and source information. The system acts as a centralized knowledge repository where information can be captured, organized with tags, and shared publicly through secure shareable links.

## Features

### Authentication

* User registration and login
* JWT-based authentication
* Password hashing using bcrypt
* Protected API routes

### Content Management

* Create, update, delete, and retrieve content
* Support for multiple content sources:

  * YouTube
  * Twitter / X
  * Notion
  * Google Docs
  * Websites
  * Internal Notes

### Automatic Metadata Extraction

* URL classification based on hostname
* Open Graph metadata extraction
* Automatic extraction of:

  * Title
  * Description
  * Thumbnail
  * Source Type
* Website scraping using Cheerio
* Network request handling using Axios

### Knowledge Organization

* Tag-based categorization
* Many-to-many relationship between notes and tags
* User-defined titles
* Automatically extracted source titles
* Rich metadata support using JSON fields

### Sharing System

* Public shareable links
* Enable / disable sharing
* Public note visibility controls
* Shared knowledge collections
* Public brain access via unique share links

### Content Visibility

* Private notes by default
* Public note support
* Share-link based access control

---

## Tech Stack

### Backend

* Node.js
* Express.js
* TypeScript

### Database

* PostgreSQL
* Prisma ORM

### Authentication

* JWT
* bcrypt

### Data Processing

* Axios
* Cheerio

### Validation

* Zod

---

## Database Design

### User

Stores authentication and ownership information.

### Note

Stores user knowledge entries including:

* Source type
* User title
* Extracted title
* Content
* Description
* Thumbnail
* Metadata
* Visibility status

### Tag

Used for categorizing notes.

### ShareLink

Allows users to expose their public knowledge base through a unique shareable URL.

---

## Metadata Ingestion Pipeline

When a user submits a URL:

```text
URL
 ↓
Source Classification
 ↓
Metadata Extraction
 ↓
Normalization
 ↓
Database Storage
```

Example:

```text
https://youtube.com/watch?v=abc
        ↓
YOUTUBE
        ↓
Extract title, thumbnail, description
        ↓
Store in database
```

This reduces manual effort and ensures consistent metadata across content sources.

---

## API Overview

### Authentication

```http
POST /signup
POST /signin
```

### Content

```http
POST   /content
GET    /content
GET    /content/:id
PATCH  /content/:id
DELETE /content/:id
```

### Sharing

```http
POST /brain/share
GET  /brain/:shareLink
```

---

## Example Use Cases

### Save a YouTube Video

User submits:

```json
{
  "link": "https://youtube.com/watch?v=abc",
  "title": "Watch Later",
  "tags": ["system-design", "backend"]
}
```

System automatically extracts:

```json
{
  "sourceType": "YOUTUBE",
  "extractedTitle": "System Design Interview",
  "thumbnail": "...",
  "description": "..."
}
```

---

### Share Knowledge Publicly

User enables sharing:

```json
{
  "share": true
}
```

System generates:

```text
/brain/3f2d8b7c-xxxx-xxxx-xxxx
```

Other users can access public notes through the generated link.

---

## Key Engineering Decisions

### Metadata Normalization

External content sources expose metadata in different formats. The system normalizes them into a consistent structure before persistence.

### User-Controlled Titles

The platform stores both:

* User title
* Extracted source title

This allows users to organize knowledge without losing original source information.

### Ownership-Based Access Control

All content operations are scoped to the authenticated owner.

### Share-Link Security

Knowledge sharing is controlled through unique share tokens and visibility settings.

---

## Future Improvements

* AI-generated summaries
* Semantic search
* Vector embeddings
* Full-text search
* Browser extension
* Content recommendations
* Background metadata extraction jobs
* Redis caching
* Docker deployment
* CI/CD pipeline
* Rate limiting
* Analytics dashboard

---

## Project Goal

The goal of this project is to build a personal knowledge management system inspired by the "Second Brain" concept, enabling users to capture, organize, enrich, and share information from across the internet while reducing information loss and improving knowledge retrieval.
