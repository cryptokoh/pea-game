/**
 * Nored Farms Product Catalog
 * Matches main site product list — used for quest knowledge and wholesale.
 */

export const PRODUCTS = [
    { id: '5000mg-blue-lotus-tincture', name: '5000mg Blue Lotus Tincture', category: 'Tinctures', price: 60, plant: 'blue-lotus',
      science: 'Contains apomorphine and nuciferine — two alkaloids from Nymphaea caerulea. Apomorphine is a dopamine agonist; nuciferine acts on serotonin receptors.',
      pitch: 'Our highest-potency Blue Lotus extract. Customers love the calm euphoria — perfect for evening relaxation.' },

    { id: '3000mg-kanna-tincture', name: '3000mg Kanna Tincture', category: 'Tinctures', price: 80, plant: 'kanna',
      science: 'Kanna (Sceletium tortuosum) contains mesembrine, a selective serotonin reuptake inhibitor (SRI). Traditional South African botanical used for mood elevation.',
      pitch: 'Premium Kanna extract for mood support. Fast-acting sublingual delivery. High repeat-purchase rate.' },

    { id: '500mg-kanna-gummies', name: '500mg Kanna Gummies', category: 'Gummies', price: 40, plant: 'kanna',
      science: 'Mesembrine and mesembrenone in a convenient edible format. Gentle SRI action promotes calm focus.',
      pitch: 'Entry-level Kanna product — great impulse buy. Eye-catching packaging, 40% margin at wholesale.' },

    { id: '2500mg-blue-lotus-gummies', name: '2500mg Blue Lotus Gummies', category: 'Gummies', price: 40, plant: 'blue-lotus',
      science: 'Nuciferine-rich gummies from Nymphaea caerulea petals. Nuciferine has anxiolytic and mild sedative properties.',
      pitch: 'Best-selling SKU. Customers who try these come back within 2 weeks. Stock at checkout counter.' },

    { id: '1g-blue-lotus-resin-extract', name: '1g Blue Lotus Resin Extract', category: 'Extracts', price: 30, plant: 'blue-lotus',
      science: 'Concentrated resin extraction preserves the full alkaloid profile — apomorphine, nuciferine, and nuphar alkaloids.',
      pitch: 'Potent concentrate for experienced users. Small footprint, high value per shelf inch.' },

    { id: '1g-high-potency-kanna-extract', name: '1g High Potency Kanna Extract', category: 'Extracts', price: 40, plant: 'kanna',
      science: 'Standardized to high mesembrine content via CO2 extraction. Preserves the full spectrum of Sceletium alkaloids.',
      pitch: 'Our strongest Kanna product. Pairs well with the gummies for a good-better-best display.' },

    { id: 'high-potency-kava-kava-co2-extract', name: 'High Potency Kava Kava CO2 Extract', category: 'Extracts', price: 30, plant: 'kava',
      science: 'Contains six major kavalactones — kavain, dihydrokavain, yangonin, desmethoxyyangonin, methysticin, dihydromethysticin. These bind to GABA receptors for anxiolytic effects.',
      pitch: 'Kava is having a moment — kava bars are everywhere. CO2 extraction means no heavy metals, clean label.' },

    { id: 'dried-blue-lotus-1oz', name: 'Dried Blue Lotus (1 oz)', category: 'Dried Botanicals', price: 30, plant: 'blue-lotus',
      science: 'Whole dried Nymphaea caerulea petals. Traditionally steeped as tea or wine infusion since ancient Egypt.',
      pitch: 'The OG format. Tea drinkers and herbalists love it. Beautiful flower petals sell themselves on display.' },

    { id: 'dried-kanna-1oz', name: 'Dried Kanna (1 oz)', category: 'Dried Botanicals', price: 30, plant: 'kanna',
      science: 'Fermented Sceletium tortuosum — traditional Khoisan preparation that converts mesembrenone to mesembrine for enhanced bioavailability.',
      pitch: 'Traditional preparation method. Appeals to the herbalist and ethnobotany crowd.' },

    { id: 'purple-dragon-fruit', name: 'Purple Dragon Fruit, rooted 12-16"', category: 'Live Plants', price: 20, plant: 'dragon-fruit',
      science: 'Hylocereus species rich in betalains (antioxidant pigments), vitamin C, and prebiotic fiber. Drought-tolerant cactus.',
      pitch: 'Living plants bring people into the store. Dragon fruit is Instagram-worthy and Central Texas hardy.' },

    { id: 'bob-gordon-elderberry', name: 'Bob Gordon Elderberry, 12-16" tall', category: 'Live Plants', price: 20, plant: 'elderberry',
      science: 'Sambucus nigra cultivar. Elderberries contain anthocyanins and flavonoids studied for immune support.',
      pitch: 'Elderberry syrup is a $500M market. Sell the plant + the education. Great cross-sell with articles.' },

    { id: 'central-texas-prickly-pear', name: 'Central Texas Prickly Pear, 2 pads', category: 'Live Plants', price: 20, plant: 'prickly-pear',
      science: 'Opuntia species. Pads (nopales) are high in fiber, antioxidants, and betalains. Traditional food and medicine.',
      pitch: 'Native Texas plant — zero maintenance. The fruit and pads are both edible. Customers love the story.' },

    { id: 'davis-mountain-yucca', name: 'Davis Mountain Yucca (soapweed), 6" tall', category: 'Live Plants', price: 25, plant: 'yucca',
      science: 'Yucca elata roots contain steroidal saponins historically used as natural soap and anti-inflammatory.',
      pitch: 'Unique desert plant with real utility — roots make natural soap. Great conversation starter.' },

    { id: 'heirloom-sugarcane-seeds', name: 'Heirloom Sugarcane Seeds', category: 'Seeds', price: 20, plant: 'sugarcane',
      science: 'Saccharum officinarum. Raw sugarcane juice is rich in polyphenols and antioxidants absent in refined sugar.',
      pitch: 'Glass vial packaging with 10-20yr shelf life. Gift-worthy. Gardeners snap these up.' },

    { id: 'hibiscus-seeds', name: 'Hibiscus Seeds', category: 'Seeds', price: 20, plant: 'hibiscus',
      science: 'Hibiscus sabdariffa. Calyces are rich in anthocyanins and vitamin C. Studies show blood pressure benefits from hibiscus tea.',
      pitch: 'Hibiscus tea market is booming. Sell seeds to the grow-your-own crowd.' },

    { id: 'nicotiana-rustica-seeds', name: 'Nicotiana Rustica (Hape) Seeds', category: 'Seeds', price: 40, plant: 'tobacco',
      science: 'Nicotiana rustica — "sacred tobacco" used in traditional Amazonian Rape/Hape ceremonies. 8-10x nicotine content of commercial tobacco.',
      pitch: 'Niche but high-value. Ceremonial use market is growing. Premium price point reflects the rarity.' }
];

export const CATEGORIES = [...new Set(PRODUCTS.map(p => p.category))];

export function getProductsByPlant(plant) {
    return PRODUCTS.filter(p => p.plant === plant);
}

export function getProductById(id) {
    return PRODUCTS.find(p => p.id === id);
}
