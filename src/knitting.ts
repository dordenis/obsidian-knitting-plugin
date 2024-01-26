import {Settings} from "./settings";

export class Knitting {

	public settings: Settings

	constructor(settings: Settings)
	{
		this.settings = settings
	}

	public render(el: HTMLElement): void
	{
		const rows = this.settings.source
			.split("\n")
			.filter((row) => row.length > 0)
			.map(row => row.replace(/\s+/g, ""));

		const cols_max = Math.max(...rows.map(r => r.length))

		const table = el.createEl("table", {cls: ["knitting", this.settings.style]});

		const body = table.createEl("tbody");

		for (let i = 0; i < rows.length; i++) {
			const row = body.createEl("tr");

			for (let j = 0; j < cols_max; j++) {
				const letter = rows[i][j] ?? ""
				row.createEl("td", { text: letter, attr: {style: `color: ${this.settings.colors[letter] ?? ""}`}});
			}

			row.createEl("td", { cls: "title", text: rows.length - i });
		}

		const footer = body.createEl("tr")
		for (let j = cols_max; j > 0; j--) {
			footer.createEl("td", { cls: "title", text: j });
		}
	}

}
