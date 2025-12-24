import { Request, Response, NextFunction } from "express"
import { z } from "zod"

import { knex } from "@/database/knex"
import { AppError } from "@/utils/AppError"

class ProductsController {
  async index(request: Request, response: Response, next: NextFunction) {
    try {
      const { name } = request.query

      const products = await knex<ProductRepository>("products")
        .select()
        .whereLike("name", `%${name ?? ""}%`)
        .orderBy("name")

      return response.json(products)
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

  async update(request: Request, response: Response, next: NextFunction) {
    try {
      const id = z.string()
        .transform((value) => Number(value))
        .refine((value) => !isNaN(value), { message: "id must be a number" })
        .parse(request.params.id)

      const product = await knex<ProductRepository>("products")
        .select()
        .where({ id })
        .first()

      if (!product) {
        throw new AppError("product not found", 404)
      }

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

      await knex<ProductRepository>("products")
        .update({ name, price, updated_at: new Date() })
        .where({ id })

      return response.json()
    } catch (error) {
      next(error)
    }
  }

  async remove(request: Request, response: Response, next: NextFunction) {
    try {
      const id = z.string()
        .transform((value) => Number(value))
        .refine((value) => !isNaN(value), { message: "id must be a number" })
        .parse(request.params.id)

      const product = await knex<ProductRepository>("products")
        .select()
        .where({ id })
        .first()

      if (!product) {
        throw new AppError("product not found", 404)
      }

      await knex<ProductRepository>("products")
        .delete()
        .where({ id })

      return response.json()
    } catch (error) {
      next(error)
    }
  }
}

export { ProductsController }
