const dotenv = require("dotenv");
dotenv.config();

const app = require("./app.js");
const connectDB = require("./config/db.js");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`server running on port ${PORT}`);
    });
    return server;
  } catch (error) {
    console.error("Database connection failure:", error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
