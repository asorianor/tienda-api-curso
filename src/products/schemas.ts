import { z } from 'zod';

/**
 * Filtros opcionales de GET /api/products. Llegan como texto en la query string.
 * Los parámetros que no aparecen aquí se ignoran, para no romper clientes que ya envíen otros.
 */
export const listProductsQuerySchema = z.object({
  category: z.string().trim().min(1).optional(),
  // Solo dígitos: z.coerce.number() convertiría "" en 0 y aceptaría cosas como "1e3" o " 30 "
  maxPriceCents: z
    .string()
    .regex(/^\d+$/, 'Debe ser un número entero de céntimos, sin signo ni decimales')
    .transform(Number)
    .optional(),
});
