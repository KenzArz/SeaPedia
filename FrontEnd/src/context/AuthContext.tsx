import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	useRef,
} from "react";

const API_URL = "http://localhost:5000/api";

export interface User {
	id: string;
	username: string;
	roles: string[];
	activeRole: string;
	createdAt?: string | null;
}

interface AuthContextType {
	user: User | null;
	token: string | null;
	loading: boolean;
	login: (username: string, password: string) => Promise<User>;
	register: (username: string, password: string) => Promise<void>;
	logout: () => void;
	switchRole: (role: string) => Promise<void>;
	addRole: (type: "seller" | "driver", formData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function decodeJWT(token: string): User | null {
	try {
		const payload = JSON.parse(atob(token.split(".")[1]));
		if (!payload.id || !payload.username) return null;
		if (payload.exp && payload.exp * 1000 < Date.now()) return null;
		return {
			id: payload.id,
			username: payload.username,
			roles: payload.roles ?? ["Buyer"],
			activeRole: payload.activeRole ?? "Buyer",
			createdAt: payload.createdAt ?? null,
		};
	} catch {
		return null;
	}
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const storedToken = localStorage.getItem("seapedia_token");
	const initialUser = storedToken ? decodeJWT(storedToken) : null;

	const [user, setUser] = useState<User | null>(initialUser);
	const [token, setToken] = useState<string | null>(storedToken);
	const [loading, setLoading] = useState<boolean>(
		!initialUser && !!storedToken,
	);

	const isMounted = useRef(true);
	useEffect(() => {
		isMounted.current = true;
		return () => {
			isMounted.current = false;
		};
	}, []);

	useEffect(() => {
		const currentToken = localStorage.getItem("seapedia_token");
		if (!currentToken) {
			setLoading(false);
			return;
		}

		const decodedUser = decodeJWT(currentToken);
		if (!decodedUser) {
			localStorage.removeItem("seapedia_token");
			setToken(null);
			setUser(null);
			setLoading(false);
			return;
		}

		if (!user) setUser(decodedUser);
		setLoading(false);

		fetch(`${API_URL}/auth/profile`, {
			headers: { Authorization: `Bearer ${currentToken}` },
		})
			.then((res) => {
				if (!isMounted.current) return;
				if (res.ok) {
					res.json().then((data) => {
						if (isMounted.current) setUser((prev) => ({ ...prev, ...data }));
					});
				} else if (res.status === 401 || res.status === 403) {
					if (isMounted.current) {
						localStorage.removeItem("seapedia_token");
						setToken(null);
						setUser(null);
					}
				}
			})
			.catch(() => {});
	}, []);

	const login = async (username: string, password: string): Promise<User> => {
		const res = await fetch(`${API_URL}/auth/login`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ username, password }),
		});
		const data = await res.json();
		if (!res.ok) throw new Error(data.message || "Login gagal");

		localStorage.setItem("seapedia_token", data.token);
		setToken(data.token);
		setUser(data.user);

		try {
			const profileRes = await fetch(`${API_URL}/auth/profile`, {
				headers: { Authorization: `Bearer ${data.token}` },
			});
			if (profileRes.ok) {
				const profileData = await profileRes.json();
				const enriched = { ...data.user, ...profileData };
				setUser(enriched);
				return enriched;
			}
		} catch {}

		return data.user;
	};

	const register = async (
		username: string,
		password: string,
	): Promise<void> => {
		const res = await fetch(`${API_URL}/auth/register`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ username, password }),
		});
		const data = await res.json();
		if (!res.ok) throw new Error(data.message || "Registrasi gagal");

		localStorage.setItem("seapedia_token", data.token);
		setToken(data.token);
		setUser(data.user);

		try {
			const profileRes = await fetch(`${API_URL}/auth/profile`, {
				headers: { Authorization: `Bearer ${data.token}` },
			});
			if (profileRes.ok) {
				const profileData = await profileRes.json();
				setUser({ ...data.user, ...profileData });
			}
		} catch {}
	};

	const logout = () => {
		localStorage.removeItem("seapedia_token");
		setToken(null);
		setUser(null);
	};

	const switchRole = async (role: string): Promise<void> => {
		const currentToken = token ?? localStorage.getItem("seapedia_token");
		if (!currentToken) return;

		const res = await fetch(`${API_URL}/auth/role`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${currentToken}`,
			},
			body: JSON.stringify({ activeRole: role }),
		});
		const data = await res.json();
		if (!res.ok) throw new Error(data.message || "Gagal mengubah peran");

		localStorage.setItem("seapedia_token", data.token);
		setToken(data.token);
		setUser((prev) => ({ ...prev, ...data.user }));
	};

	const addRole = async (
		type: "seller" | "driver",
		formData: any,
	): Promise<void> => {
		const currentToken = token ?? localStorage.getItem("seapedia_token");
		if (!currentToken) return;

		const res = await fetch(`${API_URL}/auth/add-role/${type}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${currentToken}`,
			},
			body: JSON.stringify(formData),
		});
		const data = await res.json();
		if (!res.ok)
			throw new Error(
				data.message || `Gagal menambahkan peran sebagai ${type}`,
			);

		localStorage.setItem("seapedia_token", data.token);
		setToken(data.token);
		setUser((prev) => ({ ...prev, ...data.user }));
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				token,
				loading,
				login,
				register,
				logout,
				switchRole,
				addRole,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
	return ctx;
};

export default AuthContext;
