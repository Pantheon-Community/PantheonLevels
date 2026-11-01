import { config } from "@/global/config";
import { type GuildMember, type Snowflake } from "discord.js";
import { calculateLevelIndex, rolesOfLevel } from "./levelCalculations";

export async function giveRoles(m: GuildMember, messageCount: number): Promise<void> {
    const levelIndex = calculateLevelIndex(messageCount);

    const roleCache = m.roles.cache;

    const rolesToTakeAway = new Set(config.roles);
    const rolesToGive = new Set<Snowflake>();

    for (const roleId of rolesOfLevel(levelIndex)) {
        rolesToTakeAway.delete(roleId);
        rolesToGive.add(roleId);
    }

    for (const role of rolesToTakeAway) {
        if (roleCache.has(role)) {
            await m.roles.remove(role);
            console.log(`remove ${(await m.guild.roles.fetch(role))?.name}`);
        }
    }

    for (const role of rolesToGive) {
        if (!roleCache.has(role)) {
            await m.roles.add(role);
            console.log(`give ${(await m.guild.roles.fetch(role))?.name}`);
        }
    }
}
