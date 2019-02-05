const { ApolloServer, gql } = require('apollo-server');

const typeDefs = gql`

  scalar Date

  type Mission {
    owner: User #
    createdAt: String #
    updatedAt: String #
    department: String #
    description: String #
    completionDate: String #
    deadlineDate: String #
    startDate: String #
    state: String #
    english: String #
    french: String #
    glGroup: String #
    title: String #
    title2: String #
    jobType: String #
    location: String #
    security: String #
    keySkills: String #
    programArea: String #
    roleType: String #
    timeCommitment: String # munging needed to make all 40hr work week
    timeInterval: String # ^
  }

  type User {
    guid: ID!
    createdAt: Date
    last_action: Date
    last_login: Date
    language: String
  }

  type Group {
    guid: ID!
    name: String!
    description: String
    members: [User]
  }

  type TimeSeriesData {
    dates: [Date],
    values: [Int]
  }

  type Summary {
    numUsers: Int
    numGroups: Int
    usersTimeSeries: TimeSeriesData
    groupsTimeSeries: TimeSeriesData
  }

  type Query {
    summary: Summary!
    description: String
    user(guid: ID): User!
    group(guid: ID, name: String): Group
    missions(
      owner: UserInput, 
      department: DepartmentEnum,
      roleType: MissionRoleTypeEnum,
      location: MissionLocationEnum,
      programArea: MissionProgramAreaEnum
      ): [Mission]!
    enumMetaData(enum: EnumMetaDataEnum!): [String]
  }

  input UserInput {
    guid: ID!
  }

  enum EnumMetaDataEnum {
    MISSION_ROLE_TYPE
    MISSION_PROGRAM_AREA
    MISSION_LOCATION
    DEPARTMENT
  }

  enum MissionRoleTypeEnum {
    OFFERING
    SEEKING
    BOTH
  }

  enum MissionProgramAreaEnum {
    ADMINISTRATION
    CLIENT_SERVICE
    LEGAL_AND_OR_REGULATORY
    SECURITY_AND_OR_ENFORCEMENT
    HUMAN_RESOURCES
    POLICY
    COMMUNICATIONS
    SCIENCE
    INFORMATION_TECHNOLOGY
    OTHER
    ALL
  }

  enum MissionLocationEnum {
    BRITISH_COLUMBIA
    ALBERTA
    SASKATCHEWAN
    MANITOBA
    ONTARIO
    QUEBEC
    NATIONAL_CAPITAL_REGION
    NEW_BRUNSWICK
    NOVA_SCOTIA
    ALL
  }

  enum DepartmentEnum {
    TREASURY_BOARD_SECRETARIAT
    SHARED_SERVICES_CANADA
    GLOBAL_AFFAIRS_CANADA
    CARLETON_UNIVERSITY
    UNIVERSITY_OF_OTTAWA
    EMPLOYMENT_AND_SOCIAL_DEVELOPMENT_CANADA
    IMMIGRATION_REFUGEES_AND_CITIZENSHIP_CANADA
    NATURAL_RESOURCES_CANADA
    PARKS_CANADA
    NATIONAL_DEFENCE
    CANADA_BORDER_SERVICES_AGENCY
    INDIGENOUS_AND_NORTHERN_AFFAIRS_CANADA
    PUBLIC_SERVICES_AND_PROCUREMENT_CANADA
    AGRICULTURE_AND_AGRIFOOD_CANADA
    STUDENT
    DEPARTMENT_OF_JUSTICE_CANADA
    FISHERIES_AND_OCEANS
    CANADIAN_FOOD_INSPECTION_AGENCY
    CANADA_REVENUE_AGENCY
    PUBLIC_SERVICE_COMMISSION_OF_CANADA
    INNOVATION_SCIENCE_AND_ECONOMIC_DEVELOPMENT_CANADA
    PRIVY_COUNCIL_OFFICE
    ENVIRONMENT_AND_CLIMATE_CHANGE_CANADA
    HEALTH_CANADA
    VETERANS_AFFAIRS_CANADA
    PUBLIC_SAFETY_CANADA
    SENATE_OF_CANADA
    DEPARMENT_OF_FINANCE_CANADA
    WESTERN_ECOCONOMIC_DIVERSIFICATION_CANADA
    CANADIAN_HERITAGE
    ELECTIONS_CANADA
    TRANSPORT_CANADA
    CANADA_SCHOOL_OF_PUBLIC_SERVICE
    SERVICE_CANADA
    COURTS_ADMINISTRATION_SERVICE
    STATISTICS_CANADA
    CORRECTIONAL_SERVICE_CANADA
    NATIONAL_FILM_BOARD
    PAROLE_BOARD_OF_CANADA
    LIBRARY_AND_ARCHIVES_CANADA
    CANADA_ECONOMIC_DEVELOPMENT_FOR_QUEBEC_REGIONS
    MILITARY_POLICE_COMPLAINTS_COMMISSION_OF_CANADA
    CANADIAN_RADIO_TELEVISION_AND_TELECOMMUNICATIONS_COMMISSION
    CANADIAN_INSTITUTE_OF_HEALTH_RESEARCH
    PUBLIC_HEALTH_AGENCY_OF_CANADA
    CANADA_COUNCIL_FOR_THE_ARTS
    CANADIAN_HUMAN_RIGHTS_COMMISSION
    QUEENS_UNIVERSITY
    CANADIAN_COAST_GUARD
    ABORIGINAL_BUSINESS_CANADA
    NATIONAL_CAPITAL_COMMISSION
    INFRASTRUCTURE_CANADA
    OFFICE_OF_THE_SUPERINTENDENT_OF_BANKRUPTCY_CANADA
    DEFENCE_RESEARCH_AND_DEVELOPMENT_CANADA
    CANADIAN_ENVIRONMENTAL_ASSESSMENT_AGENCY
    CROWN_INDIGENOUS_RELATIONS_AND_NORTHERN_AFFAIRS_CANADA
    OFFICE_OF_THE_AUDITOR_GENERAL_OF_CANADA
    ROYAL_CANADIAN_NAVY
    COMPETITION_BUREAU_CANADA
    ALGONQUIN_COLLEGE
    POLICY_HORIZONS_CANADA
    SUPREME_COURT_OF_CANADA
    OFFICE_OF_THE_SECRETARY_TO_THE_GOVERNOR_GENERAL
    NATIONAL_RESEARCH_COUNCIL_CANADA
    PASSPORT_CANADA
    ROYAL_CANADIAN_MOUNTED_POLICE
    POLAR_KNOWLEDGE_CANADA
    CANADIAN_SPACE_AGENCY
    YORK_UNIVERSITY
    CANADA_EMPLOYMENT_INSURANCE_COMMISSION
    HOUSE_OF_COMMONS
    OFFICE_OF_THE_COMMISSIONER_OF_OFFICIAL_LANGUAGES
    CANADIAN_INTELLECTUAL_PROPERTY_OFFICE
    ADMINISTRATIVE_TRIBUNALS_SUPPORT_SERVICE_OF_CANADA
    IMMIGRATION_AND_REFUGEE_BOARD_OF_CANADA
    NOT_SPECIFIED_AND_OTHER
    ALL
  }

  schema {
    query: Query
  }

`;

const resolvers  = require('./resolvers/Query');

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});