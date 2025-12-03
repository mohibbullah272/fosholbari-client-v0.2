import ProjectCard from "./ProjectCard";
import { IProject } from '../../types/index';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export const dynamic = "force-static";

const RecentProject = async () => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/project/all?limit=3`, {
      cache: "force-cache"
    });

    // Check if response is ok
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const result = await res.json();

    // Check if API response is successful
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch projects');
    }

    // Check if data exists and is an array
    const projects = result.data || [];

    return (
      <div className="max-w-7xl mx-auto my-20">
        <h3 className="text-4xl text-center my-10 font-bold">চলমান প্রকল্প</h3>

        {projects.length === 0 ? (
          <div className="text-center py-10">
            <Alert className="max-w-md mx-auto bg-muted">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                কোনো প্রকল্প পাওয়া যায়নি। নতুন প্রকল্প যুক্ত করুন।
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 place-content-center items-center lg:gap-5 md:gap-10 gap-15 px-5">
            {projects.map((project: IProject) => (
              <ProjectCard project={project} key={project?.id} />
            ))}
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Error fetching projects:', error);
    
    return (
      <div className="max-w-7xl mx-auto my-20">
        <h3 className="text-4xl text-center my-10 font-bold">চলমান প্রকল্প</h3>
        
        <div className="text-center py-10">
          <Alert variant="destructive" className="max-w-md mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              প্রকল্প লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }
};

export default RecentProject;