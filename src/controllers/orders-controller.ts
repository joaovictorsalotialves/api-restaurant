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
        throw new AppError("product not found")
      }

      await knex<OrderRepository>("orders").insert({
        table_session_id,
        product_id,
        quantity,
        price: product.price,
      })

      return response.status(201).json()
    } catch (error) {
      next(error)
    }
  }

  async index(request: Request, response: Response, next: NextFunction) {
    try {
      const table_session_id = z.string()
        .transform((value) => Number(value))
        .refine((value) => !isNaN(value), { message: "table_session_id must be a number" })
        .parse(request.params.table_session_id)

      const order = await knex("orders")
        .select(
          "orders.id", 
          "orders.table_session_id", 
          "orders.product_id", 
          "products.name", 
          "orders.price", 
          "orders.quantity",
          knex.raw("(orders.price * orders.quantity) AS total"),
          "orders.created_at",
          "orders.updated_at",
        )
        .join("products", "products.id", "orders.product_id")
        .where({ table_session_id })
        .orderBy("orders.created_at", "desc")

      return response.json(order)
    } catch (error) {
      next(error)
    }
  }

  async show(request: Request, response: Response, next: NextFunction) {
    try {
      const table_session_id = z.string()
        .transform((value) => Number(value))
        .refine((value) => !isNaN(value), { message: "table_session_id must be a number" })
        .parse(request.params.table_session_id)

      const orders = await knex("orders")
        .select(knex.raw("COALESCE(SUM(orders.price * orders.quantity), 0) AS total"))
        .select(knex.raw("COALESCE(SUM(orders.quantity), 0) AS quantity"))
        .where({ table_session_id })
        .first()

      return response.json(orders)
    } catch (error) {
      next(error)
    }
  }
}

export { OrdersController }
