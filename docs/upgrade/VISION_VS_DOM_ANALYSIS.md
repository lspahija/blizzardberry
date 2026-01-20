# Vision-First vs DOM-First: Deep Tradeoff Analysis

## TL;DR Decision Matrix

| If your priority is... | Choose | Why |
|------------------------|--------|-----|
| Highest accuracy on standard sites | Vision-first | 94% vs 73-89% on benchmarks |
| Works on ALL sites including edge cases | DOM-first | No screenshot limitations |
| Lowest cost per action | DOM-first | No image tokens |
| Best handling of complex visual UIs | Vision-first | Sees layout, not structure |
| Best handling of dynamic/JS-heavy sites | Vision-first | Sees rendered state |
| Simplest LLM prompting | Vision-first | "Click the blue button" |

---

## Benchmark Evidence

From [WebVoyager benchmark](https://github.com/sagekit/webvoyager) results:

| Approach | Agent | Score | Notes |
|----------|-------|-------|-------|
| **Pure Vision** | Magnitude | 94% | SOTA, coordinate-based clicking |
| **Hybrid** | Browserable | 90.4% | DOM + vision |
| **Hybrid** | Browser-Use | 89.1% | DOM-primary + vision validation |
| **Hybrid** | Operator (OpenAI) | 87% | Pixels + DOM |
| **Hybrid** | Skyvern | 85.8% | Screenshots + bounding boxes |
| **Pure DOM** | Agent-E | 73.1% | Text only, no vision |
| **Baseline** | Original WebVoyager | 57.1% | - |

**Key finding**: Pure vision (94%) outperforms pure DOM (73%) by 21 percentage points.

Sources: [Magnitude WebVoyager](https://github.com/sagekit/webvoyager), [Browser-Use SOTA Report](https://browser-use.com/posts/sota-technical-report), [Agent-E Results](https://www.emergence.ai/blog/agent-e-sota)

---

## The Blizzardberry Constraint

**Critical difference from competitors**: All benchmarked agents use **server-side Playwright** with real CDP screenshots. Blizzardberry runs **client-side** with DOM-to-image libraries.

| Capability | Server-side (Playwright) | Client-side (Widget) |
|------------|-------------------------|---------------------|
| Screenshot quality | Pixel-perfect | Reconstructed from DOM |
| Cross-origin iframes | Can screenshot | Render blank |
| Cross-origin images | Can screenshot | May fail (CORS) |
| Performance | ~100ms | ~500-2000ms |
| Video frames | Can capture | Cannot capture |

**This changes the calculus.** The 94% benchmark was achieved with *real* screenshots, not DOM-reconstructed images.

---

## What Breaks in Each Approach

### Vision-First Failures (Client-Side)

| Scenario | What Happens | Frequency |
|----------|--------------|-----------|
| Cross-origin iframe (login widget, embed) | Renders as blank rectangle | Common |
| Cross-origin image without CORS | Tainted canvas or missing | Common |
| Canvas/WebGL content | May not render correctly | Uncommon |
| CSS animations mid-frame | Captures arbitrary state | Common |
| Very large pages | Slow capture, memory issues | Uncommon |
| Shadow DOM (some cases) | May not render | Uncommon |

**Example failure**: User says "Click the Google login button" but the Google OAuth iframe renders as blank white rectangle. Vision model has no idea what to click.

### DOM-First Failures

| Scenario | What Happens | Frequency |
|----------|--------------|-----------|
| Obfuscated class names | `<div class="x7sj2">` - no semantic info | Common |
| Visual-only relationships | Can't see that button is "next to" image | Common |
| Complex layouts (grids, flex) | DOM order ≠ visual order | Common |
| Minified/mangled React output | Deeply nested divs | Very common |
| Canvas/WebGL apps | No DOM elements exist | Uncommon |
| Icon-only buttons | `<button><svg>...</svg></button>` - no text | Common |

**Example failure**: User says "Click the blue submit button" but DOM shows `<button class="a3x9">...</button>` with no color information. DOM model picks wrong button.

---

## Critical Insight: Both Fail on Cross-Origin

For cross-origin iframes, **both approaches fail**:

| Approach | Cross-origin iframe handling |
|----------|----------------------------|
| Vision | Renders blank rectangle |
| DOM | Cannot read iframe contents |

Neither can interact with content inside a cross-origin iframe. The widget simply cannot access it due to browser security (Same-Origin Policy).

**This is a fundamental limitation of client-side agents, regardless of approach.**

---

## Approach Comparison: Detailed

### 1. Accuracy on "Standard" Sites

**Sites with mostly same-origin content, semantic HTML:**

| Aspect | Vision-First | DOM-First |
|--------|--------------|-----------|
| Form filling | ✅ Excellent | ✅ Excellent |
| Button clicking | ✅ Excellent | ✅ Good (needs labels) |
| Navigation | ✅ Excellent | ✅ Excellent |
| Data extraction | ⚠️ Needs OCR | ✅ Excellent |

**Winner**: Tie for simple sites

### 2. Accuracy on "Complex" Sites

**Sites with dynamic content, modern frameworks, complex layouts:**

| Aspect | Vision-First | DOM-First |
|--------|--------------|-----------|
| React/Vue/Svelte apps | ✅ Sees rendered output | ⚠️ Sees component tree |
| Dynamic dropdowns | ✅ Sees current state | ⚠️ May miss options |
| Drag-and-drop interfaces | ✅ Understands visually | ❌ Hard to infer |
| Price sliders | ✅ Can see values | ❌ Often custom elements |
| Data tables with virtual scroll | ⚠️ Only visible rows | ⚠️ Only rendered rows |

**Winner**: Vision-first

### 3. Cost Analysis

Assuming Claude Sonnet 4 pricing:
- Input: $3/M tokens
- Output: $15/M tokens
- Images: ~1600 tokens for 1024x768 image

| Approach | Tokens per step | Cost per step |
|----------|-----------------|---------------|
| DOM-only | ~2000-5000 | $0.006-0.015 |
| Vision-only | ~2000 + 1600 image | $0.011-0.020 |
| Hybrid (DOM + vision) | ~4000 + 1600 | $0.017-0.025 |

**Winner**: DOM-first (30-40% cheaper)

### 4. Latency Analysis

| Component | DOM-First | Vision-First |
|-----------|-----------|--------------|
| DOM extraction | 50-100ms | - |
| Screenshot capture | - | 500-2000ms |
| Network upload | ~100ms (5KB) | ~500ms (100KB) |
| LLM inference | 1000-3000ms | 1000-3000ms |
| **Total** | **1.2-3.2s** | **2.0-5.5s** |

**Winner**: DOM-first (40-60% faster)

### 5. Robustness to Site Changes

| Change Type | Vision-First | DOM-First |
|-------------|--------------|-----------|
| CSS redesign (same DOM) | ⚠️ May break | ✅ Unaffected |
| DOM restructure (same visuals) | ✅ Unaffected | ⚠️ May break |
| New elements added | ✅ Sees them | ✅ Sees them |
| Class name changes | ✅ Unaffected | ⚠️ CSS selectors break |
| Text content changes | ✅ Sees new text | ✅ Sees new text |

**Winner**: Vision-first (more robust to implementation changes)

---

## Hybrid Approaches

### Option A: DOM-Primary + Vision Fallback

```
1. Extract DOM, attempt action
2. If confidence < threshold OR action fails:
   - Capture screenshot
   - Re-plan with vision
3. Execute action
```

**Pros**: Cheap/fast for simple tasks, falls back for complex
**Cons**: Adds complexity, may still fail if vision capture fails

### Option B: Vision-Primary + DOM Assist

```
1. Capture screenshot
2. Extract minimal DOM (for element coordinates)
3. Plan action using vision
4. Use DOM selectors for precise targeting
```

**Pros**: Visual understanding + precise clicking
**Cons**: Full cost of both approaches

### Option C: DOM-Primary + Overlay Markers

Like [Set-of-Mark prompting](https://arxiv.org/abs/2310.11441):

```
1. Extract DOM elements
2. Capture screenshot
3. Overlay numbered markers on interactive elements
4. Send both to LLM: "Click element [3]"
```

**Pros**: Best of both worlds - visual context + precise targeting
**Cons**: Requires rendering overlay, full cost

---

## Blizzardberry-Specific Considerations

### Your Use Case

Blizzardberry is installed **by website owners on their own sites**. This is different from a general web scraper.

| Factor | Implication |
|--------|-------------|
| Site owner controls CORS | Can configure images/fonts to work |
| Site owner knows the content | Can avoid problematic patterns |
| Site is likely a web app | Modern frameworks, complex UIs |
| Users are authenticated | Session state preserved |

**Insight**: Since site owners install the widget, they have some control over making vision work. But they can't control third-party embeds.

### What Sites Would Install This?

Likely candidates:
- SaaS dashboards
- E-commerce admin panels
- Internal tools
- Documentation sites
- Customer portals

Unlikely candidates:
- Social media (too dynamic)
- News sites (too many ads/embeds)
- Banking (security concerns)

**Most likely sites are web apps with controlled environments** - these are MORE likely to work well with vision.

---

## Recommendation Framework

### Choose Vision-First If:

1. Target sites are **controlled web apps** (SaaS, internal tools)
2. Sites have **complex visual UIs** (dashboards, drag-drop)
3. DOM structure is **messy/obfuscated** (heavily bundled React/Vue)
4. You can accept **higher cost and latency**
5. Site owners can **configure CORS** for assets

### Choose DOM-First If:

1. Need to work on **arbitrary websites** with unknown structure
2. Sites have **many third-party embeds** (ads, social widgets)
3. **Cost and latency** are primary concerns
4. Sites have **good semantic HTML** (aria labels, data attributes)
5. Primary task is **form filling and data extraction**

### Choose Hybrid If:

1. Want **best accuracy** regardless of cost
2. Need **graceful degradation** when one approach fails
3. Different pages on same site have **different characteristics**

---

## My Revised Assessment

Given that:
1. Blizzardberry targets **web apps installed by site owners**
2. These sites likely have **controlled, complex UIs**
3. Benchmark evidence shows **vision outperforms DOM by 20%+**
4. Cross-origin issues affect **both approaches equally**

**I now lean toward Vision-Primary with DOM Assist** as the better approach for Blizzardberry.

### Proposed Architecture

```
1. Capture screenshot (modern-screenshot, ~500ms)
2. Extract minimal DOM (interactive elements only, for coordinates)
3. Optionally overlay element markers [1], [2], [3]
4. Send to Claude:
   - Screenshot (visual understanding)
   - Element list with coordinates (precise targeting)
5. Claude returns: "Click element [3]" or "Click at (450, 320)"
6. Execute click using DOM element or coordinates
```

### Fallback Strategy

```
If screenshot capture fails (CORS error, timeout):
  → Fall back to DOM-only mode
  → Log warning for site owner
  → Continue with reduced accuracy
```

---

## Cost/Benefit Summary

| Approach | Accuracy | Cost | Latency | Robustness |
|----------|----------|------|---------|------------|
| DOM-only | 73-85% | Low | Fast | Medium |
| Vision-only | 90-94% | Medium | Slow | High |
| Hybrid (DOM+Vision) | 90-94% | High | Medium | Highest |
| **Vision + DOM-assist** | **90-94%** | **Medium** | **Medium** | **High** |

The Vision + DOM-assist approach gets most of the accuracy benefit while:
- Using DOM for precise element targeting (not OCR)
- Having fallback when vision fails
- Keeping costs reasonable (one image per step)

---

## Open Questions

1. **Should we benchmark modern-screenshot quality?**
   - Test on 50 real sites, compare to Playwright screenshots
   - Measure actual failure rate

2. **Can we pre-detect screenshot failures?**
   - Check for cross-origin iframes before capture
   - Warn user if vision mode will be degraded

3. **Should site owners configure vision mode?**
   - Enable/disable per-site
   - Whitelist domains for CORS proxying

4. **What's the actual accuracy difference with reconstructed screenshots?**
   - Need to test: Does Claude perform equally well on modern-screenshot output vs real screenshots?
