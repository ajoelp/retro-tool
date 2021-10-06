import { formatDistance, parseISO } from 'date-fns';

export const dateAgo = (date: string) => {
  return formatDistance(parseISO(date), new Date());
};
