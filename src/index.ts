import WhatsApp from "whatsapp-web.js";
import QRCode from "qrcode-terminal";
import quotes from "./quotes.js";
import sharp from "sharp";

const client = new WhatsApp.Client({
	authStrategy: new WhatsApp.LocalAuth({ dataPath: "./auth" }),
	puppeteer: {
		headless: true,
		args: ["--no-sandbox", "--disable-setuid-sandbox"],
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
		if (msg.hasMedia && msg.type === "image") {
			const media = await msg.downloadMedia();
			const imgBuffer = Buffer.from(media.data, "base64");
			const mediaResized = await sharp(imgBuffer)
				.resize({ width: 512, height: 512, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
				.webp()
				.toBuffer();

			const sticker = new WhatsApp.MessageMedia("image/webp", mediaResized.toString("base64"), "sticker");
			const chat = await msg.getChat();
			const quote = quotes[Math.floor(Math.random() * quotes.length)];
			await chat.sendMessage(sticker, { sendMediaAsSticker: true, stickerAuthor: `${quote.source} - ${quote.philosophy}`, stickerName: quote.quote });
		}
	} catch (error) {
		console.error(error);
	}
});

client.initialize();
