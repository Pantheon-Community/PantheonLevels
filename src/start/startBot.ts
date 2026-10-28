import { commands } from "@/commands";
import { addInteractionCreateListeners } from "@/events/interactionCreate";
import { addMessageCreateListeners } from "@/events/messageCreate";
import { client, setClient } from "@/global/client";
import { config } from "@/global/config";
import { setCooldownChecks } from "@/global/limiter";
import { Color } from "@/types/Color";
import type { TeardownFn } from "@/types/TeardownFn";
import { colorize } from "@/utils/colorize";
import { logWithTimeTaken } from "@/utils/logging";
import {
    Client,
    Events,
    GatewayIntentBits,
    InteractionContextType,
    REST,
    Routes,
    SlashCommandBuilder,
} from "discord.js";

async function deployCommands(): Promise<void> {
    const rest = new REST().setToken(config.discordBotToken);

    const allGuilds = await client.guilds.fetch();

    const body = commands.map((c) => {
        const base = new SlashCommandBuilder()
            .setName(c.name)
            .setDescription(c.description)
            .setContexts(InteractionContextType.Guild);

        c.build?.(base);

        return base.toJSON();
    });

    for (const guild of allGuilds.keys()) {
        await rest.put(Routes.applicationGuildCommands(client.application.id, guild), {
            body,
        });
    }
}

export async function startBot(): Promise<TeardownFn> {
    const startedAt = Date.now();

    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildMessages,
        ],
    });

    await new Promise<void>((resolve) => {
        client.once(Events.ClientReady, (readyClient) => {
            setClient(readyClient);

            logWithTimeTaken(
                `Logged in as ${colorize(readyClient.user.displayName, Color.FgCyan)}`,
                startedAt,
            );

            resolve();
        });

        client.login(config.discordBotToken);
    });

    addMessageCreateListeners();

    addInteractionCreateListeners();

    setCooldownChecks();

    const commandStartTime = Date.now();

    await deployCommands();

    logWithTimeTaken(`Deployed ${commands.length} Commands`, commandStartTime);

    return async () => {};
}
