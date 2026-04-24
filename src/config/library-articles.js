/**
 * Ancient Wisdom Library — Knowledge articles for the learning hub.
 * Each article teaches reps about plants, products, science, or sales technique.
 * Reading articles awards XP.
 */

export const LIBRARY_CATEGORIES = [
    { id: 'all', label: 'All' },
    { id: 'plants', label: 'Plants' },
    { id: 'science', label: 'Science' },
    { id: 'healing', label: 'Healing' },
    { id: 'sales', label: 'Sales' },
    { id: 'products', label: 'Products' }
];

export const LIBRARY_ARTICLES = [
    // ── PLANTS ──
    {
        id: 'blue-lotus-history',
        category: 'plants',
        title: 'Blue Lotus: Sacred Flower of the Nile',
        excerpt: 'Nymphaea caerulea was revered in ancient Egypt for its psychoactive and spiritual properties.',
        xpReward: 15,
        readTime: '3 min',
        body: `
            <h3>A 3,000-Year Legacy</h3>
            <p>Blue Lotus (<strong>Nymphaea caerulea</strong>) isn't a true lotus — it's a water lily native to East Africa and the Nile Delta. Ancient Egyptians considered it sacred, depicting it in tomb paintings, temple reliefs, and the Book of the Dead.</p>
            <p>The flower was associated with the sun god Ra because it opens at dawn and closes at dusk, floating on still water. Priests used it in ceremonies for its mild euphoric and meditative effects.</p>

            <h3>Active Compounds</h3>
            <p>Two primary alkaloids drive Blue Lotus effects:</p>
            <p><strong>Apomorphine</strong> — a dopamine receptor agonist that produces feelings of calm euphoria. Unlike synthetic apomorphine used in medicine, the plant-derived form is gentle and non-addictive.</p>
            <p><strong>Nuciferine</strong> — acts on serotonin and dopamine receptors, contributing to relaxation and mild sedation. It's also being studied for potential anti-inflammatory properties.</p>

            <h3>Traditional Preparations</h3>
            <p>Egyptians soaked the petals in wine for hours, creating an infused drink for ceremonies. Today, common preparations include teas, tinctures, resin extracts, and gummies — each offering different onset times and durations.</p>
        `
    },
    {
        id: 'kanna-origins',
        category: 'plants',
        title: 'Kanna: South Africa\'s Mood Medicine',
        excerpt: 'The San and Khoikhoi peoples used Sceletium tortuosum for centuries as a natural mood enhancer.',
        xpReward: 15,
        readTime: '3 min',
        body: `
            <h3>Indigenous Heritage</h3>
            <p><strong>Sceletium tortuosum</strong>, known as Kanna (or Channa), has been used by the San and Khoikhoi peoples of South Africa for over 300 years. Dutch colonists first documented it in 1662, noting that the indigenous peoples chewed the fermented plant to relieve stress and elevate mood.</p>

            <h3>Traditional Fermentation</h3>
            <p>The traditional preparation involves crushing the plant material, sealing it in animal skins or containers, and allowing it to ferment for several days. This fermentation process is crucial — it converts the raw alkaloids into more bioavailable forms, particularly increasing mesembrine concentration.</p>

            <h3>Active Alkaloid: Mesembrine</h3>
            <p><strong>Mesembrine</strong> is a natural serotonin reuptake inhibitor (SRI). Unlike pharmaceutical SSRIs, mesembrine works rapidly — effects can be felt within 30-60 minutes. It selectively inhibits serotonin reuptake, producing mood elevation, reduced anxiety, and enhanced cognitive clarity without the side effects common to prescription medications.</p>

            <h3>Modern Research</h3>
            <p>Published studies show Kanna reduces amygdala reactivity to threat — essentially calming the brain's fear response. It's being investigated as a natural alternative for stress, mild anxiety, and cognitive enhancement.</p>
        `
    },
    {
        id: 'kava-pacific',
        category: 'plants',
        title: 'Kava: The Pacific\'s Ceremonial Root',
        excerpt: 'Piper methysticum has been the center of Pacific Island ceremony and social bonding for 3,000 years.',
        xpReward: 15,
        readTime: '3 min',
        body: `
            <h3>Pacific Island Tradition</h3>
            <p><strong>Piper methysticum</strong> (intoxicating pepper) has been cultivated in the Pacific Islands for over 3,000 years. From Fiji to Vanuatu, Hawaii to Tonga, kava ceremonies mark everything from peace treaties to daily social gatherings.</p>

            <h3>The Six Kavalactones</h3>
            <p>Kava's effects come from six primary kavalactones: <strong>kavain, dihydrokavain, methysticin, dihydromethysticin, yangonin, and desmethoxyyangonin</strong>. Each contributes different properties — kavain for relaxation, yangonin for mild euphoria, methysticin for muscle relaxation.</p>
            <p>The ratio of these kavalactones varies by cultivar and determines whether a kava is "heady" (cerebral, uplifting) or "heavy" (body-focused, sedating).</p>

            <h3>GABA Receptor Activity</h3>
            <p>Kavalactones primarily work through <strong>GABA-A receptor</strong> modulation — the same system targeted by anti-anxiety medications, but without the addictive potential. This produces feelings of calm, sociability, and muscle relaxation.</p>

            <h3>CO2 Extraction Advantage</h3>
            <p>Traditional water extraction can miss lipophilic kavalactones. CO2 extraction captures the full spectrum of compounds without solvents, heavy metals, or degradation — producing a cleaner, more potent extract.</p>
        `
    },
    {
        id: 'dragon-fruit-guide',
        category: 'plants',
        title: 'Purple Dragon Fruit: Growing Guide',
        excerpt: 'Hylocereus guatemalensis thrives in Central Texas with proper care and stunning purple flesh.',
        xpReward: 10,
        readTime: '2 min',
        body: `
            <h3>Why Dragon Fruit?</h3>
            <p>Purple Dragon Fruit (<strong>Hylocereus guatemalensis</strong>) produces stunning magenta-fleshed fruit packed with antioxidants, betalains, and vitamin C. The plants are drought-tolerant cactus that thrive in Central Texas heat.</p>

            <h3>Growing Conditions</h3>
            <p><strong>Sun:</strong> Full sun to partial shade. In extreme Texas heat, afternoon shade prevents sunburn.</p>
            <p><strong>Soil:</strong> Well-draining sandy or cactus mix. pH 6.0-7.0. Never waterlogged.</p>
            <p><strong>Water:</strong> Drought-tolerant once established. Water deeply but infrequently — like a cactus, not a tropical.</p>
            <p><strong>Support:</strong> These are climbing cactus. Provide a sturdy trellis or post.</p>

            <h3>Fruiting Timeline</h3>
            <p>From a 12-16" rooted cutting, expect first fruit within 1-2 years. Mature plants produce 20-60 lbs of fruit per season. Night-blooming flowers require hand pollination for best yields.</p>
        `
    },

    // ── SCIENCE ──
    {
        id: 'alkaloids-101',
        category: 'science',
        title: 'Alkaloids 101: Nature\'s Chemistry',
        excerpt: 'Understanding how plant alkaloids interact with human neurotransmitter systems.',
        xpReward: 20,
        readTime: '4 min',
        body: `
            <h3>What Are Alkaloids?</h3>
            <p>Alkaloids are nitrogen-containing organic compounds produced by plants as defense mechanisms. Over 20,000 known alkaloids exist in nature. Many interact powerfully with human neurotransmitter systems because their molecular structures mimic natural signaling molecules.</p>

            <h3>Neurotransmitter Interaction</h3>
            <p>Plant alkaloids can affect the brain through several mechanisms:</p>
            <p><strong>Receptor Agonism</strong> — Mimicking natural neurotransmitters. Apomorphine (Blue Lotus) mimics dopamine at D1/D2 receptors.</p>
            <p><strong>Reuptake Inhibition</strong> — Blocking the recycling of neurotransmitters, increasing their availability. Mesembrine (Kanna) blocks serotonin reuptake.</p>
            <p><strong>Receptor Modulation</strong> — Altering receptor sensitivity. Kavalactones (Kava) enhance GABA-A receptor function.</p>

            <h3>Why This Matters for Sales</h3>
            <p>Educated customers and shop owners want to understand <em>how</em> products work, not just <em>that</em> they work. Being able to explain alkaloid mechanisms in plain language builds credibility and trust. This is your competitive advantage over generic supplement brands.</p>
        `
    },
    {
        id: 'extraction-methods',
        category: 'science',
        title: 'Extraction Methods Compared',
        excerpt: 'Water, ethanol, and CO2 extraction — why the method matters for product quality.',
        xpReward: 20,
        readTime: '4 min',
        body: `
            <h3>Why Extraction Matters</h3>
            <p>The extraction method determines which compounds make it into the final product, at what concentration, and with what purity. Different methods suit different plants and target compounds.</p>

            <h3>Water Extraction</h3>
            <p><strong>Traditional method.</strong> Works for water-soluble compounds. Simple and clean, but misses lipophilic (fat-soluble) compounds. Used for teas and basic preparations.</p>
            <p><em>Best for:</em> Quick teas, mild preparations</p>

            <h3>Ethanol Extraction</h3>
            <p><strong>Versatile solvent.</strong> Captures both water-soluble and many fat-soluble compounds. Our tinctures use food-grade ethanol to preserve a broad spectrum of alkaloids. The 5000mg Blue Lotus tincture uses this method to capture both apomorphine and nuciferine.</p>
            <p><em>Best for:</em> Tinctures, full-spectrum extracts</p>

            <h3>Supercritical CO2 Extraction</h3>
            <p><strong>Gold standard.</strong> Uses carbon dioxide under high pressure and temperature to extract compounds. No solvent residue, no heavy metals, precise targeting. Our Kava CO2 extract captures all six kavalactones at therapeutic concentrations.</p>
            <p><em>Best for:</em> High-potency extracts, clean-label products</p>

            <h3>Resin Extraction</h3>
            <p><strong>Concentrated paste.</strong> Slow reduction of plant material into concentrated resin. Preserves the full alkaloid profile in a dense, potent format. Our Blue Lotus resin is produced this way.</p>
            <p><em>Best for:</em> Experienced users, maximum potency</p>
        `
    },
    {
        id: 'serotonin-system',
        category: 'science',
        title: 'The Serotonin System & Natural SRIs',
        excerpt: 'How Kanna\'s mesembrine differs from pharmaceutical SSRIs and why that matters.',
        xpReward: 20,
        readTime: '3 min',
        body: `
            <h3>Serotonin Basics</h3>
            <p>Serotonin (5-HT) is a neurotransmitter involved in mood regulation, sleep, appetite, and cognition. When neurons release serotonin, transporter proteins quickly recycle it. Blocking these transporters — reuptake inhibition — increases serotonin availability.</p>

            <h3>Pharmaceutical SSRIs vs. Natural SRIs</h3>
            <p>SSRIs (Selective Serotonin Reuptake Inhibitors) like fluoxetine take 4-6 weeks to reach full effect and can cause withdrawal symptoms. Kanna's <strong>mesembrine</strong> is a natural serotonin reuptake inhibitor with key differences:</p>
            <p><strong>Rapid onset</strong> — effects within 30-60 minutes vs. weeks</p>
            <p><strong>Self-limiting</strong> — the body metabolizes it naturally within hours</p>
            <p><strong>Dual action</strong> — also inhibits PDE4 (phosphodiesterase-4), which has anti-inflammatory and cognitive-enhancing effects</p>

            <h3>The Sales Angle</h3>
            <p>Position Kanna as a <em>complement</em> to wellness routines, not a replacement for prescribed medications. Always recommend customers consult healthcare providers. The science-backed approach builds trust.</p>
        `
    },

    // ── HEALING ──
    {
        id: 'blue-lotus-wellness',
        category: 'healing',
        title: 'Blue Lotus for Modern Wellness',
        excerpt: 'Sleep support, meditation aid, and stress relief — practical applications for today.',
        xpReward: 15,
        readTime: '3 min',
        body: `
            <h3>Evening Wind-Down</h3>
            <p>Blue Lotus tea (dried petals steeped 15-20 minutes) produces mild euphoria and relaxation ideal for evening use. The combination of apomorphine's dopamine activity and nuciferine's serotonin effects creates a calm, content state without sedation.</p>

            <h3>Meditation Enhancement</h3>
            <p>Ancient Egyptians used Blue Lotus before spiritual practices. Modern practitioners report enhanced introspection, vivid visualization, and deeper meditation sessions. Low doses (0.5-1g dried flower or a few drops of tincture) are typical for this use.</p>

            <h3>Stress & Mood Support</h3>
            <p>Blue Lotus acts as a gentle anxiolytic — reducing anxiety without cognitive impairment. This makes it suitable for daytime use at lower doses. Many customers find it helps with social anxiety and creative activities.</p>

            <h3>Product Recommendations by Use Case</h3>
            <p><strong>Sleep:</strong> Dried flower tea or tincture (evening)</p>
            <p><strong>Meditation:</strong> Low-dose tincture or gummies</p>
            <p><strong>Stress relief:</strong> Gummies for consistent dosing throughout the day</p>
            <p><strong>Experienced users:</strong> Resin extract for concentrated effects</p>
        `
    },
    {
        id: 'kanna-daily-use',
        category: 'healing',
        title: 'Integrating Kanna Into Daily Wellness',
        excerpt: 'Morning mood support, focus enhancement, and social confidence with Kanna.',
        xpReward: 15,
        readTime: '3 min',
        body: `
            <h3>Morning Mood Boost</h3>
            <p>Unlike Blue Lotus (better for evening), Kanna shines as a daytime botanical. Mesembrine's serotonin reuptake inhibition provides mood elevation and motivation without drowsiness. Many users take it as part of their morning routine.</p>

            <h3>Focus & Cognitive Clarity</h3>
            <p>Kanna's PDE4 inhibition has nootropic effects — enhanced working memory, improved attention, and better cognitive flexibility. This makes it popular with professionals and students.</p>

            <h3>Social Settings</h3>
            <p>At social doses, Kanna reduces social anxiety while increasing empathy and talkativeness. This has made it popular in the "sober curious" movement as an alternative to alcohol at social events.</p>

            <h3>Dose Laddering</h3>
            <p><strong>Gentle start:</strong> 500mg gummies — consistent, measured dose for newcomers</p>
            <p><strong>Moderate:</strong> Dried fermented herb — traditional preparation, more flexibility</p>
            <p><strong>Advanced:</strong> High-potency CO2 extract — concentrated for experienced users</p>
        `
    },
    {
        id: 'kava-ceremony',
        category: 'healing',
        title: 'Kava Circles: Building Community',
        excerpt: 'How to facilitate a kava gathering and why it\'s perfect for wellness communities.',
        xpReward: 15,
        readTime: '3 min',
        body: `
            <h3>The Kava Circle Tradition</h3>
            <p>In Pacific Island culture, kava ceremonies bring communities together. Everyone sits in a circle, a leader prepares the kava, and each person drinks from a shared bowl (or individual cups) in turn. The experience promotes connection, conversation, and collective relaxation.</p>

            <h3>Modern Kava Circles</h3>
            <p>Kava bars and wellness communities are bringing this tradition to Western audiences. CO2 extract makes preparation simple — no grinding shells, no filtering. Mix with water, coconut milk, or a plant-based milk alternative.</p>

            <h3>Why Wellness Venues Love It</h3>
            <p>Kava circles are:<br>
            <strong>Alcohol-free</strong> — perfect for sober spaces and wellness communities<br>
            <strong>Social</strong> — promotes genuine connection without impairment<br>
            <strong>Repeatable</strong> — customers come back regularly for the communal experience<br>
            <strong>Differentiating</strong> — sets a venue apart from standard offerings</p>

            <h3>Pitch to Community Spaces</h3>
            <p>When pitching to places like Casa de Luz, emphasize the <em>experience</em> not just the product. Kava isn't inventory — it's programming. Offer to host or co-host the first circle to demonstrate the concept.</p>
        `
    },

    // ── SALES ──
    {
        id: 'pitch-framework',
        category: 'sales',
        title: 'The Nored Farms Pitch Framework',
        excerpt: 'A structured approach to pitching botanicals that builds trust and closes sales.',
        xpReward: 20,
        readTime: '4 min',
        body: `
            <h3>The S.E.E.D. Framework</h3>
            <p>Every effective pitch follows four phases:</p>

            <h3>S — Survey the Space</h3>
            <p>Before you speak, observe. What does the store already carry? What's their aesthetic? Who are their customers? A pitch to The Herb Bar (science-oriented herbalists) should sound completely different from a pitch to a smoke shop.</p>

            <h3>E — Educate with Science</h3>
            <p>Lead with knowledge, not prices. Share the specific alkaloids, mechanisms of action, and research behind each product. Store owners respect reps who know their products at a molecular level.</p>

            <h3>E — Experience Integration</h3>
            <p>Show how products fit into the store's existing identity. Don't just say "put it on a shelf." Explain how Blue Lotus tea could complement their meditation section, or how Kanna gummies fit their wellness counter.</p>

            <h3>D — Deal Structure</h3>
            <p>Only discuss pricing after you've built value. Offer a trial order with favorable terms. Suggest a "good-better-best" product ladder (dried herb → gummies → extract) so the store can test customer interest at different price points.</p>
        `
    },
    {
        id: 'objection-handling',
        category: 'sales',
        title: 'Handling Common Objections',
        excerpt: 'What to say when shop owners push back on botanicals.',
        xpReward: 20,
        readTime: '4 min',
        body: `
            <h3>"We already carry Blue Lotus"</h3>
            <p><strong>Response:</strong> "That's great — your customers already know the plant. Our tinctures and resin extracts offer a concentrated format they can't get from raw petals. It's about giving them options: dried flower for tea, tincture for sublingual, gummies for on-the-go. A product ladder increases your average ticket."</p>

            <h3>"I've never heard of Kanna"</h3>
            <p><strong>Response:</strong> "It's one of the fastest-growing botanicals in the US right now. Mesembrine — the active compound — is a natural serotonin reuptake inhibitor. It's being written up in wellness publications constantly. Getting ahead of this trend positions your store as cutting-edge."</p>

            <h3>"My customers won't pay that much"</h3>
            <p><strong>Response:</strong> "Our gummies start at $40 for a jar — comparable to a good CBD product. And our dried botanicals are $30 per ounce. The price point fits your existing supplement range. We also have wholesale pricing that gives you strong margins."</p>

            <h3>"Is this legal?"</h3>
            <p><strong>Response:</strong> "Absolutely. Blue Lotus, Kanna, and Kava are all legal to sell as botanical products in the US. They're not scheduled substances. We can provide documentation on legality and sourcing for your records."</p>

            <h3>"I need to research it more"</h3>
            <p><strong>Response:</strong> "Totally understand. Here's a sample and my card. I'll follow up next week. In the meantime, I'd recommend looking up mesembrine and apomorphine — the science is really compelling."</p>
        `
    },
    {
        id: 'territory-strategy',
        category: 'sales',
        title: 'Building Your Austin Territory',
        excerpt: 'Strategic approach to mapping and conquering your sales region.',
        xpReward: 15,
        readTime: '3 min',
        body: `
            <h3>Territory Mapping</h3>
            <p>Austin's botanical retail landscape breaks into zones:</p>
            <p><strong>South Austin:</strong> Wellness-focused, holistic communities. Casa de Luz, natural food co-ops, yoga studios.</p>
            <p><strong>East Austin:</strong> Trendy, independent shops. Smoke shops, alternative wellness stores.</p>
            <p><strong>Central/Campus:</strong> Student-adjacent, price-sensitive but high volume.</p>
            <p><strong>North Austin:</strong> Established health food stores, supplement shops.</p>

            <h3>Sequencing Your Approach</h3>
            <p>Start with stores where you have the strongest product-market fit. Herbal apothecaries and wellness centers understand botanicals — shorter education cycle, faster close. Use early wins to build references for harder targets.</p>

            <h3>Follow-Up Cadence</h3>
            <p><strong>Day 1:</strong> Initial visit with samples<br>
            <strong>Day 3:</strong> Follow-up text/email with product info sheet<br>
            <strong>Day 7:</strong> Check-in call — "Did you try the sample?"<br>
            <strong>Day 14:</strong> In-person revisit with ordering details</p>
        `
    },

    // ── PRODUCTS ──
    {
        id: 'product-lineup',
        category: 'products',
        title: 'Complete Product Lineup Guide',
        excerpt: 'Every Nored Farms product, organized by use case and customer type.',
        xpReward: 15,
        readTime: '4 min',
        body: `
            <h3>Tinctures — Precision Dosing</h3>
            <p><strong>5000mg Blue Lotus Tincture ($60)</strong> — Sublingual administration for fast onset. Full spectrum with both apomorphine and nuciferine preserved. 30-60 servings per bottle.</p>
            <p><strong>3000mg Kanna Tincture ($80)</strong> — High-concentration mesembrine in ethanol base. Sublingual for rapid absorption. Premium price point reflects high-potency extraction.</p>

            <h3>Gummies — Accessible Entry Point</h3>
            <p><strong>500mg Kanna Gummies ($40)</strong> — Pre-measured doses for consistent experience. Best seller for new customers. Low barrier to trial.</p>
            <p><strong>2500mg Blue Lotus Gummies ($40)</strong> — Convenient evening use. Popular with customers transitioning from CBD edibles.</p>

            <h3>Extracts — For the Connoisseur</h3>
            <p><strong>1g Blue Lotus Resin Extract ($30)</strong> — Concentrated paste. Small amount goes far. Experienced users only.</p>
            <p><strong>1g High Potency Kanna Extract ($40)</strong> — CO2 extracted, maximum mesembrine concentration.</p>
            <p><strong>Kava Kava CO2 Extract ($30)</strong> — Full kavalactone profile. Clean label, no solvents.</p>

            <h3>Raw Botanicals — Traditional Use</h3>
            <p><strong>Dried Blue Lotus ($30/oz)</strong> — For tea preparation. Beautiful whole flowers.</p>
            <p><strong>Dried Kanna ($30/oz)</strong> — Fermented and ready for traditional preparation.</p>

            <h3>Live Plants & Seeds — The Grower Market</h3>
            <p>Dragon Fruit, Elderberry, Prickly Pear, Yucca plants. Plus seed varieties: Sugarcane, Hibiscus, Nicotiana Rustica. These appeal to the homesteading and gardening customer.</p>
        `
    },
    {
        id: 'wholesale-pricing',
        category: 'products',
        title: 'Wholesale Pricing & Terms',
        excerpt: 'Understanding the wholesale structure and how to present pricing to accounts.',
        xpReward: 15,
        readTime: '2 min',
        body: `
            <h3>Standard Wholesale Terms</h3>
            <p><strong>Minimum Order:</strong> $200 first order, $100 reorders</p>
            <p><strong>Payment Terms:</strong> Net-30 for established accounts, prepay for first order</p>
            <p><strong>Wholesale Discount:</strong> 40% off retail for standard orders</p>
            <p><strong>Volume Discount:</strong> 50% off retail for orders over $500</p>

            <h3>Margin Analysis</h3>
            <p>At 40% wholesale discount, stores achieve a <strong>67% markup</strong> at full retail. Even with a 20% store discount to customers, margins remain above 30% — comparable to premium CBD products.</p>

            <h3>Trial Order Strategy</h3>
            <p>Recommend starting with a curated selection: 2x each of the best sellers (Blue Lotus Gummies, Kanna Gummies, Kava Extract). Total wholesale cost around $180. Low risk for the store, strong test of customer interest.</p>

            <h3>Reorder Indicators</h3>
            <p>If a store moves through the trial in 2-3 weeks, recommend a full-line order. If specific products outperform, help them optimize their mix. Always check in before they run out — don't let them go to zero stock.</p>
        `
    }
];

/**
 * Get articles by category
 */
export function getArticlesByCategory(category) {
    if (category === 'all') return LIBRARY_ARTICLES;
    return LIBRARY_ARTICLES.filter(a => a.category === category);
}

/**
 * Get article by id
 */
export function getArticleById(id) {
    return LIBRARY_ARTICLES.find(a => a.id === id);
}

/**
 * Search articles by query
 */
export function searchArticles(query) {
    const q = query.toLowerCase();
    return LIBRARY_ARTICLES.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
    );
}
