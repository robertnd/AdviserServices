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
app.use(express.json())
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
