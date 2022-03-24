import { SlashCommandBuilder } from "@discordjs/builders";
import { Routes } from "discord-api-types/v10";
import { REST } from "@discordjs/rest";
import dotenv from "dotenv";

dotenv.config();

const commands = [
    new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Test bot latency"),

    new SlashCommandBuilder()
        .setName("madlib")
        .setDescription("Starts a new madlib!")
        .addStringOption((option) =>
            option
                .setName("title")
                .setDescription("Make up a random title!")
                .setRequired(true)
        ),
].map((command) => command.toJSON());

const rest = new REST().setToken(process.env.CLIENT_SECRET);

try {
    rest.put(
        Routes.applicationGuildCommands(
            process.env.CLIENT_ID,
            process.env.GUILD_ID
        ),
        { body: commands }
    ).then(() => console.log("Successfully registered commands!"));
} catch (err) {
    console.log(err);
}
