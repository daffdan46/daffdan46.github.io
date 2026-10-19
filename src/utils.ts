export const url = (p = '') =>
  `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${p.replace(/^\//, '')}`;

export const site = {
  name: 'Daf',
  role: 'Visual designer',
  city: 'Jakarta',
  email: 'hello@example.com',
  social: [
    { label: 'Instagram', href: 'https://instagram.com/' },
    { label: 'LinkedIn', href: 'https://linkedin.com/' },
    { label: 'Behance', href: 'https://behance.net/' },
  ],
};
