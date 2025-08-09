import dotenv from 'dotenv';
import connectDB from './config/db.js';
import colors from 'colors';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes.js ';
import customerRoutes from './routes/customerRoutes.js';
import express from 'express';
import cors from 'cors';

//config .env
dotenv.config();

//config DB
connectDB();

const app = express();

//middleWare
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

//PORT
const PORT = process.env.PORT || 8086;

//run listen
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`.bgCyan.white);
});

//routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/customer', customerRoutes);

//rest api
app.get('/', (req, res) => {
  res.send('<h1>Welcome to </h1>');
});
