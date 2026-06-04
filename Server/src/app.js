import express from 'express';
import cors from 'cors';
import router from "./routes/router.js"

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', router);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'PEAK backend running' });
});

// Connect to MongoDB

export default app;