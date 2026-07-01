const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});

const app = express();
const server = http.createServer(app);

// ── Allow your Vercel frontend URL ──
const allowedOrigins = [
  'http://localhost:5173',
  'https://foodbridge-ciz3lqx63-sourish0112-archs-projects.vercel.app/', // ← replace with YOUR actual Vercel URL
  /\.vercel\.app$/  // allows all vercel preview URLs too
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.some(o =>
      typeof o === 'string' ? o === origin : o.test(origin)
    )) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }
});

app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/listings', require('./routes/listingRoutes'));
app.use('/api/impact', require('./routes/impactRoutes'));

// Health check route — visit this URL to confirm backend is alive
app.get('/', (req, res) => {
  res.json({ message: 'FoodBridge backend is running ✅' });
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });
  socket.on('disconnect', () => console.log('User disconnected'));
});

app.set('io', io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));