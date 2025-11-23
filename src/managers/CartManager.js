import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CartManager {
  constructor() {
    this.path = path.join(__dirname, '../data/carts.json');
    this.carts = [];
    this.init();
  }

  async init() {
    try {
      await this.loadCarts();
    } catch (error) {
      // Si el archivo no existe, lo creamos vacío
      await this.saveCarts();
    }
  }

  async loadCarts() {
    const data = await fs.readFile(this.path, 'utf-8');
    this.carts = JSON.parse(data);
  }

  async saveCarts() {
    const dirPath = path.dirname(this.path);
    await fs.mkdir(dirPath, { recursive: true });
    await fs.writeFile(this.path, JSON.stringify(this.carts, null, 2));
  }

  // POST / - Crear nuevo carrito
  async createCart() {
    await this.loadCarts();

    // Generar ID autoincrementable
    const newId = this.carts.length > 0 
      ? Math.max(...this.carts.map(c => c.id)) + 1 
      : 1;

    const newCart = {
      id: newId,
      products: []
    };

    this.carts.push(newCart);
    await this.saveCarts();
    return newCart;
  }

  // GET /:cid - Obtener carrito por ID
  async getCartById(id) {
    await this.loadCarts();
    const cart = this.carts.find(c => c.id === id);
    if (!cart) {
      throw new Error(`Carrito con id ${id} no encontrado`);
    }
    return cart;
  }

  // POST /:cid/product/:pid - Agregar producto al carrito
  async addProductToCart(cartId, productId) {
    await this.loadCarts();
    const cartIndex = this.carts.findIndex(c => c.id === cartId);
    
    if (cartIndex === -1) {
      throw new Error(`Carrito con id ${cartId} no encontrado`);
    }

    // Buscar si el producto ya existe en el carrito
    const productIndex = this.carts[cartIndex].products.findIndex(
      p => p.product === productId
    );

    if (productIndex !== -1) {
      // Si el producto ya existe, incrementar quantity
      this.carts[cartIndex].products[productIndex].quantity += 1;
    } else {
      // Si no existe, agregarlo con quantity = 1
      this.carts[cartIndex].products.push({
        product: productId,
        quantity: 1
      });
    }

    await this.saveCarts();
    return this.carts[cartIndex];
  }
}

export default new CartManager();