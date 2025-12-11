const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLID, GraphQLList, GraphQLNonNull } = require('graphql');
const doctorResolvers = require('./resolvers');

const DoctorType = new GraphQLObjectType({
  name: 'Doctor',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    specialization: { type: GraphQLString },
    phone: { type: GraphQLString },
    schedule: { type: new GraphQLList(GraphQLString) },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString }
  })
});

const RootQueryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    // Get all doctors
    doctors: {
      type: new GraphQLList(DoctorType),
      resolve: doctorResolvers.Query.doctors
    },
    // Get doctor by ID
    doctor: {
      type: DoctorType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve: doctorResolvers.Query.doctor
    },
    // Get doctors by specialization
    doctorBySpecialization: {
      type: new GraphQLList(DoctorType),
      args: {
        specialization: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: doctorResolvers.Query.doctorBySpecialization
    }
  }
});

const RootMutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    // Create doctor
    createDoctor: {
      type: DoctorType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        specialization: { type: new GraphQLNonNull(GraphQLString) },
        phone: { type: new GraphQLNonNull(GraphQLString) },
        schedule: { type: new GraphQLList(GraphQLString) }
      },
      resolve: doctorResolvers.Mutation.createDoctor
    },
    // Update doctor
    updateDoctor: {
      type: DoctorType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLString },
        phone: { type: GraphQLString },
        schedule: { type: new GraphQLList(GraphQLString) }
      },
      resolve: doctorResolvers.Mutation.updateDoctor
    },
    // Delete doctor
    deleteDoctor: {
      type: new GraphQLObjectType({
        name: 'DeleteDoctorResponse',
        fields: {
          success: { type: GraphQLString },
          message: { type: GraphQLString }
        }
      }),
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve: doctorResolvers.Mutation.deleteDoctor
    }
  }
});

module.exports = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType
});
