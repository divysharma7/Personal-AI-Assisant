import { heroCopy, panelFeatures } from "./heroContent";

export function ProductPanel() {
  return (
    <div className="productPanel">
      <div className="panelLead">
        <p className="panelEyebrow">{heroCopy.panel.eyebrow}</p>
        <p className="panelMission">{heroCopy.panel.mission}</p>
      </div>
      <ul className="panelFeatures">
        {panelFeatures.map((feature) => (
          <li className="panelFeature" key={feature.title}>
            <span className="featureSymbol">{feature.symbol}</span>
            <div>
              <h3 className="featureTitle">{feature.title}</h3>
              <p className="featureDetail">{feature.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
