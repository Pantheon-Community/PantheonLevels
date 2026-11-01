import { config } from "@/global/config";
import { type GuildMember, type Snowflake } from "discord.js";
import { calculateLevelIndex, rolesOfLevel } from "./levelCalculations";

export async function giveRoles(
    m: GuildMember,
    messageCount: number,
): Promise<Snowflake | undefined> {
    const levelIndex = calculateLevelIndex(messageCount);

    const roleCache = m.roles.cache;

    const rolesToTakeAway = new Set(config.roles);
    const rolesToGive: Snowflake[] = [];

    for (const roleId of rolesOfLevel(levelIndex)) {
        rolesToTakeAway.delete(roleId);
        rolesToGive.push(roleId);
    }

    for (const role of rolesToTakeAway) {
        if (roleCache.has(role)) {
            await m.roles.remove(role);
        }
    }

    let gaveAny = false;

    for (const role of rolesToGive) {
        if (!roleCache.has(role)) {
            gaveAny = true;
            await m.roles.add(role);
        }
    }

    return gaveAny ? rolesToGive.at(-1) : undefined;
}
