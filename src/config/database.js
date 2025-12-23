import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb://localhost:27017/ecommerce_coderhouse';

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB exitosamente');
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error);
    process.exit(1);
  }
};