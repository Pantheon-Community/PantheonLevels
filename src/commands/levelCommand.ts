import { UserModel } from "@/models/UserModel";
import type { Command } from "@/types/Command";
import { calculateLevel, clamp } from "@/utils/levelCalculations";
import { makeClampedBar } from "@/utils/makeBar";
import { bold, userMention } from "discord.js";

export const levelCommand: Command = {
    name: "level",

    description: "See your own level, or the level of someone else.",

    build(base) {
        base.addUserOption((x) => x.setName("user").setDescription("Who to see the level of"));
    },

    async execute(interaction) {
        const id = interaction.options.get("user")?.user?.id ?? interaction.user.id;

        const isMe = id === interaction.user.id;

        const messageCount = await UserModel.get(id);

        let [percentile, rank] = await Promise.all([
            UserModel.getPercentile(messageCount),
            UserModel.getRank(messageCount),
        ]);

        percentile = clamp(Math.round(percentile), 1, 99);

        const { level, levelFloor, levelCeiling, percentDone } = calculateLevel(messageCount);

        const content = [
            `${isMe ? "You are" : `${userMention(id)} is`} currently ${bold(`level ${level.toLocaleString()}`)} with ${messageCount.toLocaleString()} XP, ${percentDone.toLocaleString()}% of the way to level ${(level + 1).toLocaleString()}`,
            `Level ${level.toLocaleString()} (${levelFloor.toLocaleString()} XP) ${makeClampedBar(percentDone / 100, 20)} Level ${level + 1} (${levelCeiling.toLocaleString()} XP)`,
            `${isMe ? "You" : "They"} are in the ${percentile > 50 ? `top ${bold(`${(100 - percentile).toLocaleString()}%`)}` : `bottom ${bold(`${percentile.toLocaleString()}%`)}`} of users${rank !== null ? ` (rank #${bold(rank.toLocaleString())})` : ""}`,
        ].join("\n");

        await interaction.reply({ content, allowedMentions: {} });
    },
};
