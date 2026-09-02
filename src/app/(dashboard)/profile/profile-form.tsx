"use client";

import { useState } from "react";
import { updateProfileName, changePassword } from "@/app/actions/profile";

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
    <div className="space-y-8">
      <section className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mb-4 text-sm text-neutral-500 dark:text-neutral-400">
          <p>{dict.joinDate}: {new Date(user.createdAt).toLocaleDateString()}</p>
          <p>{dict.totalXp}: {user.xp}</p>
        </div>
        <form onSubmit={handleNameSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{dict.name}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{dict.email}</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full rounded border border-neutral-300 bg-neutral-100 px-3 py-2 text-sm opacity-60 dark:border-neutral-700 dark:bg-neutral-800"
            />
          </div>
          {nameMessage && (
            <p className="text-sm text-green-600 dark:text-green-400">{nameMessage}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-700 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
          >
            {dict.save}
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="mb-4 text-lg font-medium">{dict.changePassword}</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{dict.currentPassword}</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{dict.newPassword}</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
            />
          </div>
          {passwordMessage && (
            <p className="text-sm text-green-600 dark:text-green-400">{passwordMessage}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-700 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
          >
            {dict.changePassword}
          </button>
        </form>
      </section>
    </div>
  );
}
