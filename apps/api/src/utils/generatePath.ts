import { compile } from 'path-to-regexp';

function generatePath(
  path: string,
  params: Record<string, string | number> = {},
) {
  return path === '/' ? path : compile(path)(params);
}

export default generatePath;
