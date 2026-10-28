import type { Command } from "@/types/Command";
import { levelCommand } from "./levelCommand";
import { leveltopCommand } from "./leveltopCommand";
import { pingCommand } from "./pingCommand";

export const commands: Command[] = [levelCommand, pingCommand, leveltopCommand];
