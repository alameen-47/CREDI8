import dotenv from 'dotenv';
import connectDB from './config/db.js';
import colors from 'colors';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes.js ';
import express from 'express';
import cors from 'cors';

//config .env
dotenv.config();

//config DB
connectDB();

const app = express();

//middleWare
app.use(morgan('dev'));
app.use(express.json());
app.use(cors());

//PORT
const PORT = process.env.PORT || 8086;

//routes
app.use('/api/v1/auth', authRoutes);

//rest api
app.get('/', (req, res) => {
  res.send('<h1>Welcome to </h1>');
});

//run listen
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`.bgCyan.white);
});
