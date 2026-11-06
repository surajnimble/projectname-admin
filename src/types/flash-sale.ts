import type { FlashSaleListData } from '@/lib/api/contract';

const toString = (value: unknown): string => (typeof value === 'string' ? value : '');
const toNumber = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : Number(value) || 0;
const toBoolean = (value: unknown): boolean => value === true;
const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export type RawFlashSaleList = Partial<
  Record<keyof Omit<FlashSaleListData, 'itemList'>, unknown>
> & { flashSaleList?: unknown };

export const toFlashSaleList = (raw: RawFlashSaleList = {}): FlashSaleListData => ({
  totalRecord: toNumber(raw.totalRecord),
  totalPage: toNumber(raw.totalPage),
  currentPage: toNumber(raw.currentPage),
  limit: toNumber(raw.limit),
  hasNext: raw.hasNext === true,
  hasPrevious: raw.hasPrevious === true,
  nextPage: toNumber(raw.nextPage),
  previousPage: toNumber(raw.previousPage),
  itemList: Array.isArray(raw.flashSaleList)
    ? raw.flashSaleList.filter(isObject).map((sale) => ({
        flashSaleId: toString(sale.flashSaleId),
        name: toString(sale.name),
        slug: toString(sale.slug),
        banner: toString(sale.banner),
        startsAt: toString(sale.startsAt),
        endsAt: toString(sale.endsAt),
        discountType: toString(sale.discountType),
        discountValue: toNumber(sale.discountValue),
        isActive: toBoolean(sale.isActive),
        isLive: toBoolean(sale.isLive),
        itemList: Array.isArray(sale.itemList)
          ? sale.itemList.filter(isObject).map((item) => {
              const product = isObject(item.productData) ? item.productData : {};
              return {
                flashSaleItemId: toString(item.flashSaleItemId),
                productId: toString(item.productId),
                salePrice: toNumber(item.salePrice),
                saleStock: toNumber(item.saleStock),
                soldCount: toNumber(item.soldCount),
                isSoldOut: toBoolean(item.isSoldOut),
                productData: {
                  productId: toString(product.productId),
                  name: toString(product.name),
                  slug: toString(product.slug),
                  price: toNumber(product.price),
                  mrpPrice: toNumber(product.mrpPrice),
                  imageList: Array.isArray(product.imageList)
                    ? product.imageList.filter((image): image is string => typeof image === 'string')
                    : [],
                },
              };
            })
          : [],
      }))
    : [],
});
