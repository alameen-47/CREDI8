import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';
import colors from 'colors';

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));

const PORT = process.env.PORT || 5000;

//db
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB CONNECTED'.bgMagenta))
  .catch(err => console.log('DB CONNECTION ERROR', err));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`.bgCyan);
});
