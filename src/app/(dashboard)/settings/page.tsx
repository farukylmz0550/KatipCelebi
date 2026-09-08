import { getDictionary } from "@/i18n/get-dictionary";
import { SettingsForm } from "./settings-form";
import { getSettings } from "@/app/actions/settings";
import { getTheme } from "@/lib/theme";

export default async function SettingsPage() {
  const dict = await getDictionary();
  const settings = await getSettings();
  const theme = await getTheme();

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold">{dict.nav.settings}</h1>
      <SettingsForm settings={settings} currentTheme={theme} />
    </div>
  );
}
