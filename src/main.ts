import {parseYaml, Plugin} from "obsidian";
import {Knitting} from "./knitting";
import {DEFAULT_SETTINGS, Settings} from "./settings";
import {knittingEdit} from "./edit";

export default class KnittingPlugin extends Plugin {

	settings: Settings;

	async onload() {
		console.log("Load knitting plugin")

		await this.loadSettings()

		this.registerEditorExtension(knittingEdit);


		this.registerMarkdownCodeBlockProcessor("knitting",   async (source, el, ctx) => {
			const settings: Settings = await this.getSettings(source)
			const knitting = new Knitting(settings)
			knitting.render(el)
		});

	}

	onunload() {
		super.onunload();
		console.log("Unload knitting plugin")
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
	}

	async getSettings(source: string) {
		const res = source.split("---")
		const setting = await parseYaml(res[0])
		setting.source = res[1]
		setting.colors = this.getColors(setting.colors)
		return  Object.assign({}, this.settings, setting)
	}

	getColors(colors: string) {
		const result: Record<string, string> = {}

		if (!colors) {
			return result
		}

		colors.split(",").forEach(s => {
			const res = s.split("-")
			result[res[0].trim()] = res[1].trim()
		})

		return result
	}


}
