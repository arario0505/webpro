import { useState } from "react";
import StudentInfoForm from "@/components/StudentInfoForm";
import Dashboard from "@/components/Dashboard";
import type { StudentInfo } from "@/components/StudentInfoForm";

const Index = () => {
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);

  if (!studentInfo) {
    return <StudentInfoForm onSubmit={setStudentInfo} />;
  }

  return <Dashboard studentInfo={studentInfo} onBack={() => setStudentInfo(null)} />;
};

export default Index;
