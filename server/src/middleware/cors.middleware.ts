import cors from 'cors';

const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://127.0.0.1:5500',
    'http://localhost:5500',
];

// Restricted CORS configuration for authenticated/private endpoints
export const protectedCors = cors({
    origin: (origin, callback) => {
        // Allow server-to-server, curl, Postman (no origin) or allowed domains
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'X-API-KEY',
        'X-API-SECRET',
        'X-Upload-Token',
    ],
    exposedHeaders: ['Content-Range', 'X-Total-Count'],
    credentials: true,
    maxAge: 86400,
    optionsSuccessStatus: 200,
});

// Open CORS configuration for public endpoints
export const publicCors = cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-KEY', 'X-Upload-Token'],
});