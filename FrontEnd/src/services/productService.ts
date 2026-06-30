import api from './api';

export interface ProductPayload {
  name: string;
  description: string;
  price: number;
  stock: number;
  image?: string;
}

export interface ProductQueryParams {
  search?: string;
  page?: number;
  limit?: number;
}

export const productService = {
  // Seller - private
  getMyProducts: () => api.get('/products/my-products'),
  createProduct: (data: ProductPayload) => api.post('/products', data),
  updateProduct: (id: string, data: Partial<ProductPayload>) => api.put(`/products/${id}`, data),
  deleteProduct: (id: string) => api.delete(`/products/${id}`),

  // Public
  getAllProducts: (params?: ProductQueryParams) => api.get('/products', { params }),
  getProductById: (id: string) => api.get(`/products/${id}`),
};
