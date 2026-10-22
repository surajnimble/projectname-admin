import type {
  ProductSummaryData,
  VendorData,
  VendorRatingSummaryData,
} from '@/lib/api/contract';

// Rows seen in a list response are kept so a detail screen can show them right away
// and only fetch what the list did not carry.
const vendors = new Map<string, VendorData>();
const products = new Map<string, ProductSummaryData>();
const vendorDetails = new Map<string, VendorData>();
const vendorRatings = new Map<string, VendorRatingSummaryData>();

export const rememberVendor = (vendor: VendorData) => {
  vendors.set(vendor.vendorId, vendor);
};

export const vendorSeed = (vendorId: string) => vendors.get(vendorId);

export const rememberVendorDetail = (vendor: VendorData) => {
  vendorDetails.set(vendor.vendorId, vendor);
};

export const vendorDetailSeed = (vendorId: string) => vendorDetails.get(vendorId);

export const rememberVendorRatings = (vendorId: string, ratings: VendorRatingSummaryData) => {
  vendorRatings.set(vendorId, ratings);
};

export const vendorRatingsSeed = (vendorId: string) => vendorRatings.get(vendorId);

export const rememberProduct = (product: ProductSummaryData) => {
  products.set(product.productId, product);
};

export const productSeed = (productId: string) => products.get(productId);

export const resetSeedStore = () => {
  vendors.clear();
  products.clear();
  vendorDetails.clear();
  vendorRatings.clear();
};
