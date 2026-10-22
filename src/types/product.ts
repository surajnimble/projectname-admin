import type {
  ProductAttributeData,
  ProductDetailData,
  ProductListData,
  ProductReviewData,
  ProductSummaryData,
  ProductTagData,
  ProductVariantData,
} from '@/lib/api/contract';

type RawProduct = Partial<Record<keyof Omit<ProductSummaryData, 'categoryData'>, unknown>> & {
  categoryData?: { categoryId?: unknown; name?: unknown };
};
type RawProductList = Partial<Record<keyof Omit<ProductListData, 'itemList'>, unknown>> & {
  productList?: unknown;
};
type RawVariant = Partial<Record<keyof ProductVariantData, unknown>>;
type RawAttribute = Partial<Record<keyof ProductAttributeData, unknown>>;
type RawTag = Partial<Record<keyof ProductTagData, unknown>>;
type RawProductDetail = Partial<
  Record<
    keyof Omit<ProductDetailData, 'variantList' | 'attributeList' | 'tagList' | 'reviewList'>,
    unknown
  >
> & {
  variantList?: unknown;
  attributeList?: unknown;
  tagList?: unknown;
  reviewList?: unknown;
  categoryData?: { categoryId?: unknown; name?: unknown; slug?: unknown };
  brandData?: { brandId?: unknown; name?: unknown; slug?: unknown };
};

const toNumber = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;

const toString = (value: unknown): string => (typeof value === 'string' ? value : '');

const toBoolean = (value: unknown): boolean => value === true;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const toStringRecord = (value: unknown): Record<string, string> => {
  if (!isObject(value)) return {};
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [key, typeof item === 'string' ? item : String(item)]),
  );
};

const toImageList = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];

export const toProductSummary = (raw: RawProduct = {}): ProductSummaryData => ({
  productId: toString(raw.productId),
  vendorId: toString(raw.vendorId),
  name: toString(raw.name),
  slug: toString(raw.slug),
  sku: toString(raw.sku),
  price: toNumber(raw.price),
  mrpPrice: toNumber(raw.mrpPrice),
  stock: toNumber(raw.stock),
  condition: toString(raw.condition),
  warrantyMonths: toNumber(raw.warrantyMonths),
  isNonReturnable: toBoolean(raw.isNonReturnable),
  isActive: toBoolean(raw.isActive),
  isFeatured: toBoolean(raw.isFeatured),
  rating: toNumber(raw.rating),
  soldCount: toNumber(raw.soldCount),
  createdAt: toString(raw.createdAt),
  imageList: toImageList(raw.imageList),
  categoryData: {
    categoryId: toString(raw.categoryData?.categoryId),
    name: toString(raw.categoryData?.name),
  },
});

export const toProductList = (raw: RawProductList = {}): ProductListData => ({
  totalRecord: toNumber(raw.totalRecord),
  totalPage: toNumber(raw.totalPage),
  currentPage: toNumber(raw.currentPage),
  limit: toNumber(raw.limit),
  hasNext: raw.hasNext === true,
  hasPrevious: raw.hasPrevious === true,
  nextPage: toNumber(raw.nextPage),
  previousPage: toNumber(raw.previousPage),
  itemList: Array.isArray(raw.productList)
    ? raw.productList.filter(isObject).map((item) => toProductSummary(item))
    : [],
});

export const toProductDetail = (raw: RawProductDetail = {}): ProductDetailData => ({
  productId: toString(raw.productId),
  vendorId: toString(raw.vendorId),
  name: toString(raw.name),
  slug: toString(raw.slug),
  description: toString(raw.description),
  sku: toString(raw.sku),
  price: toNumber(raw.price),
  mrpPrice: toNumber(raw.mrpPrice),
  taxPercent: toNumber(raw.taxPercent),
  stock: toNumber(raw.stock),
  lowStockThreshold: toNumber(raw.lowStockThreshold),
  condition: toString(raw.condition),
  warrantyMonths: toNumber(raw.warrantyMonths),
  warrantySummary: toString(raw.warrantySummary),
  isNonReturnable: toBoolean(raw.isNonReturnable),
  weight: toNumber(raw.weight),
  status: toString(raw.status),
  isActive: toBoolean(raw.isActive),
  isFeatured: toBoolean(raw.isFeatured),
  isOutOfStock: toBoolean(raw.isOutOfStock),
  soldCount: toNumber(raw.soldCount),
  viewCount: toNumber(raw.viewCount),
  rating: toNumber(raw.rating),
  ratingCount: toNumber(raw.ratingCount),
  createdAt: toString(raw.createdAt),
  imageList: toImageList(raw.imageList),
  categoryData: {
    categoryId: toString(raw.categoryData?.categoryId),
    name: toString(raw.categoryData?.name),
    slug: toString(raw.categoryData?.slug),
  },
  brandData: {
    brandId: toString(raw.brandData?.brandId),
    name: toString(raw.brandData?.name),
    slug: toString(raw.brandData?.slug),
  },
  variantList: Array.isArray(raw.variantList)
    ? raw.variantList.filter(isObject).map((item) => {
        const variant = item as RawVariant;
        return {
          variantId: toString(variant.variantId),
          title: toString(variant.title),
          sku: toString(variant.sku),
          attributes: toStringRecord(variant.attributes),
          price: toNumber(variant.price),
          mrpPrice: toNumber(variant.mrpPrice),
          stock: toNumber(variant.stock),
          isActive: toBoolean(variant.isActive),
        };
      })
    : [],
  attributeList: Array.isArray(raw.attributeList)
    ? raw.attributeList.filter(isObject).map((item) => {
        const attribute = item as RawAttribute;
        return {
          attributeId: toString(attribute.attributeId),
          name: toString(attribute.name),
          value: toString(attribute.value),
        };
      })
    : [],
  tagList: Array.isArray(raw.tagList)
    ? raw.tagList.filter(isObject).map((item) => {
        const tag = item as RawTag;
        return {
          tagId: toString(tag.tagId),
          name: toString(tag.name),
          slug: toString(tag.slug),
        };
      })
    : [],
  reviewList: Array.isArray(raw.reviewList)
    ? raw.reviewList.filter(isObject).map((item) => {
        const review = item as Partial<ProductReviewData> & {
          userData?: { userId?: unknown; name?: unknown };
        };
        return {
          reviewId: toString(review.reviewId),
          rating: toNumber(review.rating),
          title: toString(review.title),
          comment: toString(review.comment),
          images: toImageList(review.images),
          isVerified: toBoolean(review.isVerified),
          vendorReply: toString(review.vendorReply),
          createdAt: toString(review.createdAt),
          userData: {
            userId: toString(review.userData?.userId),
            name: toString(review.userData?.name),
          },
        };
      })
    : [],
});
