import { syntaxTree } from "@codemirror/language";
import { RangeSetBuilder } from "@codemirror/state";
import {
	Decoration,
	DecorationSet,
	EditorView,
	PluginValue,
	ViewPlugin,
	ViewUpdate,
	WidgetType,
} from "@codemirror/view";
import {DEFAULT_SETTINGS} from "./settings";

const wrapper = (style: string | undefined) => Decoration.line({
	attributes: {class: `knitting-line ${style}`}
})

class KnittingWidget extends WidgetType {
	context: string;
	style: string

	constructor(context: string, style: string) {
		super();
		this.context = context
		this.style = style
	}

	toDOM(view: EditorView): HTMLElement {
		const el = document.createElement("span");
		el.className = `cm-hmd-codeblock knitting-line ${this.style}`
		el.textContent = this.context;
		return el;
	}
}

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

	destroy() {}

	buildDecorations(view: EditorView): DecorationSet {
		const builder = new RangeSetBuilder<Decoration>();

		let isKnittingBlock = false
		let startLine: number | undefined = undefined
		let style = DEFAULT_SETTINGS.style

		for (const { from, to } of view.visibleRanges) {
			const tree = syntaxTree(view.state)

			tree.iterate({
				from, to,
				enter: function (node) {

					const context = view.state.doc.lineAt(node.from).text
					const line = view.state.doc.lineAt(node.from).number


					if (node.type.name.startsWith("formatting_formatting-code-block")) {
						isKnittingBlock = context.startsWith("```knitting")
						startLine = undefined
					}

					if (context.startsWith("---") && isKnittingBlock) {
						startLine = line
					}

					if (context.startsWith("style") && isKnittingBlock) {
						const regext = /style: +(\w+)/im
						const match = regext.exec(context)
						if (match && match[1]) {
							style = match[1]
						}
					}

					if (isKnittingBlock && node.type.name.startsWith("hmd-codeblock") && context.startsWith("colors:")) {
						[...context.matchAll(new RegExp(/[: ,]+([^- ]+)[ -]/, 'gi'))].forEach(m => {
							const n = node.from + m.index + m[0].indexOf(m[1])
							builder.add(
								n,
								n + m[1].length,
								Decoration.replace({
									widget: new KnittingWidget(m[1], style),
								})
							);
						})
					}

					if (isKnittingBlock && node.type.name.startsWith("hmd-codeblock") && line > startLine) {
						builder.add(node.from, node.from, wrapper(style))
					}
				},
			});
		}

		return builder.finish();
	}
}

export const knittingEdit = ViewPlugin.fromClass(
	KnittingEdit, {
		decorations: v => v.decorations
	}
);
