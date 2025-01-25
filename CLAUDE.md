# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm start` - Start the application (runs on port 3000 by default, or PORT env variable)
- `npm run dev` - Start in development mode with auto-reload
- `npm test` - Run Jest tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier
- `npm install` or `yarn install` - Install dependencies

## Architecture Overview

This is a Node.js/Express application that serves as a rickrolling service. The core functionality:

1. **Main Application** (`app.js`): Express server setup with Pug templating engine and spider detection middleware
2. **Spider Detection**: Uses `spider-detector` to identify web crawlers/bots
3. **Video Route** (`routes/video.js`): 
   - For spiders/bots: Fetches and displays Open Graph metadata from the requested YouTube video
   - For regular users: Redirects to Rick Astley's "Never Gonna Give You Up" video
   - Includes validation for YouTube video IDs (11 characters, alphanumeric + hyphen)
4. **Open Graph Scraping**: Uses `open-graph-scraper` to fetch video metadata for spider responses
5. **Caching**: Simple in-memory cache middleware to improve performance for repeated requests

## Key Files

- `app.js`: Main Express application setup
- `routes/video.js`: Core rickrolling logic with spider detection and error handling
- `views/video.pug`: Template for rendering Open Graph metadata to spiders
- `bin/www`: Server startup script
- `middleware/cache.js`: Caching middleware for performance optimization
- `tests/video.test.js`: Jest tests for the video route

## Development Notes

- The app uses Pug templating engine (successor to Jade)
- Testing with Jest and Supertest
- ESLint and Prettier configured for code quality
- All security vulnerabilities have been patched
- Modern ES6+ syntax with async/await
- Proper error handling throughout the application