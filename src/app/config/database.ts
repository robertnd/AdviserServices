import { Pool } from 'pg'
import config from '.'

// Local
// const pool = new Pool({
//   host: 'localhost',
//   user: 'omserviceuser',
//   password: 'S@rviceUser',
//   database: 'OMPORTAL',
//   port: 5438,
//   idleTimeoutMillis: 90000
// })

// AWS
const pool = new Pool({
  host: config.db_host,
  user: config.db_user,
  password: config.db_password,
  database: config.db_name,
  port: Number(config.db_port),
  idleTimeoutMillis: 90000
})

export default pool