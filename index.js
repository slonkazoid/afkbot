require("dotenv").config();
const readline = require("readline");
const mineflayer = require("mineflayer");
const fs = require("fs");
const colors = require("colors");

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

let session = false;
let login = {
	host: process.env.HOST || "0b0t.org",
	port: process.env.PORT,
	version: process.env.VERSION,
	username: process.env.USERNAME || "afkbot",
	password: process.env.PASSWORD,
	session: session,
};

let bot;
let spawned;

function color(cm) {
	const supportedColors = [
		"black",
		"dark_blue",
		"dark_green",
		"dark_aqua",
		"dark_red",
		"dark_purple",
		"gold",
		"gray",
		"dark_gray",
		"blue",
		"green",
		"aqua",
		"red",
		"light_purple",
		"yellow",
		"white",
		"obfuscated",
		"bold",
		"strikethrough",
		"underlined",
		"italic",
		"reset",
	];
	const codes = [
		colors.black,
		colors.blue.dim,
		colors.green.dim,
		colors.cyan.dim,
		colors.red.dim,
		colors.magenta.dim,
		colors.yellow.dim,
		colors.gray,
		colors.gray.dim,
		colors.blue,
		colors.green,
		colors.cyan,
		colors.red,
		colors.magenta,
		colors.yellow,
		colors.white,
		colors.zalgo, // 16
		colors.bold,
		colors.strikethrough,
		colors.underline,
		colors.italic,
		colors.reset,
	];

	let msg =
		(cm.bold ? codes[17]() : "") +
		(cm.italic ? codes[20]() : "") +
		(cm.underlined ? codes[19]() : "") +
		(cm.strikethrough ? codes[18]() : "") +
		(cm.obfuscated ? codes[16]() : "");
	if (cm.color) {
		msg += codes[supportedColors.findIndex((color) => color === cm.color)](
			cm.text
		);
	} else msg += cm.text;
	return msg;
}

function init() {
	console.log("INIT".bgYellow);
	bot = mineflayer.createBot(login);
	spawned = false;
	bot.on("chat", (u, m, t, cm) => {
		if (cm) {
			let msg = "";
			if (cm.json) {
				msg += color(cm.json);
			} else if (cm.text) {
				msg += cm.text;
			}
			if (cm.extra) {
				cm.extra.forEach((e) => {
					msg += color(e);
				});
			}
			console.log(msg);
		} else {
			console.log(`<${u}> ${m}`);
		}
	});
	function spawn() {
		console.log("SPAWN".bgGreen);
		spawned = true;
	}

	bot._client.once("session", () => {
		session = bot._client.session;
		login.session = session;
	});
	bot.once("spawn", spawn);
	bot.once("end", () => {
		console.log("END".bgRed);
		init();
	});
	bot.on("error", (m) => {
		if (m.message.includes("Invalid session.")) {
			session = false;
		}
		console.log("ERROR".bgRed);
		init();
	});
}

init();

rl.on("line", (m) => {
	if (spawned) bot.chat(m);
	else bot.once("spawn", () => bot.chat(m));
});
