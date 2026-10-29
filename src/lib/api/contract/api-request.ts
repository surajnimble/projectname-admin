// The backend rejects unknown fields, so every call sends only the fields it needs.
// Declared as a class so the whole request contract lives in one place; services take
// plain object literals typed as ApiRequest, nothing is ever instantiated here.
export class ApiRequest {
  email?: string;
  phone?: string;
  password?: string;
  newPassword?: string;
  oldPassword?: string;
  otp?: string;
  type?: string;
  channel?: string;
  identifier?: string;
  verificationToken?: string;
  name?: string;
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  action?: string;
  days?: number;
  status?: string;
  hasDocuments?: boolean;
  commissionRate?: number;
  remark?: string;
  reason?: string;
  isVerified?: boolean;
  docType?: string;
  vendorId?: string;
  inStock?: boolean;
  isFeatured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  stock?: number;
  lowStockThreshold?: number;
  variantId?: string;
  rejectReason?: string;
  mode?: string;
  from?: string;
  to?: string;
  orderId?: string;
  amount?: number;
  reference?: string;
  notes?: string;
  permissions?: string[];
  paymentStatus?: string;
  location?: string;
}
