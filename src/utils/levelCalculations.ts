import { config } from "@/global/config";
import type { LevelInfo } from "@/types/LevelInfo";
import type { Snowflake } from "discord.js";

const { roles, roleRequirements } = config;

const len = roleRequirements.length - 1;

/**
 * Gets {@link value} as a percentage of {@link start} to {@link stop}.
 *
 * @example inverseLerp(10, 20, 15); // 50%
 * @example inverseLerp(20, 40, 35); // 75%
 */
function inverseLerp(start: number, stop: number, value: number): number {
    return (value - start) / (stop - start);
}

function lerp(start: number, stop: number, pct: number): number {
    return start + (stop - start) * pct;
}

export function clamp(x: number, min: number, max: number): number {
    return Math.min(max, Math.max(x, min));
}

export function calculateLevelIndex(messageCount: number): number {
    for (let i = 0; i < len; i++) {
        const nextCount = roleRequirements[i + 1];

        if (messageCount >= nextCount) continue;

        return i;
    }

    return len;
}

export function* rolesOfLevel(index: number): Generator<Snowflake> {
    for (let i = 0; i <= index; i++) {
        yield roles[i];
    }
}

export function calculateLevel(messageCount: number): LevelInfo {
    for (let i = 0; i < len; i++) {
        const nextCount = roleRequirements[i + 1];

        if (messageCount >= nextCount) continue;

        const thisCount = roleRequirements[i];

        const generalPct = 10 * inverseLerp(thisCount, nextCount, messageCount);

        const subLevel = Math.floor(generalPct);

        const subLevelPct = generalPct % 1;

        return {
            level: 10 * i + subLevel,
            levelFloor: lerp(thisCount, nextCount, subLevel / 10),
            levelCeiling: lerp(thisCount, nextCount, (subLevel + 1) / 10),
            percentDone: Math.floor(100 * subLevelPct),
        };
    }

    return {
        level: 10 * len,
        levelFloor: roleRequirements[len],
        levelCeiling: Number.POSITIVE_INFINITY,
        percentDone: 0,
    };
}
