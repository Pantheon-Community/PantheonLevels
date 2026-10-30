import { getCommitHash } from "@/env/getCommitHash";
import { readFromEnv } from "@/env/readFromEnv";

export const config = {
    /** Auto-generated. */
    startTime: new Date(),

    /** Auto-generated. */
    commitHash: getCommitHash(),

    /** Cooldown between messages read for XP gaining, in seconds. */
    cooldown: readFromEnv("COOLDOWN", (c) =>
        c.hasDefaultValueOf("5").isInteger().minValue(1).maxValue(6000),
    ),

    roles: readFromEnv("ROLE_IDS", (roles) =>
        roles
            .isRequired()
            .isCommaSeparatedList()
            .hasUniqueEntries()
            .map((x) => x.value),
    ),

    roleRequirements: readFromEnv("ROLE_MESSAGE_COUNTS", (reqs) =>
        reqs
            .isRequired()
            .isCommaSeparatedList()
            .hasUniqueEntries()
            .map(
                (x, i, a) =>
                    x
                        .isInteger()
                        .minValue(i === 0 ? 0 : Number(a[i - 1]?.value) + 10)
                        .maxValue(
                            i === 0
                                ? 0
                                : i == a.length - 1
                                  ? Number.MAX_SAFE_INTEGER
                                  : Number(a[i + 1]?.value),
                        ).value,
            ),
    ),

    /** Usually either "development" or "production". */
    environment: readFromEnv("NODE_ENV", (env) => env.hasDefaultValueOf("development")),

    discordBotToken: readFromEnv("DISCORD_BOT_TOKEN", (token) => token.isRequired()),

    discordServerId: readFromEnv("DISCORD_SERVER_ID", (id) => id.isRequired()),

    adminRoleId: readFromEnv("ADMIN_ROLE_ID", (id) => id.isRequired()),

    db: {
        hostname: readFromEnv("DB_HOST", (host) => host.isRequired()),

        username: readFromEnv("DB_USER", (name) => name.isRequired()),

        database: readFromEnv("DB_NAME", (name) => name.isRequired()),

        password: readFromEnv("DB_PASSWORD", (password) => password.isRequired()),

        port: readFromEnv("DB_PORT", (port) =>
            port.isRequired().isInteger().minValue(0).maxValue(65_535),
        ),
    },
} as const;

if (config.roles.length !== config.roleRequirements.length) {
    throw new Error(`Roles must be same length as role requirements`);
}
