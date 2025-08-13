import { Server } from "socket.io";
import server from "./server.js";

const io = new Server(server, {
    cors: {
        origin: process.env.NODE_ENV === 'production' ? "https://shady.odrly.com" : "http://localhost:3000",
        credentials: true
    }
});

try {
    io.on("connection", (socket) => {
        console.log(socket.id);
        socket.on("connection", async ({connection}) => {
            io.emit("connection", {
                connection: connection,
            });
        });
    
        //socket functions Goes Here 
    });
} catch (error) {
    console.log("Socket Error", error);
    io.emit("error", {
        error: error,
    });
}



export default io; 
