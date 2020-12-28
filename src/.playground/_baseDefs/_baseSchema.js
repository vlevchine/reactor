module.exports = `
scalar JSON
scalar Date
scalar Time
scalar DateTime
scalar Money @model(kind: "FLOAT")
scalar Filters

enum TransactionStatus {
  ERROR
  FAILURE
  SUSPENDED
  PENDING
  SUCCESS
}
enum SortKey {
  CREATED_AT
  ID
  NAME
  UPDATED_AT
}
enum WeightUnit {
  GRAMS
  KILOGRAMS
  OUNCES
  POUNDS
}

interface Node {
  name: String!
}
interface DisplayableError {
  """
  Path to the input field which caused the error.
  """
  field: [String!]
  """
  The error message.
  """
  message: String!
}

type Attribute @model(entity: false) {
  key: String
  Value: String
}

type LoginPayload @model(entity: false) {
  user: User
  token: String!
}

type Address {
  type: String! @fake(any: "home,office")
  line1: String @fake(use: "address.streetAddress")
  line2: String
  city: String @fake(use: "address.city")
  state: String @fake(use: "address.state")
  zip: String @fake(use: "address.zipCode")
  country: String @fake(use: "address.country")
}

type Permission @fake(with: "name:read,write,view,monitor,assign,manage") {
  name: String @fake(prefix: "permission")
  conf: JSON
  description: String
  roles: [Role!]!
}

type Role @fake(count: 4) {
  name: String!
  displayName: String!
  permissions: [Permission!]! @fake(init: true)
  users: [User!]!
}

type User @fake(count: 25) { 
  firstName: String! @validate(isAlphanumeric: true) @fake(use: "name.firstName")
  lastName: String! @fake(use: "name.lastName")
  name: String! @model(virtual: true)
  active: Boolean @fake(use: "random.boolean")
  email: String @validate(isEmail: true) @fake(use: "internet.email")
  userName: String! @model(unique: true) @fake(use: "internet.userName")
  password: String!
  address: Address!
  roles: [Role!]! @fake(init: true)
  employer: Company!
  bio: JSON
}

input UserInput {
  first: String
  last: String
}

type Company @fake(count: 5) {
  employees: [User!]!
  name: String! @fake(use: "company.companyName")
  address: Address!
  registeredIn: String! @fake(use: "address.country")
  description: String @fake(use: "lorem.sentence")
}

"""Information about pagination in a connection."""
type PageInfo @model(entity: false) {
  hasNextPage: Boolean!
#  hasPreviousPage: Boolean!
  startCursor: String!
  endCursor: String!
  total: Int!
}

type LookupItem {
  key: String!
  label: String!
}

type Lookups {
  name: String!
  items: [LookupItem]!
}

type Query {
  config: String!
  customSchema(ns: String): String!
  users: [User!]!
  user(id: ID!): User
  me: User
  isAuthenticated: Boolean
}

type Mutation {
  updateConfig(value: String!): String
  signUp( username: String! email: String! password: String! ): LoginPayload!
  login( username: String! password: String! ): LoginPayload!
#  createUser(input: UserInput!): User
}`;
