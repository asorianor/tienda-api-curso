import express from 'express';
import { idParamsSchema, parse } from '../shared/validation.ts';
import { listProductsQuerySchema } from './schemas.ts';
import { getProduct, listProducts } from './service.ts';

export const productsRouter = express.Router();

productsRouter.get('/', (req, res) => {
  const filters = parse(listProductsQuerySchema, req.query);
  res.json(listProducts(filters));
});

productsRouter.get('/:id', (req, res) => {
  const { id } = parse(idParamsSchema, req.params);
  res.json(getProduct(id));
});
