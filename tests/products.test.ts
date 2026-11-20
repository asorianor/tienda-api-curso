import { describe, expect, it } from 'vitest';
import type { Product } from '../src/db/schema.ts';
import { api, createProduct } from './helpers.ts';

describe('GET /api/products', () => {
  it('devuelve el catálogo completo', async () => {
    const res = await api().get('/api/products');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(8);
    expect(res.body[0]).toEqual({
      id: 1,
      name: 'Teclado mecánico',
      category: 'electronica',
      priceCents: 8990,
      stock: 12,
    });
  });
});

describe('GET /api/products con filtros', () => {
  it('filtra por categoría', async () => {
    const maceta = createProduct({ name: 'Maceta', category: 'jardin' });
    const regadera = createProduct({ name: 'Regadera', category: 'jardin' });
    createProduct({ name: 'Grapadora', category: 'oficina' });

    const res = await api().get('/api/products').query({ category: 'jardin' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual([maceta, regadera]);
  });

  it('devuelve una lista vacía si ningún producto es de esa categoría', async () => {
    const res = await api().get('/api/products').query({ category: 'no-existe' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('filtra por precio máximo, incluido el propio límite', async () => {
    const justoEnElLimite = createProduct({ priceCents: 3000 });
    const unCentimoMas = createProduct({ priceCents: 3001 });
    const catalogo: Product[] = (await api().get('/api/products')).body;

    const res = await api().get('/api/products').query({ maxPriceCents: 3000 });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(catalogo.filter((product) => product.priceCents <= 3000));
    expect(res.body).toContainEqual(justoEnElLimite);
    expect(res.body).not.toContainEqual(unCentimoMas);
  });

  it('combina categoría y precio máximo', async () => {
    const barata = createProduct({ category: 'jardin', priceCents: 1500 });
    createProduct({ category: 'jardin', priceCents: 4500 });
    createProduct({ category: 'oficina', priceCents: 1500 });

    const res = await api().get('/api/products').query({ category: 'jardin', maxPriceCents: 3000 });

    expect(res.status).toBe(200);
    expect(res.body).toEqual([barata]);
  });

  it('ignora los parámetros que no son filtros', async () => {
    const sinFiltros = await api().get('/api/products');

    const res = await api().get('/api/products').query({ orden: 'precio' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(sinFiltros.body);
  });

  it.each([
    ['maxPriceCents=abc', 'maxPriceCents'],
    ['maxPriceCents=-100', 'maxPriceCents'],
    ['maxPriceCents=29.99', 'maxPriceCents'],
    ['maxPriceCents=', 'maxPriceCents'],
    ['category=', 'category'],
    ['category=%20%20', 'category'],
    ['category=hogar&category=libros', 'category'],
  ])('responde 400 con ?%s', async (query, field) => {
    const res = await api().get(`/api/products?${query}`);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toContainEqual(expect.objectContaining({ field }));
  });
});

describe('GET /api/products/:id', () => {
  it('devuelve el producto', async () => {
    const res = await api().get('/api/products/4');

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Cuaderno A5 de tapa dura');
  });

  it('responde 404 si no existe', async () => {
    const res = await api().get('/api/products/999');

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('PRODUCT_NOT_FOUND');
  });

  it('responde 400 si el id no es un número', async () => {
    const res = await api().get('/api/products/abc');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});
