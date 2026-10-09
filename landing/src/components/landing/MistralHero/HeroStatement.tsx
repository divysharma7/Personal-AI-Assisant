import { heroCopy } from "./heroContent";

export function HeroStatement() {
  return (
    <div className="heroStatement">
      <h2 className="statementText">{heroCopy.statement}</h2>
    </div>
  );
}
