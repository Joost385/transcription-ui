<p align="center">
  <img src="https://github.com/moostrich/transcription-ui/assets/61097554/0d622ce1-c578-4fd4-ba51-528288fd66a3" />
</p>

<p align="center" style="padding: 0 50px;">
    This repository provides a full-stack web application for interview transcription. It uses a pipeline based on <a href="https://github.com/openai/whisper">OpenAI Whisper</a> for transcription and <a href="https://github.com/NVIDIA/NeMo">NVIDIA NeMo</a> for speaker diarization. The application's backend is based on <a href="https://github.com/tiangolo/fastapi">FastAPI</a> and the frontend is built with <a href="https://github.com/mui/material-ui">Material UI</a>. With the included Docker setup, the application can be deployed easily and is highly configurable.
</p>

# Getting Started

## Prerequisites

- To run the application you have to install Docker and Docker Compose.
- Before starting the application, you must configure it. See the [Configuration](#configuration) section for more information. If you are using the production setup read through [SSL Certificates](#ssl-certificates) as well.
- The project uses Make to simplify the interaction with Docker Compose. You can install it with `apt install make`. Alternatively, you can refer to the [Makefile](docker/Makefile) and execute the commands manually. All commands are executed from the docker folder, but you can also use `make -C path/to/docker/folder [target]` to execute them from anywhere.

## Setup

There are two environments to run the application in, `dev` and `prod`. Additionally you can specify whether the pipeline should use an NVIDIA GPU by adding the `device` argument `cuda`. The default environment is `dev` and the default device is `cpu`. The following steps use `prod` and `cpu`:

First start the compose setup, this will take some time:
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

The application should now be runnnig on the configured domain or for dev on `localhost:3000` in case you did not specify another `DEV_APP_PORT`. You can access the Swagger API docs under `/api/docs`

The Makefile includes more targets to manage and monitor the setup:
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

All the application data is stored in the `docker/data/` directory. The following command creates a timestamped zip-archive of `docker/data/` and places it in `docker/backup/`:

```bash
make backup
```

## SSL Certificates

To use the production environment, you need to generate SSL certificates. The Makefile includes a `make certs` target for creating self-signed certificates, which will be stored in `docker/data/certs/.`

However it's better to use certificates from a trusted certificate authority. For that you can use cerbot. Install certbot like this:

```bash
apt install certbot
```

Then execute the following command *while the compose setup is down* (replace the example domain):

```bash
certbot certonly --standalone -d example.com -d www.example.com
```

The certificates will be saved in `/etc/letsencrypt/live/example.com/`. Configure the environment variables `CERT_PATH_FULLCHAIN_PEM` and `CERT_PATH_PRIVKEY_PEM` to mount them into the nginx container. For renewing your certificates, use:
    
```bash
certbot renew --webroot -w /var/www/certbot-webroot
```

The webroot path `/var/www/certbot-webroot` can be any location, but it should correspond with the `CERTBOT_WEBROOT` environment variable. For automatic renewal, you can add a cron job in your system.

# Configuration

Before you can run the application, you need to configure it. To do this, create a `.env` file in the docker folder and set the following environment variables:

- `CELERY_CONCURRENCY`\
Specifies the maximum number of concurrent transcriptions.

- `JWT_SECRET_KEY`\
Used to sign JWT tokens. Generate a secure secret with `openssl rand -hex 32`.

- `JWT_TOKEN_EXPIRY_HOURS`\
Defines the expiry time of tokens in hours. This essentially determines how long users stay logged in.

- `PASSWORD_RESET_EXPIRY_MINUTES`\
Sets the expiry time of password reset tokens in minutes.

- `FILES_MAX_SIZE_BYTE`\
Sets a limit for the upload file size in bytes. For example, 300 MB = $300 \times 2^{20}$ bytes.

- `BASE_URL`\
The application's base URL for generating email links e.g. *https<span>:</span>//www<span>.</span>example<span>.</span>com*. For development sepedify localhost with the configured port e.g. *http<span>:</span>//localhos<span>t</span>:3000*.

- `EMAIL_HOST`\
Defines the host for the email server. For iCloud emails, set the it to `smtp.mail.me.com`, and for Gmail, use `smtp.gmail.com`.

- `EMAIL_PORT`\
Defines the email server port. For iCloud and Gmail use `578`.

- `EMAIL_USER`\
The username for accessing the email server.

- `EMAIL_PASSWORD`\
The password for accessing the email server.

- `CONTACT_EMAIL`\
Displayed as the contact email on the help page and in emails.

- `MARIADB_ROOT_PASSWORD`\
Secures the MariaDB database with this password.

- `MARIADB_USER`\
Username for MariaDB database access.

- `MARIADB_PASSWORD`\
Password for MariaDB database access.

- `MARIADB_DATABASE`\
Name of the database used by the application.

- `REDIS_PASSWORD`\
Password for securing the Redis database.

Use `pwgen -Bnc 40 3` to generate strong passwords for MariaDB and Redis.

## Production

In a production setting, configure these additional environment variables:

- `NGINX_SERVER_NAME`\
Specifies the domain(s) your application runs on. For example, `"example.com www.example.com"`. For multiple domains, enclose them in quotes and separate them with spaces.

- `CERT_PATH_FULLCHAIN_PEM`\
Path to the `fullchain.pem` file, for example generated by certbot: */etc/letsencrypt/live/example.com/fullchain.pem*

- `CERT_PATH_PRIVKEY_PEM`\
Path to the `privkey.pem` file, for example generated by certbot: */etc/letsencrypt/live/example.com/privkey.pem*

- `CERTBOT_WEBROOT`\
Location of the webroot used for certbot renewals, for instance: */var/www/certbot-webroot*

## Development

In a production setting, you can configure these port mappings:

- `DEV_APP_PORT`\
The application's running port, defaults to **3000**.

- `DEV_REDIS_PORT`\
The port for the Redis database, defaults to **6379**.

- `DEV_MARIADB_PORT`\
The port for the MariaDB database, defaults to **3306**.

# License

This project is licensed under the AGPL-3.0. The key point: if you modify and use this code, especially in networked applications, those changes should be shared under the same license. It's about maintaining openness in software development. For exact terms refer to the [LICENSE](LICENSE) file.