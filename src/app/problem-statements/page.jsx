import ProblemStatementsPublicView from "../../components/problem-statements/ProblemStatementsPublicView";
import { getProblemStatementCatalog } from "../../../lib/server/problem-statements";

export default function ProblemStatementsPage() {
  const statements = getProblemStatementCatalog();

  return <ProblemStatementsPublicView statements={statements} />;
}
