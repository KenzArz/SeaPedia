import React from "react";

interface ComingSoonSlotProps {
	icon: React.ReactNode;
	title: string;
	description: string;
}

const ComingSoonSlot: React.FC<ComingSoonSlotProps> = ({
	icon,
	title,
	description,
}) => (
	<div className="cs-slot">
		<div className="cs-slot-icon">{icon}</div>
		<div className="cs-slot-text">
			<span className="cs-slot-title">{title}</span>
			<span className="cs-slot-desc">{description}</span>
		</div>
	</div>
);

export default ComingSoonSlot;
