import * as WhatsApp from "whatsapp-web.js";
import * as QRCode from "qrcode-terminal";
import quotes from "./quotes";
import sharp from "sharp";

const client = new WhatsApp.Client({
	authStrategy: new WhatsApp.LocalAuth({ dataPath: "./auth" }),
	puppeteer: {
		headless: false,
	},
});

client.on("qr", (qr) => {
	console.log("QR RECEIVED");
	QRCode.generate(qr, { small: true });
});

client.on("ready", () => {
	console.log("Client is ready!");
});

client.on("message", async (msg) => {
	try {
		//Receiving image
		if (msg.hasMedia && msg.type === "image") {
			//Return sticker
			//Response media type
			const media = await msg.downloadMedia();
			console.log(media);
			const imgBuffer = Buffer.from(media.data, "base64");
			const mediaWebp = await sharp(imgBuffer).webp().toBuffer();
			const sticker = new WhatsApp.MessageMedia("image/webp", mediaWebp.toString("base64"), "sticker");
			const chat = await msg.getChat();
			const quote = quotes[Math.floor(Math.random() * quotes.length)];
			await chat.sendMessage(sticker, { sendMediaAsSticker: true, stickerAuthor: `${quote.source} - ${quote.philosophy}`, stickerName: quote.quote });
			// chat.sendMessage(sticker, { sendMediaAsSticker: true, stickerAuthor: `${quote.source} - ${quote.philosophy}` });
			// chat.sendMessage(sticker, { sendMediaAsSticker: true,  stickerName: quote.quote });

			// await new Promise((resolve) => setTimeout(resolve, 2000));
			// const media = await msg.downloadMedia();
			// const sticker = new WhatsApp.MessageMedia("image/webp", media.data, "sticker");
			// const chat = await msg.getChat();
			// chat.sendMessage(sticker, { sendMediaAsSticker: true });
		}
	} catch (error) {
		console.log(error);
	}
});

client.initialize();
