var mysql = require('mysql');
var { MYSQL_CREDS } = require('../../creds');
//var sendMessageToRabbitMQ = require('../../rabbitmq/send-message');

/** Class containing MySQL connection along with asynchronous wrapper functions for making SQL queries 
 * Without the wrapper functions (Promises), munging operations inside async/await functions will not work. 
 */
class MySQLConnector {
  constructor() {
    this.connection = mysql.createConnection(
      MYSQL_CREDS
    );
  }

  /**
   * Query the MySQL database.
   * @return {Promise} The Promise object containing the result of the query.
   */
  query( sql, args ) {
    //sendMessageToRabbitMQ("gcconnex-graphql", "db requested");
    return new Promise( ( resolve, reject ) => {
      this.connection.query( sql, args, ( err, rows ) => {
        if ( err ) {
          console.log("SOMETHING IS WROGN !!!");
          console.log(err);
          return reject( err );
        }
          resolve( rows );
      });
    });
  }

  /** Close the connection with the MySQL database.*/
  close() {
    return new Promise( ( resolve, reject ) => {
      this.connection.end( err => {
        if ( err )
          return reject( err );
        resolve();
      });
    });
  }

}

module.exports = MySQLConnector;