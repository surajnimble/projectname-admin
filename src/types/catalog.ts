import type {
  CategoryData,
  CategoryListData,
  BrandData,
  BrandListData,
  TagData,
  TagListData,
  AttributeData,
  AttributeListData,
  CollectionData,
  CollectionListData,
} from '@/lib/api/contract';

const toNumber = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;

const toString = (value: unknown): string => (typeof value === 'string' ? value : '');

const toBoolean = (value: unknown): boolean => value === true;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const get = (obj: Record<string, unknown>, key: string): unknown => obj[key];

const findList = (
  raw: Record<string, unknown>,
  ...keys: string[]
): Record<string, unknown>[] | undefined => {
  for (const key of keys) {
    const val = raw[key];
    if (Array.isArray(val)) return val as Record<string, unknown>[];
  }
  return undefined;
};

export const toCategory = (raw: Record<string, unknown>): CategoryData => ({
  categoryId: toString(get(raw, 'categoryId')),
  name: toString(get(raw, 'name')),
  slug: toString(get(raw, 'slug')),
  description: toString(get(raw, 'description')),
  image: toString(get(raw, 'image')),
  icon: toString(get(raw, 'icon')),
  parentId: toString(get(raw, 'parentId')),
  isActive: toBoolean(get(raw, 'isActive')),
  sortOrder: toNumber(get(raw, 'sortOrder')),
  createdAt: toString(get(raw, 'createdAt')),
  updatedAt: toString(get(raw, 'updatedAt')),
  childCount: toNumber(get(raw, 'childCount')),
  productCount: toNumber(get(raw, 'productCount')),
});

export const toCategoryList = (raw: Partial<CategoryListData> = {}): CategoryListData => ({
  totalRecord: toNumber(raw.totalRecord),
  totalPage: toNumber(raw.totalPage),
  currentPage: toNumber(raw.currentPage),
  limit: toNumber(raw.limit),
  hasNext: raw.hasNext === true,
  hasPrevious: raw.hasPrevious === true,
  nextPage: toNumber(raw.nextPage),
  previousPage: toNumber(raw.previousPage),
  itemList: (() => {
    const list = findList(raw as Record<string, unknown>, 'categoryList');
    return list ? list.filter(isObject).map((item) => toCategory(item)) : [];
  })(),
});

export const toBrand = (raw: Record<string, unknown>): BrandData => ({
  brandId: toString(get(raw, 'brandId')),
  name: toString(get(raw, 'name')),
  slug: toString(get(raw, 'slug')),
  description: toString(get(raw, 'description')),
  logo: toString(get(raw, 'logo')),
  isActive: toBoolean(get(raw, 'isActive')),
  productCount: toNumber(get(raw, 'productCount')),
  createdAt: toString(get(raw, 'createdAt')),
  updatedAt: toString(get(raw, 'updatedAt')),
});

export const toBrandList = (raw: Partial<BrandListData> = {}): BrandListData => ({
  totalRecord: toNumber(raw.totalRecord),
  totalPage: toNumber(raw.totalPage),
  currentPage: toNumber(raw.currentPage),
  limit: toNumber(raw.limit),
  hasNext: raw.hasNext === true,
  hasPrevious: raw.hasPrevious === true,
  nextPage: toNumber(raw.nextPage),
  previousPage: toNumber(raw.previousPage),
  itemList: (() => {
    const list = findList(raw as Record<string, unknown>, 'brandList');
    return list ? list.filter(isObject).map((item) => toBrand(item)) : [];
  })(),
});

export const toTag = (raw: Record<string, unknown>): TagData => ({
  tagId: toString(get(raw, 'tagId')),
  name: toString(get(raw, 'name')),
  slug: toString(get(raw, 'slug')),
  productCount: toNumber(get(raw, 'productCount')),
  isActive: toBoolean(get(raw, 'isActive')),
  createdAt: toString(get(raw, 'createdAt')),
  updatedAt: toString(get(raw, 'updatedAt')),
});

export const toTagList = (raw: Partial<TagListData> = {}): TagListData => ({
  totalRecord: toNumber(raw.totalRecord),
  totalPage: toNumber(raw.totalPage),
  currentPage: toNumber(raw.currentPage),
  limit: toNumber(raw.limit),
  hasNext: raw.hasNext === true,
  hasPrevious: raw.hasPrevious === true,
  nextPage: toNumber(raw.nextPage),
  previousPage: toNumber(raw.previousPage),
  itemList: (() => {
    const list = findList(raw as Record<string, unknown>, 'tagList');
    return list ? list.filter(isObject).map((item) => toTag(item)) : [];
  })(),
});

export const toAttribute = (raw: Record<string, unknown>): AttributeData => ({
  attributeId: toString(get(raw, 'attributeId')),
  name: toString(get(raw, 'name')),
  slug: toString(get(raw, 'slug')),
  type: toString(get(raw, 'type')),
  isVariant: toBoolean(get(raw, 'isVariant')),
  isFilterable: toBoolean(get(raw, 'isFilterable')),
  sortOrder: toNumber(get(raw, 'sortOrder')),
  usageCount: toNumber(get(raw, 'usageCount')),
  isActive: toBoolean(get(raw, 'isActive')),
  createdAt: toString(get(raw, 'createdAt')),
  updatedAt: toString(get(raw, 'updatedAt')),
});

export const toAttributeList = (raw: Partial<AttributeListData> = {}): AttributeListData => ({
  totalRecord: toNumber(raw.totalRecord),
  totalPage: toNumber(raw.totalPage),
  currentPage: toNumber(raw.currentPage),
  limit: toNumber(raw.limit),
  hasNext: raw.hasNext === true,
  hasPrevious: raw.hasPrevious === true,
  nextPage: toNumber(raw.nextPage),
  previousPage: toNumber(raw.previousPage),
  itemList: (() => {
    const list = findList(raw as Record<string, unknown>, 'attributeList');
    return list ? list.filter(isObject).map((item) => toAttribute(item)) : [];
  })(),
});

export const toCollection = (raw: Record<string, unknown>): CollectionData => ({
  collectionId: toString(get(raw, 'collectionId')),
  name: toString(get(raw, 'name')),
  slug: toString(get(raw, 'slug')),
  description: toString(get(raw, 'description')),
  type: toString(get(raw, 'type')),
  isActive: toBoolean(get(raw, 'isActive')),
  productCount: toNumber(get(raw, 'productCount')),
  createdAt: toString(get(raw, 'createdAt')),
  updatedAt: toString(get(raw, 'updatedAt')),
});

export const toCollectionList = (
  raw: Partial<CollectionListData> = {},
): CollectionListData => ({
  totalRecord: toNumber(raw.totalRecord),
  totalPage: toNumber(raw.totalPage),
  currentPage: toNumber(raw.currentPage),
  limit: toNumber(raw.limit),
  hasNext: raw.hasNext === true,
  hasPrevious: raw.hasPrevious === true,
  nextPage: toNumber(raw.nextPage),
  previousPage: toNumber(raw.previousPage),
  itemList: (() => {
    const list = findList(raw as Record<string, unknown>, 'collectionList');
    return list ? list.filter(isObject).map((item) => toCollection(item)) : [];
  })(),
});
