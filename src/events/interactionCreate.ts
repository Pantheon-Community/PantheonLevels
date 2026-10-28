import { commands } from "@/commands";
import { client } from "@/global/client";
import { Events } from "discord.js";

const commandMap = new Map(Object.values(commands).map((c) => [c.name, c]));

export function addInteractionCreateListeners(): void {
    client.on(Events.InteractionCreate, async (interaction) => {
        try {
            if (interaction.isChatInputCommand()) {
                const command = commandMap.get(interaction.commandName);

                await command?.execute(interaction);
            }
        } catch (error) {
            console.log(error);
        }
    });
}
