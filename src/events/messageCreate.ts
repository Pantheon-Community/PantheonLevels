import { client } from "@/global/client";
import { config } from "@/global/config";
import { isOnCooldown, setIsOnCooldown } from "@/global/limiter";
import { UserModel } from "@/models/UserModel";
import { calculateLevelIndex, rolesOfLevel } from "@/utils/levelCalculations";
import { Events } from "discord.js";

const { discordServerId } = config;

export function addMessageCreateListeners() {
    client.on(Events.MessageCreate, async (m) => {
        if (m.member?.id === "240312568273436674") {
            client.emit(Events.GuildMemberAdd, m.member);
        }

        try {
            if (
                m.author.bot ||
                m.author.system ||
                m.member === null ||
                m.guildId !== discordServerId
            )
                return;

            const { id, displayName } = m.author;

            if (isOnCooldown(id)) return;

            setIsOnCooldown(id);

            let messageCount = await UserModel.increment(id, displayName);

            const levelIndex = calculateLevelIndex(messageCount);

            const roleCache = m.member.roles.cache;

            for (const roleId of rolesOfLevel(levelIndex)) {
                if (!roleCache.has(roleId)) {
                    await m.member.roles.add(roleId);
                }
            }
        } catch (error) {
            console.log(error);
        }
    });
}
