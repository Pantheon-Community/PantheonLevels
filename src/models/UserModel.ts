import { pg, pgUnsafe } from "@/global/pg";
import type { Snowflake } from "discord.js";

interface RawUserModel {
    id: string;

    username: string;

    message_count: number;
}

export class UserModel {
    public static async setup(): Promise<void> {
        await pgUnsafe(`
            CREATE TABLE IF NOT EXISTS discord_user_levels (
                id TEXT PRIMARY KEY,
                username TEXT NOT NULL,
                message_count INTEGER NOT NULL DEFAULT 0
            );

            CREATE INDEX IF NOT EXISTS discord_user_levels_message_count_idx ON discord_user_levels(message_count);
        `);
    }

    public static async increment(id: Snowflake, username: string): Promise<number> {
        const [{ message_count }] = await pg<[Pick<RawUserModel, "message_count">]>`
            INSERT INTO discord_user_levels (id, username, message_count)
            VALUES (${id}, ${username}, 1)
            ON CONFLICT (id)
            DO UPDATE SET
                username = ${username},
                message_count = discord_user_levels.message_count + 1
            RETURNING message_count
        `;

        return message_count;
    }

    public static async get(id: Snowflake): Promise<number> {
        const [result] = await pg<Pick<RawUserModel, "message_count">[]>`
            SELECT message_count FROM discord_user_levels WHERE id = ${id}
        `;

        return result?.message_count ?? 0;
    }

    public static async set(id: Snowflake, username: string, messageCount: number): Promise<void> {
        await pg`
            INSERT INTO discord_user_levels (id, username, message_count)
            VALUES (${id}, ${username}, ${messageCount})
            ON CONFLICT (id)
            DO UPDATE SET
                username = ${username},
                message_count = ${messageCount}
        `;
    }

    public static async add(id: Snowflake, username: string, amount: number): Promise<void> {
        await pg`
            INSERT INTO discord_user_levels (id, username, message_count)
            VALUES (${id}, ${username}, ${amount})
            ON CONFLICT (id)
            DO UPDATE SET
                username = ${username},
                message_count = discord_user_levels.message_count + ${amount}
        `;
    }

    public static async getPercentile(messageCount: number): Promise<number> {
        const [{ percentile }] = await pg<[{ percentile: string }]>`
            SELECT 100.0 * COUNT(*) FILTER (WHERE message_count <= ${messageCount})
            / COUNT(*) AS percentile
            FROM discord_user_levels
        `;

        return Number(percentile);
    }

    public static async getRank(messageCount: number): Promise<number | null> {
        const [result] = await pg<{ ranking: string }[]>`
            WITH ranked AS (
                SELECT message_count,
                RANK() OVER (ORDER BY message_count DESC) AS ranking
                FROM discord_user_levels
            )
            SELECT ranking
            FROM ranked
            WHERE message_count = ${messageCount}
        `;

        if (result !== undefined) {
            return Number(result.ranking);
        }

        return null;
    }

    public static async getTop(limit: number): Promise<[string, number][]> {
        const results = await pg<Pick<RawUserModel, "username" | "message_count">[]>`
            SELECT username, message_count FROM discord_user_levels
            ORDER BY message_count DESC
            LIMIT ${limit}
        `;

        return results.map((x) => [x.username, x.message_count]);
    }
}
