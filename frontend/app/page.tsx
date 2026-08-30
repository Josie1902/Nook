import { AppShell } from "@/components/features/layout/AppShell";
import { HomeView } from "@/components/features/home/HomeView";

export default async function Home() {

  return (
    <AppShell>
      <div className="space-y-12">
        <HomeView/>
      </div>
    </AppShell>
  );
}