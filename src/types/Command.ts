import type { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export interface Command {
    name: string;

    description: string;

    build?(base: SlashCommandBuilder): void;

    execute(interaction: ChatInputCommandInteraction): Promise<void>;
}
