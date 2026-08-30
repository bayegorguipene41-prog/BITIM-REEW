// 📌 IMPORTA TUTTE LE PROCEDURE
import { procedureItalia } from "./italia";
import { procedureFrancia } from "./francia";
import { procedureGermania } from "./germania";
import { procedureSpagna } from "./spagna";
import { procedureRegnoUnito } from "./RegnoUnito";
import { procedureAustria } from "./austria";
import { procedureBelgio } from "./Belgio";
import { procedureSvizzera } from "./svizzera";
import { procedurePortogallo } from "./Portogallo";
import { procedureIrlanda } from "./Irlanda";
import { procedureSvezia } from "./svezia";
import { procedureStatiUniti } from "./StatiUniti";
import { procedureMarocco } from "./Marocco";
import { procedureAlgeria } from "./Algeria";
import { procedureTunisia } from "./tunisia";
import { procedureSenegal } from "./senegal";
import { procedureCina } from "./cina";
import { procedureMali } from "./Mali";
import { procedurePaesiBassi } from "./PaesiBassi";

// ✅ NUOVA: Importa le procedure dettagliate dell'Italia
import { PROCEDURE_ITALIA } from "./italia";

// 📌 ESPORTA TUTTE INSIEME
export const PROCEDURES = [
  procedureItalia,
  procedureFrancia,
  procedureGermania,
  procedureSpagna,
  procedureRegnoUnito,
  procedureAustria,
  procedureBelgio,
  procedureSvizzera,
  procedurePortogallo,
  procedureIrlanda,
  procedureSvezia,
  procedureStatiUniti,
  procedureMarocco,
  procedureAlgeria,
  procedureTunisia,
  procedureSenegal,
  procedureCina,
  procedureMali,
  procedurePaesiBassi,

  // ✅ Aggiungi qui le procedure dettagliate nuove
  ...PROCEDURE_ITALIA,
];