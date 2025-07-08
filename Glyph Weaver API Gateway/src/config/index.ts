import dotenv from 'dotenv';

dotenv.config();

interface IConfig {
  port: number;
  corsOrigin: string;
  logLevel: string;
  jwt: {
    jwksUrl: string;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  services: {
    auth: string;
    player: string;
    leaderboard: string;
    iap: string;
    gamecontent: string;
    analytics: string;
    system: string;
  };
}

const config: IConfig = {
  port: parseInt(process.env.PORT || '8080', 10),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  logLevel: process.env.LOG_LEVEL || 'info',
  jwt: {
    jwksUrl: process.env.JWT_PUBLIC_KEY_URL || '',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  services: {
    auth: process.env.AUTH_SERVICE_URL || '',
    player: process.env.PLAYER_SERVICE_URL || '',
    leaderboard: process.env.LEADERBOARD_SERVICE_URL || '',
    iap: process.env.IAP_SERVICE_URL || '',
    gamecontent: process.env.GAMECONTENT_SERVICE_URL || '',
    analytics: process.env.ANALYTICS_SERVICE_URL || '',
    system: process.env.SYSTEM_SERVICE_URL || '',
  },
};

// Validation
const requiredConfigs: (keyof typeof config.services | 'jwksUrl')[] = [
  'auth',
  'player',
  'leaderboard',
  'iap',
  'gamecontent',
  'analytics',
  'system',
  'jwksUrl',
];

const missingConfigs = requiredConfigs.filter(key => {
  if (key === 'jwksUrl') {
    return !config.jwt.jwksUrl;
  }
  return !config.services[key as keyof typeof config.services];
});

if (missingConfigs.length > 0) {
  const message = `FATAL_ERROR: Missing required environment variables: ${missingConfigs.join(', ')}`;
  console.error(message);
  throw new Error(message);
}

export default Object.freeze(config);