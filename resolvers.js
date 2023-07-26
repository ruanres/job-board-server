import { GraphQLError } from "graphql";
import { getCompany } from "./db/companies.js";
import { createJob, deleteJob, getJob, getJobs, getJobsByCompany, updateJob } from "./db/jobs.js";

export const resolvers = {
  Query: {
    jobs: (_root, {limit, offset}) => getJobs(limit, offset),
    job: async (_root, { id }) => {
      const job = await getJob(id);
      if(!job) {
        throw notFoundError('No job found with id ' + id);
      }
      return job;
    },
    company: async (_root, { id }) => {
      const company = await getCompany(id);
      if(!company) {
        throw notFoundError('No company found with id ' + id);
      }
      return company;
    },
  },

  Mutation: {
    createJob: (_root, {input: {title, description}}, { user }) => {
      if (!user) {
        throw unauthorizedError('Missing authentication');
      }
      const companyId = user.companyId;
      return createJob({title, description, companyId});
    },
    updateJob: async (_root, { input: {id, title, description}}, { user }) => {
      if (!user) {
        throw unauthorizedError('Missing authentication');
      }
      const job = await updateJob({id, title, description, companyId: user.companyId});
      if(!job) {
        throw notFoundError('No job found with id ' + id);
      }
      return job;
    },
    deleteJob: async (_root, { id }, { user }) => {
      if (!user) {
        throw unauthorizedError('Missing authentication');
      }
      const job = await deleteJob(id, user.companyId);
      if(!job) {
        throw notFoundError('No job found with id ' + id);
      }
      return job;
    }
  },

  Job: {
    date: (job) => toIsoDate(job.createdAt),
    company: (job, _args, { companyLoader }) => companyLoader.load(job.companyId),
  },

  Company: {
    jobs: (company) => getJobsByCompany(company.id),
  }
}

function notFoundError(message) {
  return new GraphQLError(message, {
    extensions: { code: 'NOT_FOUND'}
  })
}

function toIsoDate(value) {
  return value.slice(0, 'yyyy-mm-dd'.length);
}

function unauthorizedError(message) {
  return new GraphQLError(message, {
    extensions: { code: 'UNAUTHORIZED'}
  })
}