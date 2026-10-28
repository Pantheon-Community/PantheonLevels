import { clamp } from "./levelCalculations";

const barA = "<:histo_again:1564942981922816080>";
const barB = "<:histo_again_darker:1564943020313284698>";

export function makeBar(percentFill: number, width: number, emptyChar = barB): string {
    const fillPart = Math.round(percentFill * width);

    return barA.repeat(fillPart) + emptyChar.repeat(width - fillPart);
}

export function makeClampedBar(percentFill: number, width: number, emptyChar = barB): string {
    const fillPart = clamp(Math.round(percentFill * width), 1, width - 1);

    return barA.repeat(fillPart) + emptyChar.repeat(width - fillPart);
}
