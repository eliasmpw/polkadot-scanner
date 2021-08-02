import express from "express";
import consola from "consola";
import path from "path";
import authMiddleware from "./middlewares/authMiddleware";
import { connect } from "mongoose";
import usersRouter from "./routes/users";

const app = express();

// Add middlewares
app.use(express.json());

const startApp = async () => {
  try {
    // Connect to MongoDB
    await connect(process.env.MONGO_URI as string, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
    });

    consola.info({ message: "MongoDB connected", badge: true });

    // Add authentication middleware
    app.use(await authMiddleware());

    // Add Routes
    app.use("/api/users", usersRouter);

    // Set static folder for frontend
    app.use(express.static(path.resolve(__dirname, "../", "client", "build")));

    app.get("*", (req, res) => {
      res.sendFile(
        path.resolve(__dirname, "../", "client", "build", "index.html")
      );
    });

    // Start listening on PORT
    app.listen(process.env.PORT, () =>
      consola.success({
        message: `Server started on port ${process.env.PORT}`,
        badge: true,
      })
    );
  } catch (err) {
    consola.error({
      message: err,
      badge: true,
    });
  }
};

startApp();
