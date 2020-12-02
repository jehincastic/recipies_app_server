import { format } from 'date-fns';

export const formatDate = (dateString: string) => format(
  new Date(dateString), 'yyyy-MM-dd kk:mm:ss.sss',
);
