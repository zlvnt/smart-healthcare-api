const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLID, GraphQLList, GraphQLNonNull } = require('graphql');
const patientResolvers = require('./resolvers');

const PatientType = new GraphQLObjectType({
  name: 'Patient',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    birth_date: { type: GraphQLString },
    gender: { type: GraphQLString },
    phone: { type: GraphQLString },
    address: { type: GraphQLString },
    blood_type: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString }
  })
});

const RootQueryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    // Get all patients
    patients: {
      type: new GraphQLList(PatientType),
      resolve: patientResolvers.Query.patients
    },
    // Get patient by ID
    patient: {
      type: PatientType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve: patientResolvers.Query.patient
    },
    // Get patient by name
    patientByName: {
      type: new GraphQLList(PatientType),
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: patientResolvers.Query.patientByName
    }
  }
});

const RootMutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    // Create patient
    createPatient: {
      type: PatientType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        birth_date: { type: new GraphQLNonNull(GraphQLString) },
        gender: { type: new GraphQLNonNull(GraphQLString) },
        phone: { type: new GraphQLNonNull(GraphQLString) },
        address: { type: GraphQLString },
        blood_type: { type: GraphQLString }
      },
      resolve: patientResolvers.Mutation.createPatient
    },
    // Update patient
    updatePatient: {
      type: PatientType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLString },
        phone: { type: GraphQLString },
        address: { type: GraphQLString },
        blood_type: { type: GraphQLString }
      },
      resolve: patientResolvers.Mutation.updatePatient
    },
    // Delete patient
    deletePatient: {
      type: new GraphQLObjectType({
        name: 'DeletePatientResponse',
        fields: {
          success: { type: GraphQLString },
          message: { type: GraphQLString }
        }
      }),
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve: patientResolvers.Mutation.deletePatient
    }
  }
});

module.exports = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType
});
