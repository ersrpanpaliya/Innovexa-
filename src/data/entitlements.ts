/**
 * Entitlements configuration for Maharashtra Ration Cards
 * Commodities: Wheat, Rice, Sugar (quantities in kg)
 */

export interface CommodityEntitlement {
  wheat: number;
  rice: number;
  sugar: number;
}

export interface CardCategoryConfig {
  id: 'Orange' | 'Yellow' | 'White' | 'AAY';
  code: string;
  labelKey: string;
  defaultLabel: string;
  colorName: string;
  chipColor: string;
  chipBorder: string;
  descriptionKey: string;
  wheat: number;
  rice: number;
  sugar: number;
}

export const ENTITLEMENTS: Record<string, CardCategoryConfig> = {
  Orange: {
    id: 'Orange',
    code: 'ORANGE',
    labelKey: 'card_category_orange',
    defaultLabel: 'Orange Card (केसरी रेशन कार्ड)',
    colorName: 'Orange',
    chipColor: '#EA580C',
    chipBorder: '#C2410C',
    descriptionKey: 'card_desc_orange',
    wheat: 10,
    rice: 9,
    sugar: 5
  },
  Yellow: {
    id: 'Yellow',
    code: 'YELLOW',
    labelKey: 'card_category_yellow',
    defaultLabel: 'Yellow Card (पिवळे रेशन कार्ड - BPL)',
    colorName: 'Yellow',
    chipColor: '#EAB308',
    chipBorder: '#CA8A04',
    descriptionKey: 'card_desc_yellow',
    wheat: 8,
    rice: 7,
    sugar: 3
  },
  White: {
    id: 'White',
    code: 'WHITE',
    labelKey: 'card_category_white',
    defaultLabel: 'White Card (पांढरे रेशन कार्ड - APL)',
    colorName: 'White',
    chipColor: '#CBD5E1',
    chipBorder: '#94A3B8',
    descriptionKey: 'card_desc_white',
    wheat: 5,
    rice: 5,
    sugar: 2
  },
  AAY: {
    id: 'AAY',
    code: 'AAY',
    labelKey: 'card_category_aay',
    defaultLabel: 'Antyodaya Anna Yojana (AAY - अंत्योदय)',
    colorName: 'Red / AAY',
    chipColor: '#DC2626',
    chipBorder: '#B91C1C',
    descriptionKey: 'card_desc_aay',
    wheat: 15,
    rice: 20,
    sugar: 1
  }
};

export const COMMODITIES = [
  { id: 'Wheat', labelKey: 'commodity_wheat', defaultLabel: 'Wheat (गहू)', unit: 'kg' },
  { id: 'Rice', labelKey: 'commodity_rice', defaultLabel: 'Rice (तांदूळ)', unit: 'kg' },
  { id: 'Sugar', labelKey: 'commodity_sugar', defaultLabel: 'Sugar (साखर)', unit: 'kg' }
] as const;

export type CommodityType = 'Wheat' | 'Rice' | 'Sugar';
