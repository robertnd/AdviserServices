import dotenv from 'dotenv'

// dotenv by default does not overwrite env variables once set
dotenv.config({ override:true })

export default {
    port: process.env.PORT,
    serving_name: process.env.SERVING_NAME,
    jwt_secret: process.env.JWT_SECRET,
    jwt_issuer: process.env.JWT_ISSUER,
    page_size: process.env.PAGE_SIZE,
    jwt_validity: process.env.JWT_VALIDITY,
    db_host: process.env.DB_HOST,
    db_port: process.env.DB_PORT,
    db_name: process.env.DB_NAME,
    db_user: process.env.DB_USER,
    db_password: process.env.DB_PASSWORD,
    store_events: process.env.STORE_EVENTS
}