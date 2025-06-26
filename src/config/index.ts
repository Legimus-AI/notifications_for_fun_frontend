/**
 * Application Configuration
 *
 * This file centralizes all configuration constants and environment variables.
 * It uses Vite's import.meta.env to access environment variables.
 *
 * Environment variables must be prefixed with VITE_ to be exposed to the client.
 * See: https://vite.dev/guide/env-and-mode
 */

interface AppConfig {
  // API Configuration
  apiBaseUrl: string;
  wsUrl: string;

  // Application Information
  appName: string;
  appVersion: string;

  // Debug & Logging
  debugMode: boolean;
  logLevel: "debug" | "info" | "warn" | "error";

  // Environment Information
  isDevelopment: boolean;
  isProduction: boolean;
  mode: string;
}

// Helper function to convert string to boolean
const toBoolean = (
  value: string | undefined,
  defaultValue: boolean = false
): boolean => {
  if (!value) return defaultValue;
  return value.toLowerCase() === "true";
};

// Helper function to validate log level
const validateLogLevel = (
  level: string | undefined
): "debug" | "info" | "warn" | "error" => {
  const validLevels = ["debug", "info", "warn", "error"] as const;
  if (level && validLevels.includes(level as any)) {
    return level as "debug" | "info" | "warn" | "error";
  }
  return "info"; // default
};

// Main configuration object
export const config: AppConfig = {
  // API Configuration
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:4500",
  wsUrl: import.meta.env.VITE_WS_URL || "ws://localhost:4500",

  // Application Information
  appName: import.meta.env.VITE_APP_NAME || "Notifications for Fun",
  appVersion: import.meta.env.VITE_APP_VERSION || "1.0.0",

  // Debug & Logging
  debugMode: toBoolean(import.meta.env.VITE_DEBUG_MODE, import.meta.env.DEV),
  logLevel: validateLogLevel(import.meta.env.VITE_LOG_LEVEL),

  // Environment Information
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  mode: import.meta.env.MODE,
};

// API Configuration
export const API_CONFIG = {
  BASE_URL: config.apiBaseUrl,
  WS_URL: config.wsUrl,
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// WebSocket Configuration
export const WS_CONFIG = {
  URL: config.wsUrl,
  RECONNECT_ATTEMPTS: 5,
  RECONNECT_DELAY: 3000, // 3 seconds
  HEARTBEAT_INTERVAL: 30000, // 30 seconds
} as const;

// UI Configuration
export const UI_CONFIG = {
  TOAST_DURATION: 5000, // 5 seconds
  TOAST_MAX_COUNT: 5,
  SIDEBAR_WIDTH: 280,
  MOBILE_BREAKPOINT: 768,
} as const;

// Logging Configuration
export const LOG_CONFIG = {
  LEVEL: config.logLevel,
  ENABLED: config.debugMode,
  PREFIX: `[${config.appName}]`,
} as const;

// Helper functions for common config checks
export const isDevMode = () => config.isDevelopment;
export const isProdMode = () => config.isProduction;
export const getApiUrl = (endpoint: string) =>
  `${config.apiBaseUrl}/api${endpoint}`;
export const getWsUrl = () => config.wsUrl;

// Debug function to log current configuration (only in development)
export const logConfig = () => {
  if (config.debugMode) {
    console.group(`${LOG_CONFIG.PREFIX} Configuration`);
    console.log("Environment:", config.mode);
    console.log("API Base URL:", config.apiBaseUrl);
    console.log("WebSocket URL:", config.wsUrl);
    console.log("Debug Mode:", config.debugMode);
    console.log("Log Level:", config.logLevel);
    console.groupEnd();
  }
};

// Export default config
export default config;
