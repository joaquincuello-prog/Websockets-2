import { Router } from 'express';
import cartManager from '../managers/CartManager.js';

const router = Router();

// POST /api/carts - Crear nuevo carrito
router.post('/', async (req, res) => {
  try {
    const newCart = await cartManager.createCart();
    res.status(201).json({
      status: 'success',
      payload: newCart
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// GET /api/carts/:cid - Listar productos del carrito (con populate)
router.get('/:cid', async (req, res) => {
  try {
    const cart = await cartManager.getCartById(req.params.cid);
    res.json({
      status: 'success',
      payload: cart
    });
  } catch (error) {
    res.status(404).json({
      status: 'error',
      message: error.message
    });
  }
});

// POST /api/carts/:cid/product/:pid - Agregar producto al carrito
router.post('/:cid/product/:pid', async (req, res) => {
  try {
    const updatedCart = await cartManager.addProductToCart(
      req.params.cid,
      req.params.pid
    );
    res.json({
      status: 'success',
      payload: updatedCart,
      message: 'Producto agregado al carrito correctamente'
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// DELETE /api/carts/:cid/products/:pid - Eliminar producto del carrito
router.delete('/:cid/products/:pid', async (req, res) => {
  try {
    const updatedCart = await cartManager.removeProductFromCart(
      req.params.cid,
      req.params.pid
    );
    res.json({
      status: 'success',
      payload: updatedCart,
      message: 'Producto eliminado del carrito correctamente'
    });
  } catch (error) {
    res.status(404).json({
      status: 'error',
      message: error.message
    });
  }
});

// PUT /api/carts/:cid - Actualizar todo el carrito
router.put('/:cid', async (req, res) => {
  try {
    const { products } = req.body;
    
    if (!Array.isArray(products)) {
      return res.status(400).json({
        status: 'error',
        message: 'El campo products debe ser un array'
      });
    }

    const updatedCart = await cartManager.updateCart(req.params.cid, products);
    res.json({
      status: 'success',
      payload: updatedCart,
      message: 'Carrito actualizado correctamente'
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// PUT /api/carts/:cid/products/:pid - Actualizar cantidad de un producto
router.put('/:cid/products/:pid', async (req, res) => {
  try {
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        status: 'error',
        message: 'La cantidad debe ser mayor a 0'
      });
    }

    const updatedCart = await cartManager.updateProductQuantity(
      req.params.cid,
      req.params.pid,
      quantity
    );

    res.json({
      status: 'success',
      payload: updatedCart,
      message: 'Cantidad actualizada correctamente'
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// DELETE /api/carts/:cid - Vaciar carrito
router.delete('/:cid', async (req, res) => {
  try {
    const clearedCart = await cartManager.clearCart(req.params.cid);
    res.json({
      status: 'success',
      payload: clearedCart,
      message: 'Carrito vaciado correctamente'
    });
  } catch (error) {
    res.status(404).json({
      status: 'error',
      message: error.message
    });
  }
});

export default router;