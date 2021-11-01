export function classNames(
  ...args: (string | undefined | null | false)[]
): string {
  return (
    args.filter((arg) => {
      return arg != null || !arg;
    }) as string[]
  ).join(' ');
}
