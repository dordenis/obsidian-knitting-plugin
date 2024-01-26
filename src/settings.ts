
export interface Settings {
	style: string
	colors: Record<string, string>[]
	source: string
}

export const DEFAULT_SETTINGS: Partial<Settings> = {
	style: "jfont"
}
