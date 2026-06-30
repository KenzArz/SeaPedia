import React, { useEffect } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

export type ToastType = "success" | "error";

export interface ToastProps {
	message: string;
	type?: ToastType;
	onClose: () => void;
	duration?: number;
}

const Toast: React.FC<ToastProps> = ({
	message,
	type = "success",
	onClose,
	duration = 2500,
}) => {
	useEffect(() => {
		const timer = setTimeout(onClose, duration);
		return () => clearTimeout(timer);
	}, [onClose, duration]);

	const isSuccess = type === "success";

	return (
		<div
			role="status"
			aria-live="polite"
			style={{
				position: "fixed",
				bottom: 28,
				right: 24,
				zIndex: 9999,
				display: "flex",
				alignItems: "center",
				gap: 10,
				padding: "12px 16px",
				borderRadius: 10,
				background: isSuccess ? "#ecfdf5" : "#fef2f2",
				border: `1px solid ${isSuccess ? "#a7f3d0" : "#fecaca"}`,
				color: isSuccess ? "#065f46" : "#b91c1c",
				boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
				fontSize: 13.5,
				fontWeight: 600,
				maxWidth: 340,
				animation: "toastIn 0.25s cubic-bezier(0.34,1.56,0.64,1) both",
				fontFamily: "inherit",
			}}
		>
			{isSuccess ? (
				<CheckCircle size={16} style={{ flexShrink: 0 }} />
			) : (
				<XCircle size={16} style={{ flexShrink: 0 }} />
			)}
			<span style={{ flex: 1 }}>{message}</span>
			<button
				onClick={onClose}
				aria-label="Tutup notifikasi"
				style={{
					background: "none",
					border: "none",
					cursor: "pointer",
					color: "inherit",
					padding: "0 2px",
					lineHeight: 1,
					opacity: 0.6,
					flexShrink: 0,
				}}
			>
				<X size={14} />
			</button>

			<style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
      `}</style>
		</div>
	);
};

export default Toast;
