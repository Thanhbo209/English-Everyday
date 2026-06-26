import buildApp from "./app.js";
import app from "./app.js";

const start = async () => {
  const app = buildApp();

  try {
    await app.listen({
      port: 3000,
      host: "0.0.0.0",
    });

    console.log("Server running on port 3000");
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();
