export function mapToObject (map: Map<any, any>) {
  return [...map.entries()]
    .reduce((o, [k, v]) => ({ ...o, [k]: v }), {});
}
