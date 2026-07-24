"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Check,
  AlertCircle,
  User,
  Calendar,
  Loader2
} from "lucide-react";

interface Customer {
  id: string;
  name: string;
  phone: string;
}

interface Vehicle {
  id: string;
  licensePlate: string;
  manufacturer: string;
  model: string;
  year: number | null;
  customerId: string;
  customer: Customer;
}

interface VeiculosClientProps {
  initialVehicles: Vehicle[];
  customers: Customer[];
  onCreate: (data: {
    licensePlate: string;
    manufacturer: string;
    model: string;
    year?: number | null;
    customerId: string;
  }) => Promise<unknown>;
  onUpdate: (
    id: string,
    data: {
      licensePlate: string;
      manufacturer: string;
      model: string;
      year?: number | null;
      customerId: string;
    }
  ) => Promise<unknown>;
  onDelete: (id: string) => Promise<unknown>;
}

export default function VeiculosClient({
  initialVehicles,
  customers,
  onCreate,
  onUpdate,
  onDelete,
}: VeiculosClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [licensePlate, setLicensePlate] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState<string>("");
  const [customerId, setCustomerId] = useState("");

  const filteredVehicles = initialVehicles.filter((v) => {
    const term = searchTerm.toLowerCase();
    return (
      v.licensePlate.toLowerCase().includes(term) ||
      v.manufacturer.toLowerCase().includes(term) ||
      v.model.toLowerCase().includes(term) ||
      v.customer.name.toLowerCase().includes(term)
    );
  });

  const resetForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setLicensePlate("");
    setManufacturer("");
    setModel("");
    setYear("");
    setCustomerId("");
    setError(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    if (customers.length > 0) {
      setCustomerId(customers[0].id);
    }
    setIsFormOpen(true);
  };

  const handleOpenEdit = (vehicle: Vehicle) => {
    setLicensePlate(vehicle.licensePlate);
    setManufacturer(vehicle.manufacturer);
    setModel(vehicle.model);
    setYear(vehicle.year ? vehicle.year.toString() : "");
    setCustomerId(vehicle.customerId);
    setEditingId(vehicle.id);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!licensePlate.trim() || !manufacturer.trim() || !model.trim() || !customerId) {
      setError("Placa, marca, modelo e proprietário são obrigatórios.");
      return;
    }

    const parsedYear = year ? parseInt(year, 10) : null;
    if (year && isNaN(parsedYear as number)) {
      setError("Ano do veículo inválido.");
      return;
    }

    startTransition(async () => {
      try {
        const payload = {
          licensePlate: licensePlate.toUpperCase().trim(),
          manufacturer,
          model,
          year: parsedYear,
          customerId,
        };

        if (editingId) {
          await onUpdate(editingId, payload);
          setSuccess("Veículo atualizado com sucesso!");
        } else {
          await onCreate(payload);
          setSuccess("Veículo cadastrado com sucesso!");
        }
        resetForm();
        router.refresh();
        setTimeout(() => setSuccess(null), 3000);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Erro ao salvar o veículo.");
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza de que deseja remover este veículo? Ordens de serviço associadas também serão excluídas.")) {
      return;
    }

    setError(null);
    setSuccess(null);

    startTransition(async () => {
      try {
        await onDelete(id);
        setSuccess("Veículo excluído com sucesso!");
        router.refresh();
        setTimeout(() => setSuccess(null), 3000);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Erro ao excluir veículo.");
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Search and Add Header */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por placa, marca, modelo ou cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 hover:bg-slate-50/50"
          />
        </div>
        <button
          onClick={handleOpenCreate}
          disabled={customers.length === 0}
          className="inline-flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-all shadow-sm shadow-indigo-900/10 disabled:opacity-50"
          title={customers.length === 0 ? "Cadastre um cliente primeiro" : ""}
        >
          <Plus className="h-4.5 w-4.5" /> Adicionar Veículo
        </button>
      </div>

      {customers.length === 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
          Você precisa cadastrar pelo menos um cliente antes de poder adicionar veículos.
        </div>
      )}

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

      {/* Vehicle Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="border-b border-slate-100 px-5 py-4 flex items-center justify-between bg-slate-50">
              <h2 className="text-base font-bold text-slate-900">
                {editingId ? "Editar Veículo" : "Cadastrar Veículo"}
              </h2>
              <button onClick={resetForm} className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Placa *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: ABC1D23"
                    value={licensePlate}
                    onChange={(e) => setLicensePlate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Ano (Opcional)</label>
                  <input
                    type="number"
                    placeholder="Ex: 2020"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Marca *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Chevrolet"
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Modelo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Onix"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Proprietário / Cliente *</label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
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

      {/* Vehicles Grid list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVehicles.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-sm">
            Nenhum veículo encontrado.
          </div>
        ) : (
          filteredVehicles.map((vehicle) => (
            <div key={vehicle.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all flex flex-col justify-between">
              <div>
                {/* Header with Mercosul Style license plate */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">{vehicle.manufacturer} {vehicle.model}</h3>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>Ano: {vehicle.year || "Não especificado"}</span>
                    </div>
                  </div>
                  {/* License plate card */}
                  <div className="border border-blue-600 rounded overflow-hidden shadow-sm shrink-0 w-24 text-center font-mono font-bold text-sm bg-white">
                    <div className="bg-blue-600 text-[8px] text-white py-0.5 leading-none">BRASIL</div>
                    <div className="py-1 tracking-wider text-slate-950 bg-slate-50">{vehicle.licensePlate}</div>
                  </div>
                </div>

                {/* Owner section */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-600">
                  <User className="h-4 w-4 text-slate-400 shrink-0" />
                  <div className="truncate">
                    <span className="font-bold text-slate-500 block uppercase tracking-wider text-[10px]">Proprietário</span>
                    <span className="font-medium text-slate-800">{vehicle.customer.name}</span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-1.5">
                <button
                  onClick={() => handleOpenEdit(vehicle)}
                  className="inline-flex items-center justify-center gap-1 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors"
                >
                  <Edit2 className="h-3 w-3" /> Editar
                </button>
                <button
                  onClick={() => handleDelete(vehicle.id)}
                  className="inline-flex items-center justify-center gap-1 rounded bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1.5 text-xs font-semibold text-rose-700 transition-colors"
                >
                  <Trash2 className="h-3 w-3" /> Excluir
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
