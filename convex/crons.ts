import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Checks every enabled alert rule and emails when one goes over its limit.
crons.interval("check alert rules", { minutes: 5 }, internal.alertRules.checkAll, {});

export default crons;
