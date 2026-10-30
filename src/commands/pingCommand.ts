import { client } from "@/global/client";
import { config } from "@/global/config";
import { idsOnCooldown } from "@/global/limiter";
import type { Command } from "@/types/Command";
import { Colors, EmbedBuilder, hyperlink, MessageFlags, time, TimestampStyles } from "discord.js";

const { commitHash } = config;

export const pingCommand: Command = {
    name: "ping",

    description: "Check if the levels bot is up",

    build(base) {
        base.addBooleanOption((x) =>
            x.setName("non-ephemeral").setDescription("Whether to show the result to everyone"),
        );
    },

    async execute(interaction) {
        const ping = Math.abs(Date.now() - interaction.createdTimestamp).toLocaleString();
        const apiLatency = Math.abs(Math.round(client.ws.ping)).toLocaleString();
        const startedAt = time(client.readyAt, TimestampStyles.RelativeTime);
        const memoryUsage = Math.ceil(process.memoryUsage().heapUsed / 1024 ** 2).toLocaleString();
        const cacheSize = idsOnCooldown.size.toLocaleString();

        const output = [
            `Ping: ${ping}ms`,
            `API Latency: ${apiLatency}ms`,
            `Started: ${startedAt}`,
            `Memory: ${memoryUsage} MB`,
            `Cooldown Cache Size: ${cacheSize}`,
        ];

        if (commitHash !== null) {
            const url = `https://github.com/Pantheon-Community/PantheonLevels/commit/${commitHash}`;

            output.push(`Version: ${hyperlink(commitHash, url)}`);
        }

        const embed = new EmbedBuilder()
            .setColor(Colors.DarkBlue)

            .setTitle("Pong!")
            .setDescription(output.join("\n"))
            .setFooter({
                text: `Made by NachoToast`,
                iconURL:
                    (await client.users.fetch("240312568273436674")).displayAvatarURL() ??
                    undefined,
            });

        await interaction.reply({
            embeds: [embed],
            flags: interaction.options.getBoolean("non-ephemeral")
                ? undefined
                : MessageFlags.Ephemeral,
        });
    },
};
