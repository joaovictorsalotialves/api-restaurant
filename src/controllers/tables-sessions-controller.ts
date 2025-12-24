import { Request, Response, NextFunction } from "express"
import { z } from "zod"

import { AppError } from "@/utils/AppError"
import { knex } from "@/database/knex"

export class TablesSessionsController {
  async index(request: Request, response: Response, next: NextFunction) {
    try {
      const sessions = await knex<TableSessionRepository>("tables_sessions")
        .select()
        .orderBy("closed_at")

        return response.json(sessions)
    } catch (error) {
      next(error)
    }
  }

  async create(request: Request, response: Response, next: NextFunction) {
    try {
      const bodySchema = z.object({
        table_id: z.number(),
      })

      const { table_id } = bodySchema.parse(request.body)

      const session = await knex<TableSessionRepository>("tables_sessions")
        .select()
        .where({ table_id })
        .orderBy("opened_at", "desc")
        .first()

      if (session && !session.closed_at) {
        throw new AppError("this table is already open")
      }

      await knex<TableSessionRepository>("tables_sessions").insert({
        table_id,
      })

      return response.status(201).json()
    } catch (error) {
      next(error)
    }
  }
}
