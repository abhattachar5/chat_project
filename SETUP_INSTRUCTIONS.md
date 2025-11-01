# Phase 1 Setup Instructions

## Prerequisites

Before running the project, ensure you have:

1. **Node.js 18+** installed
2. **npm** (comes with Node.js)

## Installation Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Verify Angular CLI is installed:**
   ```bash
   npx ng version
   ```

## Project Structure

The project has been initialized with:

- ✅ Angular 18 workspace configuration
- ✅ TypeScript strict mode
- ✅ ESLint configuration
- ✅ Prettier configuration
- ✅ Karma/Jasmine test setup
- ✅ Playwright E2E test setup
- ✅ Angular Material integration
- ✅ Core services foundation
- ✅ Widget shell component
- ✅ Embedding infrastructure

## Build Commands

```bash
# Build the library
npm run build:lib

# Build for production
npm run build:lib -- --configuration production

# Run tests
npm test

# Lint
npm run lint

# Format code
npm run format
```

## Next Steps (Phase 2)

Once dependencies are installed, you can:

1. Start the demo application (when created):
   ```bash
   npm start
   ```

2. Begin implementing Phase 2 features:
   - Message list component
   - Session lifecycle
   - Question rendering
   - Input handling

## Notes

- The project uses **strict TypeScript** mode
- Angular Material is configured but animations should be handled by the host application
- The widget is designed to be embedded as a library
- All services are provided at root level for lazy loading

## Troubleshooting

If you encounter issues:

1. **Dependencies not found**: Run `npm install`
2. **TypeScript errors**: Check that all imports are correct
3. **Material theme issues**: Ensure `@angular/material` is installed
4. **Build errors**: Check `angular.json` configuration

## Current Status

✅ **Phase 1 - Foundation & Setup** is complete:
- [x] Project initialization
- [x] Angular Material integration
- [x] Core services (Config, API, Analytics, Theme, Idempotency)
- [x] Widget shell component
- [x] Embedding infrastructure (global API)

Ready to proceed to **Phase 2: Core Chat Functionality**

