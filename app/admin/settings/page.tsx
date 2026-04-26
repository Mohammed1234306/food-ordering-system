'use client';
// ============================================================
// ADMIN SETTINGS PAGE
// ============================================================
// Configure restaurant-wide settings:
// - Restaurant name, tagline, address, contact
// - Delivery fee and minimum order
// - Open/closed toggle
// - Alert sound selection (3 built-in + custom URL)
// - Alert volume slider
// - Currency symbol
// - Delivery time range
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Bell, Volume2, Save, Loader2, ExternalLink,
  Store, Clock, Truck, DollarSign, Phone, Mail, MapPin, Globe,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { ALERT_SOUNDS } from '@/hooks/useRealtimeOrders';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { RestaurantSettings } from '@/types';

// The 3 built-in alert sounds
// !! REPLACE THESE with your actual sound file URLs !!
// Place .mp3 files in /public/sounds/ folder
// Or use external CDN URLs
const BUILT_IN_SOUNDS: {
  key: string;
  label: string;
  emoji: string;
  description: string;
}[] = [
  {
    key: 'bell1',
    label: 'Classic Bell',
    emoji: '🔔',
    description: 'Traditional restaurant bell',
  },
  {
    key: 'bell2',
    label: 'Chime',
    emoji: '🎵',
    description: 'Soft notification chime',
  },
  {
    key: 'bell3',
    label: 'Alert',
    emoji: '⚡',
    description: 'Urgent alert tone',
  },
];

export default function AdminSettingsPage() {
  const supabase = createClient();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load settings from database
  useEffect(() => {
    supabase
      .from('restaurant_settings')
      .select('*')
      .eq('id', 1)
      .single()
      .then(({ data }) => {
        if (data) setSettings(data as RestaurantSettings);
        setLoading(false);
      });
  }, []);

  // Generic field update helper
  const updateField = (field: keyof RestaurantSettings, value: unknown) => {
    setSettings(prev => prev ? { ...prev, [field]: value } : prev);
  };

  // Play a preview of the selected alert sound
  const previewSound = (soundKey: string) => {
    const soundUrl = ALERT_SOUNDS[soundKey as keyof typeof ALERT_SOUNDS] || soundKey;
    if (!audioRef.current) {
      audioRef.current = new Audio(soundUrl);
    } else {
      audioRef.current.src = soundUrl;
    }
    audioRef.current.volume = settings?.alert_volume || 0.8;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {
      toast.error('Could not play sound. Please interact with the page first.');
    });
  };

  // Save all settings to the database
  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);

    const { error } = await supabase
      .from('restaurant_settings')
      .update({
        restaurant_name: settings.restaurant_name,
        tagline: settings.tagline,
        delivery_fee: settings.delivery_fee,
        min_order_amount: settings.min_order_amount,
        delivery_time_min: settings.delivery_time_min,
        delivery_time_max: settings.delivery_time_max,
        is_open: settings.is_open,
        alert_sound: settings.alert_sound,
        alert_volume: settings.alert_volume,
        restaurant_address: settings.restaurant_address,
        restaurant_phone: settings.restaurant_phone,
        restaurant_email: settings.restaurant_email,
        instagram_url: settings.instagram_url,
        facebook_url: settings.facebook_url,
        currency_symbol: settings.currency_symbol,
        require_phone: settings.require_phone,
      })
      .eq('id', 1);

    if (error) {
      toast.error(`Failed to save: ${error.message}`);
    } else {
      toast.success('Settings saved successfully!');
    }

    setIsSaving(false);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="p-8 text-white/60 text-center">
        <p>Failed to load settings. Please refresh the page.</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl">

      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white">Settings</h1>
          <p className="text-white/40 text-sm mt-1">Configure your restaurant</p>
        </div>
        <button onClick={handleSave} disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-60 text-sm">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      <div className="space-y-6">

        {/* ---- STORE STATUS ---- */}
        <SettingSection title="Store Status" icon={<Store className="w-4 h-4 text-green-400" />}>
          <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
            <div>
              <p className="text-white font-medium text-sm">Store is {settings.is_open ? 'OPEN' : 'CLOSED'}</p>
              <p className="text-white/40 text-xs mt-0.5">
                {settings.is_open
                  ? 'Customers can place orders'
                  : 'Customers cannot place orders'}
              </p>
            </div>
            <ToggleSwitch
              checked={settings.is_open}
              onChange={v => updateField('is_open', v)}
              color="green"
            />
          </div>
        </SettingSection>

        {/* ---- RESTAURANT INFO ---- */}
        <SettingSection title="Restaurant Information" icon={<Store className="w-4 h-4 text-blue-400" />}>
          <div className="space-y-4">
            <SettingInput
              label="Restaurant Name"
              value={settings.restaurant_name}
              onChange={v => updateField('restaurant_name', v)}
              placeholder="RESTAURANT_NAME_HERE"
            />
            <SettingInput
              label="Tagline"
              value={settings.tagline}
              onChange={v => updateField('tagline', v)}
              placeholder="Delicious food, delivered fast"
            />
            <SettingInput
              label="Address"
              value={settings.restaurant_address}
              onChange={v => updateField('restaurant_address', v)}
              placeholder="123 Food Street, City, Country"
              icon={<MapPin className="w-4 h-4" />}
            />
            <div className="grid grid-cols-2 gap-4">
              <SettingInput
                label="Phone"
                value={settings.restaurant_phone}
                onChange={v => updateField('restaurant_phone', v)}
                placeholder="+1 234 567 8900"
                icon={<Phone className="w-4 h-4" />}
              />
              <SettingInput
                label="Email"
                value={settings.restaurant_email}
                onChange={v => updateField('restaurant_email', v)}
                placeholder="hello@restaurant.com"
                icon={<Mail className="w-4 h-4" />}
              />
            </div>
          </div>
        </SettingSection>

        {/* ---- DELIVERY SETTINGS ---- */}
        <SettingSection title="Delivery Settings" icon={<Truck className="w-4 h-4 text-amber-400" />}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/60 text-xs mb-1.5">Delivery Fee ($)</label>
              <input
                type="number" step="0.01" min="0"
                value={settings.delivery_fee}
                onChange={e => updateField('delivery_fee', parseFloat(e.target.value) || 0)}
                className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-white/60 text-xs mb-1.5">Min Order Amount ($)</label>
              <input
                type="number" step="0.01" min="0"
                value={settings.min_order_amount}
                onChange={e => updateField('min_order_amount', parseFloat(e.target.value) || 0)}
                className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-white/60 text-xs mb-1.5">Delivery Time Min (min)</label>
              <input
                type="number" min="1"
                value={settings.delivery_time_min}
                onChange={e => updateField('delivery_time_min', parseInt(e.target.value) || 25)}
                className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-white/60 text-xs mb-1.5">Delivery Time Max (min)</label>
              <input
                type="number" min="1"
                value={settings.delivery_time_max}
                onChange={e => updateField('delivery_time_max', parseInt(e.target.value) || 45)}
                className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-white/60 text-xs mb-1.5">
              Currency Symbol {/* !! CHANGE THIS to your currency !! */}
            </label>
            <input
              type="text" maxLength={3}
              value={settings.currency_symbol}
              onChange={e => updateField('currency_symbol', e.target.value)}
              placeholder="$"
              className="w-24 bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </SettingSection>

        {/* ---- ALERT SOUND SETTINGS ---- */}
        <SettingSection
          title="New Order Alert Sound"
          icon={<Bell className="w-4 h-4 text-primary-400" />}
        >
          <p className="text-white/40 text-xs mb-4">
            This sound plays in the browser when a new order comes in.
            You must interact with the page first for audio to work (browser requirement).
          </p>

          {/* Built-in sound options */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            {BUILT_IN_SOUNDS.map(sound => (
              <div
                key={sound.key}
                className={cn(
                  'p-4 rounded-xl border cursor-pointer transition-all',
                  settings.alert_sound === sound.key
                    ? 'bg-primary-500/20 border-primary-500 text-white'
                    : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30 hover:text-white'
                )}
                onClick={() => updateField('alert_sound', sound.key)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-2xl">{sound.emoji}</span>
                  {settings.alert_sound === sound.key && (
                    <div className="w-2 h-2 rounded-full bg-primary-400" />
                  )}
                </div>
                <p className="font-medium text-sm">{sound.label}</p>
                <p className="text-xs opacity-60 mt-0.5">{sound.description}</p>
                <button
                  onClick={e => { e.stopPropagation(); previewSound(sound.key); }}
                  className="mt-3 text-xs px-2 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  ▶ Preview
                </button>
              </div>
            ))}
          </div>

          {/* Custom sound URL option */}
          <div className="mb-4">
            <label className="block text-white/60 text-xs mb-1.5">
              Or use custom sound URL (MP3/OGG):
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={['bell1','bell2','bell3'].includes(settings.alert_sound) ? '' : settings.alert_sound}
                onChange={e => updateField('alert_sound', e.target.value || 'bell1')}
                placeholder="https://example.com/alert.mp3"
                className="flex-1 bg-white/10 border border-white/20 text-white placeholder:text-white/30 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {!['bell1','bell2','bell3'].includes(settings.alert_sound) && (
                <button
                  onClick={() => previewSound(settings.alert_sound)}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm transition-colors"
                >
                  ▶ Test
                </button>
              )}
            </div>
          </div>

          {/* Volume slider */}
          <div>
            <label className="flex items-center gap-2 text-white/60 text-xs mb-2">
              <Volume2 className="w-3.5 h-3.5" />
              Alert Volume: {Math.round(Number(settings.alert_volume) * 100)}%
            </label>
            <input
              type="range" min="0" max="1" step="0.05"
              value={settings.alert_volume}
              onChange={e => updateField('alert_volume', parseFloat(e.target.value))}
              className="w-full accent-primary-500"
            />
          </div>
        </SettingSection>

        {/* ---- SOCIAL LINKS ---- */}
        <SettingSection title="Social Media" icon={<Globe className="w-4 h-4 text-pink-400" />}>
          <div className="space-y-4">
            <SettingInput
              label="Instagram URL"
              value={settings.instagram_url}
              onChange={v => updateField('instagram_url', v)}
              placeholder="https://instagram.com/your_restaurant"
            />
            <SettingInput
              label="Facebook URL"
              value={settings.facebook_url}
              onChange={v => updateField('facebook_url', v)}
              placeholder="https://facebook.com/your_restaurant"
            />
          </div>
        </SettingSection>

        {/* How to make yourself admin */}
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
          <p className="text-blue-400 text-sm font-medium mb-1">💡 How to add more admins</p>
          <p className="text-blue-300/70 text-xs">
            Run this SQL in your Supabase SQL Editor:
          </p>
          <code className="block mt-2 p-2 bg-blue-950/50 rounded-lg text-xs text-blue-300 font-mono">
            UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@example.com';
          </code>
        </div>
      </div>

      {/* Save button at the bottom too */}
      <div className="mt-8 flex justify-end">
        <button onClick={handleSave} disabled={isSaving}
          className="flex items-center gap-2 px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-all hover:shadow-warm disabled:opacity-60">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save All Settings
        </button>
      </div>
    </div>
  );
}

// ============================================================
// HELPER SUB-COMPONENTS
// ============================================================

function SettingSection({ title, icon, children }: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
      <h2 className="flex items-center gap-2 text-white font-semibold text-sm mb-4">
        {icon}
        {title}
      </h2>
      {children}
    </div>
  );
}

function SettingInput({ label, value, onChange, placeholder, icon }: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-white/60 text-xs mb-1.5">{label}</label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">{icon}</span>
        )}
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'w-full bg-white/10 border border-white/20 text-white placeholder:text-white/30 rounded-xl py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500',
            icon ? 'pl-10 pr-4' : 'px-4'
          )}
        />
      </div>
    </div>
  );
}

function ToggleSwitch({ checked, onChange, color = 'primary' }: {
  checked: boolean;
  onChange: (v: boolean) => void;
  color?: string;
}) {
  const bgColor = checked
    ? color === 'green' ? 'bg-green-500' : 'bg-primary-500'
    : 'bg-white/20';

  return (
    <div onClick={() => onChange(!checked)} className={cn('w-12 h-6 rounded-full cursor-pointer relative transition-colors', bgColor)}>
      <div className={cn('absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform', checked ? 'left-7' : 'left-1')} />
    </div>
  );
}
