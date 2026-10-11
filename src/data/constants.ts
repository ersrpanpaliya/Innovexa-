/**
 * Ration Saathi - Public Sector Application Constants
 * Department of Food, Civil Supplies and Consumer Protection, Government of Maharashtra
 */

export const SITE_NAME = 'Ration Saathi';
export const HELPLINE = '1967';
export const HELPLINE_TEL = 'tel:1967';
export const HELPLINE_LABEL = 'National / State Food PDS Toll-Free Helpline: 1967';
export const STATE_NAME = 'Maharashtra';
export const DEPARTMENT_NAME = 'Department of Food, Civil Supplies & Consumer Protection';
export const LAST_UPDATED = 'October 2026';

/**
 * Set PROTOTYPE_MODE to false for official production deployment
 * When true, a slim accessible banner notes prototype status and sample quota metrics.
 */
export const PROTOTYPE_MODE = true;

export const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
export const MOBILE_REGEX = /^\d{10}$/;
export const MAX_FILE_SIZE_BYTES = 3 * 1024 * 1024; // 3 MB
