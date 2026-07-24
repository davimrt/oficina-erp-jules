import React from "react";
import Link from "next/link";
import { getServiceOrders } from "../actions/serviceOrders";
import {
  Plus
} from "lucide-react";
import OSListClient from "./os-list-client";

export const dynamic = "force-dynamic";

export default async function OSPage() {
  const serviceOrders = await getServiceOrders();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Ordens de Serviço</h1>
          <p className="mt-1 text-sm text-slate-500">Histórico e acompanhamento de todas as ordens de serviço abertas.</p>
        </div>
        <Link
          href="/os/nova"
          className="inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-all shadow-sm"
        >
          <Plus className="h-4 w-4" /> Nova Ordem de Serviço
        </Link>
      </div>

      <OSListClient initialOrders={serviceOrders} />
    </div>
  );
}
