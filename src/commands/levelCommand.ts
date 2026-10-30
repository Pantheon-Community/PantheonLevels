import { config } from "@/global/config";
import { UserModel } from "@/models/UserModel";
import type { Command } from "@/types/Command";
import { calculateLevel, clamp } from "@/utils/levelCalculations";
import { makeClampedBar } from "@/utils/makeBar";
import { bold, Colors, EmbedBuilder, MessageFlags, roleMention, userMention } from "discord.js";

const { adminRoleId } = config;

export const levelCommand: Command = {
    name: "level",

    description: "See your own level, or the level of someone else",

    build(base) {
        base.addUserOption((x) => x.setName("user").setDescription("Who to see the level of"))
            .addIntegerOption((x) =>
                x
                    .setName("set")
                    .setDescription("Set the XP of the user, staff only")
                    .setMinValue(0),
            )
            .addIntegerOption((x) =>
                x
                    .setName("add")
                    .setDescription("Add to the XP of the user, staff only")
                    .setMinValue(1),
            )
            .addBooleanOption((x) =>
                x.setName("non-ephemeral").setDescription("Whether to show the result to everyone"),
            );
    },

    async execute(interaction) {
        const setTo = interaction.options.getInteger("set");

        const add = interaction.options.getInteger("add");

        const user = interaction.options.getUser("user") ?? interaction.user;

        const isMe = user.id === interaction.user.id;

        let isNew = false;

        if (setTo !== null || add !== null) {
            let isAllowed: boolean;

            if (!interaction.member?.roles) {
                isAllowed = false;
            } else if (Array.isArray(interaction.member.roles)) {
                isAllowed = interaction.member.roles.includes(adminRoleId);
            } else {
                isAllowed = interaction.member.roles.cache.has(adminRoleId);
            }

            if (!isAllowed) {
                await interaction.reply({
                    content: `Nice try, unfortunately you need the ${roleMention(adminRoleId)} role to do this.`,
                    flags: MessageFlags.Ephemeral,
                });

                return;
            }

            if (setTo !== null && add !== null) {
                await interaction.reply({
                    content:
                        "Please specify only either add or set, including both is kinda confusing.",
                    flags: MessageFlags.Ephemeral,
                });

                return;
            }

            if (setTo !== null) {
                await UserModel.set(user.id, user.displayName, setTo);
            } else if (add !== null) {
                await UserModel.add(user.id, user.displayName, add);
            }

            isNew = true;
        }

        const messageCount = setTo ?? (await UserModel.get(user.id));

        let [percentile, rank] = await Promise.all([
            UserModel.getPercentile(messageCount),
            UserModel.getRank(messageCount),
        ]);

        percentile = clamp(Math.round(percentile), 1, 99);

        const { level, levelFloor, levelCeiling, percentDone } = calculateLevel(messageCount);

        const prevLevelText = `Level ${level.toLocaleString()} (${levelFloor.toLocaleString()} XP)`;
        const nextLevelText = `Level ${(level + 1).toLocaleString()} (${levelCeiling.toLocaleString()} XP)`;
        const bar = makeClampedBar(percentDone / 100, 10);

        const adverb = isNew ? "now" : "currently";

        const [subject, verb] = isMe ? ["You", "have"] : [userMention(user.id), "has"];

        const content = [
            `${subject} ${adverb} ${verb} ${messageCount.toLocaleString()} XP`,
            `${prevLevelText} ${bar}  ${nextLevelText}`,
        ].join("\n\n");

        const percentileText =
            percentile > 50
                ? `top ${(100 - percentile).toLocaleString()}%`
                : `bottom ${percentile.toLocaleString()}%`;

        let footerText: string;

        if (rank !== null) {
            footerText = `Rank #${rank.toLocaleString()} (${percentileText})`;
        } else {
            footerText = percentileText.charAt(0).toUpperCase() + percentileText.slice(1);
        }

        const embed = new EmbedBuilder()
            .setColor(Colors.DarkBlue)
            .setTitle(`Level ${bold(level.toLocaleString())}`)
            .setFooter({ text: footerText, iconURL: user.displayAvatarURL() })
            .setDescription(content);

        await interaction.reply({
            embeds: [embed],
            flags: interaction.options.getBoolean("non-ephemeral")
                ? undefined
                : MessageFlags.Ephemeral,
        });
    },
};
