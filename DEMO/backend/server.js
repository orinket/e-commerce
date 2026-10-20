const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv-vault');
const helmet = require('helmet');
const mongoSanitize = require('mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const router = require('./router');
const errorHandler = require('./middleware/error');
const { startEcomJobs } = require('./jobs/ecom');
const webSocketServer = require('./lib/websocketServer');

// Load env vars
dotenv.config();

const app = express();

// When behind nginx/Railway/etc., set TRUST_PROXY=1 so req.ip and rate limits use X-Forwarded-For.
if (process.env.TRUST_PROXY === '1' || process.env.TRUST_PROXY === 'true') {
    app.set('trust proxy', 1);
}

// Enable CORS at the very top (comma-separated FRONTEND_URL; default covers common CRA ports)
const defaultDevOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:4000',
    'http://localhost:4002',
];

const envOrigins = (process.env.FRONTEND_URL || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

const isAllowedOrigin = (origin) => {
    if (!origin) return true;
    if (defaultDevOrigins.includes(origin) || envOrigins.includes(origin)) return true;
    try {
        const url = new URL(origin);
        // Allow all Vercel deployments (storefront, admin, preview branches)
        if (url.hostname.endsWith('.vercel.app')) return true;
        if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') return true;
    } catch {
        // invalid URL
    }
    return false;
};

const corsOptions = {
    origin(origin, callback) {
        if (isAllowedOrigin(origin)) {
            callback(null, true);
        } else {
            callback(null, false);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Cookie', 'x-session-id'],
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Set security headers
app.use(helmet({
    contentSecurityPolicy: false, // Disable for development to avoid connection issues
    hsts: false,
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

// Logging in dev
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    // Standard combined format for production
    app.use(morgan('combined'));
}

// Body parser — 10kb was too small for general settings (banners, SEO, JSON blocks).
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || '1mb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.JSON_BODY_LIMIT || '1mb' }));

// Cookie parser
app.use(cookieParser());

// Sanitize data (Prevents NoSQL injection)
app.use((req, res, next) => {
    if (req.body) req.body = mongoSanitize(req.body);
    if (req.query) req.query = mongoSanitize(req.query);
    if (req.params) req.params = mongoSanitize(req.params);
    next();
});

// Prevent http param pollution
app.use(hpp());

// General Rate limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 mins
    max: 1000, // Increased for development testing
    message: 'Too many requests from this IP, please try again after 10 minutes'
});

// Stricter Rate limiting for Auth routes (Login/Signup)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 100, // Increased for development testing
    message: 'Too many login attempts, please try again after 15 minutes'
});

app.use('/api', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);

// Database connection with serverless caching
let cachedPromise = null;
const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) {
        return;
    }
    if (!cachedPromise) {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            throw new Error('MONGO_URI environment variable is not defined in Vercel settings');
        }
        cachedPromise = mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
        }).then((conn) => {
            console.log('MongoDB connected successfully');
            return conn;
        }).catch((err) => {
            cachedPromise = null;
            console.error(`MongoDB Error: ${err.message}`);
            throw err;
        });
    }
    return cachedPromise;
};

// Health check route (does not require DB)
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'Backend is running',
        dbConnected: mongoose.connection.readyState >= 1,
        hasMongoUri: Boolean(process.env.MONGO_URI)
    });
});

// Middleware to ensure DB connection before handling API requests
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error('Database connection failed:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Database Connection Error',
            error: err.message,
            hint: !process.env.MONGO_URI ? 'MONGO_URI environment variable is missing in Vercel' : undefined,
        });
    }
});

// Mount router
app.use('/api', router);

// Error handler (must be after router)
app.use(errorHandler);

// Only start background jobs and WebSockets in persistent environments (local / Railway)
if (!process.env.VERCEL) {
    (async () => {
        await connectDB();
        startEcomJobs();

        const PORT = process.env.PORT || 5002;
        const server = app.listen(PORT, () => {
            console.log(`Server started successfully on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
            
            const wsInitialized = webSocketServer.initialize(server);
            if (wsInitialized) console.log('WebSocket server initialized successfully');
        });

        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`Port ${PORT} is in use.`);
            }
        });
    })();
}

// Export the Express app for Vercel Serverless Functions
module.exports = app;
