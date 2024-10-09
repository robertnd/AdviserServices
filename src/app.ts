import express from 'express'
import * as winston from 'winston'
import * as expressWinston from 'express-winston'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import { AdviserRoutes } from './app/modules/v1/advisers/routes/adviser.routes'
import fs from 'fs'
import path from 'path'
import { AdminRoutes } from './app/modules/admin/routes/admin.routes'

const app: express.Application = express()

// import helmet from "helmet"
// app.use(helmet()) header
app.use(cors())
// app.use(expressWinston.logger({
//     transports: [new winston.transports.Console()],
//     format: winston.format.combine(
//         winston.format.colorize(),
//         winston.format.json()
//     )
// }))

// Large uploads enablement
// app.use(express.text({ limit: "50mb" }))
app.use(express.json({ limit: "50mb" }))
app.use(
  express.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 })
)
app.use(express.json())
// app.use(express.text())

app.use(expressWinston.errorLogger({
    transports: [new winston.transports.Console()],
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.json()
    )
}))

// routes
app.use('/api/v1/adviser', AdviserRoutes)
app.use('/api/v1/admin', AdminRoutes)

const swaggerDoc = JSON.parse(fs.readFileSync(path.join(__dirname, 'swagger-output.json'), 'utf8'));

//app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerOutput))
// app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerOutput))
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc))

app.get('/', (req: express.Request, res: express.Response) => {
    res.send('Hello from Services')
})

export default app
