// ==========================================
// CONDITION ENGINE — unico sistema di condizioni
// ==========================================

// Il contesto è una mappa piatta campo → valore, costruita dal questionario utente.
// Nome del campo usato da una condizione = chiave di questo oggetto.
export type ConditionContext = Record<string, unknown>;

export type ConditionOperator =
  | "eq"
  | "neq"
  | "in"
  | "not_in"
  | "gte"
  | "lte"
  | "gt"
  | "lt"
  | "contains";

export type ConditionValue =
  | string
  | number
  | boolean
  | undefined
  | null
  | Array<string | number | boolean>;

// Modello unico di condizione, riutilizzato da Procedure e Documenti.
export interface Condition {
  field: string;
  operator: ConditionOperator;
  value: ConditionValue;
}

// Qualsiasi entità che possa dichiarare una condizione opzionale di applicabilità.
export interface Conditioned {
  condition?: Condition;
}

function getField(context: ConditionContext, field: string): unknown {
  return context[field];
}

function isComparableNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function compareEquals(actual: unknown, expected: ConditionValue): boolean {
  return actual === expected;
}

function compareNumeric(actual: unknown, expected: ConditionValue, test: (a: number, b: number) => boolean): boolean {
  if (!isComparableNumber(actual) || !isComparableNumber(expected)) return false;
  return test(actual, expected);
}

function toArray(value: ConditionValue): Array<string | number | boolean> {
  return Array.isArray(value) ? value : [];
}

// contains: se il valore nel contesto è una stringa → sottostringa;
// se è un array → appartenenza (strict). Altrimenti false.
function compareContains(actual: unknown, expected: ConditionValue): boolean {
  if (typeof actual === "string") {
    return typeof expected === "string" && actual.includes(expected);
  }
  if (Array.isArray(actual)) {
    return actual.includes(expected);
  }
  return false;
}

export function evaluateCondition(condition: Condition, context: ConditionContext): boolean {
  const actual = getField(context, condition.field);
  const expected = condition.value;

  switch (condition.operator) {
    case "eq":
      return compareEquals(actual, expected);
    case "neq":
      return !compareEquals(actual, expected);
    case "in":
      // Se actual e un array, verifica se QUALSIASI elemento e presente in expected.
      // Se actual e un singolo valore, verifica se e presente in expected.
      if (Array.isArray(actual)) {
        const expectedArr = toArray(expected);
        return actual.some((v) => expectedArr.includes(v));
      }
      return toArray(expected).includes(actual as string | number | boolean);
    case "not_in":
      // Contrario di in: true se NESSUN elemento di actual e in expected.
      if (Array.isArray(actual)) {
        const expectedArr = toArray(expected);
        return !actual.some((v) => expectedArr.includes(v));
      }
      return !toArray(expected).includes(actual as string | number | boolean);
    case "gte":
      return compareNumeric(actual, expected, (a, b) => a >= b);
    case "lte":
      return compareNumeric(actual, expected, (a, b) => a <= b);
    case "gt":
      return compareNumeric(actual, expected, (a, b) => a > b);
    case "lt":
      return compareNumeric(actual, expected, (a, b) => a < b);
    case "contains":
      return compareContains(actual, expected);
    default:
      return false;
  }
}

// Applicabilità generica: senza condizione → true;
// con condizione → esito della valutazione.
export function isApplicable<T extends Conditioned>(
  entity: T,
  context: ConditionContext
): boolean {
  return entity.condition ? evaluateCondition(entity.condition, context) : true;
}

export function applicableOf<T extends Conditioned>(
  entities: readonly T[],
  context: ConditionContext
): T[] {
  return entities.filter((e) => isApplicable(e, context));
}

import { resolveNationalityGroups } from "./db/nationality-groups";

// Costruisce il contesto condizioni a partire da un profilo/questionario utente.
// I campi non presenti nel profilo restano undefined (una condizione che li
// verifica con eq/neq produce rispettivamente false/true senza eccezioni).
export function conditionContextFromProfile(profile: Record<string, unknown>): ConditionContext {
  return {
    age: profile.age,
    maritalStatus: profile.maritalStatus,
    employment: profile.employment,
    nationality: profile.nationality,
    nationalityGroup: resolveNationalityGroups(profile.nationality as string),
    destination: profile.destination ?? profile.country,
    category: profile.category,
    situation: profile.situation,
  };
}
