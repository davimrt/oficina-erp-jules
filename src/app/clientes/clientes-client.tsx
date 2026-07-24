"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Check,
  AlertCircle,
  Phone,
  FileText,
  ChevronDown,
  ChevronUp,
  Loader2
} from "lucide-react";

interface Customer {
  id: string;
  name: string;
  phone: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ClientesClientProps {
  initialCustomers: Customer[];
  onCreate: (data: { name: string; phone: string; notes?: string | null }) => Promise<unknown>;
  onUpdate: (id: string, data: { name: string; phone: string; notes?: string | null }) => Promise<unknown>;
  onDelete: (id: string) => Promise<unknown>;
}

export default function ClientesClient({
  initialCustomers,
  onCreate,
  onUpdate,
  onDelete,
}: ClientesClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Expanded customer state
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const filteredCustomers = initialCustomers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
  );

  const resetForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setName("");
    setPhone("");
    setNotes("");
    setError(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (customer: Customer, e: React.MouseEvent) => {
    e.stopPropagation();
    setName(customer.name);
    setPhone(customer.phone);
    setNotes(customer.notes || "");
    setEditingId(customer.id);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim() || !phone.trim()) {
      setError("Nome e telefone são obrigatórios.");
      return;
    }

    startTransition(async () => {
      try {
        if (editingId) {
          await onUpdate(editingId, { name, phone, notes });
          setSuccess("Cliente atualizado com sucesso!");
        } else {
          await onCreate({ name, phone, notes });
          setSuccess("Cliente cadastrado com sucesso!");
        }
        resetForm();
        router.refresh();
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Ocorreu um erro ao salvar o cliente.");
      }
    });
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Tem certeza que deseja excluir este cliente? Todos os seus veículos e ordens de serviço vinculados também serão excluídos.")) {
      return;
    }

    setError(null);
    setSuccess(null);

    startTransition(async () => {
      try {
        await onDelete(id);
        setSuccess("Cliente excluído com sucesso!");
        router.refresh();
        setTimeout(() => setSuccess(null), 3000);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Erro ao excluir cliente.");
      }
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-4">
      {/* Search and Add Header */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 hover:bg-slate-50/50"
          />
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-all shadow-sm shadow-indigo-900/10"
        >
          <Plus className="h-4.5 w-4.5" /> Adicionar Cliente
        </button>
      </div>

      {/* Success/Error Alerts */}
      {success && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800 shadow-sm">
          <Check className="h-4 w-4 text-emerald-600 shrink-0" />
          {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-800 shadow-sm">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          {error}
        </div>
      )}

      {/* Form Drawer / Modal overlay */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="border-b border-slate-100 px-5 py-4 flex items-center justify-between bg-slate-50">
              <h2 className="text-base font-bold text-slate-900">
                {editingId ? "Editar Cliente" : "Adicionar Novo Cliente"}
              </h2>
              <button onClick={resetForm} className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Telefone / Celular *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 11988887777"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Observações Internas (Opcional)</label>
                <textarea
                  placeholder="Ex: Prefere peças originais, pagar parcelado..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg disabled:opacity-50 transition-all shadow-sm"
                >
                  {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingId ? "Atualizar" : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customers List Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            Nenhum cliente cadastrado ou encontrado com esta busca.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredCustomers.map((customer) => {
              const isExpanded = expandedId === customer.id;
              return (
                <div key={customer.id} className="transition-colors hover:bg-slate-50/40">
                  <div
                    onClick={() => toggleExpand(customer.id)}
                    className="p-4 sm:px-6 flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900 truncate text-base">{customer.name}</p>
                        {customer.notes && (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded border border-slate-200">
                            <FileText className="h-3 w-3 text-slate-400" /> Notas
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="h-3.5 w-3.5 text-slate-400" /> {customer.phone}
                      </p>
                    </div>

                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleOpenEdit(customer, e)}
                        className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(customer.id, e)}
                        className="p-2 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => toggleExpand(customer.id)}
                        className="p-2 rounded-lg text-slate-400 hover:bg-slate-100"
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Details Container */}
                  {isExpanded && (
                    <div className="bg-slate-50/50 px-4 py-4 sm:px-6 border-t border-slate-100 text-sm space-y-3">
                      <div>
                        <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Notas / Observações</h4>
                        <p className="mt-1 text-slate-700 italic">
                          {customer.notes || "Nenhuma observação interna registrada para este cliente."}
                        </p>
                      </div>
                      <div className="pt-2">
                        <Link
                          href={`/os/nova?customerId=${customer.id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-500"
                        >
                          <Plus className="h-3.5 w-3.5" /> Abrir ordem de serviço rápida para este cliente
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
