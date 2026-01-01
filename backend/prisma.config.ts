import { definePrismaConfig } from "@prisma/internals";

export default definePrismaConfig({
  // Use adapter for direct DB connection
  adapter: {
    provider: "postgresql",
    url: process.env.DATABASE_URL,
  },
});
