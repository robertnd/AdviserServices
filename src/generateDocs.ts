// generateSwagger.ts
import swaggerJsdoc from 'swagger-jsdoc'
import fs from 'fs'
import path from 'path'
import swaggerOptions from './swaggerOptions'

const swaggerSpec = swaggerJsdoc(swaggerOptions)
const outputPath = path.join(__dirname, 'swagger-output.json')
fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2))
