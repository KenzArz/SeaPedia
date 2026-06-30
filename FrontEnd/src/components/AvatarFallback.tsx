import React from "react";

const PALETTE = [
	"#4F46E5", // indigo
	"#7C3AED", // violet
	"#DB2777", // pink
	"#DC2626", // red
	"#D97706", // amber
	"#059669", // emerald
	"#0891B2", // cyan
	"#0284C7", // sky
];

function getColorFromName(name?: string): string {
	if (!name || name === "?") return PALETTE[0];
	return PALETTE[name.charCodeAt(0) % PALETTE.length];
}

interface AvatarFallbackProps {
	name?: string;
	size?: number;
	photoUrl?: string;
	className?: string;
	style?: React.CSSProperties;
}

const AvatarFallback: React.FC<AvatarFallbackProps> = ({
	name,
	size = 48,
	photoUrl,
	className = "",
	style,
}) => {
	const isLarge = size >= 160;
	const borderRadius = isLarge ? 16 : "50%";

	if (photoUrl) {
		return (
			<img
				src={photoUrl}
				alt={name ?? "avatar"}
				width={size}
				height={size}
				className={className}
				style={{
					width: size,
					height: size,
					borderRadius,
					objectFit: "cover",
					display: "block",
					flexShrink: 0,
					...style,
				}}
			/>
		);
	}

	const initial = name?.charAt(0)?.toUpperCase() ?? "?";
	const bg = getColorFromName(name);
	const fontSize = isLarge
		? Math.round(size * 0.46)
		: Math.max(Math.round(size * 0.42), 12);

	return (
		<div
			className={className}
			aria-label={name ?? "avatar"}
			style={{
				position: "relative",
				width: size,
				height: size,
				borderRadius,
				backgroundColor: bg,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				color: "#ffffff",
				fontWeight: 900,
				fontSize,
				fontFamily: "inherit",
				flexShrink: 0,
				userSelect: "none",
				letterSpacing: isLarge ? "-2px" : "normal",
				...(isLarge && {
					boxShadow: "inset 0 -6px 24px rgba(0,0,0,0.18)",
				}),
				...style,
			}}
		>
			{initial}
		</div>
	);
};

export default AvatarFallback;
