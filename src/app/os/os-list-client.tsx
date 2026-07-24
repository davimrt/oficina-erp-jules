"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  ArrowRight,
  Calendar
} from "lucide-react";

interface Customer {
  name: string;
  phone: string;
}

interface Vehicle {
  licensePlate: string;
  manufacturer: string;
  model: string;
}

interface Mechanic {
  name: string;
}

interface ServiceOrder {
  id: string;
  osNumber: string;
  customerComplaint: string;
  status: string;
  totalPrice: number;
  createdAt: Date;
  customer: Customer;
  vehicle: Vehicle;
  mechanic: Mechanic | null;
}

interface OSListClientProps {
  initialOrders: ServiceOrder[];
}

export default function OSListClient({ initialOrders }: OSListClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
    NEW: { label: "Nova", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
    DIAGNOSING: { label: "Em Diagnóstico", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
    WAITING_FOR_APPROVAL: { label: "Aguardando Aprovação", color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
    APPROVED: { label: "Aprovada", color: "text-indigo-700", bg: "bg-indigo-50 border-indigo-200" },
    IN_PROGRESS: { label: "Em Execução", color: "text-orange-700", bg: "bg-orange-50 border-orange-200" },
    READY: { label: "Pronta", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
    DELIVERED: { label: "Entregue", color: "text-slate-700", bg: "bg-slate-50 border-slate-200" },
  };

  const filteredOrders = initialOrders.filter((os) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      os.osNumber.toLowerCase().includes(term) ||
      os.customer.name.toLowerCase().includes(term) ||
      os.vehicle.licensePlate.toLowerCase().includes(term) ||
      os.vehicle.manufacturer.toLowerCase().includes(term) ||
      os.vehicle.model.toLowerCase().includes(term);

    const matchesStatus = statusFilter === "" || os.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por Nº OS, cliente, placa ou veículo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 hover:bg-slate-50/50"
          />
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Todos os Status</option>
            <option value="NEW">Nova</option>
            <option value="DIAGNOSING">Em Diagnóstico</option>
            <option value="WAITING_FOR_APPROVAL">Aguardando Aprovação</option>
            <option value="APPROVED">Aprovada</option>
            <option value="IN_PROGRESS">Em Execução</option>
            <option value="READY">Pronta</option>
            <option value="DELIVERED">Entregue</option>
          </select>
        </div>
      </div>

      {/* Orders List / Cards */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            Nenhuma ordem de serviço encontrada.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredOrders.map((os) => {
              const label = statusLabels[os.status];
              const dateFormatted = new Date(os.createdAt).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              });

              return (
                <div key={os.id} className="p-4 sm:p-5 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-black text-slate-900 text-sm bg-slate-100 border border-slate-200 px-2 py-0.5 rounded shadow-sm">
                        {os.osNumber}
                      </span>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${label?.bg} ${label?.color}`}>
                        {label?.label}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 shrink-0" /> {dateFormatted}
                      </span>
                    </div>

                    <div className="font-bold text-slate-800 text-sm sm:text-base flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span>{os.vehicle.manufacturer} {os.vehicle.model}</span>
                      <span className="font-mono text-xs text-slate-500 bg-slate-50 px-1.5 py-0.2 rounded border border-slate-200">
                        {os.vehicle.licensePlate}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 flex flex-col sm:flex-row sm:gap-x-4 gap-y-0.5">
                      <p><span className="font-bold text-slate-600">Cliente:</span> {os.customer.name}</p>
                      {os.mechanic && (
                        <p><span className="font-bold text-slate-600">Mecânico:</span> {os.mechanic.name}</p>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 truncate max-w-xl italic">
                      &ldquo;{os.customerComplaint}&rdquo;
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-slate-100 sm:border-0 pt-3 sm:pt-0 shrink-0">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">Valor Total</span>
                      <span className="font-black text-slate-900 text-sm sm:text-base">
                        R$ {os.totalPrice.toFixed(2)}
                      </span>
                    </div>
                    <Link
                      href={`/os/${os.id}`}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/50 text-indigo-700 font-semibold text-xs sm:text-sm px-3.5 py-2 transition-all"
                    >
                      Gerenciar <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
