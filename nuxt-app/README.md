# Spotify Party – Nuxt 3

Uses [Nuxt 3](https://nuxt.com/), [tRPC](https://trpc.io/), [tRPC Nuxt](https://trpc-nuxt.vercel.app/),
[Drizzle ORM](https://github.com/drizzle-team/drizzle-orm)
and [Drizzle Kit](https://github.com/drizzle-team/drizzle-kit-mirror)
with [Planetscale](https://app.planetscale.com/m-kronberger/spotify-party).

The application is deployed using [Vercel](https://vercel.com/moritzkronberger/spotify-party).

## Development

### Setup

Make sure you have navigated to the `nuxt-app` directory:

```bash
cd nuxt-app
```

Install the dependencies:

```bash
npm install
```

Link the directory to the Vercel project:

```bash
npm run vercel-link
```

And pull the required environment variables:

```bash
npm run vercel-env-pull
```

### Development Server

Start the development server on <http://localhost:3000>:

```bash
npm run dev
```

## Production

Build the application for production:

```bash
npm run build
```

Locally preview production build:

```bash
npm run preview
```

## DB Migrations

To migrate the database simply run:

```bash
npm run drizzle-push
```
