// Helpers
var createFieldsObject = require("./helpers/createFieldsObject");
var getDepartment = require("./helpers/getDepartment");
var getLocation = require("./helpers/getLocation");
var getProgramArea = require("./helpers/getProgramArea");
var formatTimeSeries = require("./helpers/formatTimeSeries");

// Connector
var MySQLConnector = require('./connectors/mysql');

// Models
var User = require('./models/User');
var Group = require('./models/Group');
var Mission = require('./models/Mission');

var db = new MySQLConnector();
var user_model = new User(db);
var mission_model = new Mission(db);
var group_model = new Group(db);

var moment = require("moment");

const resolverMap = {

  Date: {
    __parseValue(value) {
      return new Date(value); // value from the client
    },
    __serialize(value) {
      return moment(value).format('YYYY-MM-DD'); // value sent to the client
    },
    __parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return parseInt(ast.value, 10); // ast value is always in string format
      }
      return null;
    }
  },

  Query: {
    
    description: () => `This is an API for accessing data on GCcollab using GraphQL`,

    summary: async (root, args, context, info) => {
      var results = {};
      var numUsers = await user_model.getNumUsers();
      var numGroups = await group_model.getNumGroups();
      var usersTimeSeries = await user_model.getUsersTimeSeries();
      var groupsTimeSeries = await group_model.getGroupsTimeSeries();

      results = {
        numUsers: numUsers,
        numGroups: numGroups,
        usersTimeSeries: formatTimeSeries(usersTimeSeries),
        groupsTimeSeries: formatTimeSeries(groupsTimeSeries)
      };
      return results;
    },

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

    group: async (root, args, context, info) => {
      var results = {};
      var fields = createFieldsObject(info);
      var group_fields = [];

      fields.map((field) => {

        if ( field.name === 'guid' ) {

          if ( args.guid ) {
            results.guid = args.guid;
          } else {
            group_fields.push('guid');
          }

        }

        if ( field.name === 'name' ) {
          
          if ( args.name ) {
            results.name = args.name;
          } else {
            group_fields.push('name');
          }

        }

        if ( field.name === 'description' ) {
          
          if ( args.description ) {
            results.description = args.description;
          } else {
            group_fields.push('description');
          }

        }

        if ( field.name === 'members' ) {
          
          results.members = group_model.getMembers(args, field.subFields);
          
        }

      });

      group_results = await group_model.getGroup(args, group_fields);
      
      group_fields.map((field) => {
        results[field] = group_results[0][field];
      });
        
      return(results);
    },

    missions: async (root, args, context, info) => {
      var fields = createFieldsObject(info);
      var requested_fields = [];
      var requested_args = {};
      var owner_fields = []; // stores any fields in elggusers_entity
      var output = {};

      if (args.department) {
        requested_args["department"] = getDepartment(args.department);
      }

      if (args["location"]) {
        requested_args["location"] = getLocation(args["location"]);
      }

      if (args.programArea) {
        requested_args["programArea"] = getProgramArea(args.programArea);
      }

      if (args.roleType) {
        if (args.roleType === "OFFERING")
          requested_args["roleType"] = "offering";
        else {
          if(args.roleType === "SEEKING") {
            requested_args["roleType"] = "seeking";
          } else {
            requested_args["roleType"] = "both";
          }
        }  
      }
      
      fields.map((field) => {
        switch(field.name) {
          case "owner": requested_fields.push("owner"); owner_fields = field.subFields; break;
          case "createdAt": requested_fields.push("createdAt"); break;
          case "updatedAt": requested_fields.push("updatedAt"); break;
          case "department": requested_fields.push("department"); break;
          case "description": requested_fields.push("description"); break;
          case "completionDate": requested_fields.push("completionDate"); break;
          case "deadlineDate": requested_fields.push("deadlineDate"); break;
          case "startDate": requested_fields.push("startDate"); break;
          case "state": requested_fields.push("state"); break;
          case "english": requested_fields.push("english"); break;
          case "french": requested_fields.push("french"); break;
          case "glGroup": requested_fields.push("glGroup"); break;
          case "title": requested_fields.push("title"); break;
          case "title2": requested_fields.push("title2"); break;
          case "jobType": requested_fields.push("job_type"); break;
          case "security": requested_fields.push("security"); break;
          case "location": requested_fields.push("location"); break;
          case "keySkills": requested_fields.push("keySkills"); break;
          case "programArea": requested_fields.push("programArea"); break;
          case "roleType": requested_fields.push("roleType"); break;
          case "timeCommitment": requested_fields.push("timeCommitment"); break;
          case "timeInterval": requested_fields.push("timeInterval"); break;
          case "__typename": break;
          default: console.log("invalid field: " + field.name); break;
        }
      });

      if (requested_args !== {}) {
        output = await mission_model.getMissions(requested_args, requested_fields, owner_fields);
      } else {
        output = await mission_model.getAllMissions(requested_fields, owner_fields);
      }

      return (output);
    },

    enumMetaData: (root, args, context, info) => { 
      
      if (args.enum == "MISSION_ROLE_TYPE") {
        return(["OFFERING", "SEEKING", "BOTH"]);
      }
      
      if (args.enum == "MISSION_PROGRAM_AREA") {
        return([
          "ADMINISTRATION", 
          "CLIENT_SERVICE",
          "LEGAL_AND_OR_REGULATORY",
          "SECURITY_AND_OR_ENFORCEMENT",
          "HUMAN_RESOURCES",
          "POLICY",
          "COMMUNICATIONS",
          "SCIENCE",
          "INFORMATION_TECHNOLOGY",
          "OTHER",
          "ALL"
        ]);
      }

      if (args.enum == "MISSION_LOCATION") {
        return([
          "BRITISH_COLUMBIA",
          "ALBERTA",
          "SASKATCHEWAN",
          "MANITOBA",
          "ONTARIO",
          "QUEBEC",
          "NATIONAL_CAPITAL_REGION",
          "NEW_BRUNSWICK",
          "NOVA_SCOTIA",
          "ALL"
        ]);
      }

      if (args.enum == "DEPARTMENT") {
        return([
          "TREASURY_BOARD_SECRETARIAT",
          "SHARED_SERVICES_CANADA",
          "GLOBAL_AFFAIRS_CANADA",
          "CARLETON_UNIVERSITY",
          "UNIVERSITY_OF_OTTAWA",
          "EMPLOYMENT_AND_SOCIAL_DEVELOPMENT_CANADA",
          "IMMIGRATION_REFUGEES_AND_CITIZENSHIP_CANADA",
          "NATURAL_RESOURCES_CANADA",
          "PARKS_CANADA",
          "NATIONAL_DEFENCE",
          "CANADA_BORDER_SERVICES_AGENCY",
          "INDIGENOUS_AND_NORTHERN_AFFAIRS_CANADA",
          "PUBLIC_SERVICES_AND_PROCUREMENT_CANADA",
          "AGRICULTURE_AND_AGRIFOOD_CANADA",
          "STUDENT",
          "DEPARTMENT_OF_JUSTICE_CANADA",
          "FISHERIES_AND_OCEANS",
          "CANADIAN_FOOD_INSPECTION_AGENCY",
          "CANADA_REVENUE_AGENCY",
          "PUBLIC_SERVICE_COMMISSION_OF_CANADA",
          "INNOVATION_SCIENCE_AND_ECONOMIC_DEVELOPMENT_CANADA",
          "PRIVY_COUNCIL_OFFICE",
          "ENVIRONMENT_AND_CLIMATE_CHANGE_CANADA",
          "HEALTH_CANADA",
          "VETERANS_AFFAIRS_CANADA",
          "PUBLIC_SAFETY_CANADA",
          "SENATE_OF_CANADA",
          "DEPARMENT_OF_FINANCE_CANADA",
          "WESTERN_ECOCONOMIC_DIVERSIFICATION_CANADA",
          "CANADIAN_HERITAGE",
          "ELECTIONS_CANADA",
          "TRANSPORT_CANADA",
          "CANADA_SCHOOL_OF_PUBLIC_SERVICE",
          "SERVICE_CANADA",
          "COURTS_ADMINISTRATION_SERVICE",
          "STATISTICS_CANADA",
          "CORRECTIONAL_SERVICE_CANADA",
          "NATIONAL_FILM_BOARD",
          "PAROLE_BOARD_OF_CANADA",
          "LIBRARY_AND_ARCHIVES_CANADA",
          "CANADA_ECONOMIC_DEVELOPMENT_FOR_QUEBEC_REGIONS",
          "MILITARY_POLICE_COMPLAINTS_COMMISSION_OF_CANADA",
          "CANADIAN_RADIO_TELEVISION_AND_TELECOMMUNICATIONS_COMMISSION",
          "CANADIAN_INSTITUTE_OF_HEALTH_RESEARCH",
          "PUBLIC_HEALTH_AGENCY_OF_CANADA",
          "CANADA_COUNCIL_FOR_THE_ARTS",
          "CANADIAN_HUMAN_RIGHTS_COMMISSION",
          "QUEENS_UNIVERSITY",
          "CANADIAN_COAST_GUARD",
          "ABORIGINAL_BUSINESS_CANADA",
          "NATIONAL_CAPITAL_COMMISSION",
          "INFRASTRUCTURE_CANADA",
          "OFFICE_OF_THE_SUPERINTENDENT_OF_BANKRUPTCY_CANADA",
          "DEFENCE_RESEARCH_AND_DEVELOPMENT_CANADA",
          "CANADIAN_ENVIRONMENTAL_ASSESSMENT_AGENCY",
          "CROWN_INDIGENOUS_RELATIONS_AND_NORTHERN_AFFAIRS_CANADA",
          "OFFICE_OF_THE_AUDITOR_GENERAL_OF_CANADA",
          "ROYAL_CANADIAN_NAVY",
          "COMPETITION_BUREAU_CANADA",
          "ALGONQUIN_COLLEGE",
          "POLICY_HORIZONS_CANADA",
          "SUPREME_COURT_OF_CANADA",
          "OFFICE_OF_THE_SECRETARY_TO_THE_GOVERNOR_GENERAL",
          "NATIONAL_RESEARCH_COUNCIL_CANADA",
          "PASSPORT_CANADA",
          "ROYAL_CANADIAN_MOUNTED_POLICE",
          "POLAR_KNOWLEDGE_CANADA",
          "CANADIAN_SPACE_AGENCY",
          "YORK_UNIVERSITY",
          "CANADA_EMPLOYMENT_INSURANCE_COMMISSION",
          "HOUSE_OF_COMMONS",
          "OFFICE_OF_THE_COMMISSIONER_OF_OFFICIAL_LANGUAGES",
          "CANADIAN_INTELLECTUAL_PROPERTY_OFFICE",
          "ADMINISTRATIVE_TRIBUNALS_SUPPORT_SERVICE_OF_CANADA",
          "IMMIGRATION_AND_REFUGEE_BOARD_OF_CANADA",
          "NOT_SPECIFIED_AND_OTHER",
          "ALL"
        ]);
      }

    }
    
  }



};

module.exports = resolverMap;