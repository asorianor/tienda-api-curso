import type { Product } from '../db/schema.ts';
import { AppError } from '../shared/errors.ts';
import { findProductById, findProducts, type ProductFilters } from './repository.ts';

export function listProducts(filters: ProductFilters = {}): Product[] {
  return findProducts(filters);
}

export function getProduct(id: number): Product {
  const product = findProductById(id);
  if (!product) {
    throw new AppError(404, 'PRODUCT_NOT_FOUND', `No existe el producto ${id}`);
  }
  return product;
}
