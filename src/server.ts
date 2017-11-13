import * as bodyParser from 'body-parser'
import * as cors from 'cors'
import * as session from 'express-session'
import * as mysqlSession from 'express-mysql-session'
import {NestFactory} from '@nestjs/core'
import {ApplicationModule} from './modules/app.module'
import {ENV} from "../config/env/development";

const MySQLStore = mysqlSession(session)
const options = {
  host: ENV.DB_HOST,
  port: ENV.DB_PORT,
  username: ENV.DB_USER,
  password: ENV.DB_PASS,
  database: ENV.DB_NAME,
  schema: {
    tableName: 'custom_sessions_table_name',
    columnNames: {
      session_id: 'custom_session_id',
      expires: 'custom_expires_column_name',
      data: 'custom_data_column_name'
    }
  }
}
const sessionStore = new MySQLStore(options)

async function bootstrap() {
  const app = await NestFactory.create(ApplicationModule)
  app.use(bodyParser.urlencoded({extended: false}))
  app.use(bodyParser.json())
  app.use(cors())
  app.use(session({
    key: 'hf_sid',
    secret: ENV.SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false
  }))
  await app.listen(3100)
}

bootstrap()
