import { Router } from 'express';
import productManager from '../managers/ProductManager.js';

const router = Router();

// GET /api/products - Listar todos los productos (con límite opcional)
router.get('/', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
    const products = await productManager.getProducts(limit);
    res.json({
      status: 'success',
      payload: products
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// GET /api/products/:pid - Obtener producto por ID
router.get('/:pid', async (req, res) => {
  try {
    const productId = parseInt(req.params.pid);
    const product = await productManager.getProductById(productId);
    res.json({
      status: 'success',
      payload: product
    });
  } catch (error) {
    res.status(404).json({
      status: 'error',
      message: error.message
    });
  }
});

// POST /api/products - Agregar nuevo producto
router.post('/', async (req, res) => {
  try {
    const newProduct = await productManager.addProduct(req.body);
    
    // ⭐ CONEXIÓN HTTP CON WEBSOCKET ⭐
    // Emitir evento de WebSocket para actualizar la vista en tiempo real
    const io = req.app.get('io');
    const products = await productManager.getProducts();
    io.emit('updateProducts', products);
    
    res.status(201).json({
      status: 'success',
      payload: newProduct
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// PUT /api/products/:pid - Actualizar producto
router.put('/:pid', async (req, res) => {
  try {
    const productId = parseInt(req.params.pid);
    const updatedProduct = await productManager.updateProduct(productId, req.body);
    
    // ⭐ CONEXIÓN HTTP CON WEBSOCKET ⭐
    const io = req.app.get('io');
    const products = await productManager.getProducts();
    io.emit('updateProducts', products);
    
    res.json({
      status: 'success',
      payload: updatedProduct
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// DELETE /api/products/:pid - Eliminar producto
router.delete('/:pid', async (req, res) => {
  try {
    const productId = parseInt(req.params.pid);
    const deletedProduct = await productManager.deleteProduct(productId);
    
    // ⭐ CONEXIÓN HTTP CON WEBSOCKET ⭐
    // Emitir evento de WebSocket para actualizar la vista en tiempo real
    const io = req.app.get('io');
    const products = await productManager.getProducts();
    io.emit('updateProducts', products);
    
    res.json({
      status: 'success',
      payload: deletedProduct,
      message: 'Producto eliminado correctamente'
    });
  } catch (error) {
    res.status(404).json({
      status: 'error',
      message: error.message
    });
  }
});

export default router;