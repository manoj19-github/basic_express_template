import { Application } from "express";
import http from "http";
import { WebSocketServer } from "ws";


function initializeWebSocket(app: Application): http.Server<typeof http.IncomingMessage, typeof http.ServerResponse> {

	const server = http.createServer(app);

	// ✅ Attach WebSocket to same server
	const wss = new WebSocketServer({ server });

	wss.on("connection", (socket, request) => {
		const requestedIP = request.socket.remoteAddress;
		console.log("Client Connected:", requestedIP);

		socket.on("message", (message) => {
			const msg = message.toString();
			console.log("Received Message:", msg);

			// Broadcast to all clients
			wss.clients.forEach((client) => {
				if (client.readyState === socket.OPEN) {
					client.send(`server broadcast: ${msg}`);
				}
			});
		});

		socket.on("close", () => {
			console.log("Client Disconnected:", requestedIP);
		});

		socket.on("error", (err) => {
			console.log("Socket Error:", err.message);
		});
	});

	return server

}


export default initializeWebSocket