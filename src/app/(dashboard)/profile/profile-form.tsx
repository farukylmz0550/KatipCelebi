"use client";

import { useState } from "react";
import { User, Mail, Lock, Save, Calendar, Zap } from "lucide-react";
import { updateProfileName, changePassword } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type User = {
  name: string;
  email: string;
  xp: number;
  createdAt: string;
};

type Dict = {
  name: string;
  email: string;
  save: string;
  currentPassword: string;
  newPassword: string;
  changePassword: string;
  passwordSuccess: string;
  nameSuccess: string;
  joinDate: string;
  totalXp: string;
};

export function ProfileForm({ user, dict }: { user: User; dict: Dict }) {
  const [name, setName] = useState(user.name);
  const [nameMessage, setNameMessage] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleNameSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setNameMessage("");
    const result = await updateProfileName(name);
    if (result.ok) setNameMessage(dict.nameSuccess);
    else if (result.error) setNameMessage(result.error);
    setLoading(false);
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setPasswordMessage("");
    const result = await changePassword({ currentPassword, newPassword });
    if (result.ok) {
      setPasswordMessage(dict.passwordSuccess);
      setCurrentPassword("");
      setNewPassword("");
    } else if (result.error) setPasswordMessage(result.error);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User size={28} />
          </div>
          <div>
            <p className="text-lg font-medium">{user.name}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {dict.joinDate}: {new Date(user.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Zap size={14} />
                {dict.totalXp}: {user.xp}
              </span>
            </div>
          </div>
        </div>
        <form onSubmit={handleNameSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-1.5">
              <User size={14} className="text-muted-foreground" />
              {dict.name}
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-1.5">
              <Mail size={14} className="text-muted-foreground" />
              {dict.email}
            </Label>
            <Input
              id="email"
              type="email"
              value={user.email}
              disabled
              className="opacity-60"
            />
          </div>
          {nameMessage && (
            <p className="text-sm text-green-600 dark:text-green-400">{nameMessage}</p>
          )}
          <Button type="submit" disabled={loading}>
            <Save size={14} />
            {dict.save}
          </Button>
        </form>
      </section>

      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-medium">
          <Lock size={18} className="text-muted-foreground" />
          {dict.changePassword}
        </h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">{dict.currentPassword}</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">{dict.newPassword}</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          {passwordMessage && (
            <p className="text-sm text-green-600 dark:text-green-400">{passwordMessage}</p>
          )}
          <Button type="submit" disabled={loading} variant="outline">
            <Lock size={14} />
            {dict.changePassword}
          </Button>
        </form>
      </section>
    </div>
  );
}
