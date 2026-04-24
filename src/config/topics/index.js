/**
 * Topic Registry — Metadata for all 4 learning topics.
 * Each topic maps to a config file with section content.
 */

export const TOPICS = [
    {
        key: 'growing',
        title: 'Growing & Cultivation',
        icon: '\u{1F331}',
        description: 'Trees, cacti, herbs, and live plant cultivation techniques.',
        sectionCount: 22,
        color: '#6b8f71'
    },
    {
        key: 'extraction',
        title: 'Extraction Science',
        icon: '\u{1F9EA}',
        description: 'Solventless, water, ethanol, CO2, and advanced extraction methods.',
        sectionCount: 12,
        color: '#c4a265'
    },
    {
        key: 'effects',
        title: 'Effects & Wellness',
        icon: '\u{2728}',
        description: 'Alkaloids, neuroscience, traditional uses, and modern research.',
        sectionCount: 27,
        color: '#9b7ed8'
    },
    {
        key: 'infrastructure',
        title: 'Infrastructure & Business',
        icon: '\u{1F3D7}',
        description: 'Lab setup, compliance, supply chains, and business operations.',
        sectionCount: 9,
        color: '#d4956b'
    }
];

/**
 * Get a topic by key
 */
export function getTopicByKey(key) {
    return TOPICS.find(t => t.key === key);
}

/**
 * Lazy-load topic sections. Returns array of section objects.
 * @param {string} topicKey
 * @returns {Promise<Array>}
 */
export async function loadTopicSections(topicKey) {
    switch (topicKey) {
        case 'growing':
            return (await import('./growing.js')).default;
        case 'extraction':
            return (await import('./extraction.js')).default;
        case 'effects':
            return (await import('./effects.js')).default;
        case 'infrastructure':
            return (await import('./infrastructure.js')).default;
        default:
            return [];
    }
}
