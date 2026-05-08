export const generateRepairerProfilePath = (repairerId: string, businessName?: string) => {
  const slug = businessName 
    ? businessName.toLowerCase()
        .replace(/[àáâãäå]/g, 'a')
        .replace(/[èéêë]/g, 'e')
        .replace(/[ìíîï]/g, 'i')
        .replace(/[òóôõö]/g, 'o')
        .replace(/[ùúûü]/g, 'u')
        .replace(/[ç]/g, 'c')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
    : repairerId;
    
  return `/repairer/${repairerId}/${slug}`;
};

export const parseRepairerProfilePath = (pathname: string) => {
  const match = pathname.match(/^\/repairer\/([^/]+)(?:\/(.+))?$/);
  if (match) {
    return {
      repairerId: match[1],
      slug: match[2] || null
    };
  }
  return null;
};