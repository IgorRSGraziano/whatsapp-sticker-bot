import { Client } from "whatsapp-web.js";
import * as QRCode from "qrcode-terminal";
const client = new Client({});

client.on("qr", (qr) => {
	console.log("QR RECEIVED");
	QRCode.generate(qr, { small: true });
});

client.on("ready", () => {
	console.log("Client is ready!");
});

client.initialize();
