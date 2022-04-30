import React, { useRef, useEffect } from "react";

import "./styles.css";

interface Props {
	isOpen: boolean;
	style?: object;
	children: React.ReactNode;
	onOutsideClick: (e: MouseEvent | null) => void;
}

export default function Menu({
	isOpen,
	style,
	children,
	onOutsideClick,
}: Props) {
	const menuRef = useRef(null);

	useEffect(() => {
		function cleanup() {
			document.removeEventListener("mousedown", handleClick);
			document.removeEventListener("keyup", handleKeyUp);
		}

		const handleClick = (e: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(e.target))
				onOutsideClick(e);
		};

		function handleKeyUp(e: KeyboardEvent) {
			if (e.key === "Enter") onOutsideClick(null);
		}

		if (isOpen) {
			document.addEventListener("mousedown", handleClick);
			document.addEventListener("keyup", handleKeyUp);
		}
		return () => cleanup();
	}, [menuRef, onOutsideClick]);

	if (!isOpen) return <></>;

	return (
		<div className="NLT__menu" ref={menuRef}>
			<div className="NLT__menu-container" style={style}>
				{children}
			</div>
		</div>
	);
}
