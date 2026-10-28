import type { Client } from "discord.js";

export let client: Client<true>;

export function setClient(value: Client<true>): void {
    client = value;
}
