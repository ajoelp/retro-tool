import queryString from 'query-string';
import { useLocation } from 'react-router-dom';
import { useMemo } from 'react';

export function useQueryParams() {
  const { search } = useLocation();
  return useMemo(() => {
    return queryString.parse(search);
  }, [search]);
}
