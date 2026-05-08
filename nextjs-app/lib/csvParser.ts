export const parseCSV = (text)=>text.split("
").map(r=>r.split(","));