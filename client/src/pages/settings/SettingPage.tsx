import { useState, useEffect } from 'react';
import { useBranding } from '../../context/BrandingContext';
import * as settingsService from '../../services/settings.services';
import { Input } from '../../components/UI/Input';
import { Button } from '../../components/UI/Buttons';


export function SettingsPage() {
  const { branding, refetch } = useBranding();

  const [appTitle, setAppTitle] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#2563EB');
  const [secondaryColor, setSecondaryColor] = useState('#7C3AED');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (branding) {
      setAppTitle(branding.app_title || '');
      setLogoUrl(branding.logo_url || '');
      setPrimaryColor(branding.primary_color || '#2563EB');
      setSecondaryColor(branding.secondary_color || '#7C3AED');
    }
  }, [branding]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await settingsService.updateSettings({
        app_title: appTitle,
        logo_url: logoUrl || null,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
      });
      await refetch(); // pulls new branding + applies CSS vars live
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Branding</h1>
        <p className="text-sm text-slate-500">Customize how your portal looks to your team and visitors.</p>
      </div>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}
      {saved && (
        <div className="rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          Branding updated.
        </div>
      )}

      <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-5">
        <Input
          label="App title"
          value={appTitle}
          onChange={(e) => setAppTitle(e.target.value)}
          placeholder="Acme Document Portal"
        />
        <Input
          label="Logo URL"
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          placeholder="https://storage.provider.com/tenants/101/logo.png"
        />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Primary color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-9 w-12 cursor-pointer rounded border border-slate-300"
              />
              <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="flex-1" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Secondary color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="h-9 w-12 cursor-pointer rounded border border-slate-300"
              />
              <Input value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="flex-1" />
            </div>
          </div>
        </div>

        {/* live preview */}
        <div className="space-y-2 border-t border-slate-100 pt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Preview</p>
          <div className="flex items-center gap-2">
            <button
              className="rounded px-4 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: primaryColor }}
            >
              Primary button
            </button>
            <button
              className="rounded px-4 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: secondaryColor }}
            >
              Secondary button
            </button>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-100 pt-4">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}