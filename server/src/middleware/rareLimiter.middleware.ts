import rateLimit from 'express-rate-limit';

// General API rate limit — applies broadly, generous enough not to bother real usage
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});

// Strict limiter for auth endpoints (login, bootstrap) — protects against credential stuffing / brute force
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Please try again later.' },
});

// Public upload — the most exposed endpoint (no auth at all), tightest limit, keyed by IP
export const publicUploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many upload attempts from this location. Please try again later.' },
});

// Upload-token issuance — called by developer backends with API keys, but still worth capping
export const uploadTokenLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many token requests. Please try again later.' },
});