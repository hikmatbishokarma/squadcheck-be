"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => ({
    port: parseInt(process.env.PORT, 10) || 3001,
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/squadcheck',
    jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-prod',
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    nodeEnv: process.env.NODE_ENV || 'development',
});
//# sourceMappingURL=configuration.js.map