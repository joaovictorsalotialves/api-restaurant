import { Request, Response, NextFunction } from "express"
import { z } from "zod"

import { knex } from "@/database/knex"

export class TablesSessionsController {
  async create(request: Request, response: Response, next: NextFunction) {
    try {
      const bodySchema = z.object({
        table_id: z.number(),
      })

      const { table_id } = bodySchema.parse(request.body)

      await knex<TableSessionRepository>("tables_sessions").insert({
        table_id,
      })

      return response.status(201).json()
    } catch (error) {
      next(error)
    }
  }
}
