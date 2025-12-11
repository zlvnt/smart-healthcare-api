const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLID, GraphQLList, GraphQLNonNull } = require('graphql');
const appointmentResolvers = require('./resolvers');

const AppointmentType = new GraphQLObjectType({
  name: 'Appointment',
  fields: () => ({
    id: { type: GraphQLID },
    patient_id: { type: GraphQLString },
    doctor_id: { type: GraphQLString },
    appointment_date: { type: GraphQLString },
    status: { type: GraphQLString },
    complaint: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString }
  })
});

const RootQueryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    // Get all appointments
    appointments: {
      type: new GraphQLList(AppointmentType),
      resolve: appointmentResolvers.Query.appointments
    },
    // Get appointment by ID
    appointment: {
      type: AppointmentType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve: appointmentResolvers.Query.appointment
    },
    // Get appointments by patient ID
    appointmentByPatient: {
      type: new GraphQLList(AppointmentType),
      args: {
        patientId: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve: appointmentResolvers.Query.appointmentByPatient
    },
    // Get appointments by doctor ID
    appointmentByDoctor: {
      type: new GraphQLList(AppointmentType),
      args: {
        doctorId: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve: appointmentResolvers.Query.appointmentByDoctor
    }
  }
});

const RootMutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    // Create appointment with validation
    createAppointment: {
      type: AppointmentType,
      args: {
        patient_id: { type: new GraphQLNonNull(GraphQLID) },
        doctor_id: { type: new GraphQLNonNull(GraphQLID) },
        appointment_date: { type: new GraphQLNonNull(GraphQLString) },
        complaint: { type: GraphQLString },
        status: { type: GraphQLString }
      },
      resolve: appointmentResolvers.Mutation.createAppointment
    },
    // Update appointment status
    updateAppointmentStatus: {
      type: AppointmentType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        status: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: appointmentResolvers.Mutation.updateAppointmentStatus
    },
    // Delete appointment
    deleteAppointment: {
      type: new GraphQLObjectType({
        name: 'DeleteAppointmentResponse',
        fields: {
          success: { type: GraphQLString },
          message: { type: GraphQLString }
        }
      }),
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve: appointmentResolvers.Mutation.deleteAppointment
    }
  }
});

module.exports = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType
});
