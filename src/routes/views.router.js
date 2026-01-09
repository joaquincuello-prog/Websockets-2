import { Router } from 'express';
import productManager from '../managers/ProductManager.js';
import cartManager from '../managers/CartManager.js';

const router = Router();

// Vista home - Redirigir a /products
router.get('/', (req, res) => {
  res.redirect('/products');
});

// Vista products - Lista de productos con paginación
router.get('/products', async (req, res) => {
  try {
    const { page = 1, limit = 10, sort, query } = req.query;
    
    const result = await productManager.getProducts({
      page,
      limit,
      sort,
      query
    });

    const buildQueryString = (pageNum) => {
      const params = new URLSearchParams();
      params.set('page', pageNum);
      if (limit) params.set('limit', limit);
      if (sort) params.set('sort', sort);
      if (query) params.set('query', query);
      return params.toString();
    };

    res.render('products', {
      products: result.payload,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage ? `/products?${buildQueryString(result.prevPage)}` : null,
      nextLink: result.hasNextPage ? `/products?${buildQueryString(result.nextPage)}` : null,
      currentQuery: query || '',
      currentSort: sort || '',
      currentLimit: limit
    });
  } catch (error) {
    res.status(500).render('products', { 
      error: 'Error al cargar los productos',
      products: [],
      page: 1,
      totalPages: 0
    });
  }
});

// Vista producto individual
router.get('/products/:pid', async (req, res) => {
  try {
    const product = await productManager.getProductById(req.params.pid);
    res.render('productDetail', { product });
  } catch (error) {
    res.status(404).render('error', {
      message: 'Producto no encontrado',
      error: error.message
    });
  }
});

// ⭐ Vista carrito específico - ACTUALIZADA
router.get('/carts/:cid', async (req, res) => {
  try {
    const cart = await cartManager.getCartById(req.params.cid);
    
    // Calcular totales en el servidor
    let total = 0;
    let totalQuantity = 0;
    
    // Agregar subtotal a cada producto
    const productsWithSubtotal = cart.products.map(item => {
      const subtotal = item.product.price * item.quantity;
      total += subtotal;
      totalQuantity += item.quantity;
      
      return {
        product: {
          _id: item.product._id,
          title: item.product.title,
          description: item.product.description,
          code: item.product.code,
          price: item.product.price,
          category: item.product.category,
          stock: item.product.stock
        },
        quantity: item.quantity,
        subtotal: subtotal.toFixed(2)
      };
    });

    res.render('cart', {
      cartId: cart._id,
      products: productsWithSubtotal,
      total: total.toFixed(2),
      totalQuantity: totalQuantity,
      productCount: cart.products.length
    });
  } catch (error) {
    res.status(404).render('error', {
      message: 'Carrito no encontrado',
      error: error.message
    });
  }
});

// Vista realTimeProducts - Lista dinámica con WebSockets
router.get('/realtimeproducts', async (req, res) => {
  try {
    const result = await productManager.getProducts({ limit: 100 });
    res.render('realTimeProducts', { products: result.payload });
  } catch (error) {
    res.status(500).render('realTimeProducts', { 
      error: 'Error al cargar los productos',
      products: []
    });
  }
});

export default router;