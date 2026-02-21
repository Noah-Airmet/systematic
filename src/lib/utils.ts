import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function json<T>(data: T, init?: ResponseInit) {
  return Response.json(data, init);
}
