import { findColorClass } from "src/services/color";
import { uppercaseFirst } from "src/services/string/utils";
import "./styles.css";

interface Props {
	isDarkMode: boolean;
	color: string;
	isSelected: boolean;
	onColorClick: (color: string) => void;
}

export default function ColorItem({
	isDarkMode,
	color,
	isSelected,
	onColorClick,
}: Props) {
	let containerClass = "NLT__color-item NLT__selectable";
	if (isSelected) containerClass += " NLT__selected";

	const colorClass = findColorClass(isDarkMode, color);
	let squareClass = "NLT__color-item-square";
	squareClass += " " + colorClass;

	return (
		<div
			className={containerClass}
			onClick={(e) => {
				//Stop event propagation so we don't select the tag menu
				//and close it
				e.stopPropagation();
				onColorClick(color);
			}}
		>
			<div className={squareClass}></div>
			<div>{uppercaseFirst(color)}</div>
		</div>
	);
}
