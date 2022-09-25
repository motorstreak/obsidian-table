import {
	Plugin,
	Editor,
	MarkdownView,
	Notice,
	MarkdownViewModeType,
} from "obsidian";

import NltSettingsTab from "./NltSettingsTab";

import { NltTable } from "./NltTable";
import { addRow, addColumn } from "./services/internal/add";
import { serializeTable } from "./services/io/serialize";
import { createEmptyMarkdownTable } from "./services/random";
import {
	closeAllMenus,
	getTopLevelMenu,
	closeTopLevelMenu,
	timeSinceMenuOpen,
	updateMenuPosition,
} from "./services/menu/menuSlice";
import { store } from "./services/redux/store";
import { TableState } from "./services/table/types";
import _ from "lodash";
export interface NltSettings {
	data: {
		[tableId: string]: TableState;
	};
	tableFolder: string;
	viewModeSync: {
		tableId: string | null;
		viewModes: MarkdownViewModeType[];
	};
	viewModeSyncInterval: number;
}

export const DEFAULT_SETTINGS: NltSettings = {
	data: {},
	tableFolder: "_notion-like-tables",
	viewModeSync: {
		tableId: null,
		viewModes: [],
	},
	viewModeSyncInterval: 2000,
};
export default class NltPlugin extends Plugin {
	settings: NltSettings;
	focusedTable: string | null = null;
	layoutChangeTime: number;

	private getViewMode = (el: HTMLElement): MarkdownViewModeType | null => {
		const parent = el.parentElement;
		if (parent) {
			return parent.className.includes("cm-preview-code-block")
				? "source"
				: "preview";
		}
		return null;
	};

	isLivePreviewEnabled() {
		return (this.app.vault as any).config?.livePreview;
	}

	/**
	 * Called on plugin load.
	 * This can be when the plugin is enabled or Obsidian is first opened.
	 */
	async onload() {
		await this.loadSettings();
		await this.forcePostProcessorReload();

		this.registerMarkdownCodeBlockProcessor(
			"notion-like-tables",
			(source, el, ctx) => {
				const TABLE_ID_REGEX = new RegExp(/^table-id-[a-zA-Z0-9_-]+$/);
				const text = source.trim();
				const tableId = text.match(TABLE_ID_REGEX) ? text : null;
				if (tableId) {
					const viewMode = this.getViewMode(el);
					if (viewMode) {
						ctx.addChild(new NltTable(el, this, tableId, viewMode));
					}
				}
			}
		);

		this.addSettingTab(new NltSettingsTab(this.app, this));
		this.registerCommands();
		this.registerEvents();
	}

	private throttleFileScroll = _.throttle(() => {
		const topLevelMenu = getTopLevelMenu(store.getState());
		if (topLevelMenu !== null) store.dispatch(closeAllMenus());
		store.dispatch(updateMenuPosition());
	}, 150);

	registerEvents() {
		this.registerEvent(
			this.app.workspace.on("file-open", () => {
				//Clear the focused table
				this.blurTable();

				let livePreviewScroller =
					document.querySelector(".cm-scroller");
				let readingModeScroller = document.querySelector(
					".markdown-preview-view"
				);
				if (livePreviewScroller) {
					livePreviewScroller.addEventListener("scroll", () => {
						this.throttleFileScroll();
					});
				}
				if (readingModeScroller) {
					readingModeScroller.addEventListener("scroll", () => {
						this.throttleFileScroll();
					});
				}
			})
		);

		this.registerEvent(
			this.app.workspace.on("resize", () => {
				const topLevelMenu = getTopLevelMenu(store.getState());
				if (topLevelMenu !== null) store.dispatch(closeAllMenus());
			})
		);

		this.registerEvent(
			this.app.workspace.on("layout-change", () => {
				this.app.workspace.on("resize", () => {
					const topLevelMenu = getTopLevelMenu(store.getState());
					if (topLevelMenu !== null) store.dispatch(closeAllMenus());
				});
			})
		);

		this.registerDomEvent(activeDocument, "keydown", async (e) => {
			if (e.key === "Enter") {
				const topLevelMenu = getTopLevelMenu(store.getState());
				if (topLevelMenu !== null) store.dispatch(closeTopLevelMenu());
			}
		});

		this.registerDomEvent(activeDocument, "click", (el: any) => {
			const topLevelMenu = getTopLevelMenu(store.getState());
			//Without this, the menu will immediately close on our open click
			const time = timeSinceMenuOpen(store.getState());
			if (topLevelMenu !== null && time > 100) {
				for (let i = 0; i < el.path.length; i++) {
					const element = el.path[i];
					if (element instanceof HTMLElement) {
						if (element.id === topLevelMenu.id) break;
						//If we've clicked in the app but not in the menu
						if (element.className.includes("NLT__app")) {
							store.dispatch(closeTopLevelMenu());
							break;
						}
						//If we're clicking outside of the app
						if (element.className.includes("view-content")) {
							store.dispatch(closeAllMenus());
							break;
						}
					}
				}
			} else {
				for (let i = 0; i < el.path.length; i++) {
					const element = el.path[i];
					if (element instanceof HTMLElement) {
						//If we've clicked in an app
						if (element.className.includes("NLT__app")) {
							const id = element.getAttribute("data-id");
							this.focusTable(id);
							break;
						}
						//If we're clicking outside of the app
						if (element.className.includes("view-content")) {
							this.blurTable();
							break;
						}
					}
				}
			}
		});
	}

	registerCommands() {
		this.addCommand({
			id: "nlt-add-table",
			name: "Add table",
			hotkeys: [{ modifiers: ["Mod", "Shift"], key: "=" }],
			editorCallback: (editor: Editor) => {
				editor.replaceSelection(createEmptyMarkdownTable());
			},
		});

		this.addCommand({
			id: "nlt-add-column",
			name: "Add column to focused table",
			hotkeys: [{ modifiers: ["Mod", "Shift"], key: "\\" }],
			callback: async () => {
				if (this.focusedTable) {
					const tableId = this.focusedTable;
					const { model, settings } = this.settings.data[tableId];
					const [updatedModel, updatedSettings] = addColumn(
						model,
						settings
					);
					const newState = {
						...this.settings.data[tableId],
						model: updatedModel,
						settings: updatedSettings,
					};
					const viewModesToUpdate: MarkdownViewModeType[] = [
						"preview",
					];
					if (this.isLivePreviewEnabled())
						viewModesToUpdate.push("source");
					await serializeTable(
						true,
						this,
						newState,
						tableId,
						viewModesToUpdate
					);
				} else {
					new Notice(
						"No focused table. Please click a table to focus it and retry this operation again."
					);
				}
			},
		});

		this.addCommand({
			id: "nlt-add-row",
			name: "Add row to focused table",
			hotkeys: [{ modifiers: ["Mod", "Shift"], key: "Enter" }],
			callback: async () => {
				if (this.focusedTable) {
					const tableId = this.focusedTable;
					const { model } = this.settings.data[tableId];
					const updatedModel = addRow(model);
					const newState = {
						...this.settings.data[tableId],
						model: updatedModel,
					};
					const viewModesToUpdate: MarkdownViewModeType[] = [
						"preview",
					];
					if (this.isLivePreviewEnabled())
						viewModesToUpdate.push("source");
					await serializeTable(
						true,
						this,
						newState,
						tableId,
						viewModesToUpdate
					);
				} else {
					new Notice(
						"No focused table. Please click a table to focus it and retry this operation."
					);
				}
			},
		});
	}

	focusTable = (tableId: string) => {
		this.focusedTable = tableId;
	};

	blurTable = () => {
		this.focusedTable = null;
	};

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	/**
	 * Called on plugin unload.
	 * This can be when the plugin is disabled or Obsidian is closed.
	 */
	async onunload() {
		await this.forcePostProcessorReload();
	}

	/*
	 * Forces the post processor to be called again.
	 * This is necessary for clean up purposes on unload and causing NLT tables
	 * to be rendered onload.
	 */
	async forcePostProcessorReload() {
		this.app.workspace.iterateAllLeaves((leaf) => {
			const view = leaf.view;
			if (view.getViewType() === "markdown") {
				if (view instanceof MarkdownView)
					view.previewMode.rerender(true);
			}
		});
	}
}
