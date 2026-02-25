import type { Category } from '@/types';

/** A Category node with its resolved children */
export interface CategoryNode extends Category {
  children: CategoryNode[];
  level: number;
}

/** Build a tree from a flat list of categories */
export function buildCategoryTree(
  categories: Category[],
  parentId: string | null = null,
  level = 0
): CategoryNode[] {
  return categories
    .filter((c) => c.parent_id === parentId)
    .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name))
    .map((c) => ({
      ...c,
      level,
      children: buildCategoryTree(categories, c.id, level + 1),
    }));
}

/** Flatten a tree back to a sorted array (depth-first) */
export function flattenTree(nodes: CategoryNode[]): CategoryNode[] {
  const result: CategoryNode[] = [];
  for (const node of nodes) {
    result.push(node);
    result.push(...flattenTree(node.children));
  }
  return result;
}

/** Get all descendant IDs (including the category itself) */
export function getDescendantIds(
  categories: Category[],
  categoryId: string
): string[] {
  const ids: string[] = [categoryId];
  const children = categories.filter((c) => c.parent_id === categoryId);
  for (const child of children) {
    ids.push(...getDescendantIds(categories, child.id));
  }
  return ids;
}

/** Get ancestor chain from root → current (for breadcrumb) */
export function getAncestors(
  categories: Category[],
  categoryId: string
): Category[] {
  const cat = categories.find((c) => c.id === categoryId);
  if (!cat) return [];
  if (!cat.parent_id) return [cat];
  return [...getAncestors(categories, cat.parent_id), cat];
}

/** Get direct children of a category */
export function getChildren(
  categories: Category[],
  parentId: string | null
): Category[] {
  return categories
    .filter((c) => c.parent_id === parentId)
    .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
}

/** Check if category is a leaf (has no children) */
export function isLeafCategory(
  categories: Category[],
  categoryId: string
): boolean {
  return !categories.some((c) => c.parent_id === categoryId);
}

/** Get only root categories (no parent) */
export function getRootCategories(categories: Category[]): Category[] {
  return categories
    .filter((c) => c.parent_id === null)
    .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
}
