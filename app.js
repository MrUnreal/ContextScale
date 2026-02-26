// ContextScale — app.js
(async function () {
    const { models, comparisons } = await d3.json('data.json');

    // Sort models by context size descending
    models.sort((a, b) => b.tokens - a.tokens);

    // Sort comparisons by tokens ascending
    comparisons.sort((a, b) => a.tokens - b.tokens);

    const TOKENS_PER_WORD = 1.33;

    // ─── Slider Scale (logarithmic) ───
    // Map slider 0-100 to token range logarithmically
    const MIN_TOKENS = 1000;
    const MAX_TOKENS = 12000000; // 12M — covers Llama 4 Scout (10M)
    const logMin = Math.log10(MIN_TOKENS);
    const logMax = Math.log10(MAX_TOKENS);

    function sliderToTokens(val) {
        const logVal = logMin + (val / 100) * (logMax - logMin);
        return Math.round(Math.pow(10, logVal));
    }

    function tokensToSlider(tokens) {
        const logVal = Math.log10(Math.max(MIN_TOKENS, tokens));
        return ((logVal - logMin) / (logMax - logMin)) * 100;
    }

    // ─── Hero Rotating Comparisons ───
    const heroEl = document.getElementById('hero-comparison');
    const heroNumber = document.getElementById('hero-number');
    let currentHeroTokens = 128000;

    function updateHeroComparisons(tokens) {
        currentHeroTokens = tokens;
        heroNumber.textContent = formatTokenCount(tokens);

        // Find what fits
        const fittingItems = comparisons.filter(c => c.tokens <= tokens);
        // Pick some interesting ones to display
        const displayItems = pickInterestingComparisons(fittingItems, tokens);

        heroEl.innerHTML = '';
        displayItems.forEach((item, i) => {
            const count = Math.floor(tokens / item.tokens);
            const chip = document.createElement('div');
            chip.className = 'comparison-chip';
            chip.style.animationDelay = `${i * 0.08}s`;
            chip.innerHTML = `
                <span class="icon">${item.icon}</span>
                <span class="count">${count > 1 ? count + '×' : ''}</span>
                ${item.name}
            `;
            heroEl.appendChild(chip);
        });
    }

    function pickInterestingComparisons(items, tokens) {
        // Pick a mix: largest single item that fits, plus a few medium and small
        const result = [];
        
        // Largest item that fits once
        const largest = items.filter(c => c.tokens <= tokens).pop();
        if (largest) result.push(largest);

        // Middle range item
        const midToken = tokens / 5;
        const mid = items.reduce((best, c) => {
            if (c === largest) return best;
            if (!best || Math.abs(c.tokens - midToken) < Math.abs(best.tokens - midToken)) return c;
            return best;
        }, null);
        if (mid && mid !== largest) result.push(mid);

        // Small item
        const small = items.find(c => c !== largest && c !== mid && c.tokens < tokens / 20);
        if (small) result.push(small);

        // A book if any fits
        const book = items.filter(c => c.category === 'books' && c !== largest && c !== mid && c !== small).pop();
        if (book && result.length < 5) result.push(book);

        return result.slice(0, 5);
    }

    // ─── Slider Logic ───
    const slider = document.getElementById('token-slider');
    const sliderValue = document.getElementById('slider-value');
    const sliderWords = document.getElementById('slider-words');
    const sliderLabel = document.getElementById('slider-tokens-label');
    const fitsContainer = document.getElementById('fits-container');

    // Set initial slider to 128K
    slider.value = tokensToSlider(128000);

    function updateSlider() {
        const tokens = sliderToTokens(parseFloat(slider.value));
        sliderValue.textContent = formatTokenCount(tokens) + ' tokens';
        sliderWords.textContent = `≈ ${formatNumber(Math.round(tokens / TOKENS_PER_WORD))} words`;
        sliderLabel.textContent = formatTokenShort(tokens);

        updateHeroComparisons(tokens);
        renderFitsCards(tokens);
    }

    slider.addEventListener('input', updateSlider);

    function renderFitsCards(tokens) {
        fitsContainer.innerHTML = '';

        comparisons.forEach((item, i) => {
            const ratio = tokens / item.tokens;
            const fits = ratio >= 1;
            const fitsCount = Math.floor(ratio);
            const pct = Math.min(100, (ratio) * 100);

            const card = document.createElement('div');
            card.className = `fit-card ${fits ? (fitsCount >= 1 ? 'fits' : 'partial') : 'nope'}`;

            let statusHTML;
            if (fitsCount > 1) {
                statusHTML = `<span class="fit-status times">${fitsCount}×</span>`;
            } else if (fits) {
                statusHTML = `<span class="fit-status yes">✓ Fits</span>`;
            } else {
                statusHTML = `<span class="fit-status no">${Math.round(pct)}%</span>`;
            }

            card.innerHTML = `
                <div class="fit-icon">${item.icon}</div>
                <div class="fit-info">
                    <div class="fit-name">${item.name}</div>
                    <div class="fit-tokens">${formatTokenCount(item.tokens)} tokens</div>
                </div>
                ${statusHTML}
                <div class="fit-bar ${fits ? 'green' : (pct > 50 ? 'yellow' : 'red')}" style="width: ${Math.min(100, pct)}%"></div>
            `;

            fitsContainer.appendChild(card);
        });
    }

    // ─── Model Bars ───
    const modelBarsEl = document.getElementById('model-bars');
    const maxContextTokens = d3.max(models, d => d.tokens);

    // Use log scale for the bars to make small models visible
    const barScale = d3.scaleLog()
        .domain([1, maxContextTokens])
        .range([0.5, 100]);

    function renderModelBars() {
        modelBarsEl.innerHTML = '';

        models.forEach(model => {
            const pct = barScale(model.tokens);

            const row = document.createElement('div');
            row.className = 'model-bar-row';
            row.innerHTML = `
                <div class="model-bar-label">
                    ${model.name}
                    <span class="provider">${model.provider}</span>
                </div>
                <div class="model-bar-wrapper">
                    <div class="model-bar-fill" style="width: 0%; background: ${model.color}">
                        <span>${formatTokenShort(model.tokens)}</span>
                    </div>
                </div>
                <div class="model-bar-value">${formatTokenShort(model.tokens)}</div>
            `;

            row.addEventListener('click', () => {
                slider.value = tokensToSlider(model.tokens);
                updateSlider();
                document.querySelector('.slider-section').scrollIntoView({ behavior: 'smooth', block: 'center' });
            });

            modelBarsEl.appendChild(row);

            // Animate bar
            requestAnimationFrame(() => {
                row.querySelector('.model-bar-fill').style.width = `${pct}%`;
            });
        });
    }

    // ─── Your Text Section ───
    const userText = document.getElementById('user-text');
    const textStats = document.getElementById('text-stats');
    const modelFitGrid = document.getElementById('model-fit-grid');

    function updateTextSection() {
        const text = userText.value.trim();
        const words = text ? text.split(/\s+/).length : 0;
        const estTokens = Math.round(words * TOKENS_PER_WORD);

        textStats.innerHTML = `
            <span class="text-stat">Words: <strong>${formatNumber(words)}</strong></span>
            <span class="text-stat">Est. Tokens: <strong>${formatNumber(estTokens)}</strong></span>
        `;

        renderModelFitGrid(estTokens);
    }

    function renderModelFitGrid(userTokens) {
        modelFitGrid.innerHTML = '';

        if (userTokens === 0) {
            models.forEach(model => {
                const card = document.createElement('div');
                card.className = 'model-fit-card';
                card.innerHTML = `
                    <div class="mf-indicator" style="background: var(--border)"></div>
                    <div class="mf-name">${model.name}</div>
                    <div class="mf-context">${formatTokenShort(model.tokens)}</div>
                `;
                modelFitGrid.appendChild(card);
            });
            return;
        }

        models.forEach(model => {
            const canFit = model.tokens >= userTokens;
            const usagePct = Math.min(100, (userTokens / model.tokens) * 100);
            
            const card = document.createElement('div');
            card.className = `model-fit-card ${canFit ? 'can-fit' : 'cannot-fit'}`;
            card.innerHTML = `
                <div class="mf-indicator ${canFit ? 'green' : 'red'}"></div>
                <div class="mf-name">${model.name}</div>
                <div class="mf-usage">${canFit ? usagePct.toFixed(1) + '% used' : 'Too large'}</div>
            `;
            modelFitGrid.appendChild(card);
        });
    }

    userText.addEventListener('input', updateTextSection);

    // ─── Mind-Blowing Facts ───
    const factsGrid = document.getElementById('facts-grid');

    function renderFacts() {
        const facts = [
            {
                model: "Gemini 2.5 Pro",
                tokens: 1048576,
                number: "15",
                unit: "novels",
                detail: "1M tokens ≈ 15 full-length novels. You could paste the entire Harry Potter + LOTR series and still have room."
            },
            {
                model: "Llama 4 Scout",
                tokens: 10000000,
                number: "7,500",
                unit: "research papers",
                detail: "10M tokens is enough for ~7,500 average research papers. That's an entire PhD program's reading list."
            },
            {
                model: "GPT-4 (Original)",
                tokens: 8192,
                number: "6",
                unit: "pages",
                detail: "The original GPT-4 could only handle ~6 single-spaced pages. We've come 1,000× since then."
            },
            {
                model: "Claude 4 Opus",
                tokens: 200000,
                number: "1",
                unit: "entire codebase",
                detail: "200K tokens fits a full 50-file project. You can paste your entire startup's code in one message."
            },
            {
                model: "All English Wikipedia",
                tokens: 5830000000,
                number: "556",
                unit: "Gemini windows",
                detail: "English Wikipedia has ~5.8B tokens. Even Gemini's 1M context would need 556 windows to hold it all."
            },
            {
                model: "Galactica → GPT-4.1",
                tokens: 1047576,
                number: "128×",
                unit: "growth in 2 years",
                detail: "Context windows grew from 8K to 1M+ in just 2 years — a 128× increase. And it's still accelerating."
            }
        ];

        facts.forEach(fact => {
            const card = document.createElement('div');
            card.className = 'fact-card';
            card.innerHTML = `
                <div class="fact-model">${fact.model}</div>
                <div class="fact-number">${fact.number}</div>
                <div class="fact-unit">${fact.unit}</div>
                <div class="fact-detail">${fact.detail}</div>
            `;
            factsGrid.appendChild(card);
        });
    }

    // ─── Formatting Helpers ───
    function formatTokenCount(n) {
        if (n >= 1000000000) return (n / 1000000000).toFixed(1) + 'B';
        if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
        return n.toLocaleString();
    }

    function formatTokenShort(n) {
        if (n >= 1000000) return (n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1) + 'M';
        if (n >= 1000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'K';
        return n.toString();
    }

    function formatNumber(n) {
        return n.toLocaleString();
    }

    // ─── Init ───
    updateSlider();
    renderModelBars();
    updateTextSection();
    renderFacts();
})();
