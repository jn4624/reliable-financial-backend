import {Pool} from "pg";

export const testPool = new Pool({
    connectionString: process.env.DATABASE_URL ??
        "postgresql://stablepay:stablepay@localhost:5433/stablepay"
});
