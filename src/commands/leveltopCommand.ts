import { UserModel } from "@/models/UserModel";
import type { Command } from "@/types/Command";
import { calculateLevel } from "@/utils/levelCalculations";
import { makeBar } from "@/utils/makeBar";
import { bold, EmbedBuilder, MessageFlags } from "discord.js";

export const leveltopCommand: Command = {
    name: "level-top",

    description: "See who has the highest levels.",

    async execute(interaction) {
        const [top, myCount] = await Promise.all([
            UserModel.getTop(),
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

        if (myRank !== null && myRank > 10) {
            if (myRank > 11) {
                output.push("...");
            }

            output.push(
                `${makeBar(myCount / maxValue, 10, "")} ${myRank.toLocaleString()} ${interaction.user.displayName} - ${myCount.toLocaleString()} XP (Level ${calculateLevel(myCount).level.toLocaleString()})`,
            );
        }

        const embed = new EmbedBuilder()
            .setTitle(`Highest Level Users`)
            .setDescription(output.join("\n"));

        await interaction.reply({ embeds: [embed], options: { flags: MessageFlags.Ephemeral } });
    },
};

function* medalGenerator(): Generator<string, string, string> {
    yield "🥇";
    yield "🥈";
    yield "🥉";

    let i = 4;

    while (i > 0) {
        yield bold(`#${(i++).toString()}`);
    }

    return "";
}
