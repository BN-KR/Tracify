import Link from "next/link";

import { StatusScene, statusButton, statusButtonGhost } from "@/components/brand/status-scene";

export default function DashboardNotFound() {
  return (
    <div className="flex justify-center px-4 py-10 sm:px-6">
      <StatusScene
        compact
        code="404"
        label="dashboard"
        title="Nothing traced here."
        body="This view may have moved, or the project is no longer available."
        broken
        actions={
          <>
            <Link href="/dashboard" className={statusButton}>Back to projects</Link>
            <Link href="/" className={statusButtonGhost}>Home</Link>
          </>
        }
      />
    </div>
  );
}
