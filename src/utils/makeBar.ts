import { clamp } from "./levelCalculations";

const barA = "<:LevelLight:1566783307365224518>";
const barB = "<:LevelDark:1566783466408902676>";

export function makeBar(percentFill: number, width: number, emptyChar = barB): string {
    const fillPart = Math.round(percentFill * width);

    return barA.repeat(fillPart) + emptyChar.repeat(width - fillPart);
}

export function makeClampedBar(percentFill: number, width: number, emptyChar = barB): string {
    const fillPart = clamp(Math.round(percentFill * width), 1, width - 1);

    return barA.repeat(fillPart) + emptyChar.repeat(width - fillPart);
}
