import { Request, Response, NextFunction } from "express"
import { z } from "zod"

import { knex } from "@/database/knex"
import { AppError } from "@/utils/AppError"

class OrdersController {
  async create(request: Request, response: Response, next: NextFunction) {
    try {
      const bodySchema = z.object({
        table_session_id: z.number(),
        product_id: z.number(),
        quantity: z.number(),
      })

      const { table_session_id, product_id, quantity } = bodySchema.parse(request.body)

      const session = await knex<TableSessionRepository>("tables_sessions")
        .where({ id: table_session_id })
        .first()

      if (!session) {
        throw new AppError("session table not found", 404)
      }

      if (session.closed_at) {
        throw new AppError("this session table is already closed")
      }

      const product = await knex<ProductRepository>("products")
        .where({ id: product_id })
        .first()

      if (!product) {
        throw new AppError("product not found", 400)
      }

      return response.status(201).json()
    } catch (error) {
      next(error)
    }
  }
}

export { OrdersController }
