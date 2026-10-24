import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Category } from '../../types';
import { Plus, Edit, Trash2, Eye, EyeOff, Image as ImageIcon, Check, X } from 'lucide-react';

export const AdminCategories: React.FC = () => {
  const { categories, products, addCategory, updateCategory, deleteCategory } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    displayOrder: 1,
    isPublished: true,
  });

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
      displayOrder: categories.length + 1,
      isPublished: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      image: cat.image,
      displayOrder: cat.displayOrder,
      isPublished: cat.isPublished,
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      updateCategory(editingCategory.id, formData);
    } else {
      addCategory({
        ...formData,
        slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    const productsInCat = products.filter((p) => p.categoryId === id);
    if (productsInCat.length > 0) {
      alert(`Cannot delete category because ${productsInCat.length} products belong to it. Reassign or delete products first.`);
      return;
    }
    if (confirm('Delete this category?')) {
      deleteCategory(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold font-serif-luxury text-slate-900">
            Product Category Architecture
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize framing collections, upload collection cover art, and reorder homepage showcases.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
        {categories.map((cat) => {
          const productCount = products.filter((p) => p.categoryId === cat.id).length;
          return (
            <div
              key={cat.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-16/9 bg-slate-100 overflow-hidden">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-mono-numbers px-2 py-0.5 rounded">
                    Order: #{cat.displayOrder}
                  </div>
                  <div className="absolute top-2 right-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        cat.isPublished ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {cat.isPublished ? 'Visible' : 'Hidden'}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-1.5">
                  <h3 className="font-bold text-sm text-slate-900">{cat.name}</h3>
                  <p className="text-[11px] text-slate-500 font-mono-numbers">
                    {productCount} active products in catalog
                  </p>
                  <p className="text-slate-600 text-[11px] line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => updateCategory(cat.id, { isPublished: !cat.isPublished })}
                  className="text-slate-500 hover:text-slate-800 flex items-center gap-1 text-[11px] cursor-pointer"
                >
                  {cat.isPublished ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{cat.isPublished ? 'Hide' : 'Show'}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-white cursor-pointer"
                    title="Edit Category"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white cursor-pointer"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 relative text-xs space-y-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="font-bold font-serif-luxury text-slate-900 text-base">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h3>
              <p className="text-slate-500 mt-0.5">Define name, description, and cover image.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Wedding Photo Frames"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Short description for website visitors"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cover Image URL</label>
                <input
                  type="url"
                  required
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Display Order</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.displayOrder}
                  onChange={(e) =>
                    setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono-numbers"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-0"
                  />
                  <span>Publish category to storefront navigation</span>
                </label>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
