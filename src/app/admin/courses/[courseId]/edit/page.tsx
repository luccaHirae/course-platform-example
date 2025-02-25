import { notFound } from 'next/navigation';
import { Plus } from 'lucide-react';
import { getCourse } from '@/features/courses/actions/courses';
import { CourseForm } from '@/components/course-form';
import { SectionFormDialog } from '@/components/section-form-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DialogTrigger } from '@/components/ui/dialog';
import { PageHeader } from '@/components/page-header';
import { SortableSectionList } from '@/components/sortable-section-list';

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{
    courseId: string;
  }>;
}) {
  const { courseId } = await params;
  const course = await getCourse(courseId);

  if (!course) return notFound();

  return (
    <div className='custom-container my-6'>
      <PageHeader title={course.name} />

      <Tabs defaultValue='lessons'>
        <TabsList>
          <TabsTrigger value='lessons'>Lessons</TabsTrigger>
          <TabsTrigger value='details'>Details</TabsTrigger>
        </TabsList>

        <TabsContent value='lessons'>
          <Card>
            <CardHeader className='flex items-center flex-row justify-between'>
              <CardTitle>Sections</CardTitle>

              <SectionFormDialog courseId={course.id}>
                <DialogTrigger asChild>
                  <Button variant='outline'>
                    <Plus /> New section
                  </Button>
                </DialogTrigger>
              </SectionFormDialog>
            </CardHeader>

            <CardContent>
              <SortableSectionList
                courseId={course.id}
                sections={course.courseSections}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='details'>
          <Card>
            <CardHeader>
              <CourseForm course={course} />
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
