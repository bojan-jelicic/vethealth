export const slugify = (input: string): string => {
  return (input || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'd')
    .replace(/ž/g, 'z').replace(/Ž/g, 'z')
    .replace(/š/g, 's').replace(/Š/g, 's')
    .replace(/č/g, 'c').replace(/Č/g, 'c')
    .replace(/ć/g, 'c').replace(/Ć/g, 'c')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
};

export const isValidSlug = (s: string) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s);