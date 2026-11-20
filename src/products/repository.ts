import { db } from '../db/memory.ts';
import type { Product } from '../db/schema.ts';

/** Criterios de búsqueda del catálogo. Los que no se indican no filtran. */
export interface ProductFilters {
  category?: string;
  maxPriceCents?: number;
}

export function findProducts(filters: ProductFilters = {}): Product[] {
  const { category, maxPriceCents } = filters;
  return db.products.filter(
    (product) =>
      (category === undefined || product.category === category) &&
      (maxPriceCents === undefined || product.priceCents <= maxPriceCents),
  );
}

export function findProductById(id: number): Product | undefined {
  return db.products.find((product) => product.id === id);
}

export function updateStock(productId: number, stock: number): void {
  const product = findProductById(productId);
  if (product) product.stock = stock;
}
