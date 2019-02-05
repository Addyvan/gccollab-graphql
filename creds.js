require("dotenv").config();

const env = process.env;

const MYSQL_CREDS = {
  host: env.COLLAB_DB_HOST,
  user: env.COLLAB_DB_USER,
  password: env.COLLAB_DB_PASSWORD,
  database: env.COLLAB_DB_DATABASE_NAME,
  port: env.COLLAB_DB_PORT,
  multipleStatements: true
};

exports.MYSQL_CREDS = MYSQL_CREDS;