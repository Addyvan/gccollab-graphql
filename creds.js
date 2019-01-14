require("dotenv").config();

const env = process.env;

const MYSQL_CREDS = {
  host: env.DB_HOST,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_DATABASE_NAME,
  port: env.DB_PORT
};

exports.MYSQL_CREDS = MYSQL_CREDS;