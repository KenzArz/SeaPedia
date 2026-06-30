import api from './api';

export interface StoreData {
  _id: string;
  name: string;
  description: string;
  businessType: string;
  storePhoto: string;
  createdAt: string;
  productCount?: number;
}

export interface StorePayload {
  name: string;
  description?: string;
  businessType?: string;
  storePhoto?: string;
}

/**
 * Normalise a raw backend store object.
 *
 * When the backend returns a Mongoose document without .lean(), the actual
 * data is buried inside `._doc`. This helper extracts it so all consumers
 * always get a plain, predictable object regardless of server restart state.
 */
export function normaliseStore(raw: any): StoreData | null {
  if (!raw) return null;

  // Mongoose document leak — real data is inside _doc
  const src: any = raw._doc ?? raw;

  return {
    _id:          String(src._id   ?? ''),
    name:         src.name         ?? '',
    description:  src.description  ?? '',
    businessType: src.businessType ?? '',
    storePhoto:   src.storePhoto   ?? '',
    createdAt:    src.createdAt    ?? '',
    productCount: raw.productCount ?? src.productCount ?? 0,
  };
}

type RawResponse = { success: boolean; data: any };

export const storeService = {
  // Seller – private
  createStore: async (data: StorePayload): Promise<StoreData> => {
    const res = await api.post<RawResponse>('/stores', data);
    return normaliseStore(res.data.data)!;
  },

  getMyStore: async (): Promise<StoreData | null> => {
    const res = await api.get<RawResponse>('/stores/my-store');
    return normaliseStore(res.data.data);
  },

  updateMyStore: async (data: StorePayload): Promise<StoreData> => {
    const res = await api.put<RawResponse>('/stores/my-store', data);
    return normaliseStore(res.data.data)!;
  },

  // Public
  getStoreById: async (id: string): Promise<StoreData | null> => {
    const res = await api.get<RawResponse>(`/stores/${id}`);
    return normaliseStore(res.data.data);
  },
};
