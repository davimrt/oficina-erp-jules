import React from "react";
import Link from "next/link";
import { getServiceOrders } from "./actions/serviceOrders";
import {
  ClipboardList,
  Search,
  Wrench,
  CheckCircle2,
  Clock,
  ArrowRight,
  UserPlus
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const serviceOrders = await getServiceOrders();

  // Status mapping to label
  const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
    NEW: { label: "Nova", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
    DIAGNOSING: { label: "Em Diagnóstico", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
    WAITING_FOR_APPROVAL: { label: "Aguardando Aprovação", color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
    APPROVED: { label: "Aprovada", color: "text-indigo-700", bg: "bg-indigo-50 border-indigo-200" },
    IN_PROGRESS: { label: "Em Execução", color: "text-orange-700", bg: "bg-orange-50 border-orange-200" },
    READY: { label: "Pronta", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
    DELIVERED: { label: "Entregue", color: "text-slate-700", bg: "bg-slate-50 border-slate-200" },
  };

  // 1. Open service orders: Status is not DELIVERED
  const openOrders = serviceOrders.filter((os) => os.status !== "DELIVERED");

  // 2. Vehicles waiting for diagnosis: Status is NEW or DIAGNOSING
  const waitingDiagnosis = serviceOrders.filter((os) => os.status === "NEW" || os.status === "DIAGNOSING");

  // 3. Services in progress: Status is IN_PROGRESS
  const inProgress = serviceOrders.filter((os) => os.status === "IN_PROGRESS");

  // 4. Vehicles ready for delivery: Status is READY
  const readyForDelivery = serviceOrders.filter((os) => os.status === "READY");

  const stats = [
    {
      name: "Ordens de Serviço Ativas",
      value: openOrders.length,
      icon: ClipboardList,
      color: "text-blue-600 bg-blue-50 border-blue-100",
      description: "Todas exceto as entregues",
    },
    {
      name: "Aguardando Diagnóstico",
      value: waitingDiagnosis.length,
      icon: Search,
      color: "text-amber-600 bg-amber-50 border-amber-100",
      description: "Novas ou em diagnóstico",
    },
    {
      name: "Serviços em Execução",
      value: inProgress.length,
      icon: Wrench,
      color: "text-orange-600 bg-orange-50 border-orange-100",
      description: "Em andamento na oficina",
    },
    {
      name: "Prontos para Entrega",
      value: readyForDelivery.length,
      icon: CheckCircle2,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
      description: "Aguardando retirada",
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Painel de Controle</h1>
          <p className="mt-1 text-sm text-slate-500">Visão geral do andamento da sua oficina mecânica em tempo real.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Link
            href="/os/nova"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 shadow-sm transition-all"
          >
            <Wrench className="h-4 w-4" /> Abertura Rápida OS
          </Link>
          <Link
            href="/clientes"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-lg bg-white border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
          >
            <UserPlus className="h-4 w-4" /> Novo Cliente
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{stat.name}</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl border ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-400">{stat.description}</p>
          </div>
        ))}
      </div>

      {/* Split details columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Waiting for Diagnosis column */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col">
          <div className="border-b border-slate-100 px-5 py-4 flex items-center justify-between bg-slate-50/50 rounded-t-xl">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
              Aguardando Diagnóstico ({waitingDiagnosis.length})
            </h2>
            <Link href="/os" className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 flex items-center gap-1">
              Ver todas <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="p-4 flex-1 space-y-3 max-h-[380px] overflow-y-auto">
            {waitingDiagnosis.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                Nenhum veículo aguardando diagnóstico.
              </div>
            ) : (
              waitingDiagnosis.map((os) => {
                const label = statusLabels[os.status];
                return (
                  <Link
                    key={os.id}
                    href={`/os/${os.id}`}
                    className="block p-3.5 rounded-lg border border-slate-100 hover:border-indigo-300 hover:shadow-sm transition-all bg-slate-50/20 hover:bg-white group"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="font-bold text-slate-900 text-sm">
                        {os.vehicle.manufacturer} {os.vehicle.model}
                        <span className="ml-2 font-mono text-xs bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-600">
                          {os.vehicle.licensePlate}
                        </span>
                      </div>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${label?.bg} ${label?.color}`}>
                        {label?.label}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-slate-500 line-clamp-2">
                      <strong className="text-slate-700">Queixa:</strong> {os.customerComplaint}
                    </p>
                    <div className="mt-2.5 flex justify-between items-center text-[11px] text-slate-400">
                      <span>Cliente: {os.customer.name}</span>
                      <span className="group-hover:text-indigo-600 font-medium flex items-center gap-1 transition-colors">
                        Gerenciar <Clock className="h-3 w-3" />
                      </span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Services in Progress column */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col">
          <div className="border-b border-slate-100 px-5 py-4 flex items-center justify-between bg-slate-50/50 rounded-t-xl">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-orange-500"></span>
              Serviços em Execução ({inProgress.length})
            </h2>
            <Link href="/os" className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 flex items-center gap-1">
              Ver todas <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="p-4 flex-1 space-y-3 max-h-[380px] overflow-y-auto">
            {inProgress.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                Nenhum serviço em andamento no momento.
              </div>
            ) : (
              inProgress.map((os) => {
                const label = statusLabels[os.status];
                return (
                  <Link
                    key={os.id}
                    href={`/os/${os.id}`}
                    className="block p-3.5 rounded-lg border border-slate-100 hover:border-indigo-300 hover:shadow-sm transition-all bg-slate-50/20 hover:bg-white group"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="font-bold text-slate-900 text-sm">
                        {os.vehicle.manufacturer} {os.vehicle.model}
                        <span className="ml-2 font-mono text-xs bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-600">
                          {os.vehicle.licensePlate}
                        </span>
                      </div>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${label?.bg} ${label?.color}`}>
                        {label?.label}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-slate-500 flex flex-col gap-0.5">
                      <p><strong className="text-slate-700">Mecânico:</strong> {os.mechanic?.name || "Não atribuído"}</p>
                      <p><strong className="text-slate-700">Total:</strong> R$ {os.totalPrice.toFixed(2)}</p>
                    </div>
                    <div className="mt-2.5 flex justify-between items-center text-[11px] text-slate-400">
                      <span>Cliente: {os.customer.name}</span>
                      <span className="group-hover:text-indigo-600 font-medium flex items-center gap-1 transition-colors">
                        Gerenciar <Clock className="h-3 w-3" />
                      </span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Vehicles Ready for Delivery column */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col lg:col-span-2">
          <div className="border-b border-slate-100 px-5 py-4 flex items-center justify-between bg-slate-50/50 rounded-t-xl">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
              Veículos Prontos para Entrega ({readyForDelivery.length})
            </h2>
            <Link href="/os" className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 flex items-center gap-1">
              Ver todas <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="p-4 flex-1 space-y-3 max-h-[380px] overflow-y-auto">
            {readyForDelivery.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                Nenhum veículo pronto para retirada.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {readyForDelivery.map((os) => {
                  const label = statusLabels[os.status];
                  return (
                    <Link
                      key={os.id}
                      href={`/os/${os.id}`}
                      className="block p-4 rounded-lg border border-slate-100 hover:border-indigo-300 hover:shadow-sm transition-all bg-slate-50/20 hover:bg-white group"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="font-bold text-slate-900 text-sm">
                          {os.vehicle.manufacturer} {os.vehicle.model}
                          <span className="ml-2 font-mono text-xs bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-600">
                            {os.vehicle.licensePlate}
                          </span>
                        </div>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${label?.bg} ${label?.color}`}>
                          {label?.label}
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-slate-500 space-y-1">
                        <p><strong className="text-slate-700">Cliente:</strong> {os.customer.name} - {os.customer.phone}</p>
                        <p><strong className="text-slate-700">Total a Pagar:</strong> R$ {os.totalPrice.toFixed(2)}</p>
                      </div>
                      <div className="mt-3 flex justify-between items-center text-xs text-indigo-600 font-semibold pt-2 border-t border-slate-100 group-hover:text-indigo-500">
                        <span>Ver detalhes da entrega</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
