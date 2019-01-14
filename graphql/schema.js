const { gql } = require('apollo-server');
// THIS FILE ISNT BEING USED RIGHT NOW GO TO index.js
const typeDefs = gql`

  type User {
    guid: ID!
    name: String!
  }

  type Query {
    user(guid: ID, name: String): User
  }

  schema {
    query: Query
  }

`;

module.exports = typeDefs;