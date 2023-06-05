import { GraphQLError } from "graphql";
import { getCompany } from "./db/companies.js";
import { getJob, getJobs, getJobsByCompany } from "./db/jobs.js";

export const resolvers = {
  Query: {
    jobs: () => getJobs(),
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

  Job: {
    date: (job) => toIsoDate(job.createdAt),
    company: (job) => getCompany(job.companyId),
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