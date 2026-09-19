# Development Setup

This guide explains how to set up the project for local development.

# 1. Prerequisites

Before starting, install:

| Tool                             | Purpose                                          |
| -------------------------------- | ------------------------------------------------ |
| Python 3.12+                     | Backend development                              |
| [uv](https://docs.astral.sh/uv/) | Python dependency management                     |
| Node.js 20+                      | Frontend development                             |
| [pnpm](https://pnpm.io/)         | JavaScript dependency management                 |
| Docker                           | Runs the application and infrastructure services |
| Ollama                           | Example local LLM provider                       |

Check your installation:

```bash
python --version
uv --version
node --version
pnpm --version
docker --version
```

> **Note:** Ollama is used as the example LLM provider in this guide. The application can be configured to use another supported LLM provider.

# 2. Environment Setup

The project uses a **single root `.env` file** for local development and Docker Compose.

The project provides `.env.copy` as a template.

From the **project root**, copy the template:

### Windows PowerShell

```powershell
Copy-Item .env.copy .env
```

### macOS / Linux

```bash
cp .env.copy .env
```

You should now have:

```text
project-root/
├── .env
├── .env.copy
├── backend/
├── frontend/
├── docker-compose.yml
└── ...
```

Open `.env` and fill in the required values.

> **Important:** Never commit `.env` or any file containing secrets, passwords, or API keys.

## 2.1 Application Configuration

These values configure the application:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
API_PORT=8000
FRONTEND_PORT=3000

MAX_PDF_SIZE_MB=20
PROCESS_CONFIG_VERSION=v0-init
```

The default values are suitable for local development unless you need to change the ports or application settings.

## 2.2 Better Auth

Configure Better Auth in the root `.env` file:

```env
BETTER_AUTH_SECRET=your-secret
BETTER_AUTH_URL=http://localhost:3000
```

`BETTER_AUTH_SECRET` should be a secure random value with at least 32 characters.

### Google OAuth

Google OAuth is optional. To enable Google as a social login provider:

```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

Follow the [Better Auth Google OAuth tutorial](https://better-auth.com/docs/authentication/google).

### Gmail

Gmail is optional and is used to send password-reset emails when a user forgets their password.

```env
GMAIL_USERNAME=your-email
GMAIL_PASSWORD=your-password
```

Follow this [Gmail and Nodemailer tutorial](https://dev.to/emmanuel_xs/how-to-send-emails-for-free-in-nextjs-using-gmail-and-nodemailer-4i6e).---

## 2.3 Database

The default Docker configuration uses PostgreSQL:

```env
POSTGRES_HOST=postgres
POSTGRES_DB=nook
POSTGRES_USER=your-user
POSTGRES_PASSWORD=your-password
POSTGRES_PORT=5432
```

pgAdmin is also available for viewing and managing the database, but it is optional.

```env
PGADMIN_DEFAULT_EMAIL=admin@example.com
PGADMIN_DEFAULT_PASSWORD=admin
PGADMIN_PORT=5050
```

## 2.4 Storage

The local development environment uses **SeaweedFS** as the S3-compatible storage service.

The default local configuration is:

```env
S3_ENDPOINT_URL=http://seaweedfs-s3:8333
S3_ACCESS_KEY=any
S3_SECRET_KEY=any
S3_BUCKET=books
S3_REGION=us-east-1
```

The SeaweedFS port values are already provided in `.env.copy` and normally do not need to be changed.
## 2.5 Redis and RabbitMQ

Redis is used by Celery as the result backend.

RabbitMQ is used as the Celery message broker.

Configure them in `.env`:

```env
REDIS_PORT=6379

RABBITMQ_DEFAULT_USER=your-user
RABBITMQ_DEFAULT_PASS=your-password
RABBITMQ_PORT=5672
RABBITMQ_MANAGEMENT_PORT=15672

CELERY_BROKER_URL=your-rabbitmq-url
CELERY_RESULT_BACKEND=redis://redis:6379/0
```

Use the values from `.env.copy` as the starting point.

## 2.6 Google Books API

The application uses Google Books to retrieve book metadata during book processing.

Create an API key using the [Google Books API documentation](https://developers.google.com/books/docs/v1/using#APIKey).

Then add it to `.env`:

```env
GOOGLE_BOOKS_API_KEY=your-api-key
```

## 2.7 LLM Provider

The LLM provider can be configured through `.env`.

For local development, **this guide uses Ollama as an example**:

```env
LLM__PROVIDER=ollama

LLM__OLLAMA__BASE_URL=http://host.docker.internal:11434
```

If you want to use Ollama:

1. Install [Ollama](https://ollama.com/).
2. Start Ollama.
3. Make sure the required models are available.
4. Configure the Ollama URL in `.env`.

The LLM models used by the application are configured here:

```env
LLM__METADATA__MODEL=llama3.2:3b
LLM__RAG__MODEL=qwen3:14b
```

> **Note:** Ollama is only the example provider used in this guide. You can configure another supported provider instead.

If you are using OpenAI, configure:

```env
LLM__PROVIDER=openai

LLM__OPENAI__API_KEY=your-api-key
LLM__OPENAI__BASE_URL=https://api.openai.com/v1
```

## 2.8 Embeddings

The default local embedding configuration uses Hugging Face:

```env
EMBEDDING__PROVIDER=huggingface

EMBEDDING__HUGGING_FACE__MODEL=sentence-transformers/all-MiniLM-L6-v2
```

OpenAI embeddings can also be configured:

```env
EMBEDDING__OPENAI__MODEL=text-embedding-3-small
```

The tokenizer configuration is already provided in `.env.copy`:

```env
TOKENIZER__HUGGING_FACE__MAX_TOKENS=512
TOKENIZER__OPENAI__MAX_TOKENS=8191
```


# 3. Backend + Frontend Setup

The backend and frontend dependencies can be installed locally for development.

## 3.1 Backend

From the project root:

```bash
cd backend
```

Install dependencies:

```bash
uv sync
```

`uv` creates and manages the project's virtual environment automatically.


## 3.2 Frontend

Open a new terminal and return to the project root:

```bash
cd frontend
```

Install dependencies:

```bash
pnpm install
```

# 4. Docker + Running the Application

Make sure you have completed the **Environment Setup** before starting Docker.

From the **project root**, run:

## 4.1 Start Docker

```bash
docker compose up -d
```

Check that the containers are running:

```bash
docker compose ps
```

Docker runs the application's infrastructure and, where configured, the API and frontend services.


## 4.2 Run Database Migrations

Run the backend database migrations:

```bash
docker compose exec api alembic upgrade head
```

## 4.3 Set Up Better Auth

Generate the Better Auth schema:

```bash
docker compose exec frontend pnpm dlx auth@latest generate --config ./lib/auth/init.ts
```

Then run the Better Auth migrations:

```bash
docker compose exec frontend pnpm dlx auth@latest migrate --config ./lib/auth/init.ts
```
## 4.4 Check the Application

Once the containers are running, the application should be available at:

| Service             | URL                        |
| ------------------- | -------------------------- |
| Frontend            | http://localhost:3000      |
| Backend API         | http://localhost:8000      |
| FastAPI Docs        | http://localhost:8000/docs |
| pgAdmin             | http://localhost:5050      |
| RabbitMQ Management | http://localhost:15672     |

## 4.5 View Docker Logs

If something is not working, check the container logs:

```bash
docker compose logs
```

To view logs for a specific service:

```bash
docker compose logs api
```

## 4.6 Stop the Application

From the project root:

```bash
docker compose down
```

Start it again later with:

```bash
docker compose up -d
```
