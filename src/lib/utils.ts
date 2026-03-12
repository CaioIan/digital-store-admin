import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

const twMerge = extendTailwindMerge({
	extend: {
		classGroups: {
			"font-size": [
				"text-title-large",
				"text-title-medium",
				"text-title-small",
				"text-body-large",
				"text-body-medium",
				"text-body-small",
			],
		},
	},
});
