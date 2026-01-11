import { ProtectedLayout } from "@/components/ProtectedLayout";
import { UserRole } from "@teachy/db";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedLayout allowedRole={UserRole.TEACHER}>{children}</ProtectedLayout>
  );
}
