/** Class representing users with methods to retrieve information about any user on GCconnex/GCcollab. */
class Mission {

  /** 
   * Construct class with the mysql_db object needed to make queries
   * @param {object} mysql_db - The MySQL db connector object.
   */
  constructor(mysql_db){
    this.mysql_db = mysql_db;
  }

  /** 
   * @todo implement getUsers in order to batch requests into single sql queries
   */
  async getUsers(requestedFields, array_guids) {
    
    var requestedFields_string = "";
    requestedFields.map((field, array_index) => {
      
      if (field === "last_action" || field === "last_login") {
        field = "FROM_UNIXTIME(" + field + ") as " + field;
      }
      if (field !== "__typename") {
        if (array_index < requestedFields.length - 1) {
          requestedFields_string += field + ",";
        } else {
          requestedFields_string += field;
        }
      } else {
        requestedFields_string = requestedFields_string.substr(0, requestedFields_string.length -1);
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
      this.mysql_db.query(`SELECT ${requestedFields_string} FROM elggusers_entity WHERE guid IN (${array_guid_string})`)
        .then(result => {resolve(result)});
    });
  }

  async getAllMissions(requestedFields, owner_fields) { 
    
    var requestedFields_string = "";
    requestedFields.map((field, array_index) => {
      if (field !== "__typename") {
        if (array_index < requestedFields.length - 1) {
          requestedFields_string += field + ",";
        } else {
          requestedFields_string += field;
        }
      }
      
      
    });

    // This needs to be a promise to work!
    return new Promise( ( resolve, reject ) => {
      var mission = this.mysql_db.query(
        `
        SELECT e.guid as guid, from_unixtime(e.time_created) as createdAt, from_unixtime(e.time_updated) as updatedAt, e.owner_guid as ownerGuid, ms.string as name, ms1.string as value FROM (SELECT * FROM elggentities WHERE subtype = 52) e
        JOIN elggmetadata md ON md.entity_guid = e.guid
        JOIN elggmetastrings ms ON ms.id = md.name_id
        JOIN elggmetastrings ms1 ON ms1.id = md.value_id
        `
      ).then(result => this.parseMissionData(result, requestedFields, owner_fields))
      .then(result => resolve( result ) );
    });
  }

  async getMission(args, requestedFields, owner_fields) {
    
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
      var mission = this.mysql_db.query(
        `
        SELECT e.guid as guid, from_unixtime(e.time_created) as createdAt, from_unixtime(e.time_updated) as updatedAt, e.owner_guid as ownerGuid, ms.string as name, ms1.string as value FROM (SELECT * FROM elggentities WHERE subtype = 52) e
        JOIN elggmetadata md ON md.entity_guid = e.guid
        JOIN elggmetastrings ms ON ms.id = md.name_id
        JOIN elggmetastrings ms1 ON ms1.id = md.value_id
        WHERE e.owner_guid = ${args.guid}
        `
      ).then(result => this.parseMissionData(result, requestedFields, owner_fields))
      .then(result => resolve( result[0] ) );
    });
  }

  async parseMissionData(rows, requestedFields, owner_fields) {
    var output = [];
    if (requestedFields.indexOf("owner") > -1) {
      var owner_guid_list = [];
    }
    var current;
    rows.map(row => {
      
      if (!current) {
        current = {};
        current["guid"] = row["guid"];
        current["ownerGuid"] = row["ownerGuid"]
      }
      if (current["guid"] !== row["guid"]) {
        current["createdAt"] = this.formatDate(row["createdAt"]);
        current["updatedAt"] = this.formatDate(row["updatedAt"]);
        if (owner_guid_list) {
          owner_guid_list.push(current["ownerGuid"]);
        }
        output.push(current);
        current = {"guid": row["guid"], "ownerGuid": row["ownerGuid"]};
      } else {
        if (row["value"].substr(0,9) === "missions:") {
          row["value"] = row["value"].substr(9, row["value"].length - 9);
        }
        switch(row["name"]) {
          case "descriptor": current["description"] = row["value"]; break;
          case "completion_date": current["completionDate"] = row["value"]; break;
          case "start_date": current["startDate"] = row["value"]; break;
          case "deadline": current["deadlineDate"] = row["value"]; break;
          case "job_title": current["title"] = row["value"]; break;
          case "key_skills": current["keySkills"] = row["value"]; break;
          case "role_type": current["roleType"] = row["value"]; break;
          case "job_type": current["jobType"] = row["value"]; break;
          case "program_area": current["programArea"] = row["value"]; break;
          case "gl_group": current["glGroup"] = row["value"]; break;
          case "gl_level": current["glLevel"] = row["value"]; break;
          case "time_commitment": current["timeCommitment"] = row["value"]; break;
          case "time_interval": current["timeInterval"] = row["value"]; break;
          default: current[row["name"]] = row["value"]; break;
        };
        
      }
    });
    
    if (owner_guid_list) {
      var newOutput = [];
      var owners = await this.getUsers(owner_fields, owner_guid_list);

      owners.map((owner) => {
        for (var i=0; i < output.length; i++) {
          
          if (output[i]["ownerGuid"] === owner["guid"]) {
            output[i]["owner"] = owner;
            newOutput.push(output[i]);
            
            output.splice(i, 1);
          }
        }
      });
      return newOutput;
      
    } else {
     
      return(output);
    }
  }

  formatDate(unix_timestamp) {
    var date = new Date(unix_timestamp);
    // Hours part from the timestamp
    
    var year = date.getFullYear();
    // Minutes part from the timestamp
    var month = "0" + date.getMonth();
    // Seconds part from the timestamp
    var day = "0" + date.getDay();

    return year + '-' + month.substr(-2) + '-' + day.substr(-2);
  }

}

module.exports = Mission;