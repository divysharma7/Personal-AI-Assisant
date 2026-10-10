import { MistralHero } from "../components/landing/MistralHero";
import { ProblemSection } from "../components/ProblemSection";
import { SystemSection } from "../components/SystemSection";
import { WorkflowSection } from "../components/WorkflowSection";
import { ProductShowcase } from "../components/ProductShowcase";
import { FeatureShowcase } from "../components/showcase/FeatureShowcase";
import { showcases } from "../data/showcases";
import { BlueVisual } from "../components/showcase/visuals/BlueVisual";
import { LightVisual } from "../components/showcase/visuals/LightVisual";
import { GoldVisual } from "../components/showcase/visuals/GoldVisual";
import { DarkVisual } from "../components/showcase/visuals/DarkVisual";
import { ProductDemo } from "../components/ProductDemo";
import { UseCaseSection } from "../components/UseCaseSection";
import { ComparisonSection } from "../components/ComparisonSection";
import { TestimonialSection } from "../components/TestimonialSection";
import { FAQAccordion } from "../components/FAQAccordion";
import { FinalCTA } from "../components/FinalCTA";

const visuals = [
  <BlueVisual key="blue" />,
  <LightVisual key="light" />,
  <GoldVisual key="gold" />,
  <DarkVisual key="dark" />,
];

export default function HomePage() {
  return (
    <>
      <MistralHero />
      <ProblemSection />
      <SystemSection />
      <WorkflowSection />
      <ProductShowcase />
      {showcases.map((data, i) => (
        <FeatureShowcase key={data.theme} data={data}>
          {visuals[i]}
        </FeatureShowcase>
      ))}
      <ProductDemo />
      <UseCaseSection />
      <ComparisonSection />
      <TestimonialSection />
      <FAQAccordion />
      <FinalCTA />
    </>
  );
}