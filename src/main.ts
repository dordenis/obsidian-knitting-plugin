import { Plugin } from "obsidian";
import {Knitting} from "./knitting";

export default class KnittingPlugin extends Plugin {

	async onload() {
		console.log("Load knitting plugin")

		this.registerMarkdownCodeBlockProcessor("knitting",   async (source, el, ctx) => {
			const knitting = new Knitting(source, el)
			knitting.render()
		});

	}

	onunload() {
		super.onunload();
		console.log("Unload knitting plugin")
	}


}
