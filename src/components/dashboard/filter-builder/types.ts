export type FilterValueType = "string" | "number" | "select";

export type FilterOperator =
  | "="
  | "contains"
  | "!="
  | ">"
  | ">="
  | "<"
  | "<="
  | "any of"
  | "none of";

export const OPERATOR_LABEL: Record<FilterOperator, string> = {
  "=": "is",
  contains: "contains",
  "!=": "is not",
  ">": ">",
  ">=": "≥",
  "<": "<",
  "<=": "≤",
  "any of": "any of",
  "none of": "none of",
};

/** Every operator a column type could offer in principle. */
export const OPERATORS_BY_TYPE: Record<FilterValueType, FilterOperator[]> = {
  string: ["=", "contains", "!="],
  number: ["=", "!=", ">", ">=", "<", "<="],
  select: ["any of", "none of"],
};

export interface FilterColumnDef {
  id: string;
  name: string;
  type: FilterValueType;
  options?: string[];
  /**
   * Restricts which operators this column actually supports — a column
   * backed by an exact-match query field (e.g. a Convex `q.eq`) should only
   * offer "=", not "contains", so the UI never implies behavior the backend
   * doesn't have. Defaults to every operator for the column's type.
   */
  allowedOperators?: FilterOperator[];
}

export interface FilterCondition {
  /** Local row id (not the column id) — stable across reorders/edits. */
  id: string;
  column: string;
  operator: FilterOperator;
  value: string | number | string[];
}

export function operatorsForColumn(column: FilterColumnDef): FilterOperator[] {
  return column.allowedOperators ?? OPERATORS_BY_TYPE[column.type];
}

export function defaultOperatorForColumn(column: FilterColumnDef): FilterOperator {
  return operatorsForColumn(column)[0]!;
}

export function defaultValueForColumn(column: FilterColumnDef): FilterCondition["value"] {
  if (column.type === "select") return [];
  if (column.type === "number") return "";
  return "";
}

export function emptyCondition(column: FilterColumnDef): FilterCondition {
  return {
    id: crypto.randomUUID(),
    column: column.id,
    operator: defaultOperatorForColumn(column),
    value: defaultValueForColumn(column),
  };
}

/** True once a condition has enough of a value to be worth applying. */
export function isConditionActive(condition: FilterCondition): boolean {
  if (Array.isArray(condition.value)) return condition.value.length > 0;
  return String(condition.value).trim().length > 0;
}
