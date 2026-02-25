'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createCategory, updateCategory, deleteCategory } from '@/services/category.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Pencil, Trash2, X, Package, ChevronDown, ChevronRight, FolderTree } from 'lucide-react';
import { slugify } from '@/lib/utils';
import { SHIPPING_CATEGORY_OPTIONS, SHIPPING_CATEGORY_LABELS } from '@/lib/dc-calculator';
import { buildCategoryTree, flattenTree, type CategoryNode } from '@/lib/category-tree';
import type { Category } from '@/types';

// â”€â”€â”€ Form panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface FormPanelProps {
  editing: Category | null;
  parentId: string | null;
  parentName: string | null;
  allCategories: Category[];
  onClose: () => void;
  onSaved: () => void;
}

function CategoryForm({ editing, parentId, parentName, allCategories, onClose, onSaved }: FormPanelProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(editing?.name ?? '');
  const [slug, setSlug] = useState(editing?.slug ?? '');
  const [defaultShippingCat, setDefaultShippingCat] = useState<Category['default_shipping_category']>(
    editing?.default_shipping_category ?? 'small_parcel'
  );
  const [selectedParentId, setSelectedParentId] = useState<string>(
    editing ? (editing.parent_id ?? '') : (parentId ?? '')
  );

  // Build flat options excluding self and its descendants to avoid cycles
  const selfAndDescendants = new Set<string>();
  if (editing) {
    const tree = buildCategoryTree(allCategories);
    const flat = flattenTree(tree);
    function collectIds(id: string) {
      selfAndDescendants.add(id);
      flat.filter((n) => n.parent_id === id).forEach((n) => collectIds(n.id));
    }
    collectIds(editing.id);
  }

  const parentOptions = allCategories.filter((c) => !selfAndDescendants.has(c.id));

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      // Inject controlled values
      formData.set('name', name);
      formData.set('slug', slug);
      formData.set('default_shipping_category', defaultShippingCat);
      if (selectedParentId) {
        formData.set('parent_id', selectedParentId);
      } else {
        formData.delete('parent_id');
      }
      if (editing) {
        await updateCategory(editing.id, formData);
        toast.success('Category updated!');
      } else {
        await createCategory(formData);
        toast.success('Category created!');
      }
      onSaved();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  const levelLabel = !selectedParentId
    ? 'Main Category (Level 1)'
    : (() => {
        let depth = 1;
        let pid: string | null = selectedParentId;
        while (pid) {
          depth++;
          pid = allCategories.find((c) => c.id === pid)?.parent_id ?? null;
        }
        return `Level ${depth} Category`;
      })();

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-lg">
            {editing ? 'Edit Category' : parentName ? `Add subcategory under "${parentName}"` : 'New Main Category'}
          </CardTitle>
          <p className="text-xs text-gray-500 mt-0.5">{levelLabel}</p>
        </div>
        <button title="Close" onClick={onClose}><X className="h-4 w-4 text-gray-400" /></button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Name *</Label>
            <Input
              name="name" required value={name}
              onChange={(e) => { setName(e.target.value); !editing && setSlug(slugify(e.target.value)); }}
            />
          </div>
          <div className="space-y-1">
            <Label>Slug *</Label>
            <Input name="slug" required value={slug} onChange={(e) => setSlug(e.target.value)} />
          </div>

          {/* Parent category selector */}
          <div className="col-span-2 space-y-1">
            <Label>Parent Category</Label>
            <select
              aria-label="Parent Category"
              value={selectedParentId}
              onChange={(e) => setSelectedParentId(e.target.value)}
              className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">â€” None (Main Category) â€”</option>
              {flattenTree(buildCategoryTree(parentOptions)).map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {'  '.repeat(opt.level)}{'â””â”€ '.repeat(Math.min(opt.level, 1))}{opt.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-2 space-y-1">
            <Label>Description</Label>
            <Textarea name="description" defaultValue={editing?.description ?? ''} />
          </div>

          <div className="col-span-2 space-y-1">
            <Label className="flex items-center gap-1.5"><Package className="h-3.5 w-3.5" /> Default Shipping Category *</Label>
            <select
              name="default_shipping_category"
              aria-label="Default Shipping Category"
              value={defaultShippingCat}
              onChange={(e) => setDefaultShippingCat(e.target.value as Category['default_shipping_category'])}
              className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              required
            >
              {SHIPPING_CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label} â€” {opt.hint}</option>
              ))}
            </select>
            <p className="text-xs text-gray-400">Default DC tier for new products in this category.</p>
          </div>

          <div className="col-span-2 space-y-1">
            <Label>Image</Label>
            <Input name="image" type="file" accept="image/*" />
          </div>

          <div className="col-span-2 flex items-center gap-2">
            <input type="checkbox" name="is_active" value="true" id="cat-active" title="Active" defaultChecked={editing?.is_active ?? true} />
            <Label htmlFor="cat-active">Active (visible in store)</Label>
          </div>

          <div className="col-span-2 flex gap-3">
            <Button type="submit" isLoading={loading}>{editing ? 'Save Changes' : 'Create'}</Button>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// â”€â”€â”€ Tree node row â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface TreeNodeProps {
  node: CategoryNode;
  allCategories: Category[];
  onAddChild: (parentId: string, parentName: string) => void;
  onEdit: (cat: Category) => void;
  onDelete: (id: string, name: string) => void;
}

function TreeNode({ node, allCategories, onAddChild, onEdit, onDelete }: TreeNodeProps) {
  const [open, setOpen] = useState(node.level === 0);
  const hasChildren = node.children.length > 0;

  const levelColors = [
    'bg-blue-50 border-l-4 border-blue-400',
    'bg-indigo-50 border-l-4 border-indigo-300',
    'bg-purple-50 border-l-4 border-purple-200',
  ];
  const levelBadge = ['Main', 'Sub', 'Sub-sub'];

  const levelPadding = ['pl-4', 'pl-10', 'pl-16', 'pl-20'];

  return (
    <div>
      <div
        className={`flex items-center gap-2 py-2.5 pr-4 ${levelPadding[node.level] ?? 'pl-20'} ${node.level === 0 ? levelColors[0] : ''}`}
      >
        {/* Expand toggle */}
        <button
          onClick={() => setOpen((v) => !v)}
          className={`flex-shrink-0 transition-transform ${hasChildren ? 'text-gray-500 hover:text-gray-700' : 'text-transparent pointer-events-none'}`}
          aria-label={open ? 'Collapse' : 'Expand'}
        >
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>

        {/* Image */}
        {node.image_url ? (
          <img src={node.image_url} alt={node.name} className="h-7 w-7 rounded object-cover flex-shrink-0" />
        ) : (
          <div className="h-7 w-7 rounded bg-gray-200 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-gray-500">{node.name.charAt(0)}</span>
          </div>
        )}

        {/* Name + badges */}
        <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
          <span className={`font-medium text-sm ${node.level === 0 ? 'text-gray-900' : node.level === 1 ? 'text-gray-800' : 'text-gray-700'}`}>
            {node.name}
          </span>
          <span className="text-xs text-gray-400 font-mono hidden sm:inline">{node.slug}</span>
          <Badge variant="outline" className="text-[10px] h-4 px-1">
            {levelBadge[node.level] ?? `L${node.level + 1}`}
          </Badge>
          <Badge
            variant={node.default_shipping_category === 'bulky_cargo' ? 'destructive' : node.default_shipping_category === 'medium_parcel' ? 'default' : 'secondary'}
            className="text-[10px] h-4 px-1 hidden sm:flex items-center gap-0.5"
          >
            <Package className="h-2.5 w-2.5" />
            {SHIPPING_CATEGORY_LABELS[node.default_shipping_category ?? 'small_parcel']}
          </Badge>
          {!node.is_active && <Badge variant="secondary" className="text-[10px] h-4 px-1">Inactive</Badge>}
          {hasChildren && (
            <span className="text-xs text-gray-400">{node.children.length} sub</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2 text-xs gap-1"
            onClick={() => onAddChild(node.id, node.name)}
            title="Add subcategory"
          >
            <Plus className="h-3 w-3" /> Sub
          </Button>
          <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => onEdit(node)} title="Edit">
            <Pencil className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="destructive" className="h-7 w-7 p-0" onClick={() => onDelete(node.id, node.name)} title="Delete">
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Children */}
      {open && hasChildren && (
        <div className={`border-l border-gray-100 ml-${Math.min(node.level * 6 + 10, 24)}`}>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              allCategories={allCategories}
              onAddChild={onAddChild}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// â”€â”€â”€ Main Manager â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function CategoriesManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [formParentId, setFormParentId] = useState<string | null>(null);
  const [formParentName, setFormParentName] = useState<string | null>(null);

  const tree = buildCategoryTree(categories);

  function openCreate(parentId: string | null = null, parentName: string | null = null) {
    setEditing(null);
    setFormParentId(parentId);
    setFormParentName(parentName);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    setFormParentId(null);
    setFormParentName(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
    setFormParentId(null);
    setFormParentName(null);
  }

  function onSaved() {
    closeForm();
    router.refresh();
  }

  async function handleDelete(id: string, catName: string) {
    if (!confirm(`Delete "${catName}"? This will also affect its subcategories and products.`)) return;
    try {
      await deleteCategory(id);
      toast.success('Category deleted');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  return (
    <div className="space-y-4">
      {/* Top action bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <FolderTree className="h-4 w-4" />
          <span>{categories.length} categories total</span>
        </div>
        {!showForm && (
          <Button onClick={() => openCreate()}>
            <Plus className="h-4 w-4 mr-1" /> Add Main Category
          </Button>
        )}
      </div>

      {/* Form panel */}
      {showForm && (
        <CategoryForm
          editing={editing}
          parentId={formParentId}
          parentName={formParentName}
          allCategories={categories}
          onClose={closeForm}
          onSaved={onSaved}
        />
      )}

      {/* Tree view */}
      {tree.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center text-gray-400">
          <FolderTree className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No categories yet</p>
          <p className="text-sm mt-1">Click "Add Main Category" to get started.</p>
        </div>
      ) : (
        <div className="rounded-xl border bg-white shadow-sm overflow-hidden divide-y divide-gray-100">
          {tree.map((node) => (
            <TreeNode
              key={node.id}
              node={node}
              allCategories={categories}
              onAddChild={openCreate}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
