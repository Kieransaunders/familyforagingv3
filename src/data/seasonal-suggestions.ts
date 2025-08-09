import { SeasonalSuggestion } from '../types/foraging';

export const seasonalSuggestions: SeasonalSuggestion[] = [
  {
    name: 'Wild Garlic',
    category: 'herb',
    description: 'Broad, bright green leaves with a strong garlic smell',
    bestMonths: [3, 4, 5], // March, April, May
    habitat: 'Woodland floors, shaded areas, near streams',
    identificationTips: [
      'Distinctive garlic smell when crushed',
      'Broad, pointed leaves',
      'White star-shaped flowers in spring',
      'Grows in patches'
    ]
  },
  {
    name: 'Elderflower',
    category: 'plant',
    description: 'Creamy white flower clusters with sweet fragrance',
    bestMonths: [5, 6, 7], // May, June, July
    habitat: 'Hedgerows, woodland edges, waste ground',
    identificationTips: [
      'Distinctive sweet, musty fragrance',
      'Flat-topped clusters of tiny white flowers',
      'Opposite compound leaves',
      'Grows on elder trees/bushes'
    ]
  },
  {
    name: 'Blackberry',
    category: 'berry',
    description: 'Dark purple aggregate berries on thorny canes',
    bestMonths: [8, 9, 10], // August, September, October
    habitat: 'Hedgerows, woodland edges, waste ground',
    identificationTips: [
      'Thorny stems (canes)',
      'Compound leaves with 3-5 leaflets',
      'White or pink flowers in summer',
      'Berries turn from red to black when ripe'
    ]
  },
  {
    name: 'Nettle',
    category: 'herb',
    description: 'Serrated leaves that sting when touched',
    bestMonths: [3, 4, 5, 6], // March, April, May, June
    habitat: 'Fertile soil, waste ground, woodland clearings',
    identificationTips: [
      'Serrated, heart-shaped leaves',
      'Stinging hairs on stems and leaves',
      'Grows in patches',
      'Pick young leaves at top of plant'
    ]
  },
  {
    name: 'Dandelion',
    category: 'herb',
    description: 'Bright yellow flowers with deeply toothed leaves',
    bestMonths: [3, 4, 5, 6, 7, 8, 9], // March through September
    habitat: 'Grasslands, lawns, roadsides, waste ground',
    identificationTips: [
      'Deeply toothed leaves in rosette',
      'Bright yellow flowers',
      'Hollow stems with milky sap',
      'Fluffy seed heads (clocks)'
    ]
  },
  {
    name: 'Rose Hip',
    category: 'berry',
    description: 'Red-orange fruits from wild rose bushes',
    bestMonths: [9, 10, 11], // September, October, November
    habitat: 'Hedgerows, woodland edges, coastal areas',
    identificationTips: [
      'Bright red or orange oval fruits',
      'Thorny stems',
      'Compound leaves',
      'Remains of sepals at base of fruit'
    ]
  },
  {
    name: 'Hawthorn',
    category: 'berry',
    description: 'Small red berries with one or two seeds',
    bestMonths: [9, 10, 11], // September, October, November
    habitat: 'Hedgerows, woodland edges, hillsides',
    identificationTips: [
      'Small red berries (haws)',
      'Deeply lobed leaves',
      'Thorny branches',
      'White flowers in spring'
    ]
  },
  {
    name: 'Cleavers',
    category: 'herb',
    description: 'Sticky, scrambling plant with small white flowers',
    bestMonths: [3, 4, 5, 6], // March, April, May, June
    habitat: 'Hedgerows, woodland edges, waste ground',
    identificationTips: [
      'Sticky, clinging stems',
      'Whorls of narrow leaves',
      'Small white flowers',
      'Scrambles over other plants'
    ]
  },
  {
    name: 'Wood Sorrel',
    category: 'herb',
    description: 'Heart-shaped leaves with white flowers',
    bestMonths: [3, 4, 5, 6, 7, 8], // March through August
    habitat: 'Woodland floors, shaded areas',
    identificationTips: [
      'Heart-shaped leaves in groups of three',
      'Sour, lemony taste',
      'White flowers with purple veins',
      'Leaves fold at night'
    ]
  },
  {
    name: 'Sloe',
    category: 'berry',
    description: 'Dark blue berries from blackthorn bushes',
    bestMonths: [9, 10, 11], // September, October, November
    habitat: 'Hedgerows, woodland edges, scrubland',
    identificationTips: [
      'Dark blue berries with bloom',
      'Very thorny branches',
      'Small oval leaves',
      'White flowers before leaves in spring'
    ]
  }
];

export function getSeasonalSuggestions(month: number): SeasonalSuggestion[] {
  return seasonalSuggestions.filter(suggestion => 
    suggestion.bestMonths.includes(month)
  );
}

export function getCurrentSeasonSuggestions(): SeasonalSuggestion[] {
  const currentMonth = new Date().getMonth() + 1;
  return getSeasonalSuggestions(currentMonth);
}