import type {
  ReviewData,
  ReviewListData,
  ReviewSummaryData,
  QuestionData,
  QuestionListData,
  FlashSaleData,
  FlashSaleListData,
  FlashSaleItemData,
} from '@/lib/api/contract';

const toNumber = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;

const toString = (value: unknown): string => (typeof value === 'string' ? value : '');

const toBoolean = (value: unknown): boolean => value === true;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const toReview = (raw: unknown = {}): ReviewData => {
  const r = raw as Record<string, unknown>;
  return {
    reviewId: toString(r.reviewId),
    productId: toString(r.productId),
    productName: toString(r.productName),
    vendorId: toString(r.vendorId),
    vendorShopName: toString(r.vendorShopName),
    userId: toString(r.userId),
    userName: toString(r.userName),
    rating: toNumber(r.rating),
    title: toString(r.title),
    comment: toString(r.comment),
    images: Array.isArray(r.images) ? r.images.filter(isObject).map(String) : [],
    isVerified: toBoolean(r.isVerified),
    isPending: toBoolean(r.isPending),
    isApproved: toBoolean(r.isApproved),
    isRejected: toBoolean(r.isRejected),
    vendorReply: toString(r.vendorReply),
    repliedAt: toString(r.repliedAt),
    repliedById: toString(r.repliedById),
    helpfulCount: toNumber(r.helpfulCount),
    createdAt: toString(r.createdAt),
    updatedAt: toString(r.updatedAt),
  };
};

type RawReviewList = Partial<ReviewListData> & {
  reviewList?: unknown;
};

export const toReviewList = (raw: RawReviewList = {}): ReviewListData => ({
  totalRecord: toNumber(raw.totalRecord),
  totalPage: toNumber(raw.totalPage),
  currentPage: toNumber(raw.currentPage),
  limit: toNumber(raw.limit),
  hasNext: raw.hasNext === true,
  hasPrevious: raw.hasPrevious === true,
  nextPage: toNumber(raw.nextPage),
  previousPage: toNumber(raw.previousPage),
  itemList: Array.isArray(raw.reviewList)
    ? raw.reviewList.filter(isObject).map((item) => toReview(item))
    : [],
});

export const toReviewSummary = (
  raw: Partial<ReviewSummaryData> = {},
): ReviewSummaryData => ({
  productId: toString(raw.productId),
  averageRating: toNumber(raw.averageRating),
  totalCount: toNumber(raw.totalCount),
  verifiedCount: toNumber(raw.verifiedCount),
  distributionList: Array.isArray(raw.distributionList)
    ? raw.distributionList.filter(isObject).map((item) => ({
        rating: toNumber(item.rating),
        count: toNumber(item.count),
        percentage: toNumber(item.percentage),
      }))
    : [],
});

export const toQuestion = (raw: unknown = {}): QuestionData => {
  const r = raw as Record<string, unknown>;
  return {
    questionId: toString(r.questionId),
    productId: toString(r.productId),
    productName: toString(r.productName),
    vendorId: toString(r.vendorId),
    vendorShopName: toString(r.vendorShopName),
    userId: toString(r.userId),
    userName: toString(r.userName),
    question: toString(r.question),
    isAnonymous: toBoolean(r.isAnonymous),
    isApproved: toBoolean(r.isApproved),
    answers: Array.isArray(r.answers)
      ? r.answers.filter(isObject).map((item) => ({
          answerId: toString(item.answerId),
          answer: toString(item.answer),
          userId: toString(item.userId),
          userName: toString(item.userName),
          createdAt: toString(item.createdAt),
          isApproved: toBoolean(item.isApproved),
        }))
      : [],
    createdAt: toString(r.createdAt),
    updatedAt: toString(r.updatedAt),
  };
};

type RawQuestionList = Partial<QuestionListData> & {
  questionList?: unknown;
};

export const toQuestionList = (raw: RawQuestionList = {}): QuestionListData => ({
  totalRecord: toNumber(raw.totalRecord),
  totalPage: toNumber(raw.totalPage),
  currentPage: toNumber(raw.currentPage),
  limit: toNumber(raw.limit),
  hasNext: raw.hasNext === true,
  hasPrevious: raw.hasPrevious === true,
  nextPage: toNumber(raw.nextPage),
  previousPage: toNumber(raw.previousPage),
  itemList: Array.isArray(raw.questionList)
    ? raw.questionList.filter(isObject).map((item) => toQuestion(item))
    : [],
});

const toFlashSaleItem = (raw: unknown = {}): FlashSaleItemData => {
  const r = raw as Record<string, unknown>;
  const pd = r.productData as Record<string, unknown> | undefined;
  return {
    flashSaleItemId: toString(r.flashSaleItemId),
    productId: toString(r.productId),
    salePrice: toNumber(r.salePrice),
    originalPrice: toNumber(r.originalPrice),
    mrpPrice: toNumber(r.mrpPrice),
    saving: toNumber(r.saving),
    saleStock: toNumber(r.saleStock),
    soldCount: toNumber(r.soldCount),
    stockRemaining: toNumber(r.stockRemaining),
    isSoldOut: toBoolean(r.isSoldOut),
    discountPercent: toNumber(r.discountPercent),
    productData: {
      productId: toString(pd?.productId),
      name: toString(pd?.name),
      slug: toString(pd?.slug),
      price: toNumber(pd?.price),
      mrpPrice: toNumber(pd?.mrpPrice),
      stock: toNumber(pd?.stock),
      isActive: toBoolean(pd?.isActive),
      imageList: Array.isArray(pd?.imageList)
        ? pd.imageList.filter(isObject).map(String)
        : [],
    },
  };
};

type RawFlashSaleList = Partial<FlashSaleListData> & {
  flashSaleList?: unknown;
};

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
    ? raw.flashSaleList.filter(isObject).map((item) => toFlashSale(item))
    : [],
});

const toFlashSale = (raw: unknown = {}): FlashSaleData => {
  const r = raw as Record<string, unknown>;
  return {
    flashSaleId: toString(r.flashSaleId),
    name: toString(r.name),
    slug: toString(r.slug),
    banner: toString(r.banner),
    startsAt: toString(r.startsAt),
    endsAt: toString(r.endsAt),
    discountType: toString(r.discountType),
    discountValue: toNumber(r.discountValue),
    isActive: toBoolean(r.isActive),
    isLive: toBoolean(r.isLive),
    isUpcoming: toBoolean(r.isUpcoming),
    hasEnded: toBoolean(r.hasEnded),
    secondsRemaining: toNumber(r.secondsRemaining),
    itemList: Array.isArray(r.itemList) ? r.itemList.filter(isObject).map(toFlashSaleItem) : [],
  };
};
