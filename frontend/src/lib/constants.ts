export const FDI_TEETH = {
  upperRight: [18, 17, 16, 15, 14, 13, 12, 11],
  upperLeft: [21, 22, 23, 24, 25, 26, 27, 28],
  lowerLeft: [38, 37, 36, 35, 34, 33, 32, 31],
  lowerRight: [41, 42, 43, 44, 45, 46, 47, 48],
};

export const ALL_TEETH = [
  ...FDI_TEETH.upperRight,
  ...FDI_TEETH.upperLeft,
  ...FDI_TEETH.lowerLeft,
  ...FDI_TEETH.lowerRight,
];

export const WORK_DAYS = [
  'dushanba', 'seshanba', 'chorshanba', 'payshanba', 'juma', 'shanba', 'yakshanba',
];

export const WORK_DAY_LABELS: Record<string, string> = {
  dushanba: 'Dushanba',
  seshanba: 'Seshanba',
  chorshanba: 'Chorshanba',
  payshanba: 'Payshanba',
  juma: 'Juma',
  shanba: 'Shanba',
  yakshanba: 'Yakshanba',
};
