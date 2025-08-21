export const IS_WEB = typeof document !== 'undefined';
export const SHOW_WEB_BANNER = (typeof process !== 'undefined' && process.env && process.env.WEB_PREVIEW_BANNER === '1') || false;
export const USE_MOCK_DATA = (typeof process !== 'undefined' && process.env && process.env.WEB_USE_MOCK === '1') || false;
