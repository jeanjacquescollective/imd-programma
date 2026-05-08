export const exportCsv=(rows)=>rows.map(r=>Object.values(r).join(",")).join("
");