import React, { useState, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import {
  Plus,
  Search,
  SlidersHorizontal,
  Edit,
  Trash2,
  Copy,
  Upload,
  Check,
  X,
  Eye,
  EyeOff,
  Star,
  Download,
  AlertTriangle,
  ArrowUpDown,
  Image as ImageIcon,
} from 'lucide-react';

export const AdminProducts: React.FC = () => {
  const {
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    duplicateProduct,
    updateStock,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStockStatus, setSelectedStockStatus] = useState<string>('all');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Bulk selection
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Form Fields State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    categoryId: categories[0]?.id || '',
    description: '',
    frameSize: '12x18 inch',
    material: 'Burma Solid Teak',
    color: 'Natural Honey Teak',
    availableVariants: ['8x10 inch', '12x18 inch', '16x20 inch'],
    sellingPrice: 1999,
    discountPrice: 1499,
    productionCost: 500,
    stockQuantity: 25,
    productionTime: '24-48 Hours',
    isAvailable: true,
    isFeatured: false,
    isPublished: true,
    images: [] as string[],
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtered products
  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) return false;
    if (selectedStockStatus === 'low' && p.stockQuantity > 5) return false;
    if (selectedStockStatus === 'out' && p.stockQuantity > 0) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: `PFS-WD-${Math.floor(100 + Math.random() * 900)}`,
      categoryId: categories[0]?.id || '',
      description: '',
      frameSize: '12x18 inch',
      material: 'Kiln-Dried Solid Teakwood',
      color: 'Natural Walnut',
      availableVariants: ['8x10 inch', '12x18 inch', '16x20 inch'],
      sellingPrice: 1899,
      discountPrice: 1499,
      productionCost: 520,
      stockQuantity: 20,
      productionTime: '24 Hours',
      isAvailable: true,
      isFeatured: false,
      isPublished: true,
      images: [
        'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
      ],
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      categoryId: product.categoryId,
      description: product.description,
      frameSize: product.frameSize,
      material: product.material,
      color: product.color,
      availableVariants: product.availableVariants || [product.frameSize],
      sellingPrice: product.sellingPrice,
      discountPrice: product.discountPrice,
      productionCost: product.productionCost,
      stockQuantity: product.stockQuantity,
      productionTime: product.productionTime,
      isAvailable: product.isAvailable,
      isFeatured: product.isFeatured,
      isPublished: product.isPublished,
      images: [...product.images],
    });
    setIsFormOpen(true);
  };

  // Mobile / Desktop Image File Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setFormData((prev) => ({
            ...prev,
            images: [reader.result as string, ...prev.images],
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== index),
    }));
  };

  const handleSetPrimaryImage = (index: number) => {
    setFormData((prev) => {
      const reordered = [...prev.images];
      const [chosen] = reordered.splice(index, 1);
      return { ...prev, images: [chosen, ...reordered] };
    });
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const cat = categories.find((c) => c.id === formData.categoryId);

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        ...formData,
        categoryName: cat?.name || 'Standard Frames',
      });
    } else {
      addProduct({
        ...formData,
        slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        categoryName: cat?.name || 'Standard Frames',
      });
    }

    setIsFormOpen(false);
  };

  // Bulk actions
  const handleBulkPublish = (publish: boolean) => {
    selectedProductIds.forEach((id) => {
      updateProduct(id, { isPublished: publish });
    });
    setSelectedProductIds([]);
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedProductIds.length} selected frames?`)) {
      selectedProductIds.forEach((id) => deleteProduct(id));
      setSelectedProductIds([]);
    }
  };

  const handleExportCatalogJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(products, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `agifthub_catalog_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold font-serif-luxury text-slate-900">
            Catalog & Product Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage picture frame models, update stock, upload high-res gallery images, and configure pricing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCatalogJSON}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Export catalog as JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Catalog</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, SKU..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
          >
            <option value="all">All Categories ({products.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStockStatus}
            onChange={(e) => setSelectedStockStatus(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
          >
            <option value="all">All Stock Statuses</option>
            <option value="low">Low Stock (≤ 5 units)</option>
            <option value="out">Out of Stock (0 units)</option>
          </select>
        </div>
      </div>

      {/* Bulk Operations Strip */}
      {selectedProductIds.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between text-xs animate-in fade-in">
          <span className="font-semibold text-emerald-900">
            {selectedProductIds.length} frame(s) selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkPublish(true)}
              className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-800 rounded font-medium border border-emerald-300"
            >
              Publish Selected
            </button>
            <button
              onClick={() => handleBulkPublish(false)}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-800 rounded font-medium border border-slate-300"
            >
              Unpublish Selected
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-medium"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Products Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 w-8">
                  <input
                    type="checkbox"
                    checked={
                      selectedProductIds.length > 0 &&
                      selectedProductIds.length === filteredProducts.length
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProductIds(filteredProducts.map((p) => p.id));
                      } else {
                        setSelectedProductIds([]);
                      }
                    }}
                    className="rounded text-emerald-600 focus:ring-0"
                  />
                </th>
                <th className="py-3 px-2 w-12">Photo</th>
                <th className="py-3 px-3">Product Name & SKU</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Size & Material</th>
                <th className="py-3 px-3 text-right">Selling (₹)</th>
                <th className="py-3 px-3 text-right">Prod Cost</th>
                <th className="py-3 px-3 text-center">Stock</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((product) => {
                const isSelected = selectedProductIds.includes(product.id);
                return (
                  <tr
                    key={product.id}
                    className={`hover:bg-slate-50/60 transition-colors ${
                      isSelected ? 'bg-emerald-50/30' : ''
                    }`}
                  >
                    <td className="py-3 px-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProductIds([...selectedProductIds, product.id]);
                          } else {
                            setSelectedProductIds(selectedProductIds.filter((id) => id !== product.id));
                          }
                        }}
                        className="rounded text-emerald-600 focus:ring-0"
                      />
                    </td>
                    <td className="py-3 px-2">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">{product.name}</span>
                        {product.isFeatured && (
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                        )}
                      </div>
                      <span className="text-[10px] font-mono-numbers text-slate-400">
                        {product.sku}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-medium">
                      {product.categoryName}
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      <span className="font-mono-numbers">{product.frameSize}</span>
                      <span className="block text-[10px] text-slate-400">{product.material}</span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono-numbers font-bold text-slate-900">
                      ₹{product.discountPrice.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-mono-numbers text-slate-500">
                      ₹{product.productionCost}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <input
                        type="number"
                        min="0"
                        value={product.stockQuantity}
                        onChange={(e) => updateStock(product.id, parseInt(e.target.value) || 0)}
                        className={`w-14 text-center py-1 font-mono-numbers font-bold rounded border ${
                          product.stockQuantity <= 5
                            ? 'border-amber-300 text-amber-800 bg-amber-50'
                            : 'border-slate-200 text-slate-800'
                        }`}
                      />
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() =>
                          updateProduct(product.id, { isPublished: !product.isPublished })
                        }
                        className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                          product.isPublished
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {product.isPublished ? 'Live' : 'Draft'}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(product)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-slate-100 cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => duplicateProduct(product.id)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-slate-100 cursor-pointer"
                          title="Duplicate Product"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(product.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-xl border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Confirm Product Deletion</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete this photo frame? Historical customer orders and invoices will remain intact.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteProduct(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg text-xs"
              >
                Delete Frame
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 my-8 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsFormOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <h3 className="font-bold font-serif-luxury text-slate-900 text-lg">
                  {editingProduct ? 'Edit Picture Frame' : 'Add New Picture Frame'}
                </h3>
                <p className="text-slate-500">
                  Fill in frame mouldings, photo sizes, pricing, and stock details.
                </p>
              </div>

              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Royal Teakwood Heritage Frame"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">SKU / Product Code</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="PFS-WD-101"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono-numbers"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Handcrafted solid timber specifications, matting, optical glass type..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Primary Frame Size</label>
                  <input
                    type="text"
                    required
                    value={formData.frameSize}
                    onChange={(e) => setFormData({ ...formData, frameSize: e.target.value })}
                    placeholder="12x18 inch"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono-numbers"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Material & Wood</label>
                  <input
                    type="text"
                    required
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    placeholder="Kiln-Dried Solid Teak"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Finish Color</label>
                  <input
                    type="text"
                    required
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="Espresso Walnut / Gold Bevel"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stockQuantity}
                    onChange={(e) =>
                      setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono-numbers"
                  />
                </div>
              </div>

              {/* Financial & Pricing Section */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/90 grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.discountPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, discountPrice: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-mono-numbers font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">MRP Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.sellingPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-mono-numbers"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Production Cost (₹)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.productionCost}
                    onChange={(e) =>
                      setFormData({ ...formData, productionCost: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-mono-numbers text-slate-600"
                  />
                  <span className="text-[10px] text-slate-400">Admin only</span>
                </div>
              </div>

              {/* Mobile Friendly Image Upload Section */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Product Images (Mobile Upload & Reorder)</span>
                  </label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                  </button>
                </div>

                {/* Thumbnails list */}
                <div className="flex flex-wrap gap-3">
                  {formData.images.map((img, idx) => (
                    <div
                      key={idx}
                      className="w-20 h-20 rounded-xl overflow-hidden border border-slate-300 relative group bg-white shadow-xs"
                    >
                      <img src={img} alt="Product preview" className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute top-1 left-1 bg-emerald-600 text-white text-[8px] font-bold px-1 rounded">
                          Main
                        </span>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 transition-opacity">
                        {idx !== 0 && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryImage(idx)}
                            className="p-1 bg-white rounded text-slate-800 hover:bg-emerald-50 text-[10px]"
                            title="Make Main Image"
                          >
                            ⭐
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="p-1 bg-white rounded text-rose-600 hover:bg-rose-50 text-[10px]"
                          title="Delete image"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-0"
                  />
                  <span>Publish to Public Storefront</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-0"
                  />
                  <span>Mark as Featured Best-Seller</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
