// ==========================================
// INDICE — TUTTE LE PROCEDURE
// ==========================================

// 📌 IMPORTA TUTTE LE PROCEDURE — NOMI ESATTI DA GITHUB (MAIUSCOLA INIZIALE)
import { procedureItalia } from "./Italia";
import { procedureFrancia } from "./Francia";
import { procedureGermania } from "./Germania";
import { procedureSpagna } from "./Spagna";
import { procedureRegnoUnito } from "./RegnoUnito";
import { procedureAustria } from "./Austria";
import { procedureBelgio } from "./Belgio";
import { procedureSvizzera } from "./Svizzera";
import { procedurePortogallo } from "./Portogallo";
import { procedureIrlanda } from "./Irlanda";
import { procedureSvezia } from "./Svezia";
import { procedureStatiUniti } from "./StatiUniti";
import { procedureMarocco } from "./Marocco";
import { procedureAlgeria } from "./Algeria";
import { procedureTunisia } from "./Tunisia";
import { procedureSenegal } from "./Senegal";
import { procedureCina } from "./Cina";
import { procedureMali } from "./Mali";
import { procedurePaesiBassi } from "./PaesiBassi";

// ✅ Importa le procedure dettagliate dell'Italia
import { PROCEDURE_ITALIA } from "./Italia";

// 📌 ELENCO COMPLETO DI TUTTE LE PROCEDURE
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

  // ✅ Procedure dettagliate nuove
  ...PROCEDURE_ITALIA,
];