import { describe, expect, it } from 'vitest';
import { validateLogin, validateVendorCommission, validateVendorReason } from './validations';

describe('validateLogin', () => {
  it('accepts an email or a phone number with a password', () => {
    expect(validateLogin('a@b.com', 'x').isValid).toBe(true);
    expect(validateLogin('8607582826', 'x').isValid).toBe(true);
    expect(validateLogin('+91 86075 82826', 'x').isValid).toBe(true);
  });

  it('reports the first problem and its field', () => {
    expect(validateLogin('', '')).toMatchObject({ isValid: false, field: 'identifier' });
    expect(validateLogin('hello', 'x')).toMatchObject({ isValid: false, field: 'identifier' });
    expect(validateLogin('a@b.com', '')).toMatchObject({ isValid: false, field: 'password' });
  });
});

describe('validateVendorReason', () => {
  it('accepts a reason and rejects an empty or long one', () => {
    expect(validateVendorReason('Documents missing').isValid).toBe(true);
    expect(validateVendorReason('   ')).toMatchObject({ isValid: false, field: 'reason' });
    expect(validateVendorReason('a'.repeat(501))).toMatchObject({ isValid: false, field: 'reason' });
  });
});

describe('validateVendorCommission', () => {
  it('treats an empty rate as valid and rejects a rate outside 0-100', () => {
    expect(validateVendorCommission('').isValid).toBe(true);
    expect(validateVendorCommission('10').isValid).toBe(true);
    expect(validateVendorCommission('0').isValid).toBe(true);
    expect(validateVendorCommission('100').isValid).toBe(true);
    expect(validateVendorCommission('101')).toMatchObject({
      isValid: false,
      field: 'commissionRate',
    });
    expect(validateVendorCommission('abc')).toMatchObject({
      isValid: false,
      field: 'commissionRate',
    });
  });
});
