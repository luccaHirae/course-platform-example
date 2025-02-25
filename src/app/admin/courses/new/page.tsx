import { CourseForm } from '@/components/course/course-form';
import { PageHeader } from '@/components/page-header';

export default function NewCoursePage() {
  return (
    <div className='custom-container my-6'>
      <PageHeader title='New Course' />

      <CourseForm />
    </div>
  );
}
