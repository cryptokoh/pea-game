/**
 * Effects & Wellness — Topic sections.
 * Content extracted from classroom/effects.html
 */

export default [
    {
        id: 'effects-how-botanicals-reach-the-brain',
        title: 'How Botanicals Reach the Brain',
        body: '<p>Botanical compounds must first cross the blood-brain barrier (BBB) to produce neurological effects. Alkaloids -- the primary active compounds in many botanicals -- are often small, lipophilic molecules that can pass through the BBB with relative ease. Once inside the central nervous system, these compounds interact with specific neurotransmitter receptors, modulating the release, uptake, and binding of chemical messengers like serotonin, dopamine, GABA, and endogenous opioid peptides.</p><p><strong>Pathway:</strong> Ingestion \u2192 GI Absorption \u2192 Liver Metabolism \u2192 Blood-Brain Barrier \u2192 Receptor Binding \u2192 Neurological Effect</p>',
        xpReward: 10,
        quickFacts: [
            { q: 'What must botanical compounds cross to produce neurological effects?', a: 'The blood-brain barrier (BBB)' },
            { q: 'True or false: Alkaloids are typically large, hydrophilic molecules', a: 'False', type: 'tf' },
            { q: 'Name two neurotransmitters modulated by botanical alkaloids in the CNS.', a: 'Serotonin, dopamine, GABA, or opioid peptides (any two)' },
            { q: 'Fill in the blank: ___ are the primary active compounds in many botanicals.', a: 'Alkaloids', type: 'fill' }
        ]
    },
    {
        id: 'effects-serotonin-system',
        title: 'Serotonin (5-HT) System',
        body: '<p>Serotonin regulates mood, sleep, appetite, and cognition. Several botanical compounds interact with 5-HT receptors, particularly 5-HT2A and 5-HT1A subtypes. Kanna alkaloids show partial agonist activity at serotonin receptors, while kava\'s kavalactones may influence serotonin reuptake. Blue lotus (Nymphaea caerulea) contains compounds with serotonergic affinity, contributing to its traditional use for relaxation.</p><p><strong>Key Compounds:</strong> Mesembrine, Kavain, Nuciferine, Aporphine</p><p><strong>Safety:</strong> Combining serotonergic botanicals with SSRIs or MAOIs may increase the risk of serotonin syndrome. Consult your healthcare provider before combining.</p>',
        xpReward: 10,
        quickFacts: [
            { q: 'Which two 5-HT receptor subtypes do botanical compounds primarily interact with?', a: '5-HT2A and 5-HT1A' },
            { q: 'What risk arises from combining serotonergic botanicals with SSRIs?', a: 'Serotonin syndrome' },
            { q: 'True or false: Blue lotus has serotonergic affinity.', a: 'True', type: 'tf' },
            { q: 'What does serotonin regulate?', a: 'Mood, sleep, appetite, and cognition' }
        ]
    },
    {
        id: 'effects-dopamine-system',
        title: 'Dopamine (DA) System',
        body: '<p>Dopamine pathways govern motivation, reward, movement, and executive function. Certain kanna alkaloids show affinity for dopamine pathways, which may contribute to the reported mood-elevating and empathogenic effects. Blue lotus contains apomorphine, a potent dopamine agonist historically noted for its psychoactive properties. The dopaminergic effects of these botanicals are dose-dependent and vary significantly between individuals.</p><p><strong>Key Compounds:</strong> Apomorphine, Mesembrine, Mesembrenone</p>',
        xpReward: 10,
        quickFacts: [
            { q: 'What potent dopamine agonist is found in blue lotus?', a: 'Apomorphine' },
            { q: 'What four functions do dopamine pathways govern?', a: 'Motivation, reward, movement, and executive function' },
            { q: 'True or false: Dopaminergic effects of botanicals are the same for all individuals.', a: 'False', type: 'tf' }
        ]
    },
    {
        id: 'effects-opioid-receptor-system',
        title: 'Opioid Receptor System',
        body: '<p>The endogenous opioid system includes mu, delta, and kappa receptors involved in pain modulation, stress response, and mood regulation. Kanna\'s primary alkaloid mesembrine acts as a serotonin reuptake inhibitor, producing mood-enhancing effects distinct from pharmaceutical SSRIs. Notably, mesembrine also acts at phosphodiesterase-4 (PDE4) pathways, which researchers believe may explain its unique cognitive and anxiolytic effects.</p><p><strong>Key Compounds:</strong> Mesembrine, Mesembrenone, Paynantheine, Speciogynine</p><p><strong>Safety:</strong> Opioid receptor activity means potential for tolerance and dependence with prolonged, high-dose use. Always follow "start low, go slow" principles.</p>',
        xpReward: 10,
        quickFacts: [
            { q: 'What are the three types of opioid receptors?', a: 'Mu, delta, and kappa' },
            { q: 'Fill in the blank: Mesembrine also acts at ___ pathways, explaining its cognitive effects.', a: 'PDE4', type: 'fill' },
            { q: 'What is the recommended dosing principle for opioid-active botanicals?', a: 'Start low, go slow' }
        ]
    },
    {
        id: 'effects-gaba',
        title: 'GABA (Gamma-Aminobutyric Acid)',
        body: '<p>GABA is the brain\'s primary inhibitory neurotransmitter, responsible for reducing neuronal excitability and promoting calm. Kava\'s kavalactones are among the best-studied botanical GABA modulators, enhancing GABA-A receptor binding and producing anxiolytic effects without the cognitive impairment associated with benzodiazepines. This mechanism underlies kava\'s long history of ceremonial use for promoting relaxation and sociability in Pacific Island cultures.</p><p><strong>Key Compounds:</strong> Kavain, Dihydrokavain, Methysticin, Yangonin, Desmethoxyyangonin</p><p><strong>Safety:</strong> Avoid combining GABA-enhancing botanicals with alcohol, benzodiazepines, or other CNS depressants. This can potentiate sedative effects and impair motor function.</p>',
        xpReward: 10,
        quickFacts: [
            { q: 'What is GABA\'s primary role in the brain?', a: 'Reducing neuronal excitability and promoting calm' },
            { q: 'True or false: Kavalactones cause cognitive impairment similar to benzodiazepines.', a: 'False', type: 'tf' },
            { q: 'Which culture has a long history of ceremonial kava use?', a: 'Pacific Island cultures' },
            { q: 'What should GABA-enhancing botanicals NOT be combined with?', a: 'Alcohol, benzodiazepines, or CNS depressants' }
        ]
    },
    {
        id: 'effects-botanical-influence-on-muscle-tissue',
        title: 'Botanical Influence on Muscle Tissue',
        body: '<p>Musculoskeletal effects of botanicals operate through multiple mechanisms: direct muscle relaxation via calcium channel modulation, anti-inflammatory action through COX and LOX enzyme inhibition, and central nervous system-mediated pain relief. The interplay between peripheral (local tissue) and central (brain-mediated) effects creates the complex experience of physical relief that many botanical users report.</p>',
        xpReward: 10,
        quickFacts: [
            { q: 'What three mechanisms do botanical musculoskeletal effects operate through?', a: 'Calcium channel modulation, COX/LOX inhibition, CNS pain relief' },
            { q: 'Fill in the blank: Direct muscle relaxation occurs via ___ channel modulation.', a: 'calcium', type: 'fill' },
            { q: 'What is the difference between peripheral and central effects?', a: 'Peripheral is local tissue; central is brain-mediated' }
        ]
    },
    {
        id: 'effects-muscle-relaxation',
        title: 'Muscle Relaxation',
        body: '<p>Kava\'s kavalactones are potent skeletal muscle relaxants that work through sodium channel blockade and calcium channel modulation at the neuromuscular junction. Unlike pharmaceutical muscle relaxants, kavalactones appear to reduce muscle tension without proportional sedation at moderate doses. Kanna alkaloids contribute to muscle relaxation indirectly through serotonergic central relaxation and reduced stress signaling.</p><p><strong>Key Compounds:</strong> Kavain, Dihydromethysticin, Rhynchophylline</p>',
        xpReward: 10,
        quickFacts: [
            { q: 'How do kavalactones achieve muscle relaxation?', a: 'Sodium channel blockade and calcium channel modulation' },
            { q: 'True or false: Kavalactones cause proportional sedation when relaxing muscles.', a: 'False', type: 'tf' },
            { q: 'How do kanna alkaloids contribute to muscle relaxation?', a: 'Indirectly through serotonergic central relaxation' }
        ]
    },
    {
        id: 'effects-pain-relief-pathways',
        title: 'Pain Relief Pathways',
        body: '<p>Botanical pain relief involves both peripheral and central mechanisms. Peripherally, anti-inflammatory compounds reduce prostaglandin production at the tissue level. Centrally, alkaloids modulate pain signal transmission in the spinal cord and brain. Kanna\'s serotonergic activity provides analgesia through descending pain inhibition pathways, while its adrenergic receptor activity may contribute an additional analgesic component similar to clonidine-type pain modulation.</p><p><strong>Key Compounds:</strong> Mesembrine, Mesembrenone, Corynantheidine</p>',
        xpReward: 10,
        quickFacts: [
            { q: 'What do peripheral anti-inflammatory compounds reduce at the tissue level?', a: 'Prostaglandin production' },
            { q: 'Through what pathway does kanna provide analgesia?', a: 'Descending pain inhibition pathways' },
            { q: 'Fill in the blank: Kanna\'s ___ receptor activity is similar to clonidine-type pain modulation.', a: 'adrenergic', type: 'fill' }
        ]
    },
    {
        id: 'effects-inflammation-response',
        title: 'Inflammation Response',
        body: '<p>Chronic inflammation drives many musculoskeletal conditions. Several botanical compounds inhibit the NF-kB signaling pathway, a master regulator of inflammatory gene expression. Mesembrine has demonstrated anti-inflammatory properties in preclinical studies by suppressing COX-2 and prostaglandin E2 production. Turmeric\'s curcuminoids and boswellia\'s boswellic acids are well-studied botanical anti-inflammatories that complement these effects through different mechanisms.</p><p><strong>Key Compounds:</strong> Mesembrine, Curcumin, Boswellic Acids, Kavalactones</p><p><strong>Safety:</strong> Anti-inflammatory botanicals may interact with blood thinners and NSAIDs. Monitor for increased bruising or bleeding, and inform your physician about all supplements you take.</p>',
        xpReward: 10,
        quickFacts: [
            { q: 'What signaling pathway is a master regulator of inflammatory gene expression?', a: 'The NF-kB signaling pathway' },
            { q: 'What does mesembrine suppress to achieve anti-inflammatory effects?', a: 'COX-2 and prostaglandin E2 production' },
            { q: 'True or false: Anti-inflammatory botanicals may interact with blood thinners.', a: 'True', type: 'tf' }
        ]
    },
    {
        id: 'effects-liver-metabolism',
        title: 'Liver Metabolism',
        body: '<p>The liver is the primary site of botanical compound metabolism via the cytochrome P450 enzyme system. Kanna alkaloids are primarily metabolized by CYP3A4 and CYP2D6 enzymes, meaning they can interact with many pharmaceutical medications that share these metabolic pathways. Kava has received scrutiny regarding hepatotoxicity, though research suggests that traditional aqueous preparations of noble kava varieties carry substantially lower risk than early non-traditional extracts that prompted initial concerns.</p><p><strong>Key Enzymes:</strong> CYP3A4, CYP2D6, CYP2C9, UGT Enzymes</p><p><strong>Safety:</strong> CYP450 interactions can alter medication blood levels. Always disclose botanical use to your prescribing physician, especially for medications with narrow therapeutic windows.</p>',
        xpReward: 10,
        quickFacts: [
            { q: 'What enzyme system is the primary metabolizer of botanical compounds in the liver?', a: 'The cytochrome P450 enzyme system' },
            { q: 'Which two CYP enzymes primarily metabolize kanna alkaloids?', a: 'CYP3A4 and CYP2D6' },
            { q: 'Fill in the blank: Traditional aqueous preparations of ___ kava varieties carry lower hepatotoxicity risk.', a: 'noble', type: 'fill' },
            { q: 'True or false: Kava has never raised hepatotoxicity concerns.', a: 'False', type: 'tf' }
        ]
    },
    {
        id: 'effects-kidney-function',
        title: 'Kidney Function',
        body: '<p>The kidneys handle excretion of botanical metabolites and play a role in maintaining fluid and electrolyte balance. Most alkaloid metabolites are excreted renally after hepatic conjugation. Adequate hydration is important when using botanicals, as many have mild diuretic or dehydrating effects. Currently, there is limited evidence of direct nephrotoxicity from responsible use of common botanical extracts, though case reports exist in the context of extreme overuse or adulterated products.</p><p><strong>Considerations:</strong> Hydration, Electrolytes, Renal Clearance</p>',
        xpReward: 10,
        quickFacts: [
            { q: 'How are most alkaloid metabolites excreted?', a: 'Renally after hepatic conjugation' },
            { q: 'Why is hydration important when using botanicals?', a: 'Many have mild diuretic or dehydrating effects' },
            { q: 'True or false: There is strong evidence of nephrotoxicity from responsible botanical use.', a: 'False', type: 'tf' }
        ]
    },
    {
        id: 'effects-digestive-system',
        title: 'Digestive System',
        body: '<p>The gastrointestinal tract is both the entry point for orally consumed botanicals and a target of their effects. Many alkaloids affect gut motility -- serotonin-active compounds like mesembrine can influence gut motility, while certain bitter botanicals stimulate digestive secretion. The gut microbiome also plays a role in botanical metabolism, and some plant compounds act as prebiotics supporting beneficial bacterial populations. First-pass metabolism in the gut wall and liver affects bioavailability significantly.</p><p><strong>Key Interactions:</strong> Gut Motility, Bile Production, Microbiome, First-Pass Effect</p><p><strong>Safety:</strong> GI effects vary by individual. Start with small amounts to assess tolerance. Those with IBS, Crohn\'s, or other digestive conditions should exercise extra caution.</p>',
        xpReward: 10,
        quickFacts: [
            { q: 'What role does the gut microbiome play in botanical use?', a: 'It helps metabolize botanical compounds' },
            { q: 'Fill in the blank: Some plant compounds act as ___ supporting beneficial bacteria.', a: 'prebiotics', type: 'fill' },
            { q: 'What significantly affects oral bioavailability of botanicals?', a: 'First-pass metabolism in the gut wall and liver' }
        ]
    },
    {
        id: 'effects-chronic-condition-landscape',
        title: 'The Chronic Condition Landscape',
        body: '<p>Chronic conditions are defined by their persistence -- lasting months or years and often involving complex interactions between inflammation, neurological sensitization, immune dysfunction, and psychological factors. Many people living with chronic conditions explore botanical options as part of a broader wellness strategy. Research into botanical compounds for chronic conditions is growing but still in relatively early stages, with most evidence coming from preclinical studies and observational surveys.</p>',
        xpReward: 10,
        quickFacts: [
            { q: 'What four factors interact in chronic conditions?', a: 'Inflammation, neurological sensitization, immune dysfunction, psychological factors' },
            { q: 'True or false: Most evidence for botanicals in chronic conditions comes from large clinical trials.', a: 'False', type: 'tf' },
            { q: 'What types of studies provide most current evidence on botanicals for chronic conditions?', a: 'Preclinical studies and observational surveys' }
        ]
    },
    {
        id: 'effects-chronic-pain-management',
        title: 'Chronic Pain Management',
        body: '<p>Chronic pain involves central sensitization -- where the nervous system amplifies pain signals over time. Kanna alkaloids target multiple mood pathways simultaneously: serotonin reuptake inhibition for mood elevation, PDE4 inhibition for cognitive enhancement, and anti-inflammatory pathways for stress reduction. This multi-target approach is an area of active research interest. Survey-based studies report that many chronic pain sufferers explore botanical approaches as part of their management strategy.</p><p><strong>Key Compounds:</strong> Mesembrine, Mesembrenone, Paynantheine</p>',
        xpReward: 10,
        quickFacts: [
            { q: 'What is central sensitization?', a: 'The nervous system amplifying pain signals over time' },
            { q: 'What three pathways do kanna alkaloids target simultaneously?', a: 'Serotonin reuptake, PDE4, and anti-inflammatory pathways' },
            { q: 'Fill in the blank: PDE4 inhibition by kanna contributes to ___ enhancement.', a: 'cognitive', type: 'fill' }
        ]
    },
    {
        id: 'effects-arthritis-joint-inflammation',
        title: 'Arthritis & Joint Inflammation',
        body: '<p>Both osteoarthritis and rheumatoid arthritis involve chronic inflammatory processes in joint tissue. Botanical anti-inflammatories target these pathways through various mechanisms: inhibiting pro-inflammatory cytokines (TNF-alpha, IL-6), reducing COX-2 expression, and modulating the NF-kB signaling cascade. Turmeric, boswellia, and certain kanna alkaloids have all shown anti-inflammatory potential in laboratory studies, though clinical trials specific to arthritis are limited for many of these compounds.</p><p><strong>Key Compounds:</strong> Curcumin, Boswellic Acids, Mesembrine, Cat\'s Claw Alkaloids</p>',
        xpReward: 10,
        quickFacts: [
            { q: 'Which two pro-inflammatory cytokines do botanical anti-inflammatories inhibit?', a: 'TNF-alpha and IL-6' },
            { q: 'True or false: Clinical trials for botanicals specific to arthritis are extensive and conclusive.', a: 'False', type: 'tf' },
            { q: 'Name three botanicals that show anti-inflammatory potential for arthritis.', a: 'Turmeric, boswellia, and kanna' }
        ]
    },
    {
        id: 'effects-fibromyalgia-central-sensitization',
        title: 'Fibromyalgia & Central Sensitization',
        body: '<p>Fibromyalgia involves widespread pain, fatigue, and cognitive difficulties linked to altered central pain processing. The condition often co-occurs with sleep disturbances and mood disorders. Botanicals that modulate multiple neurotransmitter systems -- pain signaling, serotonin, GABA -- are of particular research interest for this multi-faceted condition. Kava\'s muscle-relaxant and anxiolytic properties and kanna\'s mood-modulating and stress-relieving effects are both areas being explored by researchers.</p><p><strong>Relevant Pathways:</strong> Opioid Receptors, Serotonin (5-HT), GABA, Norepinephrine</p><p><strong>Safety:</strong> Chronic conditions require medical supervision. Botanicals should complement, not replace, your treatment plan. Always discuss any new supplements with your healthcare team.</p>',
        xpReward: 10,
        quickFacts: [
            { q: 'What three symptoms define fibromyalgia?', a: 'Widespread pain, fatigue, and cognitive difficulties' },
            { q: 'What conditions often co-occur with fibromyalgia?', a: 'Sleep disturbances and mood disorders' },
            { q: 'Fill in the blank: Botanicals should ___, not replace, your treatment plan.', a: 'complement', type: 'fill' }
        ]
    },
    {
        id: 'effects-anxiety-anxiolytic-effects',
        title: 'Anxiety & Anxiolytic Effects',
        body: '<p>Anxiety disorders involve dysregulation of GABA, serotonin, and norepinephrine systems. Kava is one of the most studied botanical anxiolytics, with multiple clinical trials demonstrating efficacy comparable to low-dose benzodiazepines for generalized anxiety. The mechanism involves GABA-A receptor modulation without the receptor downregulation that causes benzodiazepine tolerance. Additionally, kavain blocks voltage-gated sodium channels, which may contribute to its calming effects on overactive neural circuits.</p><p><strong>Key Compounds:</strong> Kavain, Dihydrokavain, Yangonin, L-Theanine</p>',
        xpReward: 10,
        quickFacts: [
            { q: 'What is kava\'s anxiolytic efficacy comparable to in clinical trials?', a: 'Low-dose benzodiazepines' },
            { q: 'True or false: Kava causes the same receptor downregulation as benzodiazepines.', a: 'False', type: 'tf' },
            { q: 'What does kavain block to contribute to its calming effects?', a: 'Voltage-gated sodium channels' },
            { q: 'Which three neurotransmitter systems are dysregulated in anxiety?', a: 'GABA, serotonin, and norepinephrine' }
        ]
    },
    {
        id: 'effects-depression-mood-regulation',
        title: 'Depression & Mood Regulation',
        body: '<p>Depression involves complex changes in serotonin, dopamine, norepinephrine, and neuroplasticity pathways. Some botanical compounds show antidepressant-like activity in preclinical models. Kanna\'s serotonergic and dopaminergic effects may underlie its self-reported mood-elevating properties, while adaptogenic herbs like ashwagandha and rhodiola help regulate the HPA axis stress response that is often dysregulated in depression. Research into botanical approaches to depression is ongoing and shows promising early results.</p><p><strong>Key Compounds:</strong> Mesembrine, Withanolides, Rosavins, Salidroside</p><p><strong>Safety:</strong> Depression is a serious medical condition. If you are experiencing suicidal thoughts, contact the 988 Suicide &amp; Crisis Lifeline immediately. Never discontinue prescribed antidepressants without medical supervision.</p>',
        xpReward: 10,
        quickFacts: [
            { q: 'Which adaptogenic herbs help regulate the HPA axis in depression?', a: 'Ashwagandha and rhodiola' },
            { q: 'What axis is often dysregulated in depression?', a: 'The HPA axis (hypothalamic-pituitary-adrenal)' },
            { q: 'True or false: You should discontinue antidepressants when starting botanicals.', a: 'False', type: 'tf' },
            { q: 'Fill in the blank: Kanna has both serotonergic and ___ effects on mood.', a: 'dopaminergic', type: 'fill' }
        ]
    },
    {
        id: 'effects-ptsd-trauma-response',
        title: 'PTSD & Trauma Response',
        body: '<p>Post-traumatic stress disorder involves altered fear processing, hyperarousal, and re-experiencing traumatic events. The amygdala, hippocampus, and prefrontal cortex are key brain regions affected. Some researchers are investigating whether botanicals that modulate the endogenous opioid system and GABA pathways could support emotional regulation in PTSD. Kava\'s anxiolytic effects without cognitive impairment make it of particular interest, as PTSD patients often need to maintain cognitive clarity while managing anxiety.</p><p><strong>Relevant Pathways:</strong> GABA System, Endocannabinoid, HPA Axis, Noradrenergic</p>',
        xpReward: 10,
        quickFacts: [
            { q: 'What three brain regions are affected in PTSD?', a: 'Amygdala, hippocampus, and prefrontal cortex' },
            { q: 'Why is kava of particular interest for PTSD?', a: 'It has anxiolytic effects without cognitive impairment' },
            { q: 'What three symptoms characterize PTSD?', a: 'Altered fear processing, hyperarousal, re-experiencing events' }
        ]
    },
    {
        id: 'effects-stress-hpa-axis',
        title: 'Stress & the HPA Axis',
        body: '<p>Chronic stress dysregulates the hypothalamic-pituitary-adrenal (HPA) axis, leading to elevated cortisol, immune suppression, and metabolic disruption. Adaptogenic botanicals -- including ashwagandha, rhodiola, and holy basil -- are defined by their ability to normalize HPA axis function and improve stress resilience. These compounds do not simply sedate; they help the body maintain homeostasis under stress, supporting both physical and psychological adaptation to stressors.</p><p><strong>Key Compounds:</strong> Withanolides, Rosavins, Eugenol, Ocimumosides</p><p><strong>Safety:</strong> Adaptogens may interact with thyroid medications, immunosuppressants, and hormone therapies. Discuss with your healthcare provider, especially if you have autoimmune conditions.</p>',
        xpReward: 10,
        quickFacts: [
            { q: 'What does HPA stand for?', a: 'Hypothalamic-pituitary-adrenal' },
            { q: 'Fill in the blank: Adaptogens help the body maintain ___ under stress.', a: 'homeostasis', type: 'fill' },
            { q: 'Name three adaptogenic botanicals mentioned for stress.', a: 'Ashwagandha, rhodiola, and holy basil' },
            { q: 'True or false: Adaptogens work by simply sedating the user.', a: 'False', type: 'tf' }
        ]
    },
    {
        id: 'effects-immune-system-modulation',
        title: 'Immune System Modulation',
        body: '<p>The immune system is a complex network of cells, tissues, and signaling molecules. Several botanical compounds demonstrate immunomodulatory properties -- meaning they can help regulate (not just boost) immune function. Medicinal mushrooms like reishi, lion\'s mane, and turkey tail contain beta-glucans that activate innate immune cells including macrophages and natural killer cells. Echinacea increases phagocytic activity and cytokine production, while elderberry has shown antiviral properties in laboratory studies.</p><p><strong>Key Compounds:</strong> Beta-Glucans, Alkylamides, Anthocyanins, Triterpenoids</p>',
        xpReward: 10,
        quickFacts: [
            { q: 'What does immunomodulatory mean?', a: 'Helping regulate (not just boost) immune function' },
            { q: 'What compound in medicinal mushrooms activates innate immune cells?', a: 'Beta-glucans' },
            { q: 'True or false: Elderberry has shown antiviral properties in lab studies.', a: 'True', type: 'tf' },
            { q: 'Name two innate immune cells activated by beta-glucans.', a: 'Macrophages and natural killer cells' }
        ]
    },
    {
        id: 'effects-common-ailments-symptom-relief',
        title: 'Common Ailments & Symptom Relief',
        body: '<p>Traditional medicine systems worldwide have long used botanicals for symptom management of common illnesses. Ginger contains gingerols and shogaols with anti-nausea and anti-inflammatory properties. Peppermint\'s menthol provides symptomatic relief for congestion and headaches. Kanna\'s mood-elevating and anxiolytic properties have made it part of traditional South African folk medicine for centuries. These uses represent accumulated traditional knowledge, though rigorous clinical validation varies by compound.</p><p><strong>Key Compounds:</strong> Gingerols, Menthol, Eucalyptol, Quercetin</p>',
        xpReward: 10,
        quickFacts: [
            { q: 'What two compounds in ginger have anti-nausea properties?', a: 'Gingerols and shogaols' },
            { q: 'What does peppermint menthol provide relief for?', a: 'Congestion and headaches' },
            { q: 'Fill in the blank: Kanna has been part of traditional ___ folk medicine for centuries.', a: 'South African', type: 'fill' }
        ]
    },
    {
        id: 'effects-recovery-convalescence',
        title: 'Recovery & Convalescence',
        body: '<p>Recovery from illness involves tissue repair, immune system recalibration, and restoration of homeostasis. Adaptogenic botanicals support recovery by normalizing stress hormone levels and supporting cellular energy production. Antioxidant-rich botanicals help manage the oxidative stress that accompanies infection and inflammation. Traditional tonics and restorative formulations often combine multiple botanical categories -- adaptogens, immune modulators, and nutrient-rich herbs -- to support comprehensive recovery.</p><p><strong>Key Compounds:</strong> Withanolides, Polysaccharides, Flavonoids, Saponins</p><p><strong>Safety:</strong> Botanicals are not a substitute for medical treatment during illness. Seek professional medical care for infections, fevers, or worsening symptoms. Immune-modulating herbs may be contraindicated with autoimmune conditions.</p>',
        xpReward: 10,
        quickFacts: [
            { q: 'What three processes does recovery from illness involve?', a: 'Tissue repair, immune recalibration, homeostasis restoration' },
            { q: 'How do antioxidant-rich botanicals help during recovery?', a: 'They manage oxidative stress from infection and inflammation' },
            { q: 'True or false: Botanicals are a substitute for medical treatment during illness.', a: 'False', type: 'tf' }
        ]
    },
    {
        id: 'effects-role-of-nutrition-in-botanical-efficacy',
        title: 'The Role of Nutrition in Botanical Efficacy',
        body: '<p>How and when you consume botanical compounds matters as much as what you consume. Bioavailability -- the proportion of a compound that reaches systemic circulation -- is heavily influenced by food intake, pH levels, fat content of meals, and the presence of other compounds that may enhance or inhibit absorption. Understanding these nutritional interactions helps optimize the effects of botanical products while minimizing unwanted side effects.</p>',
        xpReward: 10,
        quickFacts: [
            { q: 'What is bioavailability?', a: 'The proportion of a compound that reaches systemic circulation' },
            { q: 'Name three factors that influence bioavailability.', a: 'Food intake, pH levels, and fat content of meals' },
            { q: 'Fill in the blank: ___ interactions help optimize botanical effects while minimizing side effects.', a: 'Nutritional', type: 'fill' }
        ]
    },
    {
        id: 'effects-bioavailability-absorption',
        title: 'Bioavailability & Absorption',
        body: '<p>Oral bioavailability of botanical alkaloids typically ranges from 20-40%, with significant first-pass metabolism in the gut wall and liver. Factors that increase bioavailability include consuming botanicals with dietary fats (lipophilic compounds absorb better), taking them on an empty stomach (faster gastric transit), and combining with black pepper extract (piperine inhibits hepatic and intestinal glucuronidation). The form of preparation -- tea, capsule, tincture, or extract -- also significantly affects absorption kinetics.</p><p><strong>Absorption Factors:</strong> Piperine, Lipid Solubility, Gastric pH, First-Pass Effect</p>',
        xpReward: 10,
        quickFacts: [
            { q: 'What is the typical oral bioavailability range for botanical alkaloids?', a: '20-40%' },
            { q: 'How does piperine from black pepper increase bioavailability?', a: 'It inhibits hepatic and intestinal glucuronidation' },
            { q: 'True or false: Taking botanicals on an empty stomach slows gastric transit.', a: 'False', type: 'tf' },
            { q: 'Why do lipophilic compounds absorb better with dietary fats?', a: 'Fats aid absorption of fat-soluble compounds' }
        ]
    },
    {
        id: 'effects-potentiators-synergistic-compounds',
        title: 'Potentiators & Synergistic Compounds',
        body: '<p>Certain natural compounds enhance the effects or duration of botanical actives. Piperine from black pepper is the most well-known bioavailability enhancer, increasing curcumin absorption by up to 2,000%. Citrus juice (particularly grapefruit) inhibits CYP3A4 enzymes, slowing the metabolism of many alkaloids and effectively increasing their potency and duration. Magnesium acts as a natural NMDA receptor antagonist that may complement analgesic botanicals. Understanding potentiators is essential for responsible dosing.</p><p><strong>Common Potentiators:</strong> Piperine, Grapefruit Juice, Magnesium, Turmeric, Chamomile</p><p><strong>Safety:</strong> Potentiators increase the effective dose of botanicals. If using potentiators, reduce your botanical dose accordingly. Grapefruit also potentiates many prescription medications -- consult your pharmacist.</p>',
        xpReward: 10,
        quickFacts: [
            { q: 'By how much can piperine increase curcumin absorption?', a: 'Up to 2,000%' },
            { q: 'How does grapefruit juice potentiate alkaloids?', a: 'It inhibits CYP3A4 enzymes, slowing metabolism' },
            { q: 'Fill in the blank: Magnesium acts as a natural ___ receptor antagonist.', a: 'NMDA', type: 'fill' },
            { q: 'True or false: When using potentiators, you should increase your botanical dose.', a: 'False', type: 'tf' }
        ]
    },
    {
        id: 'effects-food-drug-interactions',
        title: 'Food & Drug Interactions',
        body: '<p>Botanical compounds can interact with both foods and medications in clinically meaningful ways. High-protein meals may compete with alkaloid absorption in the intestine. Dairy products can bind to certain plant compounds, reducing their bioavailability. Caffeine and other stimulants may counteract sedating botanicals or amplify stimulating ones. Alcohol potentiates the CNS depressant effects of kava and sedating botanical preparations, creating potentially dangerous synergies that should be strictly avoided.</p><p><strong>Key Interactions:</strong> CYP3A4 Inhibition, CYP2D6 Inhibition, Protein Binding, pH Sensitivity</p><p><strong>Safety:</strong> Never combine botanicals with alcohol. Maintain a comprehensive list of all botanicals, supplements, and medications you use, and share it with every healthcare provider you see.</p>',
        xpReward: 10,
        quickFacts: [
            { q: 'Why can high-protein meals affect botanical absorption?', a: 'Proteins compete with alkaloid absorption in the intestine' },
            { q: 'What do dairy products do to certain plant compounds?', a: 'Bind to them, reducing bioavailability' },
            { q: 'True or false: It is safe to combine kava with alcohol.', a: 'False', type: 'tf' },
            { q: 'What should you share with every healthcare provider?', a: 'A list of all botanicals, supplements, and medications' }
        ]
    }
];
