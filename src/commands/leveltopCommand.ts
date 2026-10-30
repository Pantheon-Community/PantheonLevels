import { UserModel } from "@/models/UserModel";
import type { Command } from "@/types/Command";
import { calculateLevel } from "@/utils/levelCalculations";
import { makeBar } from "@/utils/makeBar";
import { bold, Colors, EmbedBuilder, MessageFlags } from "discord.js";

const limit = 5;

export const leveltopCommand: Command = {
    name: "level-top",

    description: "See who has the highest levels",

    build(base) {
        base.addBooleanOption((x) =>
            x.setName("non-ephemeral").setDescription("Whether to show the result to everyone"),
        );
    },

    async execute(interaction) {
        const [top, myCount] = await Promise.all([
            UserModel.getTop(limit),
            UserModel.get(interaction.user.id),
        ]);

        const myRank = await UserModel.getRank(myCount);

        const output = new Array<string>(top.length);

        const maxValue = Math.max(...top.map((x) => x[1]));

        const medals = medalGenerator();

        for (let i = 0; i < top.length; i++) {
            const [name, xp] = top[i];

            let isMe = name === interaction.user.displayName;

            output[i] =
                `${makeBar(xp / maxValue, 10, "")} ${medals.next().value} ${isMe ? bold(name) : name} - ${xp.toLocaleString()} XP (Level ${calculateLevel(xp).level.toLocaleString()})`;
        }

        if (myRank !== null && myRank > limit) {
            if (myRank > limit + 1) {
                output.push("...");
            }

            output.push(
                `${makeBar(myCount / maxValue, 10, "")} ${bold(`#${myRank.toLocaleString()}`)} ${interaction.user.displayName} - ${myCount.toLocaleString()} XP (Level ${calculateLevel(myCount).level.toLocaleString()})`,
            );
        }

        const embed = new EmbedBuilder()
            .setColor(Colors.DarkBlue)
            .setTitle(`Highest Level Users`)
            .setDescription(output.join("\n"));

        await interaction.reply({
            embeds: [embed],
            flags: interaction.options.getBoolean("non-ephemeral")
                ? undefined
                : MessageFlags.Ephemeral,
        });
    },
};

function* medalGenerator(): Generator<string, string, string> {
    yield "🥇";
    yield "🥈";
    yield "🥉";

    let i = 4;

    while (true) {
        yield bold(`#${(i++).toString()}`);
    }
}
