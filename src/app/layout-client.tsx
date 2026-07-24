"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Wrench,
  Users,
  Car,
  PlusCircle,
  LayoutDashboard,
  ClipboardList,
  Menu,
  X
} from "lucide-react";

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    { name: "Painel", href: "/", icon: LayoutDashboard },
    { name: "Nova OS", href: "/os/nova", icon: PlusCircle, highlight: true },
    { name: "Ordens de Serviço", href: "/os", icon: ClipboardList },
    { name: "Clientes", href: "/clientes", icon: Users },
    { name: "Veículos", href: "/veiculos", icon: Car },
  ];

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-slate-900 text-slate-100 z-30">
        <div className="flex h-16 shrink-0 items-center gap-2 px-6 border-b border-slate-800">
          <Wrench className="h-6 w-6 text-indigo-400" />
          <span className="font-bold text-lg tracking-wider">Oficina ERP</span>
        </div>
        <nav className="flex-1 space-y-1 px-4 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                  item.highlight
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/20"
                    : isActive
                    ? "bg-slate-800 text-indigo-400"
                    : "text-slate-300 hover:bg-slate-800 hover:text-slate-100"
                }`}
              >
                <item.icon className={`h-5 w-5 shrink-0 ${item.highlight ? "" : isActive ? "text-indigo-400" : "text-slate-400 group-hover:text-slate-300"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
          Oficina ERP MVP v1.0
        </div>
      </aside>

      {/* Header - Mobile */}
      <header className="md:hidden flex h-16 items-center justify-between bg-slate-900 text-slate-100 px-4 shrink-0 border-b border-slate-800 sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2">
          <Wrench className="h-6 w-6 text-indigo-400" />
          <span className="font-bold text-lg tracking-wider">Oficina ERP</span>
        </Link>
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-100 focus:outline-none"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Mobile Menu Backdrop & Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-slate-900/60" onClick={toggleMobileMenu} />
          <div className="relative flex w-full max-w-xs flex-col bg-slate-900 text-slate-100 h-full p-4 shadow-xl z-50">
            <div className="flex h-12 items-center justify-between mb-4 border-b border-slate-800 pb-2">
              <span className="font-bold text-lg tracking-wider flex items-center gap-2">
                <Wrench className="h-5 w-5 text-indigo-400" /> Oficina ERP
              </span>
              <button onClick={toggleMobileMenu} className="p-2 text-slate-400 hover:text-slate-100">
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex-1 space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                      item.highlight
                        ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md"
                        : isActive
                        ? "bg-slate-800 text-indigo-400"
                        : "text-slate-300 hover:bg-slate-800 hover:text-slate-100"
                    }`}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="pt-4 border-t border-slate-800 text-xs text-slate-500 text-center">
              Oficina ERP MVP v1.0
            </div>
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <main className="flex-1 md:pl-64 flex flex-col bg-slate-50 min-h-0">
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto flex-1 flex flex-col">
          {children}
        </div>
      </main>
    </div>
  );
}
