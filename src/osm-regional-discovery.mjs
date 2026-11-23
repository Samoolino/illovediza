export const SPAIN_AUTONOMOUS_REGIONS = [
  { code: 'ES-AN', name: 'Andalucía' },
  { code: 'ES-AR', name: 'Aragón' },
  { code: 'ES-AS', name: 'Asturias' },
  { code: 'ES-IB', name: 'Illes Balears' },
  { code: 'ES-CN', name: 'Canarias' },
  { code: 'ES-CB', name: 'Cantabria' },
  { code: 'ES-CM', name: 'Castilla-La Mancha' },
  { code: 'ES-CL', name: 'Castilla y León' },
  { code: 'ES-CT', name: 'Cataluña' },
  { code: 'ES-VC', name: 'Comunitat Valenciana' },
  { code: 'ES-EX', name: 'Extremadura' },
  { code: 'ES-GA', name: 'Galicia' },
  { code: 'ES-MD', name: 'Comunidad de Madrid' },
  { code: 'ES-MC', name: 'Región de Murcia' },
  { code: 'ES-NC', name: 'Navarra' },
  { code: 'ES-PV', name: 'País Vasco' },
  { code: 'ES-RI', name: 'La Rioja' },
  { code: 'ES-CE', name: 'Ceuta' },
  { code: 'ES-ML', name: 'Melilla' }
];

export function buildRegionalOverpassQuery(template, region) {
  if (typeof template !== 'string' || !template.includes('{{REGION_CODE}}')) {
    throw new Error('Overpass query template must include {{REGION_CODE}}');
  }
  if (!region || !/^ES-[A-Z]{2}$/.test(region.code) || !region.name) {
    throw new Error('a valid Spanish autonomous region is required');
  }
  return template.replaceAll('{{REGION_CODE}}', region.code).replaceAll('{{REGION_NAME}}', region.name);
}

export function deduplicateOsmElements(groups) {
  if (!Array.isArray(groups)) throw new Error('regional OSM result groups must be an array');
  const elements = new Map();
  let duplicates = 0;
  for (const group of groups) {
    if (!Array.isArray(group.elements)) continue;
    for (const element of group.elements) {
      if (!['node', 'way', 'relation'].includes(element?.type) || !Number.isInteger(element?.id)) continue;
      const key = `${element.type}/${element.id}`;
      if (elements.has(key)) {
        duplicates += 1;
        continue;
      }
      elements.set(key, element);
    }
  }
  return { elements: [...elements.values()], duplicates };
}
