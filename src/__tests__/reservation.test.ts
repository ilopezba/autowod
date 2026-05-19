import { describe, it, expect } from 'vitest';
import { parsePreferenceValue, getReservationKey } from '../services/reservation';

describe('parsePreferenceValue', () => {
  it('returns nulls for null input', () => {
    expect(parsePreferenceValue(null)).toEqual({ time: null, className: null });
  });

  it('returns nulls for empty string', () => {
    expect(parsePreferenceValue('')).toEqual({ time: null, className: null });
  });

  it('parses time-only preference', () => {
    expect(parsePreferenceValue('17:00')).toEqual({ time: '17:00', className: null });
  });

  it('parses time and class name', () => {
    expect(parsePreferenceValue('17:00|CrossFit')).toEqual({
      time: '17:00',
      className: 'CrossFit',
    });
  });

  it('trims whitespace from both parts', () => {
    expect(parsePreferenceValue('  09:00  |  WOD  ')).toEqual({
      time: '09:00',
      className: 'WOD',
    });
  });

  it('returns null time when only class name provided', () => {
    expect(parsePreferenceValue('|CrossFit')).toEqual({ time: null, className: 'CrossFit' });
  });
});

describe('getReservationKey', () => {
  it('formats evening time as reservation key', () => {
    expect(getReservationKey('17:00')).toBe('h170000');
  });

  it('formats morning time with leading zero', () => {
    expect(getReservationKey('09:30')).toBe('h093000');
  });

  it('formats midday time', () => {
    expect(getReservationKey('12:00')).toBe('h120000');
  });
});
