// Configuration file for API keys and settings
// This file should be added to .gitignore to keep API keys secure

export const CONFIG = {
  // Gemini API Key - loaded from environment variables
  GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY || '',

  // API Settings
  MAX_RETRIES: 3,
  INITIAL_DELAY_MS: 3000, // Optimized for VPN users

  // Model Configuration
  DEFAULT_MODEL: 'gemini-2.5-pro',
  FALLBACK_MODEL: 'gemini-2.5-flash'
};