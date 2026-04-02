/**
 * Shipwright source adapters.
 *
 * Extracts structured fields from raw HTML for known URL patterns and
 * schema-based pages. Called during page fetch — before the raw HTML body
 * is discarded — so adapter results are persisted alongside the extracted
 * text in the evidence pack.
 *
 * All adapters fail soft. A parse error in one adapter does not prevent
 * others from running. If no adapter matches or extracts anything useful,
 * applySourceAdapter returns null.
 *
 * Integration:
 *   collect-research.mjs calls applySourceAdapter(url, html) inside
 *   fetchAndExtract, stores the result as result.adapterData, then converts
 *   fields to facts via extractAdapterFacts in its extractFacts pipeline.
 *
 * Adding a new adapter:
 *   1. Write an extractXxxAdapter(url, html) function that returns
 *      { adapterName: string, fields: AdapterField[] } or null.
 *   2. Register it in applySourceAdapter with its URL guard.
 *   3. Add tests in tests/source-adapters.test.mjs.
 */

/**
 * @typedef {Object} AdapterField
 * @property {string} field - Fact field name (e.g. 'star_rating', 'review_count')
 * @property {string} value - Extracted string value
 * @property {'high'|'medium'} confidence - Extraction confidence
 */

/**
 * @typedef {Object} AdapterResult
 * @property {string} adapterName - Which adapter produced this result
 * @property {AdapterField[]} fields - Extracted fields (deduplicated by field+value)
 */

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

/**
 * Apply source adapters to a fetched URL and its raw HTML body.
 *
 * Tries adapters in priority order and returns the first result that has
 * at least one field. Returns null if no adapter matched or extracted anything.
 *
 * @param {string} url - Final URL after redirects
 * @param {string} html - Raw HTML body
 * @returns {AdapterResult | null}
 */
export function applySourceAdapter(url, html) {
  if (!url || !html) return null;

  // JSON-LD runs first: schema-based, highest confidence when present, works
  // across many structured pages (pricing pages, review aggregators, product pages).
  try {
    const result = extractJsonLdAdapter(url, html);
    if (result && result.fields.length > 0) return result;
  } catch {
    // fail soft — never let an adapter error surface to the caller
  }

  // npm package pages: SSR'd, weekly downloads and version available in HTML.
  try {
    if (isNpmPackageUrl(url)) {
      const result = extractNpmAdapter(url, html);
      if (result && result.fields.length > 0) return result;
    }
  } catch {
    // fail soft
  }

  // PyPI project pages: SSR'd, version and release date available in HTML.
  try {
    if (isPypiProjectUrl(url)) {
      const result = extractPypiAdapter(url, html);
      if (result && result.fields.length > 0) return result;
    }
  } catch {
    // fail soft
  }

  return null;
}

// ---------------------------------------------------------------------------
// JSON-LD adapter
// ---------------------------------------------------------------------------

/**
 * Extract structured facts from JSON-LD script blocks.
 *
 * Handles:
 *   Product / SoftwareApplication / Service → product_name, price, currency, plan_name
 *   AggregateRating (standalone or embedded in Product) → star_rating, review_count
 *   @graph wrapper → flattens items before processing
 *
 * @param {string} _url - Unused but kept for adapter signature symmetry
 * @param {string} html
 * @returns {AdapterResult | null}
 */
function extractJsonLdAdapter(_url, html) {
  const blobs = parseJsonLdBlobs(html);
  if (blobs.length === 0) return null;

  const fields = [];

  for (const blob of blobs) {
    // Expand @graph into individual items, but also include the wrapper blob
    // itself in case it has its own @type.
    const items = Array.isArray(blob['@graph'])
      ? [...blob['@graph'], blob]
      : [blob];

    for (const item of items) {
      if (!item || typeof item !== 'object') continue;
      const types = normalizeJsonLdTypes(item['@type']);

      if (isProductLikeType(types)) {
        extractProductFields(item, fields);
      }

      // AggregateRating can appear standalone or embedded inside a Product.
      // extractProductFields already handles the embedded case; this handles
      // the standalone case.
      if (types.includes('aggregaterating')) {
        extractAggregateRatingFields(item, fields);
      }
    }
  }

  if (fields.length === 0) return null;
  return { adapterName: 'json-ld', fields: dedupeAdapterFields(fields) };
}

function isProductLikeType(types) {
  return types.some((t) =>
    ['product', 'softwareapplication', 'service'].includes(t),
  );
}

function extractProductFields(item, fields) {
  if (item.name) {
    fields.push({
      field: 'product_name',
      value: String(item.name).trim(),
      confidence: 'high',
    });
  }

  const offers = [].concat(item.offers || []);
  for (const offer of offers) {
    extractOfferFields(offer, fields);
  }

  if (item.aggregateRating) {
    extractAggregateRatingFields(item.aggregateRating, fields);
  }
}

function extractOfferFields(offer, fields) {
  if (!offer || typeof offer !== 'object') return;

  if (offer.price !== undefined && offer.price !== null) {
    const price = String(offer.price).trim().replace(/,/g, '');
    // Only emit clean numeric prices — skip "0" (free tier marker) ambiguity
    // by still emitting it; that's a legitimate fact.
    if (/^\d+(\.\d{1,2})?$/.test(price)) {
      fields.push({ field: 'price', value: price, confidence: 'high' });
    }
  }

  if (offer.priceCurrency) {
    const currency = normalizeJsonLdCurrency(String(offer.priceCurrency));
    if (currency) {
      fields.push({ field: 'currency', value: currency, confidence: 'high' });
    }
  }

  if (offer.name) {
    fields.push({
      field: 'plan_name',
      value: String(offer.name).trim(),
      confidence: 'high',
    });
  }
}

function extractAggregateRatingFields(rating, fields) {
  if (!rating || typeof rating !== 'object') return;

  const ratingValue = rating.ratingValue;
  if (ratingValue !== undefined && ratingValue !== null) {
    const v = String(ratingValue).trim();
    if (/^\d+(\.\d+)?$/.test(v)) {
      const parsed = parseFloat(v);
      // Rating must be 0–5 to be treated as a star rating
      if (parsed >= 0 && parsed <= 5) {
        fields.push({ field: 'star_rating', value: v, confidence: 'high' });
      }
    }
  }

  const count = rating.reviewCount ?? rating.ratingCount;
  if (count !== undefined && count !== null) {
    const c = String(count).trim().replace(/,/g, '');
    if (/^\d+$/.test(c) && parseInt(c, 10) >= 0) {
      fields.push({ field: 'review_count', value: c, confidence: 'high' });
    }
  }
}

// ---------------------------------------------------------------------------
// npm adapter
// ---------------------------------------------------------------------------

function isNpmPackageUrl(url) {
  try {
    const u = new URL(url);
    return (
      (u.hostname === 'www.npmjs.com' || u.hostname === 'npmjs.com') &&
      u.pathname.startsWith('/package/')
    );
  } catch {
    return false;
  }
}

/**
 * Extract structured facts from an npm package page.
 *
 * npmjs.com is server-rendered. Weekly download counts and version
 * are embedded in the HTML body.
 *
 * @param {string} _url
 * @param {string} html
 * @returns {AdapterResult | null}
 */
function extractNpmAdapter(_url, html) {
  const fields = [];

  // Weekly downloads — the count appears close to the "Weekly Downloads" label
  // in the SSR'd stats section.
  const downloadsMatch = html.match(
    /Weekly Downloads[\s\S]{0,300}?<[^>]+>(\d{1,3}(?:,\d{3})*)<\/[^>]+>/i,
  );
  if (downloadsMatch) {
    const downloads = downloadsMatch[1].replace(/,/g, '');
    if (/^\d+$/.test(downloads) && parseInt(downloads, 10) > 0) {
      fields.push({ field: 'weekly_downloads', value: downloads, confidence: 'medium' });
    }
  }

  // Version — either from a JSON-LD embedded snippet or an <abbr> element.
  const versionMatch =
    html.match(/<abbr[^>]+title=["'](\d+\.\d+\.\d+[^"']*?)["'][^>]*>/) ||
    html.match(/"version"\s*:\s*"(\d+\.\d+\.\d+[^"]*)"/);
  if (versionMatch) {
    fields.push({ field: 'version', value: versionMatch[1], confidence: 'high' });
  }

  if (fields.length === 0) return null;
  return { adapterName: 'npm', fields };
}

// ---------------------------------------------------------------------------
// PyPI adapter
// ---------------------------------------------------------------------------

function isPypiProjectUrl(url) {
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/').filter(Boolean);
    return u.hostname === 'pypi.org' && parts.length >= 2 && parts[0] === 'project';
  } catch {
    return false;
  }
}

/**
 * Extract structured facts from a PyPI project page.
 *
 * PyPI project pages are server-rendered. Package name and version appear in
 * the header, and the current release date is exposed near the header time tag.
 *
 * @param {string} _url
 * @param {string} html
 * @returns {AdapterResult | null}
 */
function extractPypiAdapter(_url, html) {
  const fields = [];

  const headerMatch = html.match(
    /<h1[^>]*package-header__name[^>]*>([\s\S]{0,300}?)<\/h1>/i,
  );
  if (headerMatch) {
    const headerText = cleanAdapterText(headerMatch[1]);
    const versionMatch = headerText.match(/^(.+?)\s+([0-9][0-9A-Za-z.!+_-]*)$/);

    if (versionMatch) {
      const productName = versionMatch[1].trim();
      const version = versionMatch[2].trim();

      if (productName) {
        fields.push({
          field: 'product_name',
          value: productName,
          confidence: 'high',
        });
      }

      if (version) {
        fields.push({ field: 'version', value: version, confidence: 'high' });
      }
    }
  }

  const dateBlockMatch = html.match(
    /<p[^>]*package-header__date[^>]*>([\s\S]{0,300}?)<\/p>/i,
  );
  if (dateBlockMatch) {
    const publishedDate = extractPypiPublishedDate(dateBlockMatch[1]);
    if (publishedDate) {
      fields.push({
        field: 'published_or_observed_date',
        value: publishedDate,
        confidence: 'high',
      });
    }
  }

  if (fields.length === 0) return null;
  return { adapterName: 'pypi', fields: dedupeAdapterFields(fields) };
}

function extractPypiPublishedDate(htmlFragment) {
  const datetimeMatch = htmlFragment.match(
    /<time[^>]+datetime=["']([^"']+)["']/i,
  );
  if (datetimeMatch) {
    const normalized = normalizeAdapterDate(datetimeMatch[1]);
    if (normalized) return normalized;
  }

  const textMatch = cleanAdapterText(htmlFragment).match(
    /Released:\s*([A-Za-z]{3,9}\s+\d{1,2},\s+\d{4})/i,
  );
  if (!textMatch) return '';

  return normalizeAdapterDate(textMatch[1]);
}

// ---------------------------------------------------------------------------
// Shared utilities
// ---------------------------------------------------------------------------

/**
 * Parse all <script type="application/ld+json"> blobs from an HTML page.
 * Silently skips blobs with invalid JSON.
 */
function parseJsonLdBlobs(html) {
  const blobs = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;

  while ((m = re.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(m[1]);
      if (Array.isArray(parsed)) {
        blobs.push(...parsed);
      } else {
        blobs.push(parsed);
      }
    } catch {
      // skip invalid JSON-LD blobs — common on pages that embed partial data
    }
  }

  return blobs;
}

/**
 * Normalize @type to a lowercase array, stripping optional "schema:" prefix.
 */
function normalizeJsonLdTypes(value) {
  if (!value) return [];
  return []
    .concat(value)
    .map((t) => String(t).toLowerCase().replace(/^schema:/i, '').trim());
}

/**
 * Normalize a priceCurrency value to an ISO 4217 currency code.
 * Accepts the three most common codes and any other valid 3-letter code.
 */
function normalizeJsonLdCurrency(token) {
  const upper = String(token).trim().toUpperCase();
  // Named codes
  if (upper === 'USD') return 'USD';
  if (upper === 'EUR') return 'EUR';
  if (upper === 'GBP') return 'GBP';
  // Accept any 3-letter ISO code
  if (/^[A-Z]{3}$/.test(upper)) return upper;
  return '';
}

function cleanAdapterText(value) {
  return String(value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeAdapterDate(value) {
  if (!value) return '';

  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return '';

  return new Date(parsed).toISOString().slice(0, 10);
}

/**
 * Deduplicate adapter fields by field+value key, keeping first occurrence.
 */
function dedupeAdapterFields(fields) {
  const seen = new Set();
  const result = [];

  for (const field of fields) {
    const key = `${field.field}::${field.value}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(field);
    }
  }

  return result;
}
