// Connector
var MySQLConnector = require('./connectors/mysql');

// Models
var User = require('./models/User');
var Mission = require('./models/Mission');

var db = new MySQLConnector();
var user_model = new User(db);
var mission_model = new Mission(db);

const resolverMap = {

  Date: {
    __parseValue(value) {
      return new Date(value); // value from the client
    },
    __serialize(value) {
      return moement(value).format('DD-MM-YYYY'); // value sent to the client
    },
    __parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return parseInt(ast.value, 10); // ast value is always in string format
      }
      return null;
    }
  },

  Query: {
    
    description: () => `This is an API for accessing data on GCconnex using GraphQL`,

    user: async (root, args, context, info) => {
      var results = {};
      var fields = createFieldsObject(info); // parse the info object to get the desired fields
      var user_fields = []; // stores any fields in elggusers_entity
      
      // Loop through the selected fields and provide requested data given the args provided
      fields.map((field) => {
        
        if ( field.name === 'guid' ) {

          if ( args.guid ) {
            results.guid = args.guid;
          } else {
            user_fields.push('guid');
          }

        }

        if ( field.name === 'name' ) {
          
          if ( args.name ) {
            results.name = args.name;
          } else {
            user_fields.push('name');
          }

        }

        if ( field.name === 'language' ) {
          
          if ( args.language ) {
            results.language = args.language;
          } else {
            user_fields.push('language');
          }

        }

        if ( field.name === 'email' ) {
          
          if ( args.email ) {
            results.email = args.email;
          } else {
            user_fields.push('email');
          }

        }

        if ( field.name === 'last_action' ) {
          
          if ( args.last_action ) {
            results.last_action = args.last_action;
          } else {
            user_fields.push('last_action');
          }

        }

        if ( field.name === 'last_login' ) {
          
          if ( args.last_login ) {
            results.last_login = args.last_login;
          } else {
            user_fields.push('last_login');
          }

        }

        // args logic moved to the user_model function
        // Nested queries aren't implemented yet, going to look into data loader / optimization techniques first
        if ( field.name === 'colleagues' ) {
          
          results.colleagues = user_model.getColleagues(args, field.subFields);
          
        }

      });
      
      user_results = await user_model.getUser(args, user_fields);
      
      user_fields.map((field) => {
        if (field === "last_action" || field === "last_login")
          results[field] = user_results[0][field].toString();
        else
          results[field] = user_results[0][field];
      });
      
      return(results);
    },
    missions: async (root, args, context, info) => {
      var fields = createFieldsObject(info);
      var requested_fields = [];
      var owner_fields = []; // stores any fields in elggusers_entity
      var output = {};
      
      fields.map((field) => {
        switch(field.name) {
          case "owner": requested_fields.push("owner"); owner_fields = field.subFields; break;
          case "createdAt": requested_fields.push("createdAt"); break;
          case "updatedAt": requested_fields.push("updatedAt"); break;
          case "department": requested_fields.push("department"); break;
          case "description": requested_fields.push("description"); break;
          case "completionDate": requested_fields.push("completionDate"); break;
          case "deadlineDate": requested_fields.push("startDate"); break;
          case "state": requested_fields.push("state"); break;
          case "english": requested_fields.push("english"); break;
          case "french": requested_fields.push("french"); break;
          case "glGroup": requested_fields.push("glGroup"); break;
          case "title": requested_fields.push("title"); break;
          case "title2": requested_fields.push("title2"); break;
          case "jobType": requested_fields.push("jobType"); break;
          case "location": requested_fields.push("location"); break;
          case "keySkills": requested_fields.push("keySkills"); break;
          case "programArea": requested_fields.push("programArea"); break;
          case "roleType": requested_fields.push("roleType"); break;
          case "timeCommitment": requested_fields.push("timeCommitment"); break;
          default: console.log("invalid field: " + field.name); break;
        }
      });

      output = await mission_model.getAllMissions(requested_fields, owner_fields);

      return (output);
    }
    
  }



};

/**
 * Function to parse fields object and return list
 * @param {info} - GraphQL info object
 * @todo implement recursive parsing for deeply nested queries
 */
function createFieldsObject(info) {
  var i = 1;
  rootNode = {name:"root", children: []};
  currentParent = null;
  leaves = [];

  function traverseSelection( selection ) {

    if ( selection.selectionSet ) {
      if (!currentParent) {
        currentParent = { 
          name: selection.name.value,
          parent: rootNode,
          children: []
        };
        rootNode.children.push(currentParent);
      } else {
        currentParent = { 
          name: selection.name.value,
          parent: currentParent,
          children: []
        };
      }
      
      
      selection.selectionSet.selections.map( (selection) => traverseSelection(selection) );
    } else {
      if (!currentParent) {
        leaf = {
          name: selection.name.value,
          parent: rootNode,
          children: null
        };
        rootNode.children.push(leaf);
        leaves.push(leaf);
      } else {
        var leaf = {
          name: selection.name.value,
          parent: currentParent,
          children: null
        };
        currentParent.children.push(leaf);
        leaves.push(leaf);
      }
    }

  }
  
  // START ON EACH ROOT NODE
  info.fieldNodes[0].selectionSet.selections.map((rootSelection) => {
    traverseSelection(rootSelection);
  });


  var visitFunction = (name) => {console.log(name);};
  /**
   * 
   * @param {*} node The node in currently in question (Start with the root!)
   * @param {*} fn The visit function to be called
   */
  function PostOrderTreeTraversal(node, callback) {
    //visit the node
    if (node.children) {
      node.children.map((child) => PostOrderTreeTraversal(child, visitFunction));
      callback(node.name);
    }
    else {
      callback(node.name + " *leaf*");
    }
    
  }
  
  PostOrderTreeTraversal(rootNode, visitFunction);
  
  
  var fields = [];

  info.fieldNodes[0].selectionSet.selections.map((fieldObj) => {
        
    if (fieldObj.selectionSet) {
      var subselections = [];
      fieldObj.selectionSet.selections.map((fieldobj) => {
        subselections.push(fieldobj.name.value);
      });
      fields.push({
        name: fieldObj.name.value,
        subFields: subselections
      });
    } else {
      fields.push({name: fieldObj.name.value});
    }

  });
  
  return fields;

}

module.exports = resolverMap;
