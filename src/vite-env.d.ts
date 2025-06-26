/// <reference types="vite/client" />

/**
 * TypeScript definitions for Vite environment variables
 * This provides IntelliSense and type safety for import.meta.env
 *
 * All custom environment variables must be prefixed with VITE_
 * See: https://vite.dev/guide/env-and-mode#intellisense-for-typescript
 */

interface ImportMetaEnv {
  // API Configuration
  readonly VITE_API_BASE_URL: string;
  readonly VITE_WS_URL: string;

  // Application Information
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;

  // Debug & Logging
  readonly VITE_DEBUG_MODE: string;
  readonly VITE_LOG_LEVEL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
