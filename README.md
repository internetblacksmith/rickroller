# Rickroller

A clever rickrolling service that shows proper video metadata to web crawlers while redirecting regular visitors to Rick Astley's "Never Gonna Give You Up".

## Features

- **Spider Detection**: Identifies web crawlers and bots using `spider-detector`
- **Open Graph Support**: Fetches and displays proper video metadata for social media previews
- **Modern Codebase**: Updated dependencies with security patches
- **Development Tools**: ESLint, Prettier, and Jest testing configured

## Installation

```bash
# Install dependencies
npm install

# Or with Yarn
yarn install
```

## Usage

```bash
# Start the server
npm start

# Development mode with auto-reload
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

## How It Works

1. User visits `/v/:videoId` with any YouTube video ID
2. Spider detector checks if the visitor is a bot/crawler
3. For bots: Fetches and displays actual video metadata
4. For humans: Redirects to the rickroll video

## Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)

## Security

This project has been updated to address all known security vulnerabilities. Regular dependency updates are recommended.

## License

Private project