const PRICING_FIELDS = new Set(['product_name', 'plan_name', 'price', 'currency', 'billing_period']);

// A tuple belongs to one offer in one source. Legacy text excerpts can be used
// only when their fields are unambiguous. Flattened legacy adapter data cannot
// recover offer boundaries, even if deduplication left one value per field.
export function reconstructPricingTuples(facts) {
  const groups = new Map();
  for (const fact of facts) {
    if (!fact?.source_url || !PRICING_FIELDS.has(fact.field)) continue;
    if (!fact.tuple_id && (!fact.excerpt || /^Structured data extracted by/i.test(fact.excerpt))) continue;
    const key = JSON.stringify([fact.source_url, fact.tuple_id ? 'tuple' : 'excerpt', fact.tuple_id || fact.excerpt]);
    if (!groups.has(key)) groups.set(key, { source_url: fact.source_url, confidence: 'high' });
    const group = groups.get(key);
    if (fact.product_id) group.product_id = JSON.stringify([fact.source_url, fact.product_id]);
    if (group[fact.field] !== undefined && group[fact.field] !== fact.value) group.ambiguous = true;
    group[fact.field] = fact.value;
    if (fact.confidence_hint !== 'high') group.confidence = 'medium';
  }
  return [...groups.values()].filter(group => !group.ambiguous && group.price !== undefined)
    .map(({ source_url, product_id, product_name, plan_name = '', price, currency = '', billing_period = '', confidence }) =>
      ({ source_url, ...(product_id ? { product_id } : {}), ...(product_name ? { product_name } : {}),
        plan_name, price, currency, billing_period, confidence }));
}

// Product label for one tuple. A tuple without product identity (for example a
// text-extracted price line) takes a product name only when its own source names
// exactly one product (structured name first, then a page-derived product) and
// has no unnamed product. The caller's fallback applies only when no product is
// named anywhere and every price and identity fact comes from this tuple's host. Otherwise the
// tuple is labelled by its source host, never by a product from another source.
export function pricingProductLabel(tuple, facts, fallback) {
  if (tuple.product_name) return tuple.product_name;
  if (tuple.product_id) return 'Unnamed product';
  const valid = facts.filter(fact => fact && typeof fact === 'object');
  const sameSource = valid.filter(fact => fact.source_url === tuple.source_url);
  const valuesOf = (list, field) => new Set(list.filter(fact => fact.field === field && fact.value).map(fact => fact.value));
  const structured = valuesOf(sameSource, 'product_name');
  const names = structured.size ? structured : valuesOf(sameSource, 'product');
  const namedIds = new Set(sameSource.filter(fact => fact.field === 'product_name' && fact.product_id).map(fact => fact.product_id));
  const unnamed = sameSource.some(fact => fact.product_id && !namedIds.has(fact.product_id));
  if (names.size === 1 && !unnamed) return [...names][0];
  const host = url => { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return null; } };
  const ownHost = host(tuple.source_url);
  const priceHosts = new Set(valid.filter(fact => PRICING_FIELDS.has(fact.field)).map(fact => host(fact.source_url)));
  // The caller's fallback is derived from identity facts. It applies only when one
  // identity exists, on this host; otherwise a host label is the honest choice.
  const identity = valid.filter(fact => ['product_name', 'product', 'company'].includes(fact.field) && fact.value);
  if (identity.length > 0 && !identity.some(fact => fact.field === 'product_name')
    && valuesOf(identity, 'product').size <= 1 && valuesOf(identity, 'company').size <= 1
    && identity.every(fact => host(fact.source_url) === ownHost)
    && priceHosts.size === 1 && priceHosts.has(ownHost)) return fallback;
  return ownHost || 'Unattributed';
}
