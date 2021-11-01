import queryString from 'query-string';
import { useLocation } from 'react-router-dom';

export function useQueryParams() {
  return queryString.parse(useLocation().search);
}
