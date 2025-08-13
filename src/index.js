import dotenv from "dotenv";
import server from "./server.js";
import { error } from "node:console";
import io from "./socket.js";
import connectDB from "./db/index.js";

dotenv.config({
  path:"./.env", 
});


const serverPort = process.env.PORT || 9000;

connectDB()
  .then(() => {      
    server.on("error", (error) => {           // Fixed error logger
      console.log("Error occured at index.js", error);
    });

    server.listen(serverPort, () => {
      console.log({
        serverStatus: "🌐  Application is Running",
        URL: "🔗 http://localhost:9000",
      });
    });
  })
  .catch((error) => {
    console.log("DB connection Failed from Index.js", error);
  }); 
