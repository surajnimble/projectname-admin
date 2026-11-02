import type {
  ReviewData,
  ReviewListData,
  ReviewSummaryData,
  QuestionData,
  QuestionListData,
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

export const toReviewList = (raw: Partial<ReviewListData> = {}): ReviewListData => ({
  totalRecord: toNumber(raw.totalRecord),
  totalPage: toNumber(raw.totalPage),
  currentPage: toNumber(raw.currentPage),
  limit: toNumber(raw.limit),
  hasNext: raw.hasNext === true,
  hasPrevious: raw.hasPrevious === true,
  nextPage: toNumber(raw.nextPage),
  previousPage: toNumber(raw.previousPage),
  itemList: Array.isArray(raw.itemList)
    ? raw.itemList.filter(isObject).map((item) => toReview(item))
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

export const toQuestionList = (raw: Partial<QuestionListData> = {}): QuestionListData => ({
  totalRecord: toNumber(raw.totalRecord),
  totalPage: toNumber(raw.totalPage),
  currentPage: toNumber(raw.currentPage),
  limit: toNumber(raw.limit),
  hasNext: raw.hasNext === true,
  hasPrevious: raw.hasPrevious === true,
  nextPage: toNumber(raw.nextPage),
  previousPage: toNumber(raw.previousPage),
  itemList: Array.isArray(raw.itemList)
    ? raw.itemList.filter(isObject).map((item) => toQuestion(item))
    : [],
});
