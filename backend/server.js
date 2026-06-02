import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";
import connectDB from "./config/db.js";
const PORT = process.env.PORT || 5000;
import dns from "dns";
dns.setServers(["1.1.1.1","8.8.8.8"])
connectDB().
        then(() => {
            app.listen(PORT, () => {
                console.log(`Server running on ${PORT}`);
            });
        }).
        catch((error) => {
            console.log("Error connecting to database:", error);
        });