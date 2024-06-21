import { createServer } from "http";
import { Server } from "socket.io";
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import express from "express";
import cors from "cors";

const argv = yargs(hideBin(process.argv)).argv;

let app = express();
app.use(cors());

const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

app.get('/ping', (req, res) => {
    res.send('Hello!')
})

io.on("connection", (socket) => {
    socket.on("join-room", (room) => {
        socket.join(room);
        console.log(`User ${socket.id} joined room ${room}`);
    });

    socket.on("exchange-desc", (message) => {
        for (const room of socket.rooms) {
            if (room === socket.id) {
                continue;
            }

            socket.to(room).emit("exchange-desc", message);
        }
    });

    socket.on("exchange-candidate", (message) => {
        for (const room of socket.rooms) {
            if (room === socket.id) {
                console.log(`User ${socket.id} sent candidate to itself`);
                continue;
            }

            socket.to(room).emit("exchange-candidate", message);
        }
    });

    socket.on("disconnect", () => {
        console.log(`User ${socket.id} disconnected`);
        socket.leave("signal");
    });
});

let servePort = 5000;

if (argv.port) {
    servePort = argv.port;
}

console.log(`Server running on port ${servePort}`);
server.listen(servePort);
