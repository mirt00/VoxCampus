require("dotenv").config();
const app = require("./app");
const connectDB = require("./src/config/db");
const startEscalationJob = require("./src/jobs/escalation.job");

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    startEscalationJob();
  });
});
