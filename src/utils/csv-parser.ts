import { Recipe } from '../types/foraging';
import { v4 as uuidv4 } from 'uuid';

export interface CSVParseResult {
  recipes: Recipe[];
  errors: string[];
  warnings: string[];
  totalRows: number;
  successfulRows: number;
}

export interface CSVValidationError {
  row: number;
  field: string;
  message: string;
}

const REQUIRED_FIELDS = ['title', 'description', 'category', 'difficulty'];
const VALID_CATEGORIES = ['drinks', 'meals', 'preserves', 'medicinal'];
const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'];

export function generateCSVTemplate(): string {
  const headers = [
    'title',
    'description', 
    'category',
    'difficulty',
    'prepTime',
    'cookTime',
    'servings',
    'season',
    'requiredFinds',
    'ingredients',
    'instructions',
    'tags'
  ];
  
  const sampleData = [
    'Wild Berry Smoothie',
    'Refreshing smoothie with foraged berries',
    'drinks',
    'easy',
    '5',
    '0',
    '2',
    'summer|autumn',
    'blackberry|elderberry',
    '1 cup mixed wild berries|1 banana|1 cup yogurt',
    'Wash berries thoroughly|Blend all ingredients|Serve chilled',
    'summer|healthy|quick'
  ];

  return [
    headers.join(','),
    sampleData.map(field => `"${field}"`).join(',')
  ].join('\n');
}

export function parseCSVToRecipes(csvContent: string): CSVParseResult {
  const result: CSVParseResult = {
    recipes: [],
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
        const recipe = parseRowToRecipe(headers, values, rowNumber);
        
        if (recipe) {
          result.recipes.push(recipe);
          result.successfulRows++;
        }
      } catch (error) {
        result.errors.push(`Row ${rowNumber}: ${error.message}`);
      }
    });

  } catch (error) {
    result.errors.push(`Failed to parse CSV: ${error.message}`);
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

function parseRowToRecipe(headers: string[], values: string[], rowNumber: number): Recipe | null {
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
  if (!VALID_CATEGORIES.includes(rowData.category)) {
    throw new Error(`Invalid category: ${rowData.category}. Must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }

  // Validate difficulty
  if (!VALID_DIFFICULTIES.includes(rowData.difficulty)) {
    throw new Error(`Invalid difficulty: ${rowData.difficulty}. Must be one of: ${VALID_DIFFICULTIES.join(', ')}`);
  }

  // Parse numeric fields
  const prepTime = parseInt(rowData.prepTime) || 0;
  const cookTime = parseInt(rowData.cookTime) || 0;
  const servings = parseInt(rowData.servings) || 1;

  if (prepTime < 0 || cookTime < 0 || servings < 1) {
    throw new Error('prepTime and cookTime must be non-negative, servings must be at least 1');
  }

  // Parse array fields (using | as separator)
  const parseArrayField = (field: string): string[] => {
    const value = rowData[field]?.trim();
    if (!value) return [];
    return value.split('|').map(item => item.trim()).filter(item => item.length > 0);
  };

  const recipe: Recipe = {
    id: uuidv4(),
    title: rowData.title.trim(),
    description: rowData.description.trim(),
    category: rowData.category as Recipe['category'],
    difficulty: rowData.difficulty as Recipe['difficulty'],
    prepTime,
    cookTime,
    servings,
    season: parseArrayField('season'),
    requiredFinds: parseArrayField('requiredFinds'),
    ingredients: parseArrayField('ingredients'),
    instructions: parseArrayField('instructions'),
    tags: parseArrayField('tags'),
    userNotes: rowData.userNotes?.trim() || undefined
  };

  // Additional validation
  if (recipe.ingredients.length === 0) {
    throw new Error('Recipe must have at least one ingredient');
  }

  if (recipe.instructions.length === 0) {
    throw new Error('Recipe must have at least one instruction');
  }

  return recipe;
}

export function validateRecipeForDuplicates(
  newRecipe: Recipe, 
  existingRecipes: Recipe[]
): { isDuplicate: boolean; existingRecipe?: Recipe } {
  const existing = existingRecipes.find(recipe => 
    recipe.title.toLowerCase().trim() === newRecipe.title.toLowerCase().trim()
  );
  
  return {
    isDuplicate: !!existing,
    existingRecipe: existing
  };
}

export function exportRecipesToCSV(recipes: Recipe[]): string {
  const headers = [
    'title',
    'description',
    'category', 
    'difficulty',
    'prepTime',
    'cookTime',
    'servings',
    'season',
    'requiredFinds',
    'ingredients',
    'instructions',
    'tags'
  ];

  const csvRows = [headers.join(',')];

  recipes.forEach(recipe => {
    const row = [
      `"${recipe.title.replace(/"/g, '""')}"`,
      `"${recipe.description.replace(/"/g, '""')}"`,
      recipe.category,
      recipe.difficulty,
      recipe.prepTime.toString(),
      recipe.cookTime.toString(),
      recipe.servings.toString(),
      `"${recipe.season.join('|')}"`,
      `"${recipe.requiredFinds.join('|')}"`,
      `"${recipe.ingredients.join('|')}"`,
      `"${recipe.instructions.join('|')}"`,
      `"${recipe.tags.join('|')}"`
    ];
    csvRows.push(row.join(','));
  });

  return csvRows.join('\n');
}