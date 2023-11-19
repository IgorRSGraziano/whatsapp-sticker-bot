import { Client, MessageMedia } from "whatsapp-web.js";
import * as QRCode from "qrcode-terminal";
const client = new Client({});

client.on("qr", (qr) => {
	console.log("QR RECEIVED");
	QRCode.generate(qr, { small: true });
});

client.on("ready", () => {
	console.log("Client is ready!");
});

client.on("message", async (msg) => {
	//Receiving image
	if (msg.hasMedia) {
		const media = await msg.downloadMedia();
		//Return sticker
		if (msg.type === "image") {
			const sticker = new MessageMedia("image/webp", media.data, "sticker");
			const chat = await msg.getChat();
			chat.sendMessage(sticker, { sendMediaAsSticker: true });
		}
	}
});

client.initialize();
