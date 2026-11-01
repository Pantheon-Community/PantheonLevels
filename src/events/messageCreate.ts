import { client } from "@/global/client";
import { config } from "@/global/config";
import { isOnCooldown, setIsOnCooldown } from "@/global/limiter";
import { UserModel } from "@/models/UserModel";
import { giveRoles } from "@/utils/giveRoles";
import { Events, roleMention, userMention } from "discord.js";

const { discordServerId } = config;

export function addMessageCreateListeners() {
    client.on(Events.MessageCreate, async (m) => {
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

            const messageCount = await UserModel.increment(id, displayName);

            const highestRoleGiven = await giveRoles(m.member, messageCount);

            if (highestRoleGiven !== undefined) {
                await m.reply({
                    content: `${userMention(id)} levelled up to ${roleMention(highestRoleGiven)}`,
                    allowedMentions: {},
                });
            }
        } catch (error) {
            console.log(error);
        }
    });
}
