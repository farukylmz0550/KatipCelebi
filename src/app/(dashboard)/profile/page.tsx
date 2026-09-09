import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getDictionary } from "@/i18n/get-dictionary";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const dict = await getDictionary();
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, xp: true, createdAt: true },
  });

  if (!user) redirect("/login");

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-[var(--font-serif)] text-2xl font-semibold tracking-tight text-foreground">
          {dict.profile?.title ?? "Profile"}
        </h1>
        <p className="font-[var(--font-sans)] text-sm text-muted-foreground">
          {user.email} · {dict.profile?.joinDate ?? "Joined"} {new Date(user.createdAt).toLocaleDateString()}
        </p>
      </header>
      <ProfileForm
        user={{ name: user.name, email: user.email, xp: user.xp, createdAt: user.createdAt.toISOString() }}
        dict={{
          name: dict.profile?.name ?? "Name",
          email: dict.profile?.email ?? "Email",
          save: dict.profile?.save ?? "Save",
          currentPassword: dict.profile?.currentPassword ?? "Current password",
          newPassword: dict.profile?.newPassword ?? "New password",
          changePassword: dict.profile?.changePassword ?? "Change password",
          passwordSuccess: dict.profile?.passwordSuccess ?? "Password updated",
          nameSuccess: dict.profile?.nameSuccess ?? "Name updated",
          joinDate: dict.profile?.joinDate ?? "Joined",
          totalXp: dict.profile?.totalXp ?? "Total XP",
        }}
      />
    </div>
  );
}
