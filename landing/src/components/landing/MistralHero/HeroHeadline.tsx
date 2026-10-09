import { heroCopy } from "./heroContent";

export function HeroHeadline() {
  const { eyebrow, title, subtitle } = heroCopy.headline;

  return (
    <div className="heroHeadline">
      <p className="heroEyebrow">{eyebrow}</p>
      <h1 className="heroTitle">{title}</h1>
      <p className="heroSubtitle">{subtitle}</p>
    </div>
  );
}
