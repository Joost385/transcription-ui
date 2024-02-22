<p align="center">
  <img src="https://github.com/moostrich/transcription-ui/assets/61097554/0d622ce1-c578-4fd4-ba51-528288fd66a3" />
</p>

<p align="center" style="padding: 0 50px;">
    This repository offers a full-stack web application for interview transcription. It integrates a pipeline based on <a href="https://github.com/openai/whisper">OpenAI Whisper</a> for transcription and <a href="https://github.com/NVIDIA/NeMo">NVIDIA NeMo</a> for speaker diarization. The backend is based on <a href="https://github.com/tiangolo/fastapi">FastAPI</a> and the frontend is built with <a href="https://github.com/mui/material-ui">Material UI</a>. With the included Docker setup, deployment is straightforward and highly customizable. Thanks to <a href="https://github.com/caddyserver/caddy">caddy</a> you also get automatic automatic HTTPS.
</p>

# Getting Started

## Prerequisites

- Install Docker to run the application.
- Configure the application before starting it. Refer to the [Configuration](#configuration) section for details.
- The project uses Make to streamline interactions with Docker Compose. Alternatively, you can refer to the [Makefile](docker/Makefile) and execute the commands manually. The following commands are executed from the docker folder, but you can run them from anywhere with `make -C path/to/docker/folder [target]`.

## Setup

Choose between two environments for running the application: `dev` and `prod`. Optionally, specify the `device` argument as `cuda` to utilize an NVIDIA GPU. The default settings are `env=dev` and `device=cpu`. Follow these steps for `prod` and `cpu` setups:

Start the compose setup (this may take some time):
```bash
make up env=prod
```

Initialize the database schema:
```bash
make db-create-all
```

Create the initial admin user:
```bash
make admin
```

Download the used ML-Models (NeMo download uses `wget`):
```bash
make download-nemo-models
make download-whisper-models
```

The application should now be running on the domain(s) configured with `CADDY_DOMAIN_NAME` or on `localhost:3000` for the development environment (unless another `DEV_APP_PORT` is specified). Access the Swagger API documentation at `/api/docs`.

The Makefile includes more targets for managing and monitoring the setup:
```bash
make restart
make start
make stop
make down
make logs               # shows logs for all containers
make logs container=api # shows logs for api container
make remove-build       # removes the frontend production build volume 
make mariadb            # mariadb -u root -p
make db-drop-all        # destroys the database schema
```

All application data is stored in the `docker/data/` directory. The following command creates a timestamped zip-archive of `docker/data/` and places it in `docker/backup/`:

```bash
make backup
```

# Configuration

Configure the application by creating a `.env` file in the docker folder with these environment variables:

- `CELERY_CONCURRENCY`\
Maximum number of concurrent transcriptions.

- `JWT_SECRET_KEY`\
Secret for signing JWT tokens. Generate one using `openssl rand -hex 32`.

- `JWT_TOKEN_EXPIRY_HOURS`\
Token expiry time in hours, determining user login duration.

- `PASSWORD_RESET_EXPIRY_MINUTES`\
Expiry time for password reset tokens in minutes.

- `FILES_MAX_SIZE_BYTE`\
Upload file size limit in bytes e.g. 300 MB = $300 \times 2^{20}$ bytes.

- `CONTACT_EMAIL`\
Contact email displayed on the help page and in emails.

- `MARIADB_ROOT_PASSWORD`\
Password for the MariaDB database.

- `MARIADB_USER`\
Username for MariaDB database access.

- `MARIADB_PASSWORD`\
Password for MariaDB database access.

- `MARIADB_DATABASE`\
Database name used by the application.

- `REDIS_PASSWORD`\
Password for the Redis database.

Use `pwgen -Bnc 40 3` to generate strong passwords for MariaDB and Redis.

## Production

- `CADDY_DOMAIN_NAME`\
Domain(s) for your application e.g. `"example.com www.example.com"`. For multiple domains, enclose them in quotes and separate them with spaces. Certificates for your domains are automatically managed by caddy.

- `BASE_URL`\
Base URL for generating email links e.g. *https<span>:</span>//www<span>.</span>example<span>.</span>com*.

- `EMAIL_HOST`\
Email server host. Use `smtp.mail.me.com` for iCloud and `smtp.gmail.com` for Gmail.

- `EMAIL_PORT`\
Email server port. Use `587` for iCloud and Gmail.

- `EMAIL_USER`\
Username for the email server.

- `EMAIL_PASSWORD`\
Password for the email server.

## Development

- `DEV_APP_PORT`\
Application's running port, defaults to **3000**. A phpMyAdmin instance is running under `phpmyadmin.localhost:{DEV_APP_PORT}`. There also is a mailcatcher reachable under `mailpit.localhost:{DEV_APP_PORT}`.

# License

This project is licensed under the AGPL-3.0. The key point: if you modify and use this code, especially in networked applications, those changes should be shared under the same license. It's about maintaining openness in software development. For exact terms refer to the [LICENSE](LICENSE) file.