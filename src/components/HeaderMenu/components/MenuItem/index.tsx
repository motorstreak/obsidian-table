import Icon from "src/components/Icon";
import Stack from "src/components/Stack";
import { IconType } from "src/services/icon/types";

interface Props {
	icon?: IconType | null;
	content: string;
	onClick: any;
	selected?: boolean;
}
export default function MenuItem({
	icon,
	content,
	onClick,
	selected = false,
}: Props) {
	let className = "NLT__header-menu-item NLT__selectable";
	if (selected) className += " NLT__selected";

	return (
		<li className={className} onClick={() => onClick()}>
			<Stack>
				{icon !== null && <Icon icon={icon} />}
				<p className="NLT__p">{content}</p>
			</Stack>
		</li>
	);
}
