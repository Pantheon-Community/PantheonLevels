import { client } from "@/global/client";
import { config } from "@/global/config";
import { Events } from "discord.js";

const { discordServerId, roles, roleRequirements } = config;

export function addGuildMemberAddListeners(): void {
    if (roleRequirements[0] > 0) {
        return;
    }

    client.on(Events.GuildMemberAdd, async (member) => {
        try {
            if (member.user.bot || member.user.system || member.guild.id !== discordServerId) {
                return;
            }

            const roleCache = member.roles.cache;

            if (!roleCache.has(roles[0])) {
                await member.roles.add(roles[0]);
            }
        } catch (error) {
            console.log(error);
        }
    });
}
