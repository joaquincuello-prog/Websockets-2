import { CartModel } from '../models/cart.model.js';

class CartManager {
  // POST / - Crear nuevo carrito
  async createCart() {
    try {
      const newCart = await CartModel.create({ products: [] });
      return newCart;
    } catch (error) {
      throw new Error('Error al crear carrito: ' + error.message);
    }
  }

  // GET /:cid - Obtener carrito por ID con populate
  async getCartById(id) {
    try {
      const cart = await CartModel.findById(id).populate('products.product');
      if (!cart) {
        throw new Error(`Carrito con id ${id} no encontrado`);
      }
      return cart;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // POST /:cid/product/:pid - Agregar producto al carrito
  async addProductToCart(cartId, productId) {
    try {
      const cart = await CartModel.findById(cartId);
      if (!cart) {
        throw new Error(`Carrito con id ${cartId} no encontrado`);
      }

      // Buscar si el producto ya existe en el carrito
      const productIndex = cart.products.findIndex(
        item => item.product.toString() === productId
      );

      if (productIndex !== -1) {
        // Si existe, incrementar quantity
        cart.products[productIndex].quantity += 1;
      } else {
        // Si no existe, agregarlo
        cart.products.push({ product: productId, quantity: 1 });
      }

      await cart.save();
      return await this.getCartById(cartId);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // DELETE /:cid/products/:pid - Eliminar producto del carrito
  async removeProductFromCart(cartId, productId) {
    try {
      const cart = await CartModel.findById(cartId);
      if (!cart) {
        throw new Error(`Carrito con id ${cartId} no encontrado`);
      }

      cart.products = cart.products.filter(
        item => item.product.toString() !== productId
      );

      await cart.save();
      return await this.getCartById(cartId);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // PUT /:cid - Actualizar todo el carrito
  async updateCart(cartId, products) {
    try {
      const cart = await CartModel.findById(cartId);
      if (!cart) {
        throw new Error(`Carrito con id ${cartId} no encontrado`);
      }

      cart.products = products;
      await cart.save();
      return await this.getCartById(cartId);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // PUT /:cid/products/:pid - Actualizar cantidad de un producto
  async updateProductQuantity(cartId, productId, quantity) {
    try {
      const cart = await CartModel.findById(cartId);
      if (!cart) {
        throw new Error(`Carrito con id ${cartId} no encontrado`);
      }

      const productIndex = cart.products.findIndex(
        item => item.product.toString() === productId
      );

      if (productIndex === -1) {
        throw new Error(`Producto con id ${productId} no encontrado en el carrito`);
      }

      cart.products[productIndex].quantity = quantity;
      await cart.save();
      return await this.getCartById(cartId);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // DELETE /:cid - Vaciar carrito
  async clearCart(cartId) {
    try {
      const cart = await CartModel.findById(cartId);
      if (!cart) {
        throw new Error(`Carrito con id ${cartId} no encontrado`);
      }

      cart.products = [];
      await cart.save();
      return cart;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

export default new CartManager();