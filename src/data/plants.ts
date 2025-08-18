import { Plant, PlantCategory } from '../types/plant';

// Additional plant type for the comprehensive database
export type PlantDatabase = {
  id: string;
  name: string;
  latinName: string;
  category: "berries" | "leaves" | "nuts" | "mushrooms" | "flowers" | "roots";
  heroImage: string;
  identification: string[];
  edibility: { safe: boolean; preparation: string[]; warnings?: string[] };
  uses: { culinary: string[]; medicinal: string[]; recipes: string[] };
  ethics: string[];
  bestMonths: number[]; // Array of month numbers (1-12) when this plant is in season
};

// Comprehensive plant database with 30+ plants organized by season
export const PLANTS: PlantDatabase[] = [
  // --- SPRING ---
  {
    id: "db:nettle",
    name: "Nettle",
    latinName: "Urtica dioica",
    category: "leaves",
    heroImage: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400",
    identification: [
      "Stinging hairs on stems and leaves",
      "Opposite, serrated leaves",
      "Prefers nitrogen‑rich soils, waste ground, woodland edges",
    ],
    edibility: {
      safe: true,
      preparation: ["Blanch or cook to neutralise sting", "Use gloves when picking"],
      warnings: ["Avoid older leaves (can be gritty)"],
    },
    uses: {
      culinary: ["Soups", "Pestos", "Teas"],
      medicinal: ["Traditionally used for allergies and iron support"],
      recipes: ["nettle-soup", "nettle-pesto"],
    },
    ethics: ["Harvest young tops only", "Leave plenty for wildlife (e.g., butterflies)"],
    bestMonths: [3, 4, 5, 6], // March through June - best when young
  },
  {
    id: "db:dandelion",
    name: "Dandelion",
    latinName: "Taraxacum officinale",
    category: "leaves",
    heroImage: "https://images.unsplash.com/photo-1525440947054-5e81d6443c76?w=400",
    identification: [
      "Basal rosette of jagged leaves",
      "Hollow stems with milky sap",
      "Bright yellow composite flowers",
    ],
    edibility: {
      safe: true,
      preparation: [
        "Young leaves raw or cooked",
        "Roots roasted for 'coffee'",
        "Flowers for syrups/wine",
      ],
      warnings: ["Latex can irritate; bitter in late season"],
    },
    uses: {
      culinary: ["Salads", "Coffee substitute (roots)", "Wine/syrup (flowers)"],
      medicinal: ["Traditional liver and diuretic support"],
      recipes: ["dandelion-salad", "dandelion-coffee", "dandelion-syrup"],
    },
    ethics: ["Common, but still avoid over-harvesting roots in small patches"],
    bestMonths: [3, 4, 5, 6, 7, 8, 9], // March through September - young leaves best in spring
  },
  {
    id: "db:wild-garlic",
    name: "Wild Garlic",
    latinName: "Allium ursinum",
    category: "leaves",
    heroImage: "https://images.unsplash.com/photo-1587411768521-eba3d1d45e2b?w=400",
    identification: [
      "Strong garlic smell when crushed",
      "Broad, soft leaves; white starry flowers",
      "Moist woodland floors in spring",
    ],
    edibility: {
      safe: true,
      preparation: ["Raw in pestos", "Wilted like spinach", "Fermented"],
      warnings: ["Confuse risk with lily-of-the-valley – always check smell & ID"],
    },
    uses: {
      culinary: ["Pestos", "Soups", "Herb butters"],
      medicinal: ["Garlic family traditionally for cardiovascular support"],
      recipes: ["wild-garlic-pesto", "wild-garlic-butter"],
    },
    ethics: ["Pick leaves sparingly; never uproot bulbs in protected areas"],
    bestMonths: [3, 4, 5], // March, April, May - prime wild garlic season
  },
  {
    id: "db:goosefoot",
    name: "Goosefoot",
    latinName: "Chenopodium album",
    category: "leaves",
    heroImage: "https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=400",
    identification: [
      "Diamond/triangular leaves with mealy coating",
      "Erect, branching stems",
      "Weedy habitats, disturbed soils",
    ],
    edibility: {
      safe: true,
      preparation: ["Cook like spinach", "Use young shoots/leaves"],
      warnings: ["High oxalates — avoid huge quantities raw"],
    },
    uses: {
      culinary: ["Stews", "Sauteed greens"],
      medicinal: [],
      recipes: ["goosefoot-greens"],
    },
    ethics: ["Abundant weed; still avoid stripping entire plants"],
    bestMonths: [4, 5, 6, 7, 8], // April through August - young shoots
  },
  {
    id: "db:chickweed",
    name: "Chickweed",
    latinName: "Stellaria media",
    category: "leaves",
    heroImage: "https://images.unsplash.com/photo-1586450360903-6a6c2e7ff68f?w=400",
    identification: [
      "Single line of hairs along the stem",
      "Opposite small leaves",
      "Tiny white star-like flowers",
    ],
    edibility: {
      safe: true,
      preparation: ["Eat raw in salads", "Add to soups at the end"],
    },
    uses: {
      culinary: ["Salads", "Sandwich greens"],
      medicinal: ["Traditional soothing poultice for skin"],
      recipes: ["chickweed-salad"],
    },
    ethics: ["Very common; harvest lightly from each patch"],
    bestMonths: [3, 4, 5, 6, 7, 8, 9], // March through September
  },
  {
    id: "db:spearmint",
    name: "Spearmint",
    latinName: "Mentha spicata",
    category: "leaves",
    heroImage: "https://images.unsplash.com/photo-1618016922350-8c6d9b4a0aec?w=400",
    identification: [
      "Square stems (mint family)",
      "Opposite toothed leaves with mint aroma",
      "Spreads vigorously in damp soils",
    ],
    edibility: {
      safe: true,
      preparation: ["Teas", "Sauces", "Desserts"],
    },
    uses: {
      culinary: ["Mint teas", "Jellies", "Yogurt sauces"],
      medicinal: ["Digestive soothing traditionally"],
      recipes: ["mint-tea", "mint-yogurt-sauce"],
    },
    ethics: ["Invasive; careful garden management, but wild patches still share responsibly"],
    bestMonths: [4, 5, 6, 7, 8, 9], // April through September
  },
  {
    id: "db:plantain",
    name: "Plantain",
    latinName: "Plantago major",
    category: "leaves",
    heroImage: "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=400",
    identification: [
      "Broad leaves with parallel veins",
      "Low rosette habit",
      "Spike-like seed heads",
    ],
    edibility: {
      safe: true,
      preparation: ["Young leaves cooked", "Seeds ground as flour extender"],
    },
    uses: {
      culinary: ["Greens in soups", "Seed meal"],
      medicinal: ["Soothing leaf poultice for stings/bites"],
      recipes: ["plantain-greens"],
    },
    ethics: ["Common lawn 'weed'; pick clean, unpolluted areas only"],
    bestMonths: [4, 5, 6, 7, 8, 9], // April through September
  },

  // --- SUMMER ---
  {
    id: "db:wild-cherry",
    name: "Wild Cherry",
    latinName: "Prunus avium",
    category: "berries",
    heroImage: "https://cdn.pixabay.com/photo/2018/06/03/21/42/cherry-3451876_960_720.jpg",
    identification: [
      "Shiny bark with horizontal lenticels",
      "Clusters of white spring flowers",
      "Red to dark cherries in early summer",
    ],
    edibility: {
      safe: true,
      preparation: ["Eat ripe fruit raw", "Jams, fermentations"],
      warnings: ["Leaves and seeds contain cyanogenic compounds"],
    },
    uses: {
      culinary: ["Jams", "Liqueurs"],
      medicinal: [],
      recipes: ["wild-cherry-jam"],
    },
    ethics: ["Leave plenty for birds and other wildlife"],
    bestMonths: [6, 7], // June, July - early summer cherries
  },
  {
    id: "db:elder",
    name: "Elder",
    latinName: "Sambucus nigra",
    category: "berries",
    heroImage: "https://images.unsplash.com/photo-1564419434-b08e21e37342?w=400",
    identification: [
      "Umbels of white flowers in early summer",
      "Purple-black berry clusters",
      "Pithy stems, compound leaves",
    ],
    edibility: {
      safe: true,
      preparation: ["Cook berries (raw can upset stomach)", "Flowers for cordial"],
      warnings: ["Raw berries and leaves can be toxic"],
    },
    uses: {
      culinary: ["Cordials", "Wines", "Jellies"],
      medicinal: ["Traditional cold/flu support (flowers/berries cooked)"],
      recipes: ["elderflower-cordial", "elderberry-syrup"],
    },
    ethics: ["Take small amounts of flowers so berries still form"],
    bestMonths: [5, 6, 7, 8, 9], // May-July for flowers, August-September for berries
  },
  {
    id: "db:bilberry",
    name: "Bilberry",
    latinName: "Vaccinium myrtillus",
    category: "berries",
    heroImage: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=400",
    identification: [
      "Low shrub with solitary berries",
      "Deep blue berries that stain hands/teeth",
      "Acid heathland, moorland",
    ],
    edibility: {
      safe: true,
      preparation: ["Eat raw", "Jams, pies, dehydrated"],
    },
    uses: {
      culinary: ["Pies", "Jams"],
      medicinal: ["Traditional eye health support"],
      recipes: ["bilberry-jam"],
    },
    ethics: ["Slow-growing habitats — pick lightly"],
    bestMonths: [7, 8, 9], // July through September
  },
  {
    id: "db:marsh-samphire",
    name: "Marsh Samphire",
    latinName: "Salicornia europaea",
    category: "leaves",
    heroImage: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400",
    identification: [
      "Fleshy, jointed succulent stems",
      "Coastal saltmarshes",
      "Crunchy texture, salty taste",
    ],
    edibility: {
      safe: true,
      preparation: ["Blanch and serve with butter", "Pickled"],
      warnings: ["High salt content"],
    },
    uses: {
      culinary: ["Sea vegetable side dish", "Pickles"],
      medicinal: [],
      recipes: ["samphire-butter"],
    },
    ethics: ["Harvest sparingly; sensitive coastal ecosystems"],
    bestMonths: [7, 8, 9], // July through September
  },
  {
    id: "db:common-sorrel",
    name: "Common Sorrel",
    latinName: "Rumex acetosa",
    category: "leaves",
    heroImage: "https://images.unsplash.com/photo-1551835491-3d5c2b6de55d?w=400",
    identification: [
      "Arrow-shaped leaves with backward-pointing lobes",
      "Sour, lemony taste",
      "Meadows, pasture",
    ],
    edibility: {
      safe: true,
      preparation: ["Raw in small amounts", "Soups, sauces"],
      warnings: ["High oxalates; avoid in large quantities"],
    },
    uses: {
      culinary: ["Sorrel soup", "Sauces for fish"],
      medicinal: [],
      recipes: ["sorrel-soup"],
    },
    ethics: ["Widespread, but rotate patches"],
    bestMonths: [4, 5, 6, 7, 8], // April through August
  },
  {
    id: "db:giant-puffball",
    name: "Giant Puffball",
    latinName: "Calvatia gigantea",
    category: "mushrooms",
    heroImage: "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400",
    identification: [
      "Large white ball, often football-sized",
      "Pure white flesh when edible",
      "No gills/cap structure inside",
    ],
    edibility: {
      safe: true,
      preparation: ["Slice and fry", "Breaded 'steaks'"],
      warnings: ["Must be pure white inside; discard yellowing/olive stages"],
    },
    uses: {
      culinary: ["Fried slices", "Crumble substitute"],
      medicinal: [],
      recipes: ["puffball-steaks"],
    },
    ethics: ["Take only a portion; leave some to spore"],
    bestMonths: [6, 7, 8, 9, 10], // June through October
  },
  {
    id: "db:wild-radish",
    name: "Wild Radish",
    latinName: "Raphanus raphanistrum",
    category: "roots",
    heroImage: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400",
    identification: [
      "Pale yellow to lilac 4-petaled flowers",
      "Hairy stems and leaves",
      "Peppery taste",
    ],
    edibility: {
      safe: true,
      preparation: ["Young pods and leaves edible", "Roots often woody"],
      warnings: ["Can be bitter/spicy"],
    },
    uses: {
      culinary: ["Stir-fries", "Pickled pods"],
      medicinal: [],
      recipes: ["pickled-radish-pods"],
    },
    ethics: ["Common weed; still harvest mindfully"],
    bestMonths: [4, 5, 6, 7, 8], // April through August
  },
  {
    id: "db:woodland-strawberry",
    name: "Woodland Strawberry",
    latinName: "Fragaria vesca",
    category: "berries",
    heroImage: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400",
    identification: [
      "Three leaflets per leaf",
      "Small, intensely flavoured berries",
      "White flowers with yellow centres",
    ],
    edibility: {
      safe: true,
      preparation: ["Eat raw", "Dry for later"],
    },
    uses: {
      culinary: ["Fresh eating", "Desserts"],
      medicinal: [],
      recipes: ["wild-strawberry-compote"],
    },
    ethics: ["Tiny berries — take sparingly"],
    bestMonths: [6, 7, 8], // June through August
  },
  {
    id: "db:wild-plum",
    name: "Wild Plum",
    latinName: "Prunus domestica subsp. insititia",
    category: "berries",
    heroImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
    identification: [
      "Small plum or bullace fruits",
      "Thorny hedgerows",
      "White blossom in spring",
    ],
    edibility: {
      safe: true,
      preparation: ["Cook for jams, chutneys", "Eat ripe"],
      warnings: ["Stones contain cyanogenic compounds"],
    },
    uses: {
      culinary: ["Jams", "Chutneys"],
      medicinal: [],
      recipes: ["wild-plum-jam"],
    },
    ethics: ["Share with wildlife; avoid stripping hedgerows"],
    bestMonths: [7, 8, 9], // July through September
  },
  {
    id: "db:blackberry",
    name: "Blackberry",
    latinName: "Rubus fruticosus agg.",
    category: "berries",
    heroImage: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=400",
    identification: [
      "Arching brambles with thorns",
      "Palmate leaves, white/pink flowers",
      "Dark aggregate berries late summer",
    ],
    edibility: {
      safe: true,
      preparation: ["Raw", "Pies, jams, syrups"],
    },
    uses: {
      culinary: ["Crumble", "Jam", "Shrubs"],
      medicinal: ["Leaf tea traditionally for diarrhoea"],
      recipes: ["blackberry-crumble", "blackberry-jam"],
    },
    ethics: ["Leave plenty for wildlife, don't trample habitats"],
    bestMonths: [8, 9, 10], // August through October
  },

  // --- AUTUMN / FALL ---
  {
    id: "db:apple",
    name: "Apple",
    latinName: "Malus domestica (incl. wildings)",
    category: "berries",
    heroImage: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400",
    identification: [
      "Tree with serrated, oval leaves",
      "White/pink blossom in spring",
      "Edible pomes in autumn",
    ],
    edibility: {
      safe: true,
      preparation: ["Raw", "Ciders", "Pies"],
    },
    uses: {
      culinary: ["Cider", "Cakes", "Sauces"],
      medicinal: [],
      recipes: ["apple-crumble", "apple-cider"],
    },
    ethics: ["Forage windfalls; ask permission from private orchards"],
    bestMonths: [8, 9, 10, 11], // August through November
  },
  {
    id: "db:rose-hips",
    name: "Rose (Hips)",
    latinName: "Rosa canina (typical)",
    category: "berries",
    heroImage: "https://cdn.pixabay.com/photo/2016/09/29/14/19/rose-hips-1702982_960_720.jpg",
    identification: [
      "Shrub with curved thorns",
      "Pinnate leaves",
      "Red hips in autumn",
    ],
    edibility: {
      safe: true,
      preparation: ["Remove irritant hairs", "Make syrups, jams, teas"],
      warnings: ["Hairs inside hips are irritant — strain well"],
    },
    uses: {
      culinary: ["Syrup", "Jam", "Tea"],
      medicinal: ["High vitamin C traditionally"],
      recipes: ["rose-hip-syrup"],
    },
    ethics: ["Don't overharvest — wildlife relies on hips over winter"],
    bestMonths: [9, 10, 11], // September through November
  },
  {
    id: "db:hawthorn",
    name: "Hawthorn",
    latinName: "Crataegus monogyna",
    category: "berries",
    heroImage: "https://images.unsplash.com/photo-1598735948212-8519e3d83353?w=400",
    identification: [
      "Deeply lobed leaves",
      "White blossom in May",
      "Red haws in autumn",
    ],
    edibility: {
      safe: true,
      preparation: ["Jellies", "Ketchups", "Tinctures"],
    },
    uses: {
      culinary: ["Haw jelly", "Haw ketchup"],
      medicinal: ["Traditionally for heart support (flowers/berries)"],
      recipes: ["hawthorn-ketchup"],
    },
    ethics: ["Leave plenty for birds"],
    bestMonths: [9, 10, 11], // September through November
  },
  {
    id: "db:raspberry",
    name: "Raspberry",
    latinName: "Rubus idaeus",
    category: "berries",
    heroImage: "https://images.unsplash.com/photo-1566907820464-5e0e087de2e8?w=400",
    identification: [
      "Erect canes, often thorny",
      "Palmate, serrated leaves",
      "Aggregate red berries",
    ],
    edibility: {
      safe: true,
      preparation: ["Raw", "Jams", "Desserts"],
    },
    uses: {
      culinary: ["Jam", "Cordials"],
      medicinal: ["Raspberry leaf tea traditionally for pregnancy support"],
      recipes: ["raspberry-jam"],
    },
    ethics: ["Cultivated and wild; respect private land"],
    bestMonths: [6, 7, 8, 9], // June through September
  },
  {
    id: "db:beech",
    name: "Beech",
    latinName: "Fagus sylvatica",
    category: "nuts",
    heroImage: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
    identification: [
      "Smooth grey bark",
      "Wavy-edged leaves with silky hairs when young",
      "Triangular beechnuts in spiky husks",
    ],
    edibility: {
      safe: true,
      preparation: ["Roast/peel nuts", "Use sparingly raw (mildly toxic)"],
      warnings: ["Some people report gastric upset raw"],
    },
    uses: {
      culinary: ["Nut snacks", "Flour extender"],
      medicinal: [],
      recipes: ["roasted-beechnuts"],
    },
    ethics: ["Collect windfalls; don't damage trees"],
    bestMonths: [9, 10], // September, October
  },
  {
    id: "db:cep",
    name: "Cep / Porcini",
    latinName: "Boletus edulis",
    category: "mushrooms",
    heroImage: "https://images.unsplash.com/photo-1504970446340-5bd4d5c1d75c?w=400",
    identification: [
      "Thick, white stalk with netted pattern",
      "Brown cap, sponge-like pores (not gills)",
      "White, firm flesh (not staining blue)",
    ],
    edibility: {
      safe: true,
      preparation: ["Slice and dry", "Pan fry fresh"],
      warnings: ["Avoid red-pored or blue-staining boletes"],
    },
    uses: {
      culinary: ["Risottos", "Pasta", "Stocks"],
      medicinal: [],
      recipes: ["porcini-risotto"],
    },
    ethics: ["Cut, don't rake; leave small/old specimens"],
    bestMonths: [8, 9, 10, 11], // August through November
  },
  {
    id: "db:hazelnut",
    name: "Hazelnut",
    latinName: "Corylus avellana",
    category: "nuts",
    heroImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
    identification: [
      "Multi-stemmed shrub",
      "Rounded, toothed leaves",
      "Nuts in green husks, catkins in spring",
    ],
    edibility: {
      safe: true,
      preparation: ["Roast, grind into meal"],
    },
    uses: {
      culinary: ["Nut butters", "Flours"],
      medicinal: [],
      recipes: ["roasted-hazelnuts"],
    },
    ethics: ["Take modestly; key wildlife food"],
    bestMonths: [9, 10], // September, October
  },
  {
    id: "db:sweet-chestnut",
    name: "Sweet Chestnut",
    latinName: "Castanea sativa",
    category: "nuts",
    heroImage: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
    identification: [
      "Long, serrated leaves",
      "Large spiky burs with 1–3 nuts",
      "Tall, often plantation trees",
    ],
    edibility: {
      safe: true,
      preparation: ["Score and roast", "Puree for desserts"],
    },
    uses: {
      culinary: ["Roasted chestnuts", "Chestnut puree"],
      medicinal: [],
      recipes: ["roasted-chestnuts"],
    },
    ethics: ["Gather windfalls; avoid damaging burs/branches"],
    bestMonths: [9, 10, 11], // September through November
  },
  {
    id: "db:staghorn-sumac",
    name: "Staghorn Sumac",
    latinName: "Rhus typhina",
    category: "berries",
    heroImage: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400",
    identification: [
      "Velvety, antler-like young branches",
      "Large pinnate leaves turning red",
      "Dense red berry cones",
    ],
    edibility: {
      safe: true,
      preparation: ["Steep cones for tangy 'lemonade'", "Spice blend when dried"],
      warnings: ["Avoid look-alike toxic sumacs (rare in UK)"],
    },
    uses: {
      culinary: ["Sumac spice", "'Lemonade' infusion"],
      medicinal: [],
      recipes: ["sumac-lemonade"],
    },
    ethics: ["Often ornamental/invasive — still harvest responsibly"],
    bestMonths: [8, 9, 10], // August through October
  },

  // --- WINTER ---
  {
    id: "db:wood-sorrel",
    name: "Wood Sorrel",
    latinName: "Oxalis acetosella",
    category: "leaves",
    heroImage: "https://images.unsplash.com/photo-1520637836862-4d197d17c89a?w=400",
    identification: [
      "Shamrock-like trifoliate leaves",
      "Tangy, lemony taste",
      "Woodland floors, prefers shade",
    ],
    edibility: {
      safe: true,
      preparation: ["Use sparingly as a garnish"],
      warnings: ["High oxalates — avoid large quantities"],
    },
    uses: {
      culinary: ["Garnish", "Sharp flavouring"],
      medicinal: [],
      recipes: ["wood-sorrel-garnish"],
    },
    ethics: ["Small plants — take very lightly"],
    bestMonths: [3, 4, 5, 6, 7, 8, 9], // March through September, available most of year
  },
  {
    id: "db:sea-beet",
    name: "Sea Beet",
    latinName: "Beta vulgaris subsp. maritima",
    category: "leaves",
    heroImage: "https://picsum.photos/400/300?random=1",
    identification: [
      "Thick, glossy, dark green leaves",
      "Coastal shingle and cliffs",
      "Ancestor of cultivated beet/chard",
    ],
    edibility: {
      safe: true,
      preparation: ["Cook like spinach/chard"],
      warnings: ["Salt spray — wash well"],
    },
    uses: {
      culinary: ["Greens in sautés", "Pies"],
      medicinal: [],
      recipes: ["sea-beet-greens"],
    },
    ethics: ["Coastal plants can be sparse — pick minimally"],
    bestMonths: [5, 6, 7, 8, 9, 10], // May through October
  },
  {
    id: "db:birch",
    name: "Birch",
    latinName: "Betula pendula",
    category: "leaves",
    heroImage: "https://images.unsplash.com/photo-1516406080161-8b3f8f2b3d94?w=400",
    identification: [
      "White peeling bark with black fissures",
      "Triangular serrated leaves",
      "Catkins in spring",
    ],
    edibility: {
      safe: true,
      preparation: ["Tap sap in early spring for drinks/syrup", "Leaf teas"],
      warnings: ["Tapping requires care — don't harm the tree"],
    },
    uses: {
      culinary: ["Birch sap wine/syrup"],
      medicinal: ["Traditional diuretic leaf tea"],
      recipes: ["birch-sap-wine"],
    },
    ethics: ["If tapping, 1 small tap per healthy tree; seal afterwards"],
    bestMonths: [3, 4], // March, April for sap, year-round for leaves
  },
];

// Sample plant data based on the mockup and Family Foraging theme
export const plants: Plant[] = [
  {
    id: 'elderberry',
    name: 'Elderberry',
    latinName: 'Sambucus nigra',
    family: 'Adoxaceae',
    category: 'berries',
    heroImage: 'https://images.unsplash.com/photo-1564419434-b08e21e37342?w=400',
    images: [
      'https://images.unsplash.com/photo-1564419434-b08e21e37342?w=400',
      'https://images.unsplash.com/photo-1595804112849-c8e18d4b5c2a?w=400'
    ],
    identification: {
      keyFeatures: [
        'Small, dark purple berries in flat-topped clusters',
        'Opposite compound leaves with 5-7 serrated leaflets',
        'Serrated edge leaves as oval leaflets',
        'Available from summer to early fall'
      ],
      habitat: ['Woodland edges', 'Hedgerows', 'Waste ground', 'River banks'],
      season: ['Summer', 'Early Fall'],
      lookAlikes: ['Pokeweed (toxic)', 'Red elderberry (toxic when raw)'],
      size: 'Shrub or small tree, 3-10 feet tall'
    },
    edibility: {
      safe: true,
      preparation: ['Ripe berries safe to eat when cooked', 'Raw berries, leaves, stems are toxic'],
      warnings: ['Never eat raw elderberries or any other parts of the plant'],
      toxicParts: ['Leaves', 'Bark', 'Seeds', 'Raw berries']
    },
    uses: {
      culinary: ['Jams', 'Syrups', 'Wine', 'Pies', 'Elderberry cordial'],
      medicinal: ['Traditional cold remedy', 'Immune system support'],
      traditional: ['Folk medicine for flu', 'Dye from berries'],
      recipes: ['elderberry-syrup', 'elderberry-jam']
    },
    ethics: [
      'Harvest sustainably, leaving enough berries for wildlife',
      'Take no more than 1/3 of berries from any single bush',
      'Birds rely on elderberries for winter food'
    ],
    funFacts: 'Elder trees were considered magical in European folklore - it was believed that witches lived in them!',
    conservationStatus: 'common'
  },
  {
    id: 'blackberry',
    name: 'Blackberry',
    latinName: 'Rubus species',
    family: 'Rosaceae',
    category: 'berries',
    heroImage: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=400',
    images: [
      'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=400',
      'https://images.unsplash.com/photo-1566907820464-5e0e087de2e8?w=400'
    ],
    identification: {
      keyFeatures: [
        'Dark purple-black aggregate berries',
        'Thorny canes with 3-5 leaflets',
        'White or pink flowers in spring',
        'Grows in dense thickets'
      ],
      habitat: ['Forest edges', 'Abandoned fields', 'Roadsides', 'Sunny clearings'],
      season: ['Late Summer', 'Early Fall'],
      lookAlikes: ['Dewberry (similar, also edible)', 'Raspberry (red, also edible)'],
      size: 'Thorny canes 3-10 feet long'
    },
    edibility: {
      safe: true,
      preparation: ['Eat fresh when fully dark', 'Excellent cooked in pies and jams'],
      warnings: ['Avoid berries near roadsides due to pollution']
    },
    uses: {
      culinary: ['Fresh eating', 'Jams', 'Pies', 'Smoothies', 'Cobblers'],
      medicinal: ['Leaves traditionally used for tea'],
      traditional: ['Dye from berries', 'Basket weaving with canes'],
      recipes: ['blackberry-cobbler', 'blackberry-jam']
    },
    ethics: [
      'Wear long sleeves and pants to protect from thorns',
      'Leave some berries for wildlife',
      'Be careful not to damage the canes'
    ],
    funFacts: 'Blackberries are actually not berries at all - they are aggregate fruits made up of many tiny drupelets!',
    conservationStatus: 'common'
  },
  {
    id: 'dandelion',
    name: 'Dandelion',
    latinName: 'Taraxacum officinale',
    family: 'Asteraceae',
    category: 'leaves',
    heroImage: 'https://images.unsplash.com/photo-1525440947054-5e81d6443c76?w=400',
    images: [
      'https://images.unsplash.com/photo-1525440947054-5e81d6443c76?w=400',
      'https://images.unsplash.com/photo-1463127792983-4f5f2c8eacc2?w=400'
    ],
    identification: {
      keyFeatures: [
        'Bright yellow flower heads',
        'Deeply toothed leaves in basal rosette',
        'Hollow stems with white milky sap',
        'Fluffy white seed heads (dandelion clocks)'
      ],
      habitat: ['Lawns', 'Fields', 'Roadsides', 'Waste areas', 'Almost anywhere'],
      season: ['Spring', 'Summer', 'Fall'],
      lookAlikes: ['Cat\'s ear (similar but hairy leaves)', 'Chicory (blue flowers)'],
      size: 'Low growing, 2-18 inches tall'
    },
    edibility: {
      safe: true,
      preparation: ['Young leaves best raw in salads', 'Older leaves better cooked', 'Flowers edible raw or cooked'],
      warnings: ['Avoid plants treated with herbicides', 'May be bitter if leaves are too old']
    },
    uses: {
      culinary: ['Salad greens', 'Cooked like spinach', 'Flower wine', 'Root coffee substitute'],
      medicinal: ['Traditional liver tonic', 'Diuretic properties'],
      traditional: ['Natural dye', 'Rubber from sap'],
      recipes: ['dandelion-salad', 'dandelion-wine']
    },
    ethics: [
      'Harvest from clean areas away from roads',
      'Don\'t take from treated lawns',
      'Leave some plants to complete their life cycle'
    ],
    funFacts: 'The name comes from French "dent de lion" meaning "lion\'s tooth" because of the jagged leaves!',
    conservationStatus: 'common'
  },
  {
    id: 'acorn',
    name: 'Acorn',
    latinName: 'Quercus species',
    family: 'Fagaceae',
    category: 'nuts',
    heroImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'
    ],
    identification: {
      keyFeatures: [
        'Oval nuts with distinctive caps',
        'Lobed leaves characteristic of oak trees',
        'Found beneath oak trees',
        'Brown when ripe in fall'
      ],
      habitat: ['Oak forests', 'Parks', 'Urban areas with oak trees'],
      season: ['Fall'],
      lookAlikes: ['Chestnuts (spiky outer casing)', 'Buckeyes (toxic)'],
      size: 'Nuts 0.5-2 inches long depending on oak species'
    },
    edibility: {
      safe: true,
      preparation: ['Must be processed to remove tannins', 'Shell, grind, and leach in water', 'Can be made into flour'],
      warnings: ['Raw acorns are very bitter and hard to digest', 'Requires significant processing time']
    },
    uses: {
      culinary: ['Acorn flour', 'Acorn bread', 'Traditional Native American foods'],
      medicinal: ['Astringent properties', 'Traditional wound treatment'],
      traditional: ['Important food source for indigenous peoples', 'Animal feed'],
      recipes: ['acorn-flour', 'acorn-pancakes']
    },
    ethics: [
      'Collect fallen acorns, don\'t pull from trees',
      'Leave plenty for wildlife - critical food source',
      'White oak acorns are less bitter than red oak'
    ],
    funFacts: 'Native Americans had sophisticated techniques for processing acorns that took days to complete!',
    conservationStatus: 'common'
  },
  {
    id: 'oyster-mushroom',
    name: 'Oyster Mushroom',
    latinName: 'Pleurotus ostreatus',
    family: 'Pleurotaceae',
    category: 'mushrooms',
    heroImage: 'https://images.unsplash.com/photo-1504970446340-5bd4d5c1d75c?w=400',
    images: [
      'https://images.unsplash.com/photo-1504970446340-5bd4d5c1d75c?w=400',
      'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400'
    ],
    identification: {
      keyFeatures: [
        'Fan or oyster-shaped caps',
        'Growing in overlapping clusters on wood',
        'White to cream colored gills',
        'No stem or very short stem to one side'
      ],
      habitat: ['Dead hardwood trees', 'Logs', 'Stumps', 'Living stressed trees'],
      season: ['Fall', 'Winter', 'Spring'],
      lookAlikes: ['Elm oyster (edible)', 'Angel wings (avoid - growing on conifers)'],
      size: 'Caps 2-8 inches across'
    },
    edibility: {
      safe: true,
      preparation: ['Always cook thoroughly', 'Remove tough stem base', 'Excellent sautéed or in stir-fries'],
      warnings: ['Never eat raw mushrooms', 'Always be 100% certain of identification']
    },
    uses: {
      culinary: ['Sautéed', 'Soups', 'Stir-fries', 'Pasta dishes'],
      medicinal: ['Traditional immune support', 'Rich in antioxidants'],
      traditional: ['Cultivated commercially worldwide'],
      recipes: ['oyster-mushroom-stir-fry', 'mushroom-soup']
    },
    ethics: [
      'Only harvest what you need',
      'Cut with knife, don\'t pull from substrate',
      'Leave some for spore production',
      'Never harvest near polluted areas'
    ],
    funFacts: 'Oyster mushrooms are carnivorous! They can capture and digest small worms for extra nutrition.',
    conservationStatus: 'common'
  },
  {
    id: 'violet',
    name: 'Wild Violet',
    latinName: 'Viola species',
    family: 'Violaceae',
    category: 'flowers',
    heroImage: 'https://images.unsplash.com/photo-1520637836862-4d197d17c89a?w=400',
    images: [
      'https://images.unsplash.com/photo-1520637836862-4d197d17c89a?w=400',
      'https://images.unsplash.com/photo-1585320486699-8c4b1f6db05c?w=400'
    ],
    identification: {
      keyFeatures: [
        'Heart-shaped leaves',
        'Purple, blue, or white flowers with 5 petals',
        'Flowers have distinctive spurs',
        'Low growing in patches'
      ],
      habitat: ['Woodland areas', 'Shaded lawns', 'Stream banks', 'Moist soil'],
      season: ['Spring', 'Early Summer'],
      lookAlikes: ['African violet (houseplant, not wild)', 'Pansy (cultivated)'],
      size: 'Low growing, 2-6 inches tall'
    },
    edibility: {
      safe: true,
      preparation: ['Flowers and leaves edible raw', 'Great in salads', 'Flowers make beautiful garnish'],
      warnings: ['Avoid roadside plants', 'Don\'t confuse with African violets']
    },
    uses: {
      culinary: ['Salad garnish', 'Edible flowers', 'Jelly', 'Tea from leaves'],
      medicinal: ['Traditional respiratory remedy', 'Soothing for coughs'],
      traditional: ['Natural purple dye', 'Perfume'],
      recipes: ['violet-jelly', 'spring-salad']
    },
    ethics: [
      'Pick flowers sparingly, leaves more sustainable',
      'Don\'t harvest entire patches',
      'Allow plants to set seed for next year'
    ],
    funFacts: 'Violets are rich in vitamin C - more than oranges! They were eaten by sailors to prevent scurvy.',
    conservationStatus: 'common'
  },
  {
    id: 'wild-garlic',
    name: 'Wild Garlic',
    latinName: 'Allium ursinum',
    family: 'Amaryllidaceae',
    category: 'roots',
    heroImage: 'https://images.unsplash.com/photo-1587411768521-eba3d1d45e2b?w=400',
    images: [
      'https://images.unsplash.com/photo-1587411768521-eba3d1d45e2b?w=400',
      'https://images.unsplash.com/photo-1616776005756-4dbb1d68b9bc?w=400'
    ],
    identification: {
      keyFeatures: [
        'Strong garlic smell when crushed',
        'Broad, lance-shaped leaves',
        'White star-shaped flowers in clusters',
        'Grows from underground bulbs'
      ],
      habitat: ['Damp woodland', 'Shaded areas', 'Rich soil'],
      season: ['Spring', 'Early Summer'],
      lookAlikes: ['Lily of the valley (toxic - no garlic smell)', 'Bluebell leaves (no garlic smell)'],
      size: 'Leaves 6-10 inches long'
    },
    edibility: {
      safe: true,
      preparation: ['Leaves, flowers, and bulbs all edible', 'Use like garlic or onions', 'Great raw or cooked'],
      warnings: ['MUST smell like garlic - if no smell, do not eat', 'Confused with toxic plants']
    },
    uses: {
      culinary: ['Pesto', 'Salads', 'Soups', 'Seasoning', 'Pickled bulbs'],
      medicinal: ['Traditional antibiotic properties', 'Digestive aid'],
      traditional: ['Natural pest deterrent', 'Blood pressure support'],
      recipes: ['wild-garlic-pesto', 'garlic-bread']
    },
    ethics: [
      'Harvest leaves sustainably, leave bulbs to regrow',
      'Don\'t strip entire areas',
      'Best to harvest outer leaves only'
    ],
    funFacts: 'Bears love wild garlic so much that it\'s called "bear\'s garlic" in many languages!',
    conservationStatus: 'common'
  }
];

export const plantCategories: { name: PlantCategory; label: string; icon: string; image: string }[] = [
  {
    name: 'berries',
    label: 'Berries',
    icon: '🫐',
    image: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=400'
  },
  {
    name: 'leaves',
    label: 'Leaves',
    icon: '🌿',
    image: 'https://images.unsplash.com/photo-1525440947054-5e81d6443c76?w=400'
  },
  {
    name: 'nuts',
    label: 'Nuts',
    icon: '🌰',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400'
  },
  {
    name: 'mushrooms',
    label: 'Mushrooms',
    icon: '🍄',
    image: 'https://images.unsplash.com/photo-1504970446340-5bd4d5c1d75c?w=400'
  },
  {
    name: 'flowers',
    label: 'Flowers',
    icon: '🌸',
    image: 'https://images.unsplash.com/photo-1520637836862-4d197d17c89a?w=400'
  },
  {
    name: 'roots',
    label: 'Roots',
    icon: '🥕',
    image: 'https://images.unsplash.com/photo-1587411768521-eba3d1d45e2b?w=400'
  }
];

export const getPlantsByCategory = (category: PlantCategory): Plant[] => {
  return plants.filter(plant => plant.category === category);
};

export const getPlantById = (id: string): Plant | undefined => {
  return plants.find(plant => plant.id === id);
};

export const searchPlants = (query: string): Plant[] => {
  const searchTerm = query.toLowerCase();
  return plants.filter(plant => 
    plant.name.toLowerCase().includes(searchTerm) ||
    plant.latinName.toLowerCase().includes(searchTerm) ||
    plant.identification.keyFeatures.some(feature => 
      feature.toLowerCase().includes(searchTerm)
    )
  );
};

// Seasonal plant functions for LogFindScreen
export const getSeasonalPlantsFromDatabase = (month: number): PlantDatabase[] => {
  return PLANTS.filter(plant => 
    plant.bestMonths.includes(month)
  );
};

export const getCurrentSeasonalPlantsFromDatabase = (): PlantDatabase[] => {
  const currentMonth = new Date().getMonth() + 1; // getMonth() returns 0-11, we need 1-12
  return getSeasonalPlantsFromDatabase(currentMonth);
};

// Convert PlantDatabase to SeasonalSuggestion format for compatibility
export const getSeasonalSuggestionsFromDatabase = (month: number) => {
  const seasonalPlants = getSeasonalPlantsFromDatabase(month);
  return seasonalPlants.map(plant => ({
    name: plant.name,
    category: plant.category,
    description: plant.identification[0] || '', // Use first identification point as description
    bestMonths: plant.bestMonths,
    habitat: plant.identification.find(id => id.toLowerCase().includes('soil') || id.toLowerCase().includes('woodland') || id.toLowerCase().includes('meadow') || id.toLowerCase().includes('coastal')) || 'Various habitats',
    identificationTips: plant.identification
  }));
};

export const getCurrentSeasonalSuggestionsFromDatabase = () => {
  const currentMonth = new Date().getMonth() + 1;
  return getSeasonalSuggestionsFromDatabase(currentMonth);
};

// Convert PlantDatabase to Plant format for compatibility
export const convertPlantDatabaseToPlant = (plantDb: PlantDatabase): Plant => {
  // Convert bestMonths to inSeason flags
  const monthKeys = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'] as const;
  const inSeason: any = {};
  monthKeys.forEach((month, index) => {
    inSeason[month] = plantDb.bestMonths.includes(index + 1);
  });

  // Map category from PlantDatabase to Plant
  const categoryMapping: { [key in PlantDatabase['category']]: Plant['category'] } = {
    'berries': 'berries',
    'leaves': 'leaves', 
    'nuts': 'nuts',
    'mushrooms': 'mushrooms',
    'flowers': 'flowers',
    'roots': 'roots'
  };

  // Derive season from bestMonths
  const seasons: string[] = [];
  if (plantDb.bestMonths.some(m => [3, 4, 5].includes(m))) seasons.push('Spring');
  if (plantDb.bestMonths.some(m => [6, 7, 8].includes(m))) seasons.push('Summer');
  if (plantDb.bestMonths.some(m => [9, 10, 11].includes(m))) seasons.push('Early Fall');
  if (plantDb.bestMonths.some(m => [12, 1, 2].includes(m))) seasons.push('Winter');

  return {
    id: plantDb.id,
    name: plantDb.name,
    latinName: plantDb.latinName,
    family: 'Unknown', // PlantDatabase doesn't have family, use default
    category: categoryMapping[plantDb.category],
    heroImage: plantDb.heroImage,
    images: [plantDb.heroImage],
    identification: {
      keyFeatures: plantDb.identification,
      habitat: [plantDb.identification.find(id => 
        id.toLowerCase().includes('soil') || 
        id.toLowerCase().includes('woodland') || 
        id.toLowerCase().includes('meadow') || 
        id.toLowerCase().includes('coastal') ||
        id.toLowerCase().includes('hedge') ||
        id.toLowerCase().includes('waste')
      ) || 'Various habitats'],
      season: seasons,
      lookAlikes: [], // PlantDatabase doesn't have this field
      size: 'Unknown' // PlantDatabase doesn't have this field
    },
    edibility: plantDb.edibility,
    uses: {
      culinary: plantDb.uses.culinary,
      medicinal: plantDb.uses.medicinal,
      traditional: [], // PlantDatabase doesn't have this field
      recipes: plantDb.uses.recipes
    },
    ethics: plantDb.ethics,
    funFacts: '', // PlantDatabase doesn't have this field
    conservationStatus: 'common' as Plant['conservationStatus'],
    inSeason
  };
};

// Convert all PLANTS to Plant format
export const getPlantsFromDatabase = (): Plant[] => {
  return PLANTS.map(convertPlantDatabaseToPlant);
};