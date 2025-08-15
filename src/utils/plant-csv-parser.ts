import { Plant, PlantCategory } from '../types/plant';
import { v4 as uuidv4 } from 'uuid';

export interface PlantCSVParseResult {
  plants: Plant[];
  errors: string[];
  warnings: string[];
  totalRows: number;
  successfulRows: number;
}

export interface PlantCSVValidationError {
  row: number;
  field: string;
  message: string;
}

const REQUIRED_FIELDS = ['name', 'latinName', 'family', 'category'];
const VALID_CATEGORIES: PlantCategory[] = ['berries', 'leaves', 'nuts', 'mushrooms', 'flowers', 'roots'];
const VALID_CONSERVATION_STATUS = ['common', 'uncommon', 'rare', 'protected'];

export function generatePlantCSVTemplate(): string {
  const headers = [
    'name',
    'latinName',
    'family',
    'category',
    'heroImage',
    'images',
    'keyFeatures',
    'habitat',
    'season',
    'lookAlikes',
    'size',
    'safe',
    'preparation',
    'warnings',
    'toxicParts',
    'culinary',
    'medicinal',
    'traditional',
    'recipes',
    'ethics',
    'funFacts',
    'conservationStatus',
    // Monthly in-season flags
    'inJan','inFeb','inMar','inApr','inMay','inJun','inJul','inAug','inSep','inOct','inNov','inDec'
  ];
  
  const sampleData = [
    'Wild Strawberry',
    'Fragaria vesca',
    'Rosaceae',
    'berries',
    'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400',
    'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400|https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400',
    'Small white 5-petaled flowers|Bright red berries with seeds on outside|Three-leaflet compound leaves|Low growing plant',
    'Forest clearings|Woodland edges|Meadows|Mountain slopes',
    'Spring|Summer',
    'Mock strawberry (yellow flowers, tasteless fruit)|Indian strawberry (similar)',
    'Low growing perennial, 2-6 inches tall',
    'true',
    'Eat berries fresh when ripe|Leaves can be dried for tea|Harvest when bright red',
    'Avoid plants near roadsides|Make sure berries are truly ripe',
    '',
    'Fresh eating|Jams|Desserts|Fruit salads',
    'Leaves traditionally used for digestive tea|Vitamin C source',
    'Folk remedy for stomach ailments|Dye from berries',
    'wild-strawberry-jam|strawberry-leaf-tea',
    'Only take what you need|Leave plenty for wildlife|Don\'t uproot plants',
    'Wild strawberries are much smaller but more flavorful than cultivated ones!',
    'common',
    // Months (true where in-season)
    'false','false','true','true','true','false','false','false','false','false','false','false'
  ];

  return [
    headers.join(','),
    sampleData.map(field => `"${field}"`).join(',')
  ].join('\n');
}

export function parsePlantCSVToPlants(csvContent: string): PlantCSVParseResult {
  const result: PlantCSVParseResult = {
    plants: [],
    errors: [],
    warnings: [],
    totalRows: 0,
    successfulRows: 0
  };

  try {
    const lines = csvContent.trim().split('\n');
    
    if (lines.length < 2) {
      result.errors.push('CSV file must contain at least a header row and one data row');
      return result;
    }

    const headers = parseCSVRow(lines[0]);
    const dataRows = lines.slice(1);
    result.totalRows = dataRows.length;

    // Validate headers
    const missingHeaders = REQUIRED_FIELDS.filter(field => !headers.includes(field));
    if (missingHeaders.length > 0) {
      result.errors.push(`Missing required headers: ${missingHeaders.join(', ')}`);
      return result;
    }

    // Process each data row
    dataRows.forEach((line, index) => {
      const rowNumber = index + 2; // +2 because we skip header and arrays are 0-indexed
      
      try {
        const values = parseCSVRow(line);
        const plant = parseRowToPlant(headers, values, rowNumber);
        
        if (plant) {
          result.plants.push(plant);
          result.successfulRows++;
        }
      } catch (error) {
        result.errors.push(`Row ${rowNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });

  } catch (error) {
    result.errors.push(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return result;
}

function parseCSVRow(row: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < row.length) {
    const char = row[i];
    
    if (char === '"') {
      if (inQuotes && row[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i += 2;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      result.push(current.trim());
      current = '';
      i++;
    } else {
      current += char;
      i++;
    }
  }
  
  // Add the last field
  result.push(current.trim());
  
  return result;
}

function parseRowToPlant(headers: string[], values: string[], rowNumber: number): Plant | null {
  const rowData: Record<string, string> = {};
  
  // Map values to headers
  headers.forEach((header, index) => {
    rowData[header] = values[index] || '';
  });

  // Validate required fields
  for (const field of REQUIRED_FIELDS) {
    if (!rowData[field]?.trim()) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  // Validate category
  if (!VALID_CATEGORIES.includes(rowData.category as PlantCategory)) {
    throw new Error(`Invalid category: ${rowData.category}. Must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }

  // Validate conservation status if provided
  if (rowData.conservationStatus && !VALID_CONSERVATION_STATUS.includes(rowData.conservationStatus)) {
    throw new Error(`Invalid conservation status: ${rowData.conservationStatus}. Must be one of: ${VALID_CONSERVATION_STATUS.join(', ')}`);
  }

  // Parse boolean fields
  const parseBooleanField = (field: string, defaultValue: boolean = false): boolean => {
    const value = rowData[field]?.trim().toLowerCase();
    if (!value) return defaultValue;
    return value === 'true' || value === '1' || value === 'yes';
  };

  // Parse array fields (using | as separator)
  const parseArrayField = (field: string): string[] => {
    const value = rowData[field]?.trim();
    if (!value) return [];
    return value.split('|').map(item => item.trim()).filter(item => item.length > 0);
  };

  const inSeason = {
    jan: parseBooleanField('inJan'),
    feb: parseBooleanField('inFeb'),
    mar: parseBooleanField('inMar'),
    apr: parseBooleanField('inApr'),
    may: parseBooleanField('inMay'),
    jun: parseBooleanField('inJun'),
    jul: parseBooleanField('inJul'),
    aug: parseBooleanField('inAug'),
    sep: parseBooleanField('inSep'),
    oct: parseBooleanField('inOct'),
    nov: parseBooleanField('inNov'),
    dec: parseBooleanField('inDec'),
  } as Plant['inSeason'];

  const plant: Plant = {
    id: uuidv4(),
    name: rowData.name.trim(),
    latinName: rowData.latinName.trim(),
    family: rowData.family.trim(),
    category: rowData.category as PlantCategory,
    heroImage: rowData.heroImage?.trim() || 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400',
    images: parseArrayField('images').length > 0 ? parseArrayField('images') : [rowData.heroImage?.trim() || 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400'],
    identification: {
      keyFeatures: parseArrayField('keyFeatures'),
      habitat: parseArrayField('habitat'),
      season: parseArrayField('season'),
      lookAlikes: parseArrayField('lookAlikes'),
      size: rowData.size?.trim() || 'Size not specified'
    },
    edibility: {
      safe: parseBooleanField('safe', false),
      preparation: parseArrayField('preparation'),
      warnings: parseArrayField('warnings'),
      toxicParts: parseArrayField('toxicParts')
    },
    uses: {
      culinary: parseArrayField('culinary'),
      medicinal: parseArrayField('medicinal'),
      traditional: parseArrayField('traditional'),
      recipes: parseArrayField('recipes')
    },
    ethics: parseArrayField('ethics'),
    funFacts: rowData.funFacts?.trim() || undefined,
    conservationStatus: rowData.conservationStatus as Plant['conservationStatus'] || 'common',
    inSeason,
  };

  // Additional validation
  if (plant.identification.keyFeatures.length === 0) {
    throw new Error('Plant must have at least one key identification feature');
  }

  return plant;
}

export function validatePlantForDuplicates(
  newPlant: Plant, 
  existingPlants: Plant[]
): { isDuplicate: boolean; existingPlant?: Plant } {
  const existing = existingPlants.find(plant => 
    plant.name.toLowerCase().trim() === newPlant.name.toLowerCase().trim() ||
    plant.latinName.toLowerCase().trim() === newPlant.latinName.toLowerCase().trim()
  );
  
  return {
    isDuplicate: !!existing,
    existingPlant: existing
  };
}

export function exportPlantsToCSV(plants: Plant[]): string {
  const headers = [
    'name',
    'latinName',
    'family',
    'category',
    'heroImage',
    'images',
    'keyFeatures',
    'habitat',
    'season',
    'lookAlikes',
    'size',
    'safe',
    'preparation',
    'warnings',
    'toxicParts',
    'culinary',
    'medicinal',
    'traditional',
    'recipes',
    'ethics',
    'funFacts',
    'conservationStatus',
    'inJan','inFeb','inMar','inApr','inMay','inJun','inJul','inAug','inSep','inOct','inNov','inDec'
  ];

  const csvRows = [headers.join(',')];

  plants.forEach(plant => {
    const m = plant.inSeason || {jan:false,feb:false,mar:false,apr:false,may:false,jun:false,jul:false,aug:false,sep:false,oct:false,nov:false,dec:false};
    const row = [
      `"${plant.name.replace(/"/g, '""')}"`,
      `"${plant.latinName.replace(/"/g, '""')}"`,
      `"${plant.family.replace(/"/g, '""')}"`,
      plant.category,
      `"${plant.heroImage.replace(/"/g, '""')}"`,
      `"${plant.images.join('|')}"`,
      `"${plant.identification.keyFeatures.join('|')}"`,
      `"${plant.identification.habitat.join('|')}"`,
      `"${plant.identification.season.join('|')}"`,
      `"${plant.identification.lookAlikes.join('|')}"`,
      `"${plant.identification.size.replace(/"/g, '""')}"`,
      plant.edibility.safe.toString(),
      `"${plant.edibility.preparation.join('|')}"`,
      `"${(plant.edibility.warnings || []).join('|')}"`,
      `"${(plant.edibility.toxicParts || []).join('|')}"`,
      `"${plant.uses.culinary.join('|')}"`,
      `"${plant.uses.medicinal.join('|')}"`,
      `"${plant.uses.traditional.join('|')}"`,
      `"${plant.uses.recipes.join('|')}"`,
      `"${plant.ethics.join('|')}"`,
      `"${(plant.funFacts || '').replace(/"/g, '""')}"`,
      plant.conservationStatus || 'common',
      m.jan.toString(), m.feb.toString(), m.mar.toString(), m.apr.toString(), m.may.toString(), m.jun.toString(), m.jul.toString(), m.aug.toString(), m.sep.toString(), m.oct.toString(), m.nov.toString(), m.dec.toString()
    ];
    csvRows.push(row.join(','));
  });

  return csvRows.join('\n');
}
