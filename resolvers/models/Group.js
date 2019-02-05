/** Class representing users with methods to retrieve information about any user on GCconnex/GCcollab. */
class Group {

  /** 
   * Construct class with the mysql_db object needed to make queries
   * @param {object} mysql_db - The MySQL db connector object.
   */
  constructor(mysql_db){
    this.mysql_db = mysql_db;
  }

  async getNumGroups() {
    return new Promise( ( resolve, reject ) => {
      this.mysql_db.query(`SELECT COUNT(*) as count FROM elgggroups_entity`)
        .then(result => resolve(result[0].count));
    });
  }

  async getGroupsTimeSeries() {
    return new Promise( ( resolve, reject ) => {
      this.mysql_db.query(`
      SELECT FROM_UNIXTIME(ee.time_created) as createdAt, COUNT(*) as count FROM elgggroups_entity ge
      JOIN elggentities ee ON ee.guid = ge.guid
      group by DATE(FROM_UNIXTIME(ee.time_created))
      `).then(result => resolve(result));
    });
  }

  /** 
   * Get a user's information given args and requested fields from the db
   * @param {object} args - unique identifier.
   * @param {array of strings} requestedFields - unique identifier.
   */
  async getGroup(args, requestedFields) {
    var parameter_string = "";
    if (args.guid) {
      parameter_string = `WHERE guid = ${args.guid}`;
    } else {
      if (args.name) {
        parameter_string = `WHERE name LIKE "%${args.name}%"`;
      }
    }

    var requestedFields_string = "";
    requestedFields.map((field, array_index) => {
      
      if (array_index < requestedFields.length - 1) {
        requestedFields_string += field + ",";
      } else {
        requestedFields_string += field;
      }
      
    });

    // This needs to be a promise to work!
    return new Promise( ( resolve, reject ) => {
      var group = this.mysql_db.query(`SELECT ${requestedFields_string} FROM elgggroups_entity ${parameter_string}`)
        .then(result => resolve(result));
    });

  }

  async getUsers(args, requestedFields, array_guids) {
    var requestedFields_string = "";
    requestedFields.map((field, array_index) => {
      
      if (field === "last_action" || field === "last_login") {
        field = "FROM_UNIXTIME(" + field + ") as " + field;
      }
      if (array_index < requestedFields.length - 1) {
        requestedFields_string += field + ",";
      } else {
        requestedFields_string += field;
      }
      
    });

    var array_guid_string = "";
    array_guids.map((guid, array_index) => {

      if (array_index < array_guids.length - 1) {
        array_guid_string += guid + ",";
      } else {
        array_guid_string += guid;
      }
      
    });
    
    // This needs to be a promise to work!
    return new Promise( ( resolve, reject ) => {
      var user = this.mysql_db.query(`SELECT ${requestedFields_string} FROM elggusers_entity WHERE guid IN (${array_guid_string})`)
        .then(result => resolve(result));
    });
  }

  /** 
   * Get a users groups using either the user's name or guid
   * @param {object} args - object containing the GraphQL args object.
   * @param {array of strings} subFields - array containing desired fields of each colleague node.
   * @todo Implement nesting by returning a User object rather than an object containing guid and name. 
   *        -> (might be best to only return guid then simply perform a look up only on the requested User fields.)
   * @todo ONLY WORKS WITH NAME SO NESTING WONT WORK YET
   */
  async getMembers(args, subFields){

    if (args.guid) {
      var members = await this.mysql_db.query(`
        SELECT guid_one FROM elggentity_relationships 
        WHERE guid_two = ${args.guid} AND relationship = "member"
      `);
    }

    if (args.name) {
      var members = await this.mysql_db.query(`
        SELECT guid_one FROM elggentity_relationships er
        JOIN (SELECT guid from elgggroups_entity WHERE NAME LIKE "%${args.name}%") ue ON er.guid_two = ue.guid
        WHERE relationship = "member"
      `);
    }

    if (!args.name && ! args.guid) {
      return [];
    }
    

    var members_list = [];
    var guid_one_array = [];
    members.map((row) => {
      guid_one_array.push(row.guid_one);
    });

    if (subFields.length > 0) {
      var users = await this.getUsers(args, subFields, guid_one_array);
    }

    members.map((row, index) => {
      var user_result = {
        guid: row.guid_two,
      };
      subFields.map((field) => {
        user_result[field] = users[index][field];
      });
      members_list.push(user_result);
    });

    return members_list;
    
  }

}

module.exports = Group;