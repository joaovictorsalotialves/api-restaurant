import { Request, Response, NextFunction } from "express"
import z from "zod"

import { knex } from "@/database/knex"

class ProductsController {
  async index(request: Request, response: Response, next: NextFunction) {
    try {
      return response.json({ message: "ok" })
    } catch (error) {
      next(error)
    }
  }

  async create(request: Request, response: Response, next: NextFunction) {
    try {
      const bodySchema = z.object({
        name: z
          .string({ required_error: "name is required!" })
          .trim()
          .min(6, "name must have at least 6 characters!"),
        price: z
          .number({ required_error: "price is required!" })
          .gt(0, "price must be greater than zero!"),
      })

      const { name, price } = bodySchema.parse(request.body)

      await knex<ProductRepository>("products").insert({ name, price })

      return response.status(201).json()
    } catch (error) {
      next(error)
    }
  }
}

export { ProductsController }
