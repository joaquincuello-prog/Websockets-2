import { ProductModel } from '../models/product.model.js';

class ProductManager {
  // GET / con paginación profesional
  async getProducts({ limit = 10, page = 1, sort, query } = {}) {
    try {
      // Construir filtro de búsqueda
      const filter = {};
      
      if (query) {
        // Búsqueda por categoría o disponibilidad
        if (query.includes('category:')) {
          const category = query.split(':')[1];
          filter.category = { $regex: category, $options: 'i' };
        } else if (query === 'available') {
          filter.status = true;
          filter.stock = { $gt: 0 };
        } else if (query === 'unavailable') {
          filter.$or = [
            { status: false },
            { stock: 0 }
          ];
        }
      }

      // Construir opciones de ordenamiento
      const sortOptions = {};
      if (sort === 'asc') {
        sortOptions.price = 1;
      } else if (sort === 'desc') {
        sortOptions.price = -1;
      }

      // Opciones de paginación
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: sortOptions,
        lean: true
      };

      const result = await ProductModel.paginate(filter, options);

      // Construir respuesta con formato requerido
      return {
        status: 'success',
        payload: result.docs,
        totalPages: result.totalPages,
        prevPage: result.prevPage,
        nextPage: result.nextPage,
        page: result.page,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
        prevLink: result.hasPrevPage ? `/api/products?page=${result.prevPage}&limit=${limit}${sort ? `&sort=${sort}` : ''}${query ? `&query=${query}` : ''}` : null,
        nextLink: result.hasNextPage ? `/api/products?page=${result.nextPage}&limit=${limit}${sort ? `&sort=${sort}` : ''}${query ? `&query=${query}` : ''}` : null
      };
    } catch (error) {
      throw new Error('Error al obtener productos: ' + error.message);
    }
  }

  // GET /:pid - Obtener producto por ID
  async getProductById(id) {
    try {
      const product = await ProductModel.findById(id);
      if (!product) {
        throw new Error(`Producto con id ${id} no encontrado`);
      }
      return product;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // POST / - Agregar nuevo producto
  async addProduct(productData) {
    try {
      // Verificar si el código ya existe
      const existingProduct = await ProductModel.findOne({ code: productData.code });
      if (existingProduct) {
        throw new Error(`Ya existe un producto con el código ${productData.code}`);
      }

      const newProduct = await ProductModel.create(productData);
      return newProduct;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // PUT /:pid - Actualizar producto
  async updateProduct(id, updates) {
    try {
      // No permitir actualizar el ID ni el código
      delete updates._id;
      delete updates.code;

      const updatedProduct = await ProductModel.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true }
      );

      if (!updatedProduct) {
        throw new Error(`Producto con id ${id} no encontrado`);
      }

      return updatedProduct;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // DELETE /:pid - Eliminar producto
  async deleteProduct(id) {
    try {
      const deletedProduct = await ProductModel.findByIdAndDelete(id);
      
      if (!deletedProduct) {
        throw new Error(`Producto con id ${id} no encontrado`);
      }

      return deletedProduct;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

export default new ProductManager();