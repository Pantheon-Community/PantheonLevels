import type { Snowflake } from "discord.js";
import { config } from "./config";

export const idsOnCooldown = new Map<Snowflake, number>();

export function isOnCooldown(id: Snowflake): boolean {
    const timestamp = idsOnCooldown.get(id);

    if (timestamp === undefined) {
        return false;
    }

    if (timestamp <= Date.now()) {
        return false;
    }

    return true;
}

export function setIsOnCooldown(id: Snowflake): void {
    idsOnCooldown.set(id, Date.now() + 1000 * config.cooldown);
}

export function setCooldownChecks(): void {
    setInterval(() => {
        for (const [key, value] of idsOnCooldown.entries()) {
            if (value <= Date.now()) {
                idsOnCooldown.delete(key);
            }
        }
    }, 10_000);
}
