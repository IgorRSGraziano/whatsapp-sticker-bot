import fs from "fs";
import QRCode from "qrcode-terminal";
import sharp from "sharp";
import WhatsApp from "whatsapp-web.js";
import quotes from "./quotes.js";

process.env.TEMP_DIR ??= "./temp/";

if (!fs.existsSync(process.env.TEMP_DIR)) {
	fs.mkdirSync(process.env.TEMP_DIR);
}

const client = new WhatsApp.Client({
	authStrategy: new WhatsApp.LocalAuth({ dataPath: process.env.TEMP_DIR + "/auth" }),
	webVersionCache: {
		remotePath: "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.3000.1013063077-alpha.html",
		type: "remote",
	},
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
			await chat.sendMessage(sticker, { sendMediaAsSticker: true, stickerAuthor: `${quote.source} - ${quote.philosophy}`, stickerName: quote.quote, quotedMessageId: msg.id._serialized });
		}
	} catch (error) {
		console.error(error);
	}
});

client.initialize();
