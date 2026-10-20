import { REGEX, VENDOR_COMMISSION_MAX, VENDOR_COMMISSION_MIN, VENDOR_REASON_MAX_LENGTH } from '@/constants';
import { MESSAGES } from '@/messages';

export type ValidationField = 'identifier' | 'password' | 'reason' | 'commissionRate' | 'subAdminName' | 'subAdminEmail' | 'subAdminPhone' | 'subAdminPassword' | '';

export interface ValidationResult {
  isValid: boolean;
  message: string;
  field: ValidationField;
}

const valid: ValidationResult = { isValid: true, message: '', field: '' };
const invalid = (field: ValidationField, message: string): ValidationResult => ({
  isValid: false,
  message,
  field,
});

export const isEmpty = (value: string) => value.trim().length === 0;
export const isEmail = (value: string) => REGEX.email.test(value.trim());
export const isPhone = (value: string) => REGEX.phone.test(value.trim());
export const isEmailOrPhone = (value: string) => isEmail(value) || isPhone(value);

export function validateLogin(identifier: string, password: string): ValidationResult {
  const { identifierRequired, identifierInvalid, passwordRequired } = MESSAGES.validation;
  if (isEmpty(identifier)) return invalid('identifier', identifierRequired);
  if (!isEmailOrPhone(identifier)) return invalid('identifier', identifierInvalid);
  if (password.length === 0) return invalid('password', passwordRequired);
  return valid;
}

export function validateVendorReason(reason: string): ValidationResult {
  const { vendorReasonRequired, vendorReasonTooLong } = MESSAGES.validation;
  if (isEmpty(reason)) return invalid('reason', vendorReasonRequired);
  if (reason.trim().length > VENDOR_REASON_MAX_LENGTH) {
    return invalid('reason', vendorReasonTooLong);
  }
  return valid;
}

export function validateVendorCommission(commission: string): ValidationResult {
  const { vendorCommissionInvalid } = MESSAGES.validation;
  if (isEmpty(commission)) return valid;
  const rate = Number(commission);
  if (!Number.isFinite(rate) || rate < VENDOR_COMMISSION_MIN || rate > VENDOR_COMMISSION_MAX) {
    return invalid('commissionRate', vendorCommissionInvalid);
  }
  return valid;
}

export function validateSubAdmin(values: {
  name: string;
  email: string;
  phone: string;
  password: string;
  mode: 'create' | 'update';
}): ValidationResult {
  const {
    subAdminNameRequired,
    subAdminEmailRequired,
    subAdminEmailInvalid,
    subAdminPhoneRequired,
    subAdminPasswordRequired,
  } = MESSAGES.validation;
  if (isEmpty(values.name)) return invalid('subAdminName', subAdminNameRequired);
  if (isEmpty(values.email)) return invalid('subAdminEmail', subAdminEmailRequired);
  if (!isEmail(values.email)) return invalid('subAdminEmail', subAdminEmailInvalid);
  if (isEmpty(values.phone)) return invalid('subAdminPhone', subAdminPhoneRequired);
  if (values.mode === 'create' && isEmpty(values.password)) {
    return invalid('subAdminPassword', subAdminPasswordRequired);
  }
  return valid;
}
