import { syntaxTree } from "@codemirror/language";
import {RangeSetBuilder} from "@codemirror/state";
import {
	Decoration,
	DecorationSet,
	EditorView,
	PluginValue,
	ViewPlugin,
	ViewUpdate,
} from "@codemirror/view";
import {DEFAULT_SETTINGS} from "./settings";


const wrapper = (style: string | undefined) => Decoration.line({
	attributes: {class: `knitting-line ${style}`}
})

class KnittingEdit implements PluginValue {

	decorations: DecorationSet;

	constructor(view: EditorView) {
		this.decorations = this.buildDecorations(view);
	}

	update(update: ViewUpdate) {
		if (update.docChanged || update.viewportChanged) {
			this.decorations = this.buildDecorations(update.view);
		}
	}

	destory() {}

	buildDecorations(view: EditorView) {
		const builder = new RangeSetBuilder<Decoration>();

		let isKnittingBlock: boolean
		let startLine: number | undefined
		let style: string | undefined = DEFAULT_SETTINGS.style

		for (const {from, to} of view.visibleRanges) {
			const tree = syntaxTree(view.state)

			tree.iterate({
				from, to,
				// @ts-ignore
				enter: ({type, from, to}) => {

					const context = view.state.doc.lineAt(from).text
					const line = view.state.doc.lineAt(from).number

					if (type.name.startsWith("formatting_formatting-code-block")) {
						isKnittingBlock = context.startsWith("```knitting")
						startLine = undefined
					}

					if (type.name.startsWith("hmd-codeblock") && isKnittingBlock) {
						if (context.startsWith("---")) {
							startLine = line
						}
					}

					if (type.name.startsWith("hmd-codeblock") && isKnittingBlock) {
						const regext = /style: +(\w+)/im
						const match = regext.exec(context)
						if (match && match[1]) {
							style = match[1]
						}
					}

					if (type.name.startsWith("hmd-codeblock") && isKnittingBlock && line > startLine) {
						builder.add(from, from, wrapper(style))
					}
				}
			})
		}

		return builder.finish();
	}
}

export const knittingEdit = ViewPlugin.fromClass(
	KnittingEdit, {
		decorations: v => v.decorations
	}
)
