import { clsx, type ClassValue } from 'clsx';
import { toast } from 'sonner';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function actionToast({
  error,
  message,
}: {
  error?: boolean;
  message?: string;
}) {
  return toast(error ? 'Error' : 'Success', {
    description: message,
    closeButton: true,
  });
}

export function formatPlural(
  count: number,
  { singular, plural }: { singular: string; plural: string },
  { includeCount = true } = {}
) {
  const label = count === 1 ? singular : plural;

  return includeCount ? `${count} ${label}` : label;
}

export function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
