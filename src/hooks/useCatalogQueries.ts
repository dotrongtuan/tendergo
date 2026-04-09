import { useQuery } from '@tanstack/react-query';

import { learningRepository } from '../services/repositories/learningRepository';

export function useCatalogQuery() {
  return useQuery({
    queryKey: ['catalog'],
    queryFn: () => learningRepository.getCatalog(),
  });
}

export function useSearchQuery(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => learningRepository.searchCatalog(query),
    enabled: query.trim().length > 1,
  });
}
