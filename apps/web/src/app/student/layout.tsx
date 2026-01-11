import { ProtectedLayout } from "@/components/layout";
import { UserRole } from "@teachy/db";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedLayout allowedRole={UserRole.STUDENT}>{children}</ProtectedLayout>
  );
}
