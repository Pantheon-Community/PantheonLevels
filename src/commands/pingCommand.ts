import { client } from "@/global/client";
import { config } from "@/global/config";
import { idsOnCooldown } from "@/global/limiter";
import type { Command } from "@/types/Command";
import { bold, MessageFlags, time, TimestampStyles, userMention } from "discord.js";

export const pingCommand: Command = {
    name: "ping",

    description: "Check if the levels bot is up.",

    async execute(interaction) {
        const ping = Math.abs(Date.now() - interaction.createdTimestamp);

        const apiLatency = Math.abs(Math.round(client.ws.ping));

        const startedAt = client.readyAt;

        const memoryUsage = process.memoryUsage().heapUsed / 1024 ** 2;

        const output: string[] = [
            bold("Pong!"),
            `> Ping: ${ping.toLocaleString()}ms`,
            `> API Latency: ${apiLatency.toLocaleString()}ms`,
            `> Started: ${time(startedAt, TimestampStyles.RelativeTime)}`,
            `> Memory: ${Math.ceil(memoryUsage).toLocaleString()} MB`,
            `> Cooldown Cache Size: ${idsOnCooldown.size.toLocaleString()}`,
        ];

        if (config.commitHash !== null) {
            output.push(`> Version: ${config.commitHash ?? "unknown"}`);
        }

        output.push(`-# Any issues? Contact ${userMention("240312568273436674")}`);

        await interaction.reply({
            content: output.join("\n"),
            options: { flags: MessageFlags.Ephemeral },
            allowedMentions: {},
        });
    },
};
