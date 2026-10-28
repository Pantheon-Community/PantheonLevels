import { config } from "@/global/config";
import type { Command } from "@/types/Command";
import type { LevelInfo } from "@/types/LevelInfo";
import { calculateLevel } from "@/utils/levelCalculations";

const { roles, roleRequirements } = config;

const allData: LevelInfo[] = [];

for (let i = 0; i < roles.length - 1; i++) {
    const start = roleRequirements[i];
    const end = roleRequirements[i + 1];

    const gradient = end - start;

    for (let j = 0; j < 10; j++) {
        allData.push(calculateLevel(start + (gradient * j) / 10));
    }
}

allData.push(calculateLevel(roleRequirements[roleRequirements.length - 1]));

export const levelsCommand: Command = {
    name: "levels",

    description: "See a list of all the levels.",

    async execute(interaction) {
        await interaction.reply({
            content: allData
                .map((x) => `Level ${x.level} - ${x.levelFloor} to ${x.levelCeiling} XP`)
                .join("\n"),
        });
    },
};
