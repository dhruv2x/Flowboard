export const newId = (prefix: string) => `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
