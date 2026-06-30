import React, { useState, useEffect, useCallback, useRef } from "react";
import { Check, X, Plus, AlertCircle, Loader, Camera } from "lucide-react";
import { storeService } from "../../services/storeService";
import AvatarFallback from "../AvatarFallback";
import "../../styles/StoreManager.css";

const BUSINESS_TYPES = [
	"Fashion & Pakaian",
	"Sepatu & Aksesori",
	"Elektronik & Gadget",
	"Komputer & Laptop",
	"Handphone & Tablet",
	"Makanan & Minuman",
	"Kesehatan & Suplemen",
	"Kecantikan & Perawatan Diri",
	"Perlengkapan Rumah Tangga",
	"Furnitur & Dekorasi Rumah",
	"Peralatan Dapur",
	"Alat Tulis & Perlengkapan Kantor",
	"Mainan & Hobi",
	"Buku & Media",
	"Olahraga & Outdoor",
	"Otomotif & Aksesori Kendaraan",
	"Tanaman & Pertanian",
	"Hewan Peliharaan",
	"Bayi & Anak",
	"Perikanan & Hasil Laut",
	"Produk Pertanian & Organik",
	"Kerajinan Tangan & Seni",
	"Material Bangunan",
	"Alat Industri & Mesin",
	"Peralatan Listrik",
	"Jasa & Layanan Digital",
	"Koleksi & Barang Antik",
	"Lainnya",
];

interface StoreData {
	_id: string;
	name: string;
	description: string;
	businessType?: string;
	storePhoto?: string;
	createdAt: string;
	productCount?: number;
}

type StoreTab = "profile";

const StoreAvatarSection: React.FC<{
	storeName: string;
	photoUrl: string;
	uploading: boolean;
	onPickFile: () => void;
}> = ({ storeName, photoUrl, uploading, onPickFile }) => (
	<div className="sm-photo-col">
		<div className="sm-avatar-wrap">
			<AvatarFallback
				name={storeName}
				photoUrl={photoUrl || undefined}
				size={200}
				style={{
					borderRadius: 16,
					border: "3px solid var(--border)",
				}}
			/>
			{uploading && (
				<div className="sm-avatar-overlay">
					<Loader size={22} className="sm-spinner-sm" />
				</div>
			)}
		</div>
		<button className="sm-btn-photo" onClick={onPickFile} disabled={uploading}>
			<Camera size={14} />
			{uploading ? "Mengunggah..." : "Pilih Foto Toko"}
		</button>
		<p className="sm-photo-hint">Maks 5 MB · JPG, JPEG, PNG</p>
		<span className="sm-role-badge">Penjual</span>
	</div>
);

interface FieldRowProps {
	label: string;
	displayValue: React.ReactNode;
	editLabel?: string;
	disabled?: boolean;
	isEditing: boolean;
	onEditClick: () => void;
	children?: React.ReactNode;
}
const FieldRow: React.FC<FieldRowProps> = ({
	label,
	displayValue,
	editLabel = "Ubah",
	disabled,
	isEditing,
	onEditClick,
	children,
}) => (
	<div className="sm-field-row">
		<div className="sm-field-meta">
			<span className="sm-field-label">{label}</span>
			{!isEditing ? (
				<div className="sm-field-value-row">
					<span className="sm-field-value">{displayValue}</span>
					{!disabled && (
						<button className="sm-link-btn" onClick={onEditClick}>
							{editLabel}
						</button>
					)}
				</div>
			) : (
				<div className="sm-field-edit">{children}</div>
			)}
		</div>
	</div>
);

interface StoreManagerProps {
	onStoreLoaded: (hasStore: boolean) => void;
}

const StoreManager: React.FC<StoreManagerProps> = ({ onStoreLoaded }) => {
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [store, setStore] = useState<StoreData | null>(null);
	const [loading, setLoading] = useState(true);
	const [fetchError, setFetchError] = useState("");
	const [activeTab, setActiveTab] = useState<StoreTab>("profile");

	const [previewPhoto, setPreviewPhoto] = useState("");
	const [uploadingPhoto, setUploadingPhoto] = useState(false);
	const [photoError, setPhotoError] = useState("");

	const [editingField, setEditingField] = useState<string | null>(null);
	const [draftName, setDraftName] = useState("");
	const [draftBusiness, setDraftBusiness] = useState("");
	const [draftDesc, setDraftDesc] = useState("");
	const [savingField, setSavingField] = useState(false);
	const [fieldError, setFieldError] = useState("");
	const [fieldSuccess, setFieldSuccess] = useState("");

	const [createName, setCreateName] = useState("");
	const [createBusiness, setCreateBusiness] = useState("");
	const [createDesc, setCreateDesc] = useState("");
	const [creating, setCreating] = useState(false);
	const [createError, setCreateError] = useState("");

	useEffect(() => {
		storeService
			.getMyStore()
			.then((data) => {
				setStore(data);
				onStoreLoaded(!!data);
				if (data?.storePhoto) setPreviewPhoto(data.storePhoto);
			})
			.catch((err) => {
				if (err.response?.status === 404) {
					setStore(null);
					onStoreLoaded(false);
				} else
					setFetchError("Gagal memuat data toko. Silakan refresh halaman.");
			})
			.finally(() => setLoading(false));
	}, [onStoreLoaded]);

	const showSuccess = useCallback((msg: string) => {
		setFieldSuccess(msg);
		setTimeout(() => setFieldSuccess(""), 2500);
	}, []);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
			setPhotoError("Harus JPG, JPEG, atau PNG");
			return;
		}
		if (file.size > 5 * 1024 * 1024) {
			setPhotoError("Ukuran maksimum 5 MB");
			return;
		}
		setPhotoError("");
		const reader = new FileReader();
		reader.onloadend = async () => {
			const base64 = reader.result as string;
			setPreviewPhoto(base64);
			try {
				setUploadingPhoto(true);
				const updated = await storeService.updateMyStore({
					name: store!.name,
					description: store!.description,
					businessType: store!.businessType ?? "",
					storePhoto: base64,
				});
				setStore(updated);
				showSuccess("Foto toko berhasil diperbarui");
			} catch {
				setPhotoError("Gagal mengunggah foto. Coba lagi.");
				setPreviewPhoto(store?.storePhoto ?? ""); // rollback
			} finally {
				setUploadingPhoto(false);
				if (fileInputRef.current) fileInputRef.current.value = "";
			}
		};
		reader.readAsDataURL(file);
	};

	const openEdit = (field: string) => {
		if (!store) return;
		setFieldError("");
		setEditingField(field);
		if (field === "name") setDraftName(store.name ?? "");
		if (field === "business") setDraftBusiness(store.businessType ?? "");
		if (field === "desc") setDraftDesc(store.description ?? "");
	};
	const cancelEdit = () => {
		setEditingField(null);
		setFieldError("");
	};

	const saveField = async (field: string) => {
		if (!store) return;
		setFieldError("");
		if (field === "name" && !draftName.trim()) {
			setFieldError("Nama toko tidak boleh kosong");
			return;
		}
		setSavingField(true);
		try {
			const updated = await storeService.updateMyStore({
				name: field === "name" ? draftName.trim() : store.name,
				description: field === "desc" ? draftDesc.trim() : store.description,
				businessType:
					field === "business"
						? draftBusiness.trim()
						: (store.businessType ?? ""),
				storePhoto: previewPhoto,
			});
			setStore(updated);
			setEditingField(null);
			showSuccess("Berhasil disimpan");
		} catch (err: any) {
			setFieldError(
				err?.response?.data?.message ?? "Gagal menyimpan. Coba lagi.",
			);
		} finally {
			setSavingField(false);
		}
	};

	const handleCreate = async (e: React.SubmitEvent) => {
		e.preventDefault();
		if (!createName.trim()) {
			setCreateError("Nama toko wajib diisi");
			return;
		}
		setCreating(true);
		setCreateError("");
		try {
			const created = await storeService.createStore({
				name: createName.trim(),
				description: createDesc.trim(),
				businessType: createBusiness.trim(),
			});
			setStore(created);
			onStoreLoaded(true);
		} catch (err: any) {
			setCreateError(err?.response?.data?.message ?? "Gagal membuat toko");
		} finally {
			setCreating(false);
		}
	};

	const InlineActions: React.FC<{ field: string }> = ({ field }) => (
		<div className="sm-inline-actions">
			<button
				className="sm-btn-save-inline"
				onClick={() => saveField(field)}
				disabled={savingField}
			>
				{savingField ? (
					<Loader size={12} className="sm-spinner-sm" />
				) : (
					<Check size={12} />
				)}
				Simpan
			</button>
			<button
				className="sm-btn-cancel-inline"
				onClick={cancelEdit}
				disabled={savingField}
			>
				<X size={12} /> Batal
			</button>
		</div>
	);

	if (loading)
		return (
			<div className="sm-loading">
				<Loader size={26} className="sm-spinner" />
				<span>Memuat informasi toko...</span>
			</div>
		);
	if (fetchError)
		return (
			<div className="sm-fetch-error">
				<AlertCircle size={18} />
				<span>{fetchError}</span>
			</div>
		);

	if (!store) {
		return (
			<div className="sm-root">
				<div className="sm-breadcrumb">
					<span>Profil Toko</span>
				</div>
				<div className="sm-tabs">
					<button className="sm-tab sm-tab--active">Profil Toko</button>
				</div>

				<div className="sm-body">
					<div className="sm-photo-col">
						<div className="sm-avatar-wrap">
							<AvatarFallback
								name="?"
								size={200}
								style={{ borderRadius: 16, border: "3px solid var(--border)" }}
							/>
						</div>
						<p className="sm-photo-hint">Buat toko terlebih dahulu</p>
						<span className="sm-role-badge">Penjual</span>
					</div>

					<div className="sm-info-col">
						{createError && (
							<div className="sm-alert-error">
								<AlertCircle size={14} />
								{createError}
							</div>
						)}
						<form onSubmit={handleCreate}>
							<div className="sm-section">
								<h3 className="sm-section-title">Buat Toko Baru</h3>

								<div className="sm-field-row">
									<div className="sm-field-meta">
										<span className="sm-field-label">
											Nama Toko <span className="sm-required">*</span>
										</span>
										<div className="sm-field-edit">
											<div className="sm-inline-form">
												<input
													className="sm-input"
													value={createName}
													onChange={(e) => setCreateName(e.target.value)}
													placeholder="Contoh: Toko Sejahtera Mandiri"
													maxLength={100}
													disabled={creating}
													autoFocus
												/>
											</div>
										</div>
									</div>
								</div>

								<div className="sm-field-row">
									<div className="sm-field-meta">
										<span className="sm-field-label">Jenis Usaha</span>
										<div className="sm-field-edit">
											<div className="sm-inline-form">
												<select
													className="sm-select"
													value={createBusiness}
													onChange={(e) => setCreateBusiness(e.target.value)}
													disabled={creating}
												>
													<option value="">— Pilih kategori usaha —</option>
													{BUSINESS_TYPES.map((t) => (
														<option key={t} value={t}>
															{t}
														</option>
													))}
												</select>
											</div>
										</div>
									</div>
								</div>

								<div className="sm-field-row">
									<div className="sm-field-meta">
										<span className="sm-field-label">Deskripsi Toko</span>
										<div className="sm-field-edit">
											<div className="sm-inline-form">
												<textarea
													className="sm-textarea"
													value={createDesc}
													onChange={(e) => setCreateDesc(e.target.value)}
													placeholder="Ceritakan tentang toko Anda..."
													rows={3}
													maxLength={500}
													disabled={creating}
												/>
												<span className="sm-char-count">
													{createDesc.length}/500
												</span>
											</div>
										</div>
									</div>
								</div>
							</div>

							<div className="sm-form-submit">
								<button
									type="submit"
									className="sm-btn-primary"
									disabled={creating}
								>
									{creating ? (
										<>
											<Loader size={14} className="sm-spinner-sm" /> Membuat
											Toko...
										</>
									) : (
										<>
											<Plus size={14} /> Buat Toko
										</>
									)}
								</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="sm-root">
			<div className="sm-breadcrumb">
				<span>{store.name}</span>
			</div>

			<div className="sm-tabs">
				{(
					[{ key: "profile", label: "Profil Toko" }] as {
						key: StoreTab;
						label: string;
					}[]
				).map(({ key, label }) => (
					<button
						key={key}
						className={`sm-tab${activeTab === key ? " sm-tab--active" : ""}`}
						onClick={() => setActiveTab(key)}
					>
						{label}
					</button>
				))}
			</div>

			{activeTab === "profile" && (
				<div className="sm-body">
					<input
						ref={fileInputRef}
						type="file"
						accept=".jpg,.jpeg,.png,image/jpeg,image/png"
						style={{ display: "none" }}
						onChange={handleFileChange}
					/>

					<StoreAvatarSection
						storeName={store.name}
						photoUrl={previewPhoto}
						uploading={uploadingPhoto}
						onPickFile={() => fileInputRef.current?.click()}
					/>
					{photoError && <p className="sm-photo-error-float">{photoError}</p>}

					<div className="sm-info-col">
						{fieldSuccess && (
							<div className="sm-inline-success">{fieldSuccess}</div>
						)}

						<div className="sm-section">
							<h3 className="sm-section-title">Ubah Profil Toko</h3>

							<FieldRow
								label="Nama Toko"
								displayValue={store.name}
								isEditing={editingField === "name"}
								onEditClick={() => openEdit("name")}
							>
								<div className="sm-inline-form">
									<input
										className="sm-input"
										value={draftName}
										onChange={(e) => setDraftName(e.target.value)}
										maxLength={100}
										autoFocus
										disabled={savingField}
									/>
									{fieldError && editingField === "name" && (
										<p className="sm-field-error">{fieldError}</p>
									)}
									<InlineActions field="name" />
								</div>
							</FieldRow>

							<FieldRow
								label="Jenis Usaha"
								displayValue={
									store.businessType || (
										<em className="sm-empty">Belum diisi</em>
									)
								}
								isEditing={editingField === "business"}
								onEditClick={() => openEdit("business")}
							>
								<div className="sm-inline-form">
									<select
										className="sm-select"
										value={draftBusiness}
										onChange={(e) => setDraftBusiness(e.target.value)}
										disabled={savingField}
									>
										<option value="">— Pilih kategori usaha —</option>
										{BUSINESS_TYPES.map((t) => (
											<option key={t} value={t}>
												{t}
											</option>
										))}
									</select>
									{fieldError && editingField === "business" && (
										<p className="sm-field-error">{fieldError}</p>
									)}
									<InlineActions field="business" />
								</div>
							</FieldRow>

							<FieldRow
								label="Deskripsi Toko"
								displayValue={
									store.description || (
										<em className="sm-empty">Belum ada deskripsi</em>
									)
								}
								isEditing={editingField === "desc"}
								onEditClick={() => openEdit("desc")}
							>
								<div className="sm-inline-form">
									<textarea
										className="sm-textarea"
										value={draftDesc}
										onChange={(e) => setDraftDesc(e.target.value)}
										rows={3}
										maxLength={500}
										disabled={savingField}
									/>
									<span className="sm-char-count">{draftDesc.length}/500</span>
									{fieldError && editingField === "desc" && (
										<p className="sm-field-error">{fieldError}</p>
									)}
									<InlineActions field="desc" />
								</div>
							</FieldRow>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default StoreManager;
