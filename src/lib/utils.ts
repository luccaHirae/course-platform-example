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

export function formatPrice(amount: number, { showZeroAsNumber = false } = {}) {
  const formatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  });

  if (amount === 0 && !showZeroAsNumber) return 'Free';

  return formatter.format(amount);
}

const DATE_FORMATTER = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export function formatDate(date: Date) {
  return DATE_FORMATTER.format(date);
}

export function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function mapCourse(
  course: {
    id: string;
    name: string;
    courseSections: Array<{
      id: string;
      name: string;
      lessons: Array<{
        id: string;
        name: string;
      }>;
    }>;
  },
  completedLessonsIds: Array<string>
) {
  return {
    ...course,
    courseSections: course.courseSections.map((section) => ({
      ...section,
      lessons: section.lessons.map((lesson) => ({
        ...lesson,
        isComplete: completedLessonsIds.includes(lesson.id),
      })),
    })),
  };
}
