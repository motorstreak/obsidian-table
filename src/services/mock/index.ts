import { randomCellId, randomColumnId, randomRowId } from "../random";
import {
	DEFAULT_COLUMN_SETTINGS,
	TableState,
	ColumnSettings,
	RowSettings,
	DEFAULT_ROW_SETTINGS,
} from "../table/types";

const tableHeaderRow = (numColumns: number) => {
	let row = "|";
	row += " ";

	for (let i = 0; i < numColumns; i++) {
		row += " ";
		row += `column-${i}`;
		row += " ";
		row += "|";
	}
	return row;
};

const tableHyphenRow = (numColumns: number) => {
	let row = "|";
	row += " ";

	for (let i = 0; i < numColumns; i++) {
		row += " ";
		row += "---";
		row += " ";
		row += "|";
	}
	return row;
};

const tableRow = (numColumns: number) => {
	let row = "|";
	row += " ";

	for (let i = 0; i < numColumns; i++) {
		row += " ";
		row += `cell-${i}`;
		row += " ";
		row += "|";
	}
	return row;
};

const tableIdRow = (numColumns: number, tableId: string) => {
	let row = "|";
	row += " ";

	for (let i = 0; i < numColumns; i++) {
		row += " ";
		if (i === 0) row += tableId;
		row += " ";
		row += "|";
	}
	return row;
};

export const mockMarkdownTable = (
	numColumns: number,
	numDataRows: number,
	tableId: string
): string => {
	let table = "";
	table += tableHeaderRow(numColumns) + "\n";
	table += tableHyphenRow(numColumns);
	table += "\n";
	if (numDataRows !== 0) {
		for (let i = 0; i < numDataRows; i++) {
			table += tableRow(numColumns);
			table += "\n";
		}
	}
	table += tableIdRow(numColumns, tableId);
	return table;
};

export const mockSettings = (numColumns: number, numRows: number) => {
	const columns: { [x: string]: ColumnSettings } = {};
	const rows: { [x: string]: RowSettings } = {};
	for (let i = 0; i < numColumns; i++) {
		columns[i] = { ...DEFAULT_COLUMN_SETTINGS };
	}
	for (let i = 0; i < numRows; i++) {
		rows[i] = { ...DEFAULT_ROW_SETTINGS };
	}
	return {
		columns,
		rows,
	};
};

export const mockTableState = (
	numColumns: number,
	numRows: number
): TableState => {
	const rowIds = [];
	for (let i = 0; i < numRows; i++) rowIds.push(randomRowId());

	const columnIds = [];
	for (let i = 0; i < numColumns; i++) columnIds.push(randomColumnId());

	const cells = [];
	for (let y = 0; y < numRows; y++) {
		for (let x = 0; x < numColumns; x++) {
			cells.push({
				id: randomCellId(),
				columnId: columnIds[x],
				rowId: rowIds[y],
				markdown: "",
				html: "",
				isHeader: y === 0,
			});
		}
	}
	const columnSettings = Object.fromEntries(
		columnIds.map((id) => {
			return [id, { ...DEFAULT_COLUMN_SETTINGS }];
		})
	);
	const rowSettings = Object.fromEntries(
		rowIds.map((id) => {
			return [id, DEFAULT_ROW_SETTINGS];
		})
	);
	return {
		model: {
			rowIds,
			columnIds,
			cells,
		},
		pluginVersion: 1,
		settings: {
			columns: columnSettings,
			rows: rowSettings,
		},
	};
};
