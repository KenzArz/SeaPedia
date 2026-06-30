import React, { useState, useEffect, useRef, useCallback } from "react";
import { User, Camera, Check, X, Loader, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AvatarFallback from "../components/AvatarFallback";
import { userService, type UserProfile } from "../services/userService";
import "../styles/PersonalProfile.css";

type ProfileTab = "profile";

const GENDER_OPTIONS = ["Male", "Female", "Prefer not to say"] as const;
type Gender = (typeof GENDER_OPTIONS)[number];

function formatDate(iso: string | null | undefined): string {
	if (!iso) return "—";
	const d = new Date(iso);
	if (isNaN(d.getTime())) return "—";
	return d.toLocaleDateString("id-ID", {
		day: "numeric",
		month: "long",
		year: "numeric",
	});
}

function toInputDate(iso: string | null | undefined): string {
	if (!iso) return "";
	const d = new Date(iso);
	if (isNaN(d.getTime())) return "";
	return d.toISOString().slice(0, 10);
}

interface FieldRowProps {
	label: string;
	displayValue: React.ReactNode;
	editLabel?: string;
	disabled?: boolean;
	children?: React.ReactNode;
	isEditing: boolean;
	onEditClick: () => void;
}
const FieldRow: React.FC<FieldRowProps> = ({
	label,
	displayValue,
	editLabel = "Ubah",
	disabled,
	children,
	isEditing,
	onEditClick,
}) => (
	<div className="pp-field-row">
		<div className="pp-field-meta">
			<span className="pp-field-label">{label}</span>
			{!isEditing ? (
				<div className="pp-field-value-row">
					<span className="pp-field-value">{displayValue}</span>
					{!disabled && (
						<button className="pp-link-btn" onClick={onEditClick}>
							{editLabel}
						</button>
					)}
				</div>
			) : (
				<div className="pp-field-edit">{children}</div>
			)}
		</div>
	</div>
);

const PersonalProfile: React.FC = () => {
	const { user: authUser } = useAuth();

	const [activeTab, setActiveTab] = useState<ProfileTab>("profile");
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [loading, setLoading] = useState(true);
	const [fetchError, setFetchError] = useState("");

	const fileInputRef = useRef<HTMLInputElement>(null);
	const [previewPhoto, setPreviewPhoto] = useState<string>("");
	const [uploadingPhoto, setUploadingPhoto] = useState(false);
	const [photoError, setPhotoError] = useState("");
	const [photoSuccess, setPhotoSuccess] = useState("");

	const [editingField, setEditingField] = useState<string | null>(null);

	const [draftName, setDraftName] = useState("");
	const [draftDob, setDraftDob] = useState("");
	const [draftGender, setDraftGender] = useState<Gender>("Prefer not to say");
	const [draftPhone, setDraftPhone] = useState("");

	const [savingField, setSavingField] = useState(false);
	const [fieldError, setFieldError] = useState("");
	const [fieldSuccess, setFieldSuccess] = useState("");
	useEffect(() => {
		let mounted = true;
		setLoading(true);
		userService
			.getMe()
			.then((res) => {
				if (!mounted) return;
				setProfile(res.data.data);
				setPreviewPhoto(res.data.data.profilePhoto ?? "");
			})
			.catch(() => {
				if (!mounted) return;
				setFetchError("Gagal memuat profil. Silakan refresh halaman.");
			})
			.finally(() => {
				if (mounted) setLoading(false);
			});
		return () => {
			mounted = false;
		};
	}, []);

	const showFieldSuccess = useCallback((msg: string) => {
		setFieldSuccess(msg);
		setTimeout(() => setFieldSuccess(""), 2500);
	}, []);
	const showPhotoSuccess = useCallback((msg: string) => {
		setPhotoSuccess(msg);
		setTimeout(() => setPhotoSuccess(""), 2500);
	}, []);

	const openEdit = (field: string) => {
		if (!profile) return;
		setFieldError("");
		setFieldSuccess("");
		setEditingField(field);
		if (field === "name") setDraftName(profile.fullName ?? "");
		if (field === "dob") setDraftDob(toInputDate(profile.dateOfBirth));
		if (field === "gender")
			setDraftGender((profile.gender as Gender) ?? "Prefer not to say");
		if (field === "phone") setDraftPhone(profile.phoneNumber ?? "");
	};
	const cancelEdit = () => {
		setEditingField(null);
		setFieldError("");
	};

	const saveField = async (field: string) => {
		if (!profile) return;
		setFieldError("");

		if (field === "name" && !draftName.trim()) {
			setFieldError("Nama tidak boleh kosong");
			return;
		}
		if (field === "phone" && draftPhone.trim()) {
			const digits = draftPhone.replace(/\D/g, "");
			if (digits.length < 10 || digits.length > 15) {
				setFieldError("Nomor telepon harus 10–15 digit angka");
				return;
			}
		}

		const patch: Record<string, unknown> = {};
		if (field === "name") patch.fullName = draftName.trim();
		if (field === "dob") patch.dateOfBirth = draftDob || null;
		if (field === "gender") patch.gender = draftGender;
		if (field === "phone") patch.phoneNumber = draftPhone.trim();

		try {
			setSavingField(true);
			const res = await userService.updateProfile(patch);
			setProfile(res.data.data);
			setEditingField(null);
			showFieldSuccess("Berhasil disimpan");
		} catch (err: any) {
			setFieldError(
				err?.response?.data?.message ?? "Gagal menyimpan. Coba lagi.",
			);
		} finally {
			setSavingField(false);
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const validTypes = ["image/jpeg", "image/jpg", "image/png"];
		if (!validTypes.includes(file.type)) {
			setPhotoError("Ekstensi file harus JPG, JPEG, atau PNG");
			return;
		}
		if (file.size > 5 * 1024 * 1024) {
			setPhotoError("Ukuran file maksimum 5 MB");
			return;
		}

		setPhotoError("");
		const reader = new FileReader();
		reader.onloadend = async () => {
			const base64 = reader.result as string;
			setPreviewPhoto(base64);
			try {
				setUploadingPhoto(true);
				const res = await userService.updatePhoto(base64);
				setProfile(res.data.data);
				showPhotoSuccess("Foto profil berhasil diperbarui");
			} catch (err: any) {
				setPhotoError(
					err?.response?.data?.message ?? "Gagal mengunggah foto. Coba lagi.",
				);
				setPreviewPhoto(profile?.profilePhoto ?? "");
			} finally {
				setUploadingPhoto(false);
				if (fileInputRef.current) fileInputRef.current.value = "";
			}
		};
		reader.readAsDataURL(file);
	};

	if (loading) {
		return (
			<div className="pp-loading">
				<Loader size={28} className="pp-spinner" />
				<span>Memuat profil...</span>
			</div>
		);
	}

	if (fetchError) {
		return <div className="pp-error">{fetchError}</div>;
	}

	if (!profile) return null;

	const displayName = profile.fullName || authUser?.username || "";
	const photoSrc = previewPhoto || profile.profilePhoto || "";

	const roleColorMap: Record<string, { bg: string; color: string }> = {
		Buyer: { bg: "var(--buyer-light)", color: "var(--buyer-color)" },
		Seller: { bg: "var(--seller-light)", color: "var(--seller-color)" },
		Driver: { bg: "var(--driver-light)", color: "var(--driver-color)" },
		Admin: { bg: "var(--admin-light)", color: "var(--admin-color)" },
	};
	const activeRoleStyle =
		roleColorMap[profile.activeRole] ?? roleColorMap.Buyer;

	return (
		<div className="pp-root">
			<div className="pp-breadcrumb">
				<User size={14} />
				<span>{authUser?.username}</span>
			</div>

			<div className="pp-tabs">
				{(
					[{ key: "profile", label: "Personal Profile", icon: User }] as {
						key: ProfileTab;
						label: string;
						icon: React.FC<{ size?: number }>;
					}[]
				).map(({ key, label, icon: Icon }) => (
					<button
						key={key}
						className={`pp-tab${activeTab === key ? " pp-tab--active" : ""}`}
						onClick={() => setActiveTab(key)}
					>
						<Icon size={15} />
						{label}
					</button>
				))}
			</div>

			{activeTab === "profile" && (
				<div className="pp-body">
					<div className="pp-photo-col">
						<div className="pp-photo-wrap">
							<AvatarFallback
								name={displayName}
								photoUrl={photoSrc}
								size={200}
								style={{ borderRadius: 16, border: "3px solid var(--border)" }}
							/>
							{uploadingPhoto && (
								<div className="pp-photo-overlay">
									<Loader size={24} className="pp-spinner" />
								</div>
							)}
						</div>

						<input
							ref={fileInputRef}
							type="file"
							accept=".jpg,.jpeg,.png,image/jpeg,image/png"
							className="pp-file-input"
							onChange={handleFileChange}
							aria-label="Pilih foto profil"
						/>

						<button
							className="pp-btn-photo"
							onClick={() => fileInputRef.current?.click()}
							disabled={uploadingPhoto}
						>
							<Camera size={15} />
							{uploadingPhoto ? "Mengunggah..." : "Pilih Foto"}
						</button>

						<p className="pp-photo-hint">
							Ukuran file maksimum 5 MB.
							<br />
							Ekstensi yang diperbolehkan: .JPG .JPEG .PNG
						</p>

						{photoError && <p className="pp-photo-error">{photoError}</p>}
						{photoSuccess && <p className="pp-photo-success">{photoSuccess}</p>}

						<div
							className="pp-role-badge"
							style={{
								backgroundColor: activeRoleStyle.bg,
								color: activeRoleStyle.color,
							}}
						>
							{profile.activeRole}
						</div>
					</div>

					<div className="pp-info-col">
						{fieldSuccess && (
							<div className="pp-inline-success">{fieldSuccess}</div>
						)}

						<div className="pp-section">
							<h3 className="pp-section-title">Ubah Biodata Diri</h3>

							<FieldRow
								label="Nama"
								displayValue={
									profile.fullName || <em className="pp-empty">Belum diisi</em>
								}
								isEditing={editingField === "name"}
								onEditClick={() => openEdit("name")}
							>
								<div className="pp-inline-form">
									<input
										className="pp-input"
										value={draftName}
										onChange={(e) => setDraftName(e.target.value)}
										placeholder="Nama lengkap"
										maxLength={100}
										autoFocus
										disabled={savingField}
									/>
									{fieldError && editingField === "name" && (
										<p className="pp-field-error">{fieldError}</p>
									)}
									<div className="pp-inline-actions">
										<button
											className="pp-btn-save"
											onClick={() => saveField("name")}
											disabled={savingField}
										>
											{savingField ? (
												<Loader size={12} className="pp-spinner" />
											) : (
												<Check size={12} />
											)}
											Simpan
										</button>
										<button
											className="pp-btn-cancel"
											onClick={cancelEdit}
											disabled={savingField}
										>
											<X size={12} /> Batal
										</button>
									</div>
								</div>
							</FieldRow>

							<FieldRow
								label="Tanggal Lahir"
								displayValue={formatDate(profile.dateOfBirth)}
								editLabel="Ubah Tanggal Lahir"
								isEditing={editingField === "dob"}
								onEditClick={() => openEdit("dob")}
							>
								<div className="pp-inline-form">
									<input
										className="pp-input"
										type="date"
										value={draftDob}
										onChange={(e) => setDraftDob(e.target.value)}
										max={new Date().toISOString().slice(0, 10)}
										disabled={savingField}
									/>
									{fieldError && editingField === "dob" && (
										<p className="pp-field-error">{fieldError}</p>
									)}
									<div className="pp-inline-actions">
										<button
											className="pp-btn-save"
											onClick={() => saveField("dob")}
											disabled={savingField}
										>
											{savingField ? (
												<Loader size={12} className="pp-spinner" />
											) : (
												<Check size={12} />
											)}
											Simpan
										</button>
										<button
											className="pp-btn-cancel"
											onClick={cancelEdit}
											disabled={savingField}
										>
											<X size={12} /> Batal
										</button>
									</div>
								</div>
							</FieldRow>

							<FieldRow
								label="Gender"
								displayValue={profile.gender ?? "Prefer not to say"}
								isEditing={editingField === "gender"}
								onEditClick={() => openEdit("gender")}
							>
								<div className="pp-inline-form">
									<div className="pp-radio-group">
										{GENDER_OPTIONS.map((opt) => (
											<label key={opt} className="pp-radio-label">
												<input
													type="radio"
													name="gender"
													value={opt}
													checked={draftGender === opt}
													onChange={() => setDraftGender(opt)}
													disabled={savingField}
												/>
												{opt}
											</label>
										))}
									</div>
									<div className="pp-inline-actions">
										<button
											className="pp-btn-save"
											onClick={() => saveField("gender")}
											disabled={savingField}
										>
											{savingField ? (
												<Loader size={12} className="pp-spinner" />
											) : (
												<Check size={12} />
											)}
											Simpan
										</button>
										<button
											className="pp-btn-cancel"
											onClick={cancelEdit}
											disabled={savingField}
										>
											<X size={12} /> Batal
										</button>
									</div>
								</div>
							</FieldRow>
						</div>

						<div className="pp-divider" />

						<div className="pp-section">
							<h3 className="pp-section-title">Ubah Kontak</h3>

							<div className="pp-field-row">
								<div className="pp-field-meta">
									<span className="pp-field-label">
										<Mail
											size={13}
											style={{ verticalAlign: "middle", marginRight: 4 }}
										/>
										Email
									</span>
									<div className="pp-field-value-row">
										<span className="pp-field-value">
											{authUser?.username ?? "—"}
										</span>
										<span className="pp-badge-verified">Verified</span>
									</div>
								</div>
							</div>

							<FieldRow
								label="Nomor Telepon"
								displayValue={
									profile.phoneNumber ? (
										<span className="pp-phone-row">
											{profile.phoneNumber}
											<span className="pp-badge-verified">Verified</span>
										</span>
									) : (
										<em className="pp-empty">Belum diisi</em>
									)
								}
								isEditing={editingField === "phone"}
								onEditClick={() => openEdit("phone")}
							>
								<div className="pp-inline-form">
									<input
										className="pp-input"
										type="tel"
										value={draftPhone}
										onChange={(e) => setDraftPhone(e.target.value)}
										placeholder="08xxxxxxxxxx"
										maxLength={20}
										autoFocus
										disabled={savingField}
									/>
									{fieldError && editingField === "phone" && (
										<p className="pp-field-error">{fieldError}</p>
									)}
									<div className="pp-inline-actions">
										<button
											className="pp-btn-save"
											onClick={() => saveField("phone")}
											disabled={savingField}
										>
											{savingField ? (
												<Loader size={12} className="pp-spinner" />
											) : (
												<Check size={12} />
											)}
											Simpan
										</button>
										<button
											className="pp-btn-cancel"
											onClick={cancelEdit}
											disabled={savingField}
										>
											<X size={12} /> Batal
										</button>
									</div>
								</div>
							</FieldRow>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default PersonalProfile;
