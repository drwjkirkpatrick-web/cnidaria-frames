/**
 * jellyfish-image-generator.js — AI Image Generator for Cnidaria Frames
 *
 * Prompt builder with vector-animation nudges, variation logic,
 * and model selection. Saves generated images to localStorage + indexed variants.
 */

(function(global) {
    'use strict';

    // ─── Configuration ───
    const BASE_PROMPT =
        'A {modifier} jellyfish, {style}, {lighting}, dark ocean background (#000a1a), ' +
        'clean minimalist composition, centered, no text, no watermark, no border';

    const STYLE_NUDGES = {
        vector: 'vector illustration, flat geometric shapes, clean crisp edges, 2D flat design, SVG-like aesthetic, solid color blocks',
        animated: 'vector animation cel style, soft motion blur on tentacles, frame from an animated film, studio ghibli-inspired underwater, painterly flat colors',
        neon: 'vector neon glow style, electric bioluminescent edges, cyberpunk jellyfish, dark synthwave palette, sharp geometric tentacles with light trails',
        botanical: 'vintage botanical vector illustration, scientific diagram style, labeled aesthetic without text, cross-hatch shading, muted natural palette',
        crystal: 'geometric crystal vector art, faceted translucent bell, prismatic light refraction, stained glass flat colors, sharp angular segments',
        organic: 'organic flowing vector lines, hand-drawn feel but vector clean, ink-brush stroke edges converted to curves, delicate translucent bell'
    };

    const LIGHTING_NUDGES = {
        biolum: 'internal bioluminescent glow, self-illuminated from within, soft radial light emanating from bell',
        ambient: 'subtle ambient underwater caustic lighting, soft volumetric rays from above',
        neon_rim: 'strong rim lighting, silhouette with bright edge glow, high contrast against dark background',
        soft: 'soft diffused even lighting, gentle pastel tones, dreamy underwater atmosphere',
        dark: 'minimal lighting, mostly silhouette with faint internal glow, mysterious deep sea mood'
    };

    const MODIFIER_NUDGES = [
        'translucent moon', 'bioluminescent deep-sea', 'crystal glass', 'pastel ethereal',
        'electric neon', 'golden amber', 'crimson lion\'s mane', 'iridescent rainbow comb',
        'ghostly pale', 'deep purple phantom', 'orange flame', 'silver mirror',
        'cobalt blue', 'emerald green', 'rose quartz', 'sapphire royal'
    ];

    const MODELS = [
        { id: 'flux-2-klein', label: 'FLUX 2 Klein', provider: 'fal', description: 'Fast, balanced quality' },
        { id: 'flux-2-dev', label: 'FLUX 2 Dev', provider: 'fal', description: 'Higher quality, slower' },
        { id: 'flux-2-pro', label: 'FLUX 2 Pro', provider: 'fal', description: 'Best quality, slowest' }
    ];

    // ─── Prompt Builder ───
    function buildPrompt(userText, styleKey, lightingKey) {
        const style = STYLE_NUDGES[styleKey] || STYLE_NUDGES.vector;
        const lighting = LIGHTING_NUDGES[lightingKey] || LIGHTING_NUDGES.biolum;

        let modifier = userText ? userText.trim() : pickRandom(MODIFIER_NUDGES);
        // Clean up user text
        modifier = modifier.replace(/\b(jellyfish|jelly fish)\b/gi, '').trim();
        if (!modifier) modifier = pickRandom(MODIFIER_NUDGES);

        let prompt = BASE_PROMPT
            .replace('{modifier}', modifier)
            .replace('{style}', style)
            .replace('{lighting}', lighting);

        // Always append vector-guard
        prompt += ', vector art, flat illustration, no photorealism, no 3D render, clean 2D style';

        return { prompt, modifier, styleKey, lightingKey };
    }

    function pickRandom(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function varyPrompt(basePrompt, variationType) {
        const variations = {
            color: () => {
                const colors = ['golden', 'crimson', 'emerald', 'sapphire', 'amethyst', 'coral', 'azure'];
                const c = pickRandom(colors);
                return basePrompt.replace(/\b(translucent|bioluminescent|crystal|pastel|electric|golden|crimson|iridescent|ghostly|deep purple|orange|silver|cobalt|emerald|rose|sapphire)\b/gi, c);
            },
            species: () => {
                const species = ['moon jellyfish', 'box jellyfish', 'comb jellyfish', 'lion\'s mane jellyfish', 'crystal jellyfish', 'man o\' war', 'deep sea umbrella'];
                const s = pickRandom(species);
                return basePrompt.replace(/jellyfish/i, s);
            },
            lighting: () => {
                const lights = Object.values(LIGHTING_NUDGES);
                const l = pickRandom(lights);
                return basePrompt.replace(/internal bioluminescent glow[^,]*/i, l)
                                   .replace(/subtle ambient[^,]*/i, l)
                                   .replace(/strong rim[^,]*/i, l)
                                   .replace(/soft diffused[^,]*/i, l)
                                   .replace(/minimal lighting[^,]*/i, l);
            },
            tentacle: () => {
                const styles = ['long flowing ribbon tentacles', 'short stubby fronds', 'thousands of hair-fine threads', 'geometric angular tendrils', 'broad leaf-like oral arms'];
                const t = pickRandom(styles);
                return basePrompt + ', ' + t;
            },
            background: () => {
                const bgs = ['deep midnight blue (#000a1a)', 'abyssal black (#000000)', 'ocean teal (#001d2e)', 'bioluminescent reef glow'];
                const b = pickRandom(bgs);
                return basePrompt.replace(/dark ocean background[^,]*/i, b + ' background');
            }
        };

        const type = variationType || pickRandom(Object.keys(variations));
        return variations[type] ? variations[type]() : basePrompt;
    }

    // ─── Local Storage ───
    function saveImage(blob, metadata) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = reader.result;
                const id = 'jf_' + Date.now().toString(36);
                const entry = { id, dataUrl, metadata, created: Date.now() };

                // Save to localStorage (limit to last 20)
                let saved = [];
                try {
                    saved = JSON.parse(localStorage.getItem('cnidaria_saved_jellyfish') || '[]');
                } catch(e) {}
                saved.unshift(entry);
                if (saved.length > 20) saved = saved.slice(0, 20);
                localStorage.setItem('cnidaria_saved_jellyfish', JSON.stringify(saved));

                resolve(entry);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    function getSavedJellyfish() {
        try {
            return JSON.parse(localStorage.getItem('cnidaria_saved_jellyfish') || '[]');
        } catch(e) { return []; }
    }

    function deleteSaved(id) {
        let saved = getSavedJellyfish();
        saved = saved.filter(s => s.id !== id);
        localStorage.setItem('cnidaria_saved_jellyfish', JSON.stringify(saved));
    }

    // ─── Image Preloading ───
    function preloadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    // ─── Model Selection ───
    function getModels() { return MODELS; }
    function getDefaultModel() { return MODELS[0]; }

    // ─── Export ───
    global.JellyfishImageGenerator = {
        buildPrompt,
        varyPrompt,
        saveImage,
        getSavedJellyfish,
        deleteSaved,
        preloadImage,
        getModels,
        getDefaultModel,
        STYLE_NUDGES,
        LIGHTING_NUDGES,
        MODIFIER_NUDGES
    };
})(window);