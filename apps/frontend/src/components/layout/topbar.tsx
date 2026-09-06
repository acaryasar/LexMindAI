"use client";

import { useAuthStore } from "@/stores/auth.store";
import { LogoutButton } from "./logout-button";
import { LanguageSwitcher } from "./language-switcher";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";

export function Topbar() {
  const { user } = useAuthStore();
  const t = useTranslations("topbar");
  const tRole = useTranslations("roles");

  const userName = user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "User";
  const initials = userName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
  const roleName = user?.roles?.[0] ? tRole(user.roles[0]) : "User";

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 gap-4">

      {/* Search */}
      <div className="relative w-72">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          placeholder={t("search")}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition"
        />
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3 ml-auto">
        <LanguageSwitcher />

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200" />

        {/* User info */}
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-semibold">
            {initials}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-800 leading-tight">{userName}</p>
            <p className="text-xs text-slate-400 leading-tight">{roleName}</p>
          </div>
        </div>

        <LogoutButton label={t("logout")} />
      </div>
    </header>
  );
}
