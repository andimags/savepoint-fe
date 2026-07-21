import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatPlaytime(minutes: number): string {
    if (minutes === 0) return "-";
    const hours = minutes / 60;
    return hours < 1 ? `${minutes} min` : `${hours.toFixed(1)} hrs`;
}
