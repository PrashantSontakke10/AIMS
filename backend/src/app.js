import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import authRoutes from "../features/auth/auth.routes.js";
import adminRoutes from "../features/admin/admin.routes.js";
import courseRoutes from "../features/courses/course.routes.js";
const app = express();
app.use(cors());

app.use(helmet());

app.use(express.json());

app.use(cookieParser());

app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use('/courses', courseRoutes);
app.get("/", (req, res) => {
    res.send("Hello World!");
});

export default app;