'use client';
// ============================================================
// ADMIN MENU MANAGEMENT PAGE
// ============================================================
// Allows admins to:
// - View all menu items organized by category
// - Add new menu items
// - Edit existing items (name, price, description, image, tags)
// - Toggle item availability (enable/disable without deleting)
// - Delete items
// - Manage categories
//
// Changes here sync with the database in real-time.
// The lib/menuData.ts is used for the INITIAL seed only.
// After that, the database is the source of truth.
// ============================================================

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit2, Trash2, Eye, EyeOff,
  X, Save, Loader2, Star, Upload,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatPrice, cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { MenuItem, Category } from '@/types';

// Empty item form state - used for both create and edit
const EMPTY_ITEM: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'> = {
  category_id: '',
  name: '',              // !! WRITE ITEM NAME HERE !!
  description: '',
  price: 0,              // !! CHANGE PRICE HERE !!
  image_url: '',
  is_available: true,
  is_featured: false,
  tags: [],
  prep_time_minutes: 15,
  calories: null,
  sort_order: 0,
};

// Available tags for menu items
// !! ADD YOUR OWN TAGS HERE !!
const AVAILABLE_TAGS = [
  'popular', 'bestseller', 'new', 'vegetarian', 'vegan',
  'spicy', 'gluten-free', 'healthy', 'premium', 'cold', 'hot', 'seasonal'
];

export default function AdminMenuPage() {
  const supabase = createClient();

  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState(EMPTY_ITEM);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch all items and categories
  const fetchData = async () => {
    const [itemsRes, catsRes] = await Promise.all([
      supabase
        .from('menu_items')
        .select('*, categories(*)')
        .order('sort_order'),
      supabase
        .from('categories')
        .select('*')
        .order('sort_order'),
    ]);
    if (itemsRes.data) setItems(itemsRes.data as MenuItem[]);
    if (catsRes.data)  setCategories(catsRes.data as Category[]);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // Open form to add a new item
  const handleAddNew = () => {
    setEditingItem(null);
    setFormData({
      ...EMPTY_ITEM,
      category_id: selectedCategory !== 'all' ? selectedCategory : (categories[0]?.id || ''),
    });
    setShowForm(true);
  };

  // Open form to edit an existing item
  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      category_id: item.category_id || '',
      name: item.name,
      description: item.description || '',
      price: item.price,
      image_url: item.image_url || '',
      is_available: item.is_available,
      is_featured: item.is_featured,
      tags: item.tags || [],
      prep_time_minutes: item.prep_time_minutes,
      calories: item.calories,
      sort_order: item.sort_order,
    });
    setShowForm(true);
  };

  // Save item (create or update)
  const handleSave = async () => {
    if (!formData.name.trim()) { toast.error('Item name is required'); return; }
    if (!formData.price || formData.price <= 0) { toast.error('Price must be greater than 0'); return; }
    if (!formData.category_id) { toast.error('Please select a category'); return; }

    setIsSaving(true);

    const itemData = {
      category_id: formData.category_id,
      name: formData.name.trim(),
      description: formData.description?.trim() || null,
      price: Number(formData.price),
      image_url: formData.image_url?.trim() || null,
      is_available: formData.is_available,
      is_featured: formData.is_featured,
      tags: formData.tags,
      prep_time_minutes: formData.prep_time_minutes,
      calories: formData.calories || null,
      sort_order: formData.sort_order,
    };

    if (editingItem) {
      // UPDATE existing item
      const { error } = await supabase
        .from('menu_items')
        .update(itemData)
        .eq('id', editingItem.id);

      if (error) {
        toast.error(`Failed to update: ${error.message}`);
      } else {
        toast.success('Item updated successfully!');
        setShowForm(false);
        fetchData();
      }
    } else {
      // INSERT new item
      const { error } = await supabase
        .from('menu_items')
        .insert(itemData);

      if (error) {
        toast.error(`Failed to create: ${error.message}`);
      } else {
        toast.success('Item added to menu!');
        setShowForm(false);
        fetchData();
      }
    }

    setIsSaving(false);
  };

  // Toggle item availability without deleting it
  const handleToggleAvailability = async (item: MenuItem) => {
    const { error } = await supabase
      .from('menu_items')
      .update({ is_available: !item.is_available })
      .eq('id', item.id);

    if (error) {
      toast.error('Failed to update availability');
    } else {
      toast.success(item.is_available ? 'Item hidden from menu' : 'Item now visible on menu');
      fetchData();
    }
  };

  // Delete an item permanently
  const handleDelete = async (item: MenuItem) => {
    if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return;

    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', item.id);

    if (error) {
      toast.error(`Failed to delete: ${error.message}`);
    } else {
      toast.success('Item deleted');
      fetchData();
    }
  };

  // Toggle a tag in the form
  const toggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  // Filter items by selected category
  const filteredItems = selectedCategory === 'all'
    ? items
    : items.filter(item => item.category_id === selectedCategory);

  return (
    <div className="p-6 md:p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white">Menu Management</h1>
          <p className="text-white/40 text-sm mt-1">{items.length} items across {categories.length} categories</p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      {/* Category filter tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6 pb-1">
        <button
          onClick={() => setSelectedCategory('all')}
          className={cn('flex-shrink-0 px-3 py-2 rounded-xl text-sm font-medium transition-all',
            selectedCategory === 'all' ? 'bg-primary-500 text-white' : 'bg-white/5 border border-white/10 text-white/60 hover:text-white')}
        >
          All ({items.length})
        </button>
        {categories.map(cat => {
          const count = items.filter(i => i.category_id === cat.id).length;
          return (
            <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
              className={cn('flex-shrink-0 flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium transition-all',
                selectedCategory === cat.id ? 'bg-primary-500 text-white' : 'bg-white/5 border border-white/10 text-white/60 hover:text-white')}>
              {cat.icon} {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Items grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 bg-white/5 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map(item => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={cn(
                'bg-white/5 border rounded-2xl overflow-hidden',
                !item.is_available ? 'border-white/5 opacity-50' : 'border-white/10'
              )}
            >
              {/* Item image */}
              {item.image_url && (
                <div className="relative h-36 overflow-hidden">
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  {item.is_featured && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-primary-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                      <Star className="w-2.5 h-2.5" /> Featured
                    </div>
                  )}
                  {!item.is_available && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full">Hidden</span>
                    </div>
                  )}
                </div>
              )}

              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-white text-sm leading-tight">{item.name}</h3>
                  <span className="text-primary-400 font-bold text-sm font-mono flex-shrink-0">
                    ${Number(item.price).toFixed(2)}
                  </span>
                </div>
                {item.description && (
                  <p className="text-white/40 text-xs line-clamp-2 mb-3">{item.description}</p>
                )}

                {/* Tags */}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {item.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-white/10 text-white/50 rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex items-center gap-1.5">
                  <button onClick={() => handleEdit(item)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-xs font-medium rounded-lg transition-colors">
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button onClick={() => handleToggleAvailability(item)}
                    className={cn('flex items-center justify-center gap-1 py-1.5 px-2.5 text-xs font-medium rounded-lg transition-colors',
                      item.is_available
                        ? 'bg-white/10 hover:bg-red-500/20 text-white/70 hover:text-red-400'
                        : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                    )}>
                    {item.is_available ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={() => handleDelete(item)}
                    className="flex items-center justify-center p-1.5 bg-white/10 hover:bg-red-500/20 text-white/40 hover:text-red-400 rounded-lg transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ---- ADD/EDIT FORM MODAL ---- */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" />
            
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4"
            >
              <div className="w-full max-w-2xl bg-gray-900 border border-white/20 rounded-3xl overflow-hidden max-h-[90vh] overflow-y-auto">
                {/* Modal header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                  <h2 className="font-display font-bold text-white text-lg">
                    {editingItem ? 'Edit Item' : 'Add New Item'}
                  </h2>
                  <button onClick={() => setShowForm(false)}
                    className="p-2 text-white/40 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form */}
                <div className="p-6 space-y-5">
                  
                  {/* Category */}
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-1.5">Category *</label>
                    <select value={formData.category_id || ""}
                      onChange={e => setFormData(p => ({ ...p, category_id: e.target.value }))}
                      className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                      <option value="">Select category...</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Name + Price row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/70 text-sm font-medium mb-1.5">
                        Item Name * {/* !! WRITE ITEM NAME HERE !! */}
                      </label>
                      <input type="text" value={formData.name}
                        onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                        placeholder="e.g., Classic Burger"
                        className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/30 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                    <div>
                      <label className="block text-white/70 text-sm font-medium mb-1.5">
                        Price * {/* !! CHANGE PRICE HERE !! */}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">$</span>
                        <input type="number" step="0.01" min="0" value={formData.price}
                          onChange={e => setFormData(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
                          placeholder="0.00"
                          className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/30 rounded-xl px-4 py-2.5 pl-7 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-1.5">Description</label>
                    <textarea value={formData.description || ''}
                      onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                      placeholder="Describe the dish..."
                      rows={3}
                      className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/30 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
                  </div>

                  {/* Image URL */}
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-1.5">Image URL</label>
                    <input type="url" value={formData.image_url || ''}
                      onChange={e => setFormData(p => ({ ...p, image_url: e.target.value }))}
                      placeholder="https://... (paste an image URL or Supabase storage URL)"
                      className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/30 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    {/* Image preview */}
                    {formData.image_url && (
                      <img src={formData.image_url} alt="Preview" onError={e => (e.currentTarget.style.display = 'none')}
                        className="mt-2 h-20 rounded-lg object-cover border border-white/10" />
                    )}
                  </div>

                  {/* Prep time + Calories row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/70 text-sm font-medium mb-1.5">Prep Time (min)</label>
                      <input type="number" min="1" value={formData.prep_time_minutes}
                        onChange={e => setFormData(p => ({ ...p, prep_time_minutes: parseInt(e.target.value) || 15 }))}
                        className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                    <div>
                      <label className="block text-white/70 text-sm font-medium mb-1.5">Calories (optional)</label>
                      <input type="number" min="0" value={formData.calories || ''}
                        onChange={e => setFormData(p => ({ ...p, calories: parseInt(e.target.value) || null }))}
                        placeholder="e.g., 450"
                        className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/30 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {AVAILABLE_TAGS.map(tag => (
                        <button key={tag} type="button" onClick={() => toggleTag(tag)}
                          className={cn('px-2.5 py-1 rounded-lg text-xs font-medium transition-all',
                            formData.tags.includes(tag)
                              ? 'bg-primary-500 text-white'
                              : 'bg-white/10 text-white/50 hover:text-white hover:bg-white/20')}>
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Toggles row */}
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div
                        onClick={() => setFormData(p => ({ ...p, is_available: !p.is_available }))}
                        className={cn('w-10 h-6 rounded-full transition-colors relative',
                          formData.is_available ? 'bg-primary-500' : 'bg-white/20')}>
                        <div className={cn('absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                          formData.is_available ? 'left-5' : 'left-1')} />
                      </div>
                      <span className="text-white/70 text-sm">Available</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div
                        onClick={() => setFormData(p => ({ ...p, is_featured: !p.is_featured }))}
                        className={cn('w-10 h-6 rounded-full transition-colors relative',
                          formData.is_featured ? 'bg-amber-500' : 'bg-white/20')}>
                        <div className={cn('absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                          formData.is_featured ? 'left-5' : 'left-1')} />
                      </div>
                      <span className="text-white/70 text-sm">Featured (show on homepage)</span>
                    </label>
                  </div>
                </div>

                {/* Form footer */}
                <div className="flex gap-3 px-6 pb-6">
                  <button onClick={() => setShowForm(false)}
                    className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors text-sm">
                    Cancel
                  </button>
                  <button onClick={handleSave} disabled={isSaving}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-colors text-sm disabled:opacity-60">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {editingItem ? 'Save Changes' : 'Add to Menu'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
