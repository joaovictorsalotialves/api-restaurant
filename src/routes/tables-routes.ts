import { Router } from "express"

import { TablesController } from "@/controllers/tables-controllers"

const tablesRoutes = Router()
const tablesController = new TablesController()

tablesRoutes.get("/", tablesController.index)

export { tablesRoutes }
