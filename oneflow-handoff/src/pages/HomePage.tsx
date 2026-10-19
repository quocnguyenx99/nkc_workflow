import '@/home.css';
import '@/home-v3.css';
import { HomeNav } from '@/components/home/HomeNav';
import {
  DepartmentNetworkSection,
  FinalCTA,
  HeroSection,
  HomeFooter,
  ProcessSection,
  ProofStrip,
  TransformationSection,
  WorkflowStorySection,
} from '@/components/home/HomeSections';

export default function HomePage() {
  return (
    <div className="home-v2 home-v3">
      <div className="home-v3__signal-spine" aria-hidden="true"><i /><i /><i /></div>
      <HomeNav />
      <main>
        <HeroSection />
        <ProofStrip />
        <TransformationSection />
        <WorkflowStorySection />
        <DepartmentNetworkSection />
        <ProcessSection />
        <FinalCTA />
      </main>
      <HomeFooter />
    </div>
  );
}
