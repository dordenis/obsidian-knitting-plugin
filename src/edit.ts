import { syntaxTree } from "@codemirror/language";
import { RangeSetBuilder } from "@codemirror/state";
import {
	Decoration,
	DecorationSet,
	EditorView,
	PluginSpec,
	PluginValue,
	ViewPlugin,
	ViewUpdate,
	WidgetType,
} from "@codemirror/view";
import {DEFAULT_SETTINGS} from "./settings";

class KnittingWidget extends WidgetType {
	context: string;
	style: string

	constructor(context: string, style: string) {
		super();
		this.context = context
		this.style = style
	}

	toDOM() {
		const el = document.createElement('span');
		el.className = `knitting-line ${this.style}`;
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

	destory() {}

	buildDecorations(view: EditorView) {
		const builder = new RangeSetBuilder<Decoration>();
		let isKnittingBlock: boolean
		let startLine: number|undefined
		let style: string = DEFAULT_SETTINGS.style

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

					if (type.name.startsWith("hmd-codeblock") && isKnittingBlock && line>startLine) {
						const deco = Decoration.replace({
							widget: new KnittingWidget(context, style)
						});
						builder.add(from, to, deco);
					}
				}
			})
		}

		return builder.finish();
	}
}

const pluginSpec: PluginSpec<KnittingEdit> = {
	decorations: (value: KnittingEdit) => value.decorations,
};

export const knittingEdit = ViewPlugin.fromClass(
	KnittingEdit,
	pluginSpec
);
