import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ProductManager {
  constructor() {
    this.path = path.join(__dirname, '../data/products.json');
    this.products = [];
    this.init();
  }

  async init() {
    try {
      await this.loadProducts();
    } catch (error) {
      // Si el archivo no existe, lo creamos vacío
      await this.saveProducts();
    }
  }

  async loadProducts() {
    const data = await fs.readFile(this.path, 'utf-8');
    this.products = JSON.parse(data);
  }

  async saveProducts() {
    const dirPath = path.dirname(this.path);
    await fs.mkdir(dirPath, { recursive: true });
    await fs.writeFile(this.path, JSON.stringify(this.products, null, 2));
  }

  // GET / - Listar todos los productos
  async getProducts(limit) {
    await this.loadProducts();
    if (limit) {
      return this.products.slice(0, limit);
    }
    return this.products;
  }

  // GET /:pid - Obtener producto por ID
  async getProductById(id) {
    await this.loadProducts();
    const product = this.products.find(p => p.id === id);
    if (!product) {
      throw new Error(`Producto con id ${id} no encontrado`);
    }
    return product;
  }

  // POST / - Agregar nuevo producto
  async addProduct(productData) {
    await this.loadProducts();

    // Validar campos obligatorios
    const requiredFields = ['title', 'description', 'code', 'price', 'stock', 'category'];
    for (const field of requiredFields) {
      if (productData[field] === undefined || productData[field] === null || productData[field] === '') {
        throw new Error(`El campo ${field} es obligatorio`);
      }
    }

    // Verificar que el código no esté repetido
    const codeExists = this.products.some(p => p.code === productData.code);
    if (codeExists) {
      throw new Error(`Ya existe un producto con el código ${productData.code}`);
    }

    // Generar ID autoincrementable
    const newId = this.products.length > 0 
      ? Math.max(...this.products.map(p => p.id)) + 1 
      : 1;

    // Crear el nuevo producto con todos los campos
    const newProduct = {
      id: newId,
      title: productData.title,
      description: productData.description,
      code: productData.code,
      price: parseFloat(productData.price),
      status: productData.status !== undefined ? productData.status : true,
      stock: parseInt(productData.stock),
      category: productData.category,
      thumbnails: Array.isArray(productData.thumbnails) ? productData.thumbnails : []
    };

    this.products.push(newProduct);
    await this.saveProducts();
    return newProduct;
  }

  // PUT /:pid - Actualizar producto
  async updateProduct(id, updates) {
    await this.loadProducts();
    const index = this.products.findIndex(p => p.id === id);
    
    if (index === -1) {
      throw new Error(`Producto con id ${id} no encontrado`);
    }

    // No permitir actualizar el ID
    delete updates.id;

    // Actualizar el producto manteniendo el ID original
    this.products[index] = {
      ...this.products[index],
      ...updates
    };

    await this.saveProducts();
    return this.products[index];
  }

  // DELETE /:pid - Eliminar producto
  async deleteProduct(id) {
    await this.loadProducts();
    const index = this.products.findIndex(p => p.id === id);
    
    if (index === -1) {
      throw new Error(`Producto con id ${id} no encontrado`);
    }

    const deletedProduct = this.products.splice(index, 1)[0];
    await this.saveProducts();
    return deletedProduct;
  }
}

export default new ProductManager();