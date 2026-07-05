/**
 * jellyfish-image-generator.js — AI Image Generator v4.0
 *
 * Prompt builder, variation logic, Nous Research model selection,
 * deluxe gallery with save/preview/load/delete.
 */

(function(global) {
    'use strict';

    // ─── Configuration ───
    const BASE_PROMPT =
        'A {modifier} jellyfish, {style}, {lighting}, dark ocean background (#000a1a), ' +
        'clean minimalist composition, centered, no text, no watermark, no border';

    const STYLE_NUDGES = {
        vector:     'vector illustration, flat geometric shapes, clean crisp edges, 2D flat design, SVG-like aesthetic, solid color blocks',
        animated:   'vector animation cel style, soft motion blur on tentacles, frame from an animated film, studio ghibli-inspired underwater, painterly flat colors',
        neon:       'vector neon glow style, electric bioluminescent edges, cyberpunk jellyfish, dark synthwave palette, sharp geometric tentacles with light trails',
        botanical:  'vintage botanical vector illustration, scientific diagram style, labeled aesthetic without text, cross-hatch shading, muted natural palette',
        crystal:    'geometric crystal vector art, faceted translucent bell, prismatic light refraction, stained glass flat colors, sharp angular segments',
        organic:    'organic flowing vector lines, hand-drawn feel but vector clean, ink-brush stroke edges converted to curves, delicate translucent bell'
    };

    const LIGHTING_NUDGES = {
        biolum:    'internal bioluminescent glow, self-illuminated from within, soft radial light emanating from bell',
        ambient:   'subtle ambient underwater caustic lighting, soft volumetric rays from above',
        neon_rim:  'strong rim lighting, silhouette with bright edge glow, high contrast against dark background',
        soft:      'soft diffused even lighting, gentle pastel tones, dreamy underwater atmosphere',
        dark:      'minimal lighting, mostly silhouette with faint internal glow, mysterious deep sea mood'
    };

    const MODIFIER_NUDGES = [
        'translucent moon', 'bioluminescent deep-sea', 'crystal glass', 'pastel ethereal',
        'electric neon', 'golden amber', 'crimson lion\'s mane', 'iridescent rainbow comb',
        'ghostly pale', 'deep purple phantom', 'orange flame', 'silver mirror',
        'cobalt blue', 'emerald green', 'rose quartz', 'sapphire royal'
    ];

    // ─── Expanded Nous Research / FAL Models ───
    const MODELS = [
        { id: 'flux-2-klein',   label: 'FLUX 2 Klein',   provider: 'fal',    description: 'Fast generation, balanced quality',         category: 'FLUX' },
        { id: 'flux-2-dev',     label: 'FLUX 2 Dev',     provider: 'fal',    description: 'High quality, detailed output',             category: 'FLUX' },
        { id: 'flux-2-pro',     label: 'FLUX 2 Pro',     provider: 'fal',    description: 'Best quality, production-ready',          category: 'FLUX' },
        { id: 'flux-2-schnell', label: 'FLUX 2 Schnell', provider: 'fal',    description: 'Ultra-fast, 4 steps',                       category: 'FLUX' },
        { id: 'flux-2-fill',    label: 'FLUX 2 Fill',    provider: 'fal',    description: 'Inpainting and outpainting',              category: 'FLUX' },
        { id: 'flux-2-canny',   label: 'FLUX 2 Canny',   provider: 'fal',    description: 'Edge-guided generation',                  category: 'FLUX' },
        { id: 'flux-2-depth',   label: 'FLUX 2 Depth',   provider: 'fal',    description: 'Depth-map guided generation',             category: 'FLUX' },
        { id: 'ideogram-2',     label: 'Ideogram 2',     provider: 'fal',    description: 'Excellent typography + vector clarity',    category: 'Text' },
        { id: 'ideogram-2-turbo', label: 'Ideogram 2 Turbo', provider: 'fal', description: 'Fast Ideogram with 4K upscaling',          category: 'Text' },
        { id: 'recraft-3',      label: 'Recraft 3',      provider: 'fal',    description: 'Brand-focused, vector-friendly output',    category: 'Brand' },
        { id: 'recraft-3-svg',  label: 'Recraft 3 SVG',  provider: 'fal',    description: 'Native SVG vector output',                 category: 'Vector' },
        { id: 'pony-realism',   label: 'Pony Realism',   provider: 'fal',    description: 'Anime-to-realistic style mixing',          category: 'Anime' },
        { id: 'stable-cascade', label: 'Stable Cascade', provider: 'fal',    description: 'Three-stage high-quality generation',      category: 'Cascade' },
        { id: 'sdxl',           label: 'SDXL 1.0',       provider: 'fal',    description: 'Stable Diffusion XL, reliable',            category: 'Stable' },
        { id: 'sdxl-turbo',     label: 'SDXL Turbo',     provider: 'fal',    description: 'One-step fast SDXL',                       category: 'Stable' },
        { id: 'playground-2-5', label: 'Playground v2.5', provider: 'fal',   description: 'Photorealistic with high detail',          category: 'Photo' },
        { id: 'hyper-sd',       label: 'Hyper-SD',       provider: 'fal',    description: 'Extreme speed, 1-2 step inference',        category: 'Speed' }
    ];

    function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

    // ─── Prompt Builder ───
    function buildPrompt(userText, styleKey, lightingKey) {
        const style = STYLE_NUDGES[styleKey] || STYLE_NUDGES.vector;
        const lighting = LIGHTING_NUDGES[lightingKey] || LIGHTING_NUDGES.biolum;

        let modifier = pickRandom(MODIFIER_NUDGES);
        if (userText && userText.trim()) {
            // Extract potential color hints
            const colorHints = userText.match(/\b(red|blue|green|purple|orange|yellow|pink|cyan|teal|magenta|gold|silver|white|black|crimson|emerald|sapphire|ruby|amber)\b/gi);
            if (colorHints) modifier = userText.trim();
            else modifier = userText.trim() + ' ' + modifier;
        }

        const prompt = BASE_PROMPT
            .replace('{modifier}', modifier)
            .replace('{style}', style)
            .replace('{lighting}', lighting);

        // Vector guard to prevent photorealistic drift
        const vectorGuard = 'vector art, flat illustration, no photorealism, no 3D render, clean 2D style, digital illustration, no photography';
        const finalPrompt = prompt + ', ' + vectorGuard;

        return { prompt: finalPrompt, style, lighting, modifier };
    }

    // ─── Prompt Variation ───
    function varyPrompt(basePrompt, variationType) {
        const pick = pickRandom;
        const variations = {
            color: () => {
                const c = pick(['blue', 'purple', 'pink', 'green', 'gold', 'crimson', 'silver', 'teal']);
                return basePrompt.replace(/\b(red|blue|green|purple|orange|yellow|pink|cyan|teal|magenta|gold|silver|crimson|emerald|sapphire|ruby|amber)\b/gi, c) + `, ${c} dominant palette`;
            },
            species: () => {
                const s = pick(['moon', 'box', 'comb', 'lion\'s mane', 'crystal', 'Portuguese man o\' war', 'deep-sea atolla']);
                return basePrompt.replace(/jellyfish/, s + ' jellyfish') + `, ${s} anatomy`;
            },
            lighting: () => {
                const l = pick([...Object.values(LIGHTING_NUDGES)]);
                return basePrompt.replace(/dark ocean background[^,]*/i, '') + `, ${l}`;
            },
            tentacles: () => {
                const t = pick(['long flowing ribbon tentacles', 'short stubby tentacles', 'thousands of fine hair-like tentacles', 'frilly oral arms', 'glowing segmented tentacles']);
                return basePrompt + `, ${t}`;
            },
            background: () => {
                const b = pick(['abyssal black void', 'shallow turquoise reef', 'midnight twilight zone', 'bioluminescent deep trench']);
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
    function getModelsByCategory() {
        const cats = {};
        for (const m of MODELS) {
            if (!cats[m.category]) cats[m.category] = [];
            cats[m.category].push(m);
        }
        return cats;
    }

    // ─── Gallery Renderer ───
    function renderGallery(containerEl, onLoad, onDelete) {
        if (!containerEl) return;
        const saved = getSavedJellyfish();
        if (!saved.length) {
            containerEl.innerHTML = '<p style="color:rgba(200,230,255,0.4);font-size:12px;text-align:center;padding:16px 0;">No saved jellyfish yet. Generate and save one!</p>';
            return;
        }

        let html = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:8px 0;">';
        for (const entry of saved) {
            const dateStr = new Date(entry.created).toLocaleDateString();
            const meta = entry.metadata || {};
            html += `
                <div class="cnidaria-gallery-item" data-id="${entry.id}" style="
                    position:relative;
                    border-radius:8px;
                    overflow:hidden;
                    border:1px solid rgba(255,255,255,0.08);
                    cursor:pointer;
                    aspect-ratio:1;
                ">
                    <img src="${entry.dataUrl}" style="width:100%;height:100%;object-fit:cover;"
                        alt="${meta.prompt || 'Saved jellyfish'}"
                    >
                    <div style="
                        position:absolute;bottom:0;left:0;right:0;
                        background:rgba(0,0,0,0.7);
                        padding:4px 6px;
                        font-size:10px;
                        color:rgba(200,230,255,0.7);
                        display:flex;
                        justify-content:space-between;
                        align-items:center;
                    ">
                        <span>${dateStr}</span>
                        <button class="cnidaria-gallery-del" data-id="${entry.id}" style="
                            background:none;border:none;color:rgba(255,100,100,0.8);
                            cursor:pointer;font-size:12px;padding:0 2px;
                        " title="Delete">×</button>
                    </div>
                </div>
            `;
        }
        html += '</div>';
        containerEl.innerHTML = html;

        // Click handlers
        containerEl.querySelectorAll('.cnidaria-gallery-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.classList.contains('cnidaria-gallery-del')) return;
                const id = item.dataset.id;
                const entry = saved.find(s => s.id === id);
                if (entry && onLoad) onLoad(entry.dataUrl, entry.metadata);
            });
        });
        containerEl.querySelectorAll('.cnidaria-gallery-del').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                deleteSaved(id);
                renderGallery(containerEl, onLoad, onDelete);
                if (onDelete) onDelete(id);
            });
        });
    }

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
        getModelsByCategory,
        renderGallery,
        STYLE_NUDGES,
        LIGHTING_NUDGES,
        MODIFIER_NUDGES
    };
})(window);
