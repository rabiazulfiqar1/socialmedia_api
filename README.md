# Social Media API

A robust and feature-rich social media API built with FastAPI, providing user authentication, post management, commenting, likes, and image upload capabilities.

## Overview

This project is a complete social media backend API that allows users to register, authenticate, create posts with optional AI-generated images, comment on posts, like posts, and upload files. The API is built with modern Python async patterns and includes comprehensive testing.

## Features

- **User Authentication & Authorization**
  - User registration with email confirmation
  - JWT-based authentication (OAuth2 with Password flow)
  - Secure password hashing with bcrypt
  - Email confirmation tokens

- **Post Management**
  - Create, read, update, and delete posts
  - AI-generated images for posts using DeepAI's Cute Creature API
  - Posts with optional image uploads
  - Sort posts by newest, oldest, or most liked

- **Social Interactions**
  - Comment on posts
  - Like posts
  - View posts with their comments and likes count

- **File Upload**
  - Asynchronous file upload handling
  - Integration with Backblaze B2 cloud storage
  - Chunked file upload (1MB chunks) for efficient processing

- **Background Tasks**
  - AI image generation as background tasks
  - Email notifications for user registration

- **Logging & Monitoring**
  - Structured logging with correlation IDs
  - Request tracking across the application
  - HTTP exception logging

## Technology Stack

- **Framework**: FastAPI
- **Database**: SQLite (with SQLAlchemy ORM)
- **Authentication**: JWT (python-jose), OAuth2, bcrypt
- **Async Database**: databases library with aiosqlite
- **File Handling**: aiofiles, Backblaze B2 SDK
- **Email**: Mailgun API
- **AI Integration**: DeepAI API
- **Logging**: python-json-logger, rich, asgi-correlation-id
- **Testing**: pytest (with pytest-asyncio)
- **HTTP Client**: httpx
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS

## Portfolio Frontend

The project includes a modern portfolio website built with **Next.js**, **React**, and **Tailwind CSS**. It features:

- Dark theme with glassmorphism design
- Smooth animations and gradient effects
- Sections: Hero, About, Skills, Projects, Experience, Education, Contact
- Fully responsive layout

### Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

The portfolio will be available at: `http://localhost:3000`

## Installation

### Prerequisites

- Python 3.10 or higher
- pip (Python package manager)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/rabiazulfiqar1/socialmedia_api.git
   cd socialmedia_api
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Install development dependencies (optional)**
   ```bash
   pip install -r requirements-dev.txt
   ```

## Configuration

1. **Create environment file**
   
   Copy the sample environment file:
   ```bash
   cp .env.sample .env
   ```

2. **Configure environment variables**
   
   Edit the `.env` file and set the following variables:

   ```env
   ENV_STATE=dev  # or 'prod' or 'test'
   
   # Development environment variables (prefix with DEV_)
   DEV_DATABASE_URL=sqlite:///./socialmedia.db
   DEV_MAILGUN_DOMAIN=your-mailgun-domain
   DEV_MAILGUN_API_KEY=your-mailgun-api-key
   DEV_B2_KEY_ID=your-b2-key-id
   DEV_B2_APPLICATION_KEY=your-b2-application-key
   DEV_B2_BUCKET_NAME=your-b2-bucket-name
   DEV_DEEPAI_API_KEY=your-deepai-api-key
   ```

   **Note**: Different environment prefixes:
   - Development: `DEV_`
   - Production: `PROD_`
   - Testing: `TEST_`

## Running the Application

Start the development server:

```bash
uvicorn socialmediaapi.main:app --reload
```

The API will be available at: `http://localhost:8000`

Interactive API documentation (Swagger UI): `http://localhost:8000/docs`

Alternative API documentation (ReDoc): `http://localhost:8000/redoc`

## API Endpoints

### Authentication

- `POST /register` - Register a new user
- `POST /token` - Login and get access token
- `GET /confirm/{token}` - Confirm user email

### Posts

- `GET /` - Root endpoint (Hello World)
- `GET /post` - Get all posts (with optional sorting and pagination)
- `POST /post` - Create a new post (requires authentication)
- `GET /post/{post_id}` - Get a specific post with comments
- `DELETE /post/{post_id}` - Delete a post (requires authentication)

### Comments

- `POST /comment` - Add a comment to a post (requires authentication)
- `GET /post/{post_id}/comment` - Get all comments for a post

### Likes

- `POST /like` - Like a post (requires authentication)

### File Upload

- `POST /upload` - Upload a file to B2 cloud storage (requires authentication)

## Testing

Run the test suite:

```bash
pytest
```

Run tests with coverage:

```bash
pytest --cov=socialmediaapi
```

Run specific test files:

```bash
pytest socialmediaapi/tests/test_security.py
pytest socialmediaapi/tests/routers/test_post.py
```

## Project Structure

```
socialmedia_api/
├── frontend/                    # Portfolio website (Next.js)
│   ├── src/app/
│   │   ├── layout.tsx           # Root layout with metadata
│   │   ├── page.tsx             # Portfolio single-page application
│   │   └── globals.css          # Tailwind CSS theme and custom styles
│   ├── package.json
│   └── ...
├── socialmediaapi/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry point
│   ├── config.py            # Configuration management
│   ├── database.py          # Database setup and table definitions
│   ├── security.py          # Authentication and authorization
│   ├── tasks.py             # Background tasks (email, AI image generation)
│   ├── logging_conf.py      # Logging configuration
│   ├── models/
│   │   ├── post.py          # Post-related Pydantic models
│   │   └── user.py          # User-related Pydantic models
│   ├── routers/
│   │   ├── post.py          # Post and comment endpoints
│   │   ├── user.py          # User authentication endpoints
│   │   └── upload.py        # File upload endpoints
│   ├── libs/
│   │   └── b2/              # Backblaze B2 integration
│   └── tests/
│       ├── conftest.py      # Test configuration and fixtures
│       ├── helpers.py       # Test helper functions
│       ├── test_security.py
│       ├── test_tasks.py
│       └── routers/
│           ├── test_post.py
│           ├── test_user.py
│           └── test_upload.py
├── requirements.txt         # Production dependencies
├── requirements-dev.txt     # Development dependencies
├── .env.sample             # Sample environment variables
├── .gitignore
└── README.md
```

## Database Schema

The application uses SQLite with the following tables:

- **user**: User accounts (id, email, password, confirmed)
- **post**: User posts (id, body, user_id, image_url)
- **comments**: Comments on posts (id, body, post_id, user_id)
- **likes**: Post likes (id, post_id, user_id)

## Development

### Code Style

The project follows Python best practices and uses:
- Async/await patterns for I/O operations
- Type hints for better code documentation
- Pydantic models for data validation
- Dependency injection for database and authentication

### Logging

The application uses structured logging with correlation IDs to track requests across the system. Logs include:
- HTTP request/response details
- Database operations
- Background task execution
- API integrations

## Security Features

- Password hashing with bcrypt
- JWT tokens with expiration (default: 30 minutes for access tokens, 24 hours for confirmation tokens)
- OAuth2 password flow authentication
- Email confirmation for new users
- Protected endpoints with authentication dependency
- Secure token generation using HS256 algorithm

## External Services

The API integrates with:

1. **Mailgun** - Email delivery service for user registration and notifications
2. **Backblaze B2** - Cloud storage for file uploads
3. **DeepAI** - AI image generation for posts

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available for educational purposes.

## Author

Rabia Zulfiqar

## Acknowledgments

- Built with FastAPI framework
- Uses modern Python async patterns
- Inspired by modern social media platforms
