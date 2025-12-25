import express from 'express';
import handlebars from 'express-handlebars';
import { Server } from 'socket.io';
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import viewsRouter from './routes/views.router.js';
import productManager from './managers/ProductManager.js';
import { connectDB } from './config/database.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8080;

// Conectar a MongoDB
connectDB();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de Handlebars con helpers
const hbs = handlebars.create({
  helpers: {
    eq: (a, b) => a === b,
    gt: (a, b) => a > b,
    lt: (a, b) => a < b,
    multiply: (a, b) => a * b,
    range: (start, end) => {
      const result = [];
      for (let i = start; i <= end; i++) {
        result.push(i);
      }
      return result;
    }
  }
});

app.engine('handlebars', hbs.engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');

// Routes
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);

// Iniciar servidor HTTP
const httpServer = app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
  console.log(`🌐 Accede a http://localhost:${PORT}`);
});

// Configurar Socket.IO
const io = new Server(httpServer);

// Hacer io accesible globalmente
app.set('io', io);

// EVENTOS DE WEBSOCKET - MANEJO DE PRODUCTOS 
io.on('connection', async (socket) => {
  console.log('✅ Nuevo cliente conectado:', socket.id);

  // Enviar lista inicial de productos al conectarse
  try {
    const result = await productManager.getProducts({ limit: 100 });
    socket.emit('updateProducts', result.payload);
    console.log('📦 Lista inicial de productos enviada al cliente:', socket.id);
  } catch (error) {
    console.error('❌ Error al enviar productos iniciales:', error);
    socket.emit('error', { message: 'Error al cargar productos' });
  }

  // CREAR PRODUCTO POR WEBSOCKET
  socket.on('createProduct', async (productData) => {
    console.log('📝 Solicitud de creación de producto recibida:', productData);
    
    try {
      // Crear el producto
      const newProduct = await productManager.addProduct(productData);
      console.log('✅ Producto creado exitosamente:', newProduct._id);

      // Obtener lista actualizada
      const result = await productManager.getProducts({ limit: 100 });

      // Emitir a TODOS los clientes conectados
      io.emit('updateProducts', result.payload);
      
      // Confirmar al cliente que envió la solicitud
      socket.emit('productCreated', { 
        success: true, 
        product: newProduct,
        message: 'Producto creado exitosamente'
      });

      console.log('📡 Lista actualizada emitida a todos los clientes');
    } catch (error) {
      console.error('❌ Error al crear producto:', error);
      socket.emit('productCreated', { 
        success: false, 
        message: error.message 
      });
    }
  });

  // ⭐ ELIMINAR PRODUCTO POR WEBSOCKET
  socket.on('deleteProduct', async (productId) => {
    console.log('🗑️ Solicitud de eliminación de producto recibida:', productId);
    
    try {
      // Eliminar el producto
      const deletedProduct = await productManager.deleteProduct(productId);
      console.log('✅ Producto eliminado exitosamente:', deletedProduct._id);

      // Obtener lista actualizada
      const result = await productManager.getProducts({ limit: 100 });

      // Emitir a TODOS los clientes conectados
      io.emit('updateProducts', result.payload);

      // Confirmar al cliente que envió la solicitud
      socket.emit('productDeleted', { 
        success: true, 
        product: deletedProduct,
        message: 'Producto eliminado exitosamente'
      });

      console.log('📡 Lista actualizada emitida a todos los clientes');
    } catch (error) {
      console.error('❌ Error al eliminar producto:', error);
      socket.emit('productDeleted', { 
        success: false, 
        message: error.message 
      });
    }
  });

  // ⭐ SOLICITAR LISTA ACTUALIZADA DE PRODUCTOS
  socket.on('requestProducts', async () => {
    console.log('📋 Solicitud de lista de productos recibida de:', socket.id);
    
    try {
      const result = await productManager.getProducts({ limit: 100 });
      socket.emit('updateProducts', result.payload);
      console.log('📦 Lista de productos enviada al cliente:', socket.id);
    } catch (error) {
      console.error('❌ Error al enviar productos:', error);
      socket.emit('error', { message: 'Error al cargar productos' });
    }
  });

  // Cliente desconectado
  socket.on('disconnect', () => {
    console.log('❌ Cliente desconectado:', socket.id);
  });
});

console.log('🔌 WebSocket Server configurado correctamente');
console.log('📡 Eventos disponibles:');
console.log('   - createProduct: Crear producto por WebSocket');
console.log('   - deleteProduct: Eliminar producto por WebSocket');
console.log('   - requestProducts: Solicitar lista actualizada');
console.log('   - updateProducts: Recibir lista actualizada (emitido por servidor)');