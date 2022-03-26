import { Client, Intents, Message } from "discord.js";
import MadLibs from "./madlib-templates.js";
import dotenv from "dotenv";

// Check discord.js documentation for Client, IntentsResolvable
const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

dotenv.config();

client.on("ready", () => {
    console.log("Ready to listen for MadLib requests!");
});

const awaitingReply = [];

client.on("interactionCreate", (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;

    console.log(interaction.toString());

    if (commandName === "ping")
        interaction.reply(`Pong! - ${interaction.client.ws.ping}ms`);
    else if (commandName === "madlib") {
        const title = options.getString("title");

        const number = Math.floor(Math.random() * MadLibs.length);
        const madlib = MadLibs[number];
        const text = madlib.text;
        const requirements = madlib.requirements;

        let returnMessage =
            "Let's make a madlib! Reply to this message in the following format:\n";
        for (let req of requirements) returnMessage += "\n" + req;

        awaitingReply.push({
            userID: interaction.user.id,
            title,
            number,
        });

        interaction.reply(returnMessage);
    }
});

client.on("messageCreate", (msg) => {
    const author = msg.author.id;
    const text = msg.cleanContent;

    if (author === process.env.CLIENT_ID) return;

    for (let i = 0; i < awaitingReply.length; i++) {
        let obj = awaitingReply[i];
        console.log(obj);
        if (author === obj.userID) {
            console.log(`Found a match for ${author}\n${text}`);

            // Do stuff
            const replyContent = text.split("\n");
            let textTemplate = MadLibs[obj.number].text;
            if (
                replyContent.length !== MadLibs[obj.number].requirements.length
            ) {
                msg.reply(
                    "Could not complete madlib - the number of inputs was not correct!"
                );
                return;
            }

            for (let i = 0; i <= replyContent.length; i++) {
                const compositeString = "{" + i + "}";
                textTemplate = textTemplate.replaceAll(
                    compositeString,
                    replyContent[i]
                );
            }

            msg.reply(
                `Here's your completed madlib - '${obj.title}'\n\n${textTemplate}`
            );

            awaitingReply.splice(i, 1);
        }
    }
});

client.login(process.env.CLIENT_SECRET);
