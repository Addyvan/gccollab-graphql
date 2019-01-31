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
    language: String
    last_action: Date
    last_login: Date
  }

  type Query {
    description: String
    user(guid: ID, name: String): User!
    mission(guid: ID): Mission!
    missions: [Mission]!
    
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