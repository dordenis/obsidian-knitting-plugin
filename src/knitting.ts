
export class Knitting {

	private el: HTMLElement
	public source: string

	constructor(source: string, el: HTMLElement)
	{
		this.source = source
		this.el = el
	}

	public render(): void
	{
		const rows = this.source
			.split("\n")
			.filter((row) => row.length > 0)
			.map(row => row.replace(/\s+/g, ""));

		const cols_max = Math.max(...rows.map(r => r.length))

		const table = this.el.createEl("table", {cls: "knitting"});
		const body = table.createEl("tbody");

		for (let i = 0; i < rows.length; i++) {
			const row = body.createEl("tr");

			for (let j = 0; j < cols_max; j++) {
				row.createEl("td", { text: rows[i][j] ?? "" });
			}

			row.createEl("td", { cls: "title", text: rows.length - i });
		}

		const footer = body.createEl("tr")
		for (let j = cols_max; j > 0; j--) {
			footer.createEl("td", { cls: "title", text: j });
		}
	}


}
