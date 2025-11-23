import { Router } from 'express';
import productManager from '../managers/ProductManager.js';

const router = Router();

// Vista home - Lista estática de productos
router.get('/', async (req, res) => {
  try {
    const products = await productManager.getProducts();
    res.render('home', { products });
  } catch (error) {
    res.status(500).render('home', { 
      error: 'Error al cargar los productos',
      products: []
    });
  }
});

// Vista realTimeProducts - Lista dinámica con WebSockets
router.get('/realtimeproducts', async (req, res) => {
  try {
    const products = await productManager.getProducts();
    res.render('realTimeProducts', { products });
  } catch (error) {
    res.status(500).render('realTimeProducts', { 
      error: 'Error al cargar los productos',
      products: []
    });
  }
});

export default router;