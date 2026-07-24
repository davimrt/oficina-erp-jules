"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Trash2,
  Plus,
  Check,
  AlertCircle,
  Wrench,
  User,
  Car,
  DollarSign,
  History,
  Loader2
} from "lucide-react";

interface StatusHistory {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  changedAt: Date;
  notes: string | null;
}

interface ServiceItem {
  id: string;
  description: string;
  price: number;
}

interface PartItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  notes: string | null;
}

interface Vehicle {
  id: string;
  licensePlate: string;
  manufacturer: string;
  model: string;
  year: number | null;
}

interface Mechanic {
  id: string;
  name: string;
}

interface ServiceOrder {
  id: string;
  osNumber: string;
  customerComplaint: string;
  internalDiagnosis: string | null;
  laborPrice: number;
  partsPrice: number;
  totalPrice: number;
  status: string;
  customer: Customer;
  vehicle: Vehicle;
  mechanic: Mechanic | null;
  services: ServiceItem[];
  parts: PartItem[];
  statusHistory: StatusHistory[];
}

interface OSDetailClientProps {
  serviceOrder: ServiceOrder;
  mechanics: Mechanic[];
  onUpdateOS: (data: {
    customerComplaint?: string;
    internalDiagnosis?: string | null;
    laborPrice?: number;
    partsPrice?: number;
    status?: string;
    mechanicId?: string | null;
  }) => Promise<unknown>;
  onAddService: (description: string, price: number) => Promise<unknown>;
  onDeleteService: (itemId: string) => Promise<unknown>;
  onAddPart: (name: string, quantity: number, price: number) => Promise<unknown>;
  onDeletePart: (itemId: string) => Promise<unknown>;
  onDeleteOS: () => Promise<unknown>;
}

export default function OSDetailClient({
  serviceOrder,
  mechanics,
  onUpdateOS,
  onAddService,
  onDeleteService,
  onAddPart,
  onDeletePart,
  onDeleteOS,
}: OSDetailClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Core editable fields
  const [customerComplaint, setCustomerComplaint] = useState(serviceOrder.customerComplaint);
  const [internalDiagnosis, setInternalDiagnosis] = useState(serviceOrder.internalDiagnosis || "");
  const [mechanicId, setMechanicId] = useState(serviceOrder.mechanic?.id || "");
  const [status, setStatus] = useState(serviceOrder.status);

  // New Service Item form
  const [srvDesc, setSrvDesc] = useState("");
  const [srvPrice, setSrvPrice] = useState("");

  // New Part Item form
  const [prtName, setPrtName] = useState("");
  const [prtQty, setPrtQty] = useState("1");
  const [prtPrice, setPrtPrice] = useState("");

  const statusLabels: Record<string, { label: string; color: string; bg?: string; labelOnly: string }> = {
    NEW: { label: "Nova", color: "text-blue-700 bg-blue-50 border-blue-200", labelOnly: "Nova" },
    DIAGNOSING: { label: "Em Diagnóstico", color: "text-amber-700 bg-amber-50 border-amber-200", labelOnly: "Em Diagnóstico" },
    WAITING_FOR_APPROVAL: { label: "Aguardando Aprovação", color: "text-purple-700 bg-purple-50 border-purple-200", labelOnly: "Aguardando Aprovação" },
    APPROVED: { label: "Aprovada", color: "text-indigo-700 bg-indigo-50 border-indigo-200", labelOnly: "Aprovada" },
    IN_PROGRESS: { label: "Em Execução", color: "text-orange-700 bg-orange-50 border-orange-200", labelOnly: "Em Execução" },
    READY: { label: "Pronta", color: "text-emerald-700 bg-emerald-50 border-emerald-200", labelOnly: "Pronta" },
    DELIVERED: { label: "Entregue", color: "text-slate-700 bg-slate-50 border-slate-200", labelOnly: "Entregue" },
  };

  const handleUpdateGeneralInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      try {
        await onUpdateOS({
          customerComplaint,
          internalDiagnosis: internalDiagnosis.trim() === "" ? null : internalDiagnosis,
          mechanicId: mechanicId === "" ? null : mechanicId,
          status,
        });
        setSuccess("Informações atualizadas com sucesso!");
        router.refresh();
        setTimeout(() => setSuccess(null), 3000);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Erro ao salvar informações gerais.");
      }
    });
  };

  const handleStatusChangeDirectly = async (newStatus: string) => {
    setStatus(newStatus);
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      try {
        await onUpdateOS({
          status: newStatus,
        });
        setSuccess(`Status alterado para ${statusLabels[newStatus]?.labelOnly || newStatus}`);
        router.refresh();
        setTimeout(() => setSuccess(null), 3000);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Erro ao atualizar status.");
      }
    });
  };

  const handleAddServiceItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!srvDesc.trim() || !srvPrice.trim()) {
      setError("Preencha descrição e preço do serviço.");
      return;
    }

    const priceNum = parseFloat(srvPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      setError("Insira um preço válido para o serviço.");
      return;
    }

    startTransition(async () => {
      try {
        await onAddService(srvDesc.trim(), priceNum);
        setSrvDesc("");
        setSrvPrice("");
        setSuccess("Serviço adicionado com sucesso!");
        router.refresh();
        setTimeout(() => setSuccess(null), 3000);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Erro ao adicionar serviço.");
      }
    });
  };

  const handleDeleteServiceItem = async (itemId: string) => {
    setError(null);
    startTransition(async () => {
      try {
        await onDeleteService(itemId);
        setSuccess("Serviço removido.");
        router.refresh();
        setTimeout(() => setSuccess(null), 3000);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Erro ao deletar serviço.");
      }
    });
  };

  const handleAddPartItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!prtName.trim() || !prtQty.trim() || !prtPrice.trim()) {
      setError("Preencha todos os campos da peça.");
      return;
    }

    const qtyInt = parseInt(prtQty, 10);
    const priceNum = parseFloat(prtPrice);

    if (isNaN(qtyInt) || qtyInt <= 0) {
      setError("A quantidade deve ser maior que zero.");
      return;
    }
    if (isNaN(priceNum) || priceNum < 0) {
      setError("Preço unitário inválido.");
      return;
    }

    startTransition(async () => {
      try {
        await onAddPart(prtName.trim(), qtyInt, priceNum);
        setPrtName("");
        setPrtQty("1");
        setPrtPrice("");
        setSuccess("Peça adicionada com sucesso!");
        router.refresh();
        setTimeout(() => setSuccess(null), 3000);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Erro ao adicionar peça.");
      }
    });
  };

  const handleDeletePartItem = async (itemId: string) => {
    setError(null);
    startTransition(async () => {
      try {
        await onDeletePart(itemId);
        setSuccess("Peça removida.");
        router.refresh();
        setTimeout(() => setSuccess(null), 3000);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Erro ao deletar peça.");
      }
    });
  };

  const handleDeleteOSComplete = async () => {
    if (!confirm("Tem certeza absoluta que deseja excluir esta ordem de serviço?")) {
      return;
    }

    startTransition(async () => {
      try {
        await onDeleteOS();
        router.push("/os");
        router.refresh();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Erro ao excluir OS.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top bar with back-link & Delete OS button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <Link href="/os" className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
          <ArrowLeft className="h-4.5 w-4.5" /> Voltar para Ordens de Serviço
        </Link>
        <button
          onClick={handleDeleteOSComplete}
          disabled={isPending}
          className="inline-flex items-center justify-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 font-semibold text-xs px-3.5 py-2 rounded-lg border border-rose-200/50 transition-all ml-auto sm:ml-0"
        >
          <Trash2 className="h-4 w-4" /> Excluir OS
        </button>
      </div>

      {/* Main OS Header card with status changer */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div className="space-y-1">
          <span className="text-[10px] sm:text-xs font-black bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-500 uppercase tracking-widest font-mono shadow-sm">
            Ordem de Serviço
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">{serviceOrder.osNumber}</h2>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="text-left sm:text-right">
            <span className="text-[10px] text-slate-400 uppercase font-black block tracking-wider">Status Atual</span>
            <span className={`inline-block text-xs font-extrabold px-3 py-1 rounded-full border mt-1 ${statusLabels[serviceOrder.status]?.color}`}>
              {statusLabels[serviceOrder.status]?.labelOnly || serviceOrder.status}
            </span>
          </div>

          <div className="relative">
            <span className="text-[10px] text-slate-400 uppercase font-black block tracking-wider mb-1">Mudar Status</span>
            <select
              value={status}
              onChange={(e) => handleStatusChangeDirectly(e.target.value)}
              disabled={isPending}
              className="w-full sm:w-auto px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm bg-white font-extrabold text-slate-800 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="NEW">Nova</option>
              <option value="DIAGNOSING">Em Diagnóstico</option>
              <option value="WAITING_FOR_APPROVAL">Aguardando Aprovação</option>
              <option value="APPROVED">Aprovada</option>
              <option value="IN_PROGRESS">Em Execução</option>
              <option value="READY">Pronta (Finalizada)</option>
              <option value="DELIVERED">Entregue (Retirada)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alert notices */}
      {success && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800 shadow-sm animate-in fade-in duration-150">
          <Check className="h-4 w-4 text-emerald-600 shrink-0" />
          {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-800 shadow-sm animate-in fade-in duration-150">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          {error}
        </div>
      )}

      {/* Grid Layout of OS Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
        {/* LEFT COLUMN (2/3 width) - General Info and Forms */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          {/* Quick Customers / Vehicles view details cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Customer card */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-start gap-3">
              <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600">
                <User className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Cliente</span>
                <p className="font-extrabold text-slate-950 text-sm truncate">{serviceOrder.customer.name}</p>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">{serviceOrder.customer.phone}</p>
                {serviceOrder.customer.notes && (
                  <p className="text-[11px] text-slate-400 italic truncate mt-1">Nota: &ldquo;{serviceOrder.customer.notes}&rdquo;</p>
                )}
              </div>
            </div>

            {/* Vehicle card */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-start gap-3">
              <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600">
                <Car className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Veículo</span>
                <p className="font-extrabold text-slate-950 text-sm truncate">{serviceOrder.vehicle.manufacturer} {serviceOrder.vehicle.model}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-xs font-bold bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded text-slate-600">
                    {serviceOrder.vehicle.licensePlate}
                  </span>
                  {serviceOrder.vehicle.year && (
                    <span className="text-xs text-slate-400 font-semibold">Ano: {serviceOrder.vehicle.year}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Form for general complaint, diagnosis and mechanic */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
              <Wrench className="h-5 w-5 text-indigo-500" /> Diagnóstico e Queixas Gerais
            </h3>
            <form onSubmit={handleUpdateGeneralInfo} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Queixa Principal do Cliente</label>
                <textarea
                  required
                  rows={3}
                  value={customerComplaint}
                  onChange={(e) => setCustomerComplaint(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Diagnóstico Interno da Oficina</label>
                <textarea
                  placeholder="Descreva as falhas detectadas no veículo, testes efetuados..."
                  rows={3}
                  value={internalDiagnosis}
                  onChange={(e) => setInternalDiagnosis(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Mecânico Atribuído</label>
                <select
                  value={mechanicId}
                  onChange={(e) => setMechanicId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Não atribuído - Definir depois</option>
                  {mechanics.map((mec) => (
                    <option key={mec.id} value={mec.id}>
                      {mec.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-4 py-2.5 rounded-lg transition-all shadow-sm"
                >
                  {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Salvar Alterações Gerais
                </button>
              </div>
            </form>
          </div>

          {/* ITEMIZATION SECTION: Services and Parts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Services Performed */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5 mb-3 flex items-center justify-between">
                  <span>Mão de Obra / Serviços</span>
                  <span className="text-xs text-slate-400 font-mono">R$ {serviceOrder.laborPrice.toFixed(2)}</span>
                </h3>

                {/* List of current services */}
                <div className="space-y-2 mb-4 max-h-[220px] overflow-y-auto">
                  {serviceOrder.services.length === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center py-4">Nenhum serviço discriminado ainda.</p>
                  ) : (
                    serviceOrder.services.map((srv) => (
                      <div key={srv.id} className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded-lg text-xs hover:bg-slate-100/80">
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 truncate">{srv.description}</p>
                          <p className="text-slate-500 font-mono font-bold">R$ {srv.price.toFixed(2)}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteServiceItem(srv.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-white"
                          title="Remover serviço"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Add Service form */}
              <form onSubmit={handleAddServiceItem} className="border-t border-slate-100 pt-3 space-y-2">
                <input
                  type="text"
                  placeholder="Nova descrição do serviço..."
                  value={srvDesc}
                  onChange={(e) => setSrvDesc(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Valor R$..."
                    value={srvPrice}
                    onChange={(e) => setSrvPrice(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                  <button
                    type="submit"
                    disabled={isPending}
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shrink-0"
                  >
                    <Plus className="h-3 w-3" /> Add
                  </button>
                </div>
              </form>
            </div>

            {/* Parts Used */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5 mb-3 flex items-center justify-between">
                  <span>Peças / Materiais</span>
                  <span className="text-xs text-slate-400 font-mono">R$ {serviceOrder.partsPrice.toFixed(2)}</span>
                </h3>

                {/* List of current parts */}
                <div className="space-y-2 mb-4 max-h-[220px] overflow-y-auto">
                  {serviceOrder.parts.length === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center py-4">Nenhuma peça discriminada ainda.</p>
                  ) : (
                    serviceOrder.parts.map((prt) => (
                      <div key={prt.id} className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded-lg text-xs hover:bg-slate-100/80">
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 truncate">{prt.name}</p>
                          <p className="text-slate-500">
                            {prt.quantity}x de <span className="font-mono font-bold">R$ {prt.price.toFixed(2)}</span>
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeletePartItem(prt.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-white"
                          title="Remover peça"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Add Part form */}
              <form onSubmit={handleAddPartItem} className="border-t border-slate-100 pt-3 space-y-2">
                <input
                  type="text"
                  placeholder="Nome da peça utilizada..."
                  value={prtName}
                  onChange={(e) => setPrtName(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Qtd..."
                    value={prtQty}
                    onChange={(e) => setPrtQty(e.target.value)}
                    className="w-16 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Preço Unit. R$..."
                    value={prtPrice}
                    onChange={(e) => setPrtPrice(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                  <button
                    type="submit"
                    disabled={isPending}
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shrink-0"
                  >
                    <Plus className="h-3 w-3" /> Add
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (1/3 width) - Financial totals & Status History */}
        <div className="space-y-6 sm:space-y-8">
          {/* Calculations / Financial Summary */}
          <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 shadow-lg border border-slate-800">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 border-b border-slate-800 pb-3 mb-4 flex items-center gap-1.5">
              <DollarSign className="h-4.5 w-4.5 text-indigo-400" /> Resumo Financeiro
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center text-slate-400">
                <span>Subtotal Serviços</span>
                <span className="font-mono">R$ {serviceOrder.laborPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Subtotal Peças</span>
                <span className="font-mono">R$ {serviceOrder.partsPrice.toFixed(2)}</span>
              </div>

              <div className="border-t border-slate-800 pt-3 mt-1 flex justify-between items-end">
                <div>
                  <span className="text-[10px] text-indigo-300 font-extrabold uppercase block tracking-widest">Valor Total Geral</span>
                  <span className="text-xs text-slate-500">Calculado automaticamente</span>
                </div>
                <span className="text-2xl font-black text-white font-mono">
                  R$ {serviceOrder.totalPrice.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Status Change history log */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
              <History className="h-4.5 w-4.5 text-slate-500" /> Histórico de Alterações
            </h3>

            <div className="relative border-l-2 border-slate-100 pl-4 space-y-4 max-h-[300px] overflow-y-auto">
              {serviceOrder.statusHistory.map((hist) => {
                const dateFormatted = new Date(hist.changedAt).toLocaleString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                const label = statusLabels[hist.toStatus];

                return (
                  <div key={hist.id} className="relative text-xs">
                    {/* Circle timeline decorator */}
                    <span className="absolute -left-[23px] top-1.5 bg-indigo-600 h-2 w-2 rounded-full ring-4 ring-white"></span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`font-semibold px-1.5 py-0.2 text-[10px] rounded border ${label?.color || "text-slate-600 bg-slate-50 border-slate-200"}`}>
                        {label?.labelOnly || hist.toStatus}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">{dateFormatted}</span>
                    </div>
                    {hist.notes && (
                      <p className="mt-1 text-slate-500 italic text-[11px] leading-relaxed">
                        &ldquo;{hist.notes}&rdquo;
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
