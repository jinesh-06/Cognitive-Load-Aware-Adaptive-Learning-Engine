import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './server/routes/api.js';
import { authRouter } from './server/routes/auth.js';

async function startServer() {
    const app = express();
    const PORT = process.env.PORT || 3000;

    // CORS configuration
    app.use(cors({
        origin: [
            'https://cognitive-load-aware-adaptive-learn.vercel.app',
            'https://cognitive-load-aware-adaptive-learning-engine.vercel.app'
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // Request body parsing
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Health check
    app.get('/api/health', (req, res) => {
        res.json({
            status: 'ok',
            service: 'Cognitive Load-Aware Adaptive Learning Engine',
            timestamp: new Date().toISOString(),
            geminiConfigured: Boolean(process.env.GEMINI_API_KEY)
        });
    });

    // Authentication Routes (Google, GitHub, LinkedIn)
    app.use('/api/auth', authRouter);

    // Core API Routes
    app.use('/api', apiRouter);

    // Vite middleware for development
    if (process.env.NODE_ENV !== 'production') {
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: 'spa',
        });

        app.use(vite.middlewares);
    } else {
        // Serve frontend in production
        const distPath = path.join(process.cwd(), 'dist');

        app.use(express.static(distPath));

        app.get('*', (req, res) => {
            res.sendFile(path.join(distPath, 'index.html'));
        });
    }

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
        console.error(
            '[Cognitive Load Engine] Uncaught Exception:',
            err
        );
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
        console.error(
            '[Cognitive Load Engine] Unhandled Rejection at:',
            promise,
            'reason:',
            reason
        );
    });

    // Start server
    const server = app.listen(PORT, '0.0.0.0', () => {
        console.log(
            `[Cognitive Load Engine] Server listening on http://0.0.0.0:${PORT}`
        );
    });

    // Keep event loop alive
    setInterval(() => { }, 1000 * 60 * 60);
}

startServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
});