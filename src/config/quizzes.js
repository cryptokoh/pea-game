/**
 * Product Knowledge Quizzes
 * Tied to quest locations — reps must pass to complete quests.
 */

export const QUIZZES = {
    'herb-bar': {
        title: 'Blue Lotus & Kanna Knowledge',
        description: 'Prove you know the science before pitching to The Herb Bar.',
        passingScore: 3, // out of 5
        questions: [
            {
                q: 'What are the two primary alkaloids in Blue Lotus (Nymphaea caerulea)?',
                options: [
                    'Apomorphine and Nuciferine',
                    'Mesembrine and Mesembrenone',
                    'Kavain and Yangonin',
                    'Theobromine and Caffeine'
                ],
                correct: 0,
                explanation: 'Blue Lotus contains apomorphine (a dopamine agonist) and nuciferine (which acts on serotonin receptors). These create the calm, euphoric effect.'
            },
            {
                q: 'Kanna (Sceletium tortuosum) works primarily as what type of compound?',
                options: [
                    'MAOI (Monoamine Oxidase Inhibitor)',
                    'SRI (Serotonin Reuptake Inhibitor)',
                    'GABA agonist',
                    'Acetylcholinesterase inhibitor'
                ],
                correct: 1,
                explanation: 'Kanna\'s key alkaloid mesembrine is a selective serotonin reuptake inhibitor — similar mechanism to SSRIs but from a natural botanical source.'
            },
            {
                q: 'What traditional preparation method converts mesembrenone to mesembrine in Kanna?',
                options: [
                    'Sun drying',
                    'Steam distillation',
                    'Fermentation',
                    'Cold pressing'
                ],
                correct: 2,
                explanation: 'The traditional Khoisan fermentation process converts mesembrenone into mesembrine, enhancing bioavailability and the mood-elevating effects.'
            },
            {
                q: 'In ancient Egypt, Blue Lotus was primarily used in what context?',
                options: [
                    'As a cooking spice',
                    'Religious ceremonies and wine infusions',
                    'Textile dyeing',
                    'Building material'
                ],
                correct: 1,
                explanation: 'Ancient Egyptians steeped Blue Lotus petals in wine for ceremonial use. It appears in art spanning 3,000 years of Egyptian history.'
            },
            {
                q: 'Which Nored Farms product format typically has the highest repeat-purchase rate?',
                options: [
                    'Dried botanicals',
                    'Live plants',
                    'Gummies',
                    'Seeds'
                ],
                correct: 2,
                explanation: 'The 2500mg Blue Lotus Gummies are the best-selling SKU with the highest reorder rate — customers typically come back within 2 weeks.'
            }
        ]
    },

    'la-lighthouse': {
        title: 'Kava & Holistic Wellness',
        description: 'Learn about kavalactones and holistic pitching for Casa de Luz.',
        passingScore: 3,
        questions: [
            {
                q: 'How many major kavalactones are found in Kava Kava?',
                options: [
                    'Three',
                    'Six',
                    'Ten',
                    'Two'
                ],
                correct: 1,
                explanation: 'Six major kavalactones: kavain, dihydrokavain, yangonin, desmethoxyyangonin, methysticin, and dihydromethysticin. They work together synergistically.'
            },
            {
                q: 'Kavalactones primarily interact with which receptor system for their calming effects?',
                options: [
                    'Dopamine receptors',
                    'Opioid receptors',
                    'GABA receptors',
                    'Histamine receptors'
                ],
                correct: 2,
                explanation: 'Kavalactones bind to GABA-A receptors, producing anxiolytic (anti-anxiety) and muscle-relaxing effects without cognitive impairment at normal doses.'
            },
            {
                q: 'What extraction method does Nored Farms use for Kava Kava extract?',
                options: [
                    'Alcohol extraction',
                    'Cold water extraction',
                    'CO2 extraction',
                    'Steam distillation'
                ],
                correct: 2,
                explanation: 'CO2 extraction produces a clean, solvent-free extract with no heavy metal concerns — an important selling point for health-conscious wellness communities.'
            },
            {
                q: 'When pitching to a holistic wellness community like Casa de Luz, what should you lead with?',
                options: [
                    'Profit margins and wholesale pricing',
                    'Organic sourcing and healing traditions',
                    'Chemical compound structures',
                    'Competitor comparisons'
                ],
                correct: 1,
                explanation: 'Holistic communities value plant medicine traditions, organic sourcing, and community benefit. Lead with the story and healing intent, not hard numbers.'
            },
            {
                q: 'Which Nored Farms product category best fits a vegan community center like Casa de Luz?',
                options: [
                    'Live Plants only',
                    'Dried botanicals and teas',
                    'Seeds only',
                    'All products — everything is plant-based'
                ],
                correct: 3,
                explanation: 'Every Nored Farms product is plant-based by nature — tinctures, gummies, extracts, dried botanicals, live plants, and seeds. Perfect alignment with a vegan community.'
            }
        ]
    },
    'ace-of-cups': {
        title: 'Herbal Formulation & Wellness',
        description: 'Prove your formulation knowledge for Ace of Cups.',
        passingScore: 3,
        questions: [
            {
                q: 'When pitching to a store that makes their own tinctures, how should you position Nored Farms products?',
                options: [
                    'As a replacement for their in-house line',
                    'As complementary products that fill gaps in their offerings',
                    'As cheaper alternatives to what they make',
                    'Ignore their products and focus only on yours'
                ],
                correct: 1,
                explanation: 'Position as complementary, not competing. Ace of Cups crafts their own remedies — you want to fill gaps, not replace what they already do well.'
            },
            {
                q: 'What makes CO2 extraction superior to alcohol-based extraction for Kanna?',
                options: [
                    'It produces a more colorful product',
                    'It preserves the full alkaloid spectrum without solvent residues',
                    'It\'s cheaper to produce',
                    'It increases the caffeine content'
                ],
                correct: 1,
                explanation: 'CO2 extraction produces a clean, full-spectrum extract with no solvent residues — important for wellness-focused shops like Ace of Cups.'
            },
            {
                q: 'What is the primary mood-elevating mechanism of Kanna\'s mesembrine?',
                options: [
                    'It blocks dopamine receptors',
                    'It acts as a natural serotonin reuptake inhibitor',
                    'It stimulates adrenaline production',
                    'It increases melatonin levels'
                ],
                correct: 1,
                explanation: 'Mesembrine inhibits serotonin reuptake — similar to pharmaceutical SSRIs but from a natural source. This is Kanna\'s primary mechanism for mood elevation.'
            },
            {
                q: 'What approach works best for educating store staff about new botanical products?',
                options: [
                    'Leave a brochure and hope they read it',
                    'Offer an in-store product education session with samples',
                    'Send a long email with clinical studies',
                    'Just put products on the shelf and let them sell themselves'
                ],
                correct: 1,
                explanation: 'In-person education sessions with samples create product champions. Staff who understand and have tried the products recommend them to customers.'
            },
            {
                q: 'Which product format works best as an entry-level purchase for wellness-curious customers?',
                options: [
                    'High-potency extracts',
                    'Raw dried botanicals',
                    'Gummies at a $40 price point',
                    'Live plants'
                ],
                correct: 2,
                explanation: 'Gummies are familiar, approachable, and at $40 they\'re an easy impulse buy. Perfect gateway product for customers new to botanicals.'
            }
        ]
    },

    'texas-medicinals': {
        title: 'Advanced Extraction & Quality Standards',
        description: 'Texas Medicinals demands expert-level knowledge. No room for error.',
        passingScore: 4,
        questions: [
            {
                q: 'What is the key advantage of supercritical CO2 extraction over ethanol extraction for botanical products?',
                options: [
                    'Higher yield at lower cost',
                    'Selective extraction without thermal degradation or solvent residues',
                    'Faster processing time',
                    'Better color preservation'
                ],
                correct: 1,
                explanation: 'Supercritical CO2 allows selective extraction at low temperatures, preserving heat-sensitive alkaloids without leaving solvent residues. This is critical for Kava and Kanna quality.'
            },
            {
                q: 'A veteran herbalist challenges your Kanna extract: "How do I know the mesembrine content is standardized?" What\'s the best response?',
                options: [
                    '"Trust us, it\'s high quality"',
                    '"We can provide Certificate of Analysis data showing alkaloid percentages per batch"',
                    '"Just try it and you\'ll see"',
                    '"It\'s the same as everyone else\'s"'
                ],
                correct: 1,
                explanation: 'COA data with batch-specific alkaloid analysis is the gold standard for quality verification. Veteran herbalists expect this level of transparency.'
            },
            {
                q: 'Why is the traditional Khoisan fermentation of Kanna botanically significant?',
                options: [
                    'It makes the plant taste better',
                    'It converts mesembrenone to mesembrine, increasing bioavailability and SRI activity',
                    'It removes all alkaloids for safety',
                    'It adds probiotics to the plant material'
                ],
                correct: 1,
                explanation: 'Fermentation enzymatically converts mesembrenone to the more potent mesembrine. This traditional technique directly enhances the therapeutic profile.'
            },
            {
                q: 'What are the potential herb-drug interactions a professional herbalist would want to know about Kanna?',
                options: [
                    'None — it\'s completely safe with everything',
                    'Avoid combining with SSRIs, MAOIs, and tramadol due to serotonin syndrome risk',
                    'Only interacts with alcohol',
                    'Only interacts with caffeine'
                ],
                correct: 1,
                explanation: 'As a natural SRI, Kanna can cause serotonin syndrome when combined with pharmaceutical serotonergic drugs. This is critical safety knowledge for any herbalist.'
            },
            {
                q: 'Blue Lotus (Nymphaea caerulea) apomorphine acts primarily on which receptor system?',
                options: [
                    'GABA-A receptors',
                    'Dopamine D1 and D2 receptors',
                    'Opioid receptors',
                    'Nicotinic acetylcholine receptors'
                ],
                correct: 1,
                explanation: 'Apomorphine is a non-selective dopamine agonist acting on D1 and D2 receptors. This is what produces the euphoric, relaxing effects of Blue Lotus.'
            }
        ]
    },

    'peoples-pharmacy': {
        title: 'Clinical & Compliance Knowledge',
        description: 'Peoples Rx needs clinical data and safety profiles.',
        passingScore: 3,
        questions: [
            {
                q: 'What regulatory category do most botanical supplement products fall under in the US?',
                options: [
                    'FDA-approved drugs',
                    'Dietary supplements under DSHEA (1994)',
                    'Over-the-counter medications',
                    'Cosmetics'
                ],
                correct: 1,
                explanation: 'Botanical products are regulated as dietary supplements under the Dietary Supplement Health and Education Act of 1994. This affects labeling and claims.'
            },
            {
                q: 'When a pharmacy buyer asks about shelf life, which Nored Farms format has the longest stability?',
                options: [
                    'Fresh gummies',
                    'Dried botanicals and seeds',
                    'Live plants',
                    'Tinctures with organic matter'
                ],
                correct: 1,
                explanation: 'Dried botanicals and seeds (especially the glass-vial sugarcane seeds with 10-20yr shelf life) have the longest stability. Important for inventory management.'
            },
            {
                q: 'How many major kavalactones work synergistically in Kava Kava?',
                options: [
                    'Two',
                    'Four',
                    'Six',
                    'Eight'
                ],
                correct: 2,
                explanation: 'Six major kavalactones: kavain, dihydrokavain, yangonin, desmethoxyyangonin, methysticin, and dihydromethysticin. Their synergistic action is called the entourage effect.'
            },
            {
                q: 'A pharmacist asks: "Is Kava safe for the liver?" What\'s the evidence-based response?',
                options: [
                    '"Yes, there\'s never been any concern"',
                    '"WHO review found liver risk was associated with acetone/ethanol extracts, not traditional water or CO2 extracts"',
                    '"We don\'t have data on that"',
                    '"Just don\'t take too much"'
                ],
                correct: 1,
                explanation: 'The WHO and multiple reviews linked hepatotoxicity to non-traditional extraction solvents. CO2 extraction (our method) avoids this risk. Knowing this distinction is crucial for pharmacy buyers.'
            },
            {
                q: 'What makes Nored Farms Blue Lotus Gummies the best-selling SKU for retail environments?',
                options: [
                    'Lowest price point in the catalog',
                    'Familiar format, strong reorder rate, checkout-counter friendly',
                    'Highest potency available',
                    'Only available from Nored Farms'
                ],
                correct: 1,
                explanation: 'Gummies combine a familiar format (easy for new customers), strong 2-week reorder rate, and small footprint ideal for checkout counters. Perfect high-velocity SKU.'
            }
        ]
    },

    'in-gredients': {
        title: 'Sustainability & Local Sourcing',
        description: 'in.gredients values sustainability above all else.',
        passingScore: 3,
        questions: [
            {
                q: 'When pitching to a zero-waste store, which product format shows the strongest sustainability story?',
                options: [
                    'Individually wrapped gummies',
                    'Bulk dried botanicals with refill options',
                    'Single-use sample packets',
                    'Products in non-recyclable packaging'
                ],
                correct: 1,
                explanation: 'Bulk dried botanicals with refill options align perfectly with zero-waste values. Offer customers the option to bring their own containers.'
            },
            {
                q: 'What makes Prickly Pear an especially good fit for a sustainability-focused Austin store?',
                options: [
                    'It\'s imported from South America',
                    'It\'s a native Texas plant requiring zero irrigation once established',
                    'It requires lots of fertilizer',
                    'It only grows indoors'
                ],
                correct: 1,
                explanation: 'Central Texas Prickly Pear is a native species that thrives without irrigation — the ultimate sustainable plant. Plus both pads and fruit are edible.'
            },
            {
                q: 'Blue Lotus (Nymphaea caerulea) is native to which region?',
                options: [
                    'South America',
                    'East Africa and the Nile River region',
                    'Southeast Asia',
                    'Central Europe'
                ],
                correct: 1,
                explanation: 'Blue Lotus is native to East Africa, particularly Egypt and the Nile region, where it has been used ceremonially for over 3,000 years.'
            },
            {
                q: 'How can Nored Farms demonstrate supply chain transparency?',
                options: [
                    'Just say "trust us"',
                    'Provide sourcing origin, extraction method, and batch testing data',
                    'Refuse to share sourcing information',
                    'Change the subject to pricing'
                ],
                correct: 1,
                explanation: 'Sustainability-focused buyers want full transparency: where ingredients come from, how they\'re extracted, and batch-level quality data.'
            },
            {
                q: 'Which Nored Farms seeds have a 10-20 year shelf life in glass vial packaging?',
                options: [
                    'Hibiscus Seeds',
                    'Nicotiana Rustica Seeds',
                    'Heirloom Sugarcane Seeds',
                    'All of the above'
                ],
                correct: 2,
                explanation: 'Heirloom Sugarcane Seeds come in glass vial packaging with 10-20 year shelf life. Zero-waste approved packaging with exceptional longevity.'
            }
        ]
    },

    'rabbit-food': {
        title: 'Plant-Based Wellness',
        description: 'Rabbit Food customers are plant-based enthusiasts.',
        passingScore: 3,
        questions: [
            {
                q: 'What makes every Nored Farms product a natural fit for a vegan grocery store?',
                options: [
                    'They\'re all certified organic',
                    'They\'re all 100% plant-based by nature',
                    'They\'re all FDA approved',
                    'They\'re all made in Austin'
                ],
                correct: 1,
                explanation: 'Every Nored Farms product — tinctures, gummies, extracts, dried botanicals, plants, and seeds — is inherently plant-based. Perfect alignment with vegan values.'
            },
            {
                q: 'For a downtown store with young, health-conscious customers, which product makes the best impulse buy?',
                options: [
                    'Nicotiana Rustica Seeds at $40',
                    'Kanna Gummies at $40 with eye-catching packaging',
                    'Dried Kanna at $30 for experienced herbalists',
                    'Davis Mountain Yucca plant at $25'
                ],
                correct: 1,
                explanation: 'Kanna Gummies are the perfect impulse buy: familiar format, attractive packaging, accessible price point, and mood-boosting effects that appeal to the wellness-curious.'
            },
            {
                q: 'Hibiscus sabdariffa (used for hibiscus tea) is particularly rich in what compounds?',
                options: [
                    'Caffeine and theobromine',
                    'Anthocyanins and vitamin C',
                    'Omega-3 fatty acids',
                    'Protein and iron'
                ],
                correct: 1,
                explanation: 'Hibiscus calyces are loaded with anthocyanins (antioxidant pigments giving the deep red color) and vitamin C. Studies show blood pressure benefits from regular consumption.'
            },
            {
                q: 'How should you pitch Blue Lotus tea to a store with a smoothie/juice bar?',
                options: [
                    'Suggest they add it to their smoothies only',
                    'Offer samples as a standalone wellness tea and suggest it as a smoothie-bar add-on for relaxation blends',
                    'Tell them it\'s only for evening use',
                    'Focus on the ancient Egyptian history only'
                ],
                correct: 1,
                explanation: 'Multi-channel positioning: standalone tea AND smoothie-bar ingredient. Blue Lotus adds a unique relaxation angle to their existing wellness beverage menu.'
            },
            {
                q: 'Dragon Fruit (Hylocereus) is rich in which type of antioxidant pigment?',
                options: [
                    'Chlorophyll',
                    'Betalains',
                    'Carotenoids',
                    'Flavonoids'
                ],
                correct: 1,
                explanation: 'Dragon Fruit gets its vibrant color from betalains — powerful antioxidant pigments. The plant is also drought-tolerant, making it perfect for Central Texas growing.'
            }
        ]
    },

    'antonelli-cheese': {
        title: 'Artisan Positioning & Gourmet Strategy',
        description: 'Think beyond the herb shop. This is gourmet territory.',
        passingScore: 3,
        questions: [
            {
                q: 'What\'s the key to pitching botanical products in a gourmet food store?',
                options: [
                    'Focus on the health benefits and clinical data',
                    'Position them as artisan, story-driven products with culinary and cultural relevance',
                    'Offer the biggest discounts possible',
                    'Emphasize that they\'re herbal supplements'
                ],
                correct: 1,
                explanation: 'Gourmet stores sell stories and experiences, not supplements. Position Blue Lotus tea alongside cheese boards, Kanna as a unique conversation starter, and dried botanicals as culinary gifts.'
            },
            {
                q: 'Which Nored Farms product has the strongest "pairing" potential for a cheese shop context?',
                options: [
                    'Kanna Gummies',
                    'Dried Blue Lotus petals for tea pairing with soft cheeses',
                    'Nicotiana Rustica Seeds',
                    'High Potency Kanna Extract'
                ],
                correct: 1,
                explanation: 'Blue Lotus tea creates a unique pairing experience alongside artisan cheeses. The floral, subtly euphoric quality complements the contemplative experience of cheese tasting.'
            },
            {
                q: 'Nored Farms Heirloom Sugarcane Seeds in glass vials serve what role in a gourmet context?',
                options: [
                    'Cooking ingredient',
                    'Premium gift item with artisan appeal and 10-20yr shelf life',
                    'Sweetener alternative',
                    'Garden decoration'
                ],
                correct: 1,
                explanation: 'Glass vial packaging, heirloom provenance, and extreme shelf life make sugarcane seeds a premium gift item. Gourmet customers love unique, story-rich products.'
            },
            {
                q: 'When approaching a non-traditional retail channel (like a cheese shop), what\'s the most important first step?',
                options: [
                    'Demand immediate shelf space',
                    'Understand their customer and show how your products enhance their existing experience',
                    'Compare your prices to supplement stores',
                    'Focus on clinical studies and alkaloid profiles'
                ],
                correct: 1,
                explanation: 'In non-traditional channels, you must understand and enhance their existing experience. Show how botanicals complement what they already do — don\'t try to change their business.'
            },
            {
                q: 'Traditional Egyptian Blue Lotus preparation involved infusing petals in what?',
                options: [
                    'Milk',
                    'Wine',
                    'Honey',
                    'Olive oil'
                ],
                correct: 1,
                explanation: 'Ancient Egyptians steeped Blue Lotus petals in wine for ceremonial use. This culinary-adjacent history makes it a natural fit for gourmet contexts.'
            }
        ]
    },

    'south-congress-books': {
        title: 'Ethnobotany & Cultural Knowledge',
        description: 'Connect plants to their cultural and literary context.',
        passingScore: 3,
        questions: [
            {
                q: 'What field of study connects traditional plant use to cultural practices?',
                options: [
                    'Pharmacology',
                    'Ethnobotany',
                    'Horticulture',
                    'Biochemistry'
                ],
                correct: 1,
                explanation: 'Ethnobotany is the study of how people of particular cultures use indigenous plants. It bridges botany, anthropology, and traditional knowledge.'
            },
            {
                q: 'Kanna (Sceletium tortuosum) was traditionally used by which indigenous people?',
                options: [
                    'Australian Aboriginals',
                    'South African Khoisan (San people)',
                    'Amazonian tribes',
                    'Native Americans'
                ],
                correct: 1,
                explanation: 'The San (Khoisan) people of South Africa have used Kanna for hundreds of years for mood elevation, pain relief, and ceremonial purposes.'
            },
            {
                q: 'In a bookstore context, what makes seeds and dried botanicals effective products?',
                options: [
                    'They\'re the cheapest options',
                    'They function as unique gifts alongside ethnobotany and herb books',
                    'They have the highest margins',
                    'They require refrigeration'
                ],
                correct: 1,
                explanation: 'Seeds and dried botanicals are compact, shelf-stable, gift-worthy, and directly complement the store\'s ethnobotany and herbal medicine book sections.'
            },
            {
                q: 'Nicotiana Rustica (Hape/Rape) is used in traditional ceremonies from which region?',
                options: [
                    'European monasteries',
                    'Amazonian indigenous traditions',
                    'Chinese medicine',
                    'Mediterranean cooking'
                ],
                correct: 1,
                explanation: 'Nicotiana Rustica is central to Amazonian indigenous ceremonies, particularly in Rape/Hape traditions. It contains 8-10x the nicotine of commercial tobacco.'
            },
            {
                q: 'What makes the S.E.E.D. pitch framework effective for story-driven retailers?',
                options: [
                    'It focuses on price discounts',
                    'Story, Education, Experience, Deal — it leads with narrative before business',
                    'It skips directly to the sale',
                    'It only works for herb shops'
                ],
                correct: 1,
                explanation: 'S.E.E.D. (Story, Education, Experience, Deal) leads with narrative — perfect for retailers like bookstores who value story and cultural context over pure commerce.'
            }
        ]
    }
};

export function getQuizForLocation(locationId) {
    return QUIZZES[locationId] || null;
}
