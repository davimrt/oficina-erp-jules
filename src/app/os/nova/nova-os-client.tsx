"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Wrench,
  User,
  Car,
  AlertCircle,
  Check,
  Loader2,
  Sparkles,
  Smartphone
} from "lucide-react";

interface Mechanic {
  id: string;
  name: string;
}

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
}

interface NovaOSClientProps {
  mechanics: Mechanic[];
  initialCustomers: Customer[];
  initialVehicles: Vehicle[];
  onCreate: (data: {
    customerNameOrPhone: string;
    licensePlate: string;
    customerComplaint: string;
    mechanicId?: string | null;
    status: string;
  }) => Promise<{ id: string; osNumber: string }>;
}

export default function NovaOSClient({
  mechanics,
  initialCustomers,
  initialVehicles,
  onCreate,
}: NovaOSClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [customerInput, setCustomerInput] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [customerComplaint, setCustomerComplaint] = useState("");
  const [mechanicId, setMechanicId] = useState("");
  const [status, setStatus] = useState("NEW");

  // Autocomplete Suggestions UI states
  const [showCustSuggestions, setShowCustSuggestions] = useState(false);
  const [showVehSuggestions, setShowVehSuggestions] = useState(false);

  // Filtered suggestions
  const customerSuggestions = customerInput.trim() === ""
    ? []
    : initialCustomers.filter(
        c => c.name.toLowerCase().includes(customerInput.toLowerCase()) || c.phone.includes(customerInput)
      ).slice(0, 4);

  const vehicleSuggestions = licensePlate.trim() === ""
    ? []
    : initialVehicles.filter(
        v => v.licensePlate.toLowerCase().includes(licensePlate.toLowerCase())
      ).slice(0, 4);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!customerInput.trim()) {
      setError("Insira o nome ou telefone do cliente.");
      return;
    }
    if (!licensePlate.trim()) {
      setError("Insira a placa do veículo.");
      return;
    }
    if (!customerComplaint.trim()) {
      setError("Preencha a queixa principal do cliente.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await onCreate({
          customerNameOrPhone: customerInput.trim(),
          licensePlate: licensePlate.toUpperCase().trim(),
          customerComplaint: customerComplaint.trim(),
          mechanicId: mechanicId || null,
          status,
        });

        setSuccess("Ordem de Serviço criada com sucesso!");
        // Redirect to detail page
        setTimeout(() => {
          router.push(`/os/${result.id}`);
          router.refresh();
        }, 1200);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Erro desconhecido ao abrir a OS.");
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
      {/* Header indicating mobile mode is active */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-5 py-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-indigo-200" />
          <span className="font-bold text-sm tracking-wide uppercase">Modo de Abertura Rápida</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs bg-indigo-500/40 border border-indigo-400/30 px-2 py-0.5 rounded-full font-medium">
          <Sparkles className="h-3 w-3 text-indigo-200" /> &lt; 1 Minuto
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
        {/* Error/Success Feedback */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs sm:text-sm text-rose-800 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs sm:text-sm text-emerald-800 flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-600 shrink-0" />
            {success}
          </div>
        )}

        {/* 1. Complaint / Big text field - MAIN FOCUS OF OFICINA SCREEN */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center justify-between">
            <span>Problema / Queixa do Cliente *</span>
            <span className="text-[10px] text-indigo-600 lowercase font-semibold">Destaque na tela</span>
          </label>
          <textarea
            required
            rows={4}
            placeholder="Ex: Barulho forte na suspensão dianteira ao passar por buracos e luz de injeção piscando..."
            value={customerComplaint}
            onChange={(e) => setCustomerComplaint(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-amber-50/20 text-slate-950 font-medium placeholder-slate-400 shadow-inner"
          />
        </div>

        {/* 2. Customer lookup */}
        <div className="relative">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Cliente ou Telefone *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <input
              type="text"
              required
              placeholder="Digite o nome ou telefone do cliente..."
              value={customerInput}
              onChange={(e) => {
                setCustomerInput(e.target.value);
                setShowCustSuggestions(true);
              }}
              onFocus={() => setShowCustSuggestions(true)}
              onBlur={() => setTimeout(() => setShowCustSuggestions(false), 200)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            />
          </div>

          {/* Autocomplete dropdown list */}
          {showCustSuggestions && customerSuggestions.length > 0 && (
            <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-56 overflow-y-auto divide-y divide-slate-100">
              {customerSuggestions.map((cust) => (
                <button
                  key={cust.id}
                  type="button"
                  onMouseDown={() => {
                    setCustomerInput(cust.name);
                    setShowCustSuggestions(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs sm:text-sm hover:bg-slate-50 flex items-center justify-between"
                >
                  <span className="font-bold text-slate-900">{cust.name}</span>
                  <span className="text-slate-400 font-mono text-xs">{cust.phone}</span>
                </button>
              ))}
            </div>
          )}
          {showCustSuggestions && customerInput.trim() !== "" && customerSuggestions.length === 0 && (
            <div className="absolute z-50 left-0 right-0 mt-1 bg-indigo-50 border border-indigo-100 rounded-xl p-3 shadow-md text-xs text-indigo-800">
              Novo cliente detectado! Será cadastrado automaticamente ao salvar.
            </div>
          )}
        </div>

        {/* 3. License plate */}
        <div className="relative">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Placa do Veículo *
          </label>
          <div className="relative">
            <Car className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <input
              type="text"
              required
              placeholder="Ex: ABC1D23"
              value={licensePlate}
              onChange={(e) => {
                setLicensePlate(e.target.value);
                setShowVehSuggestions(true);
              }}
              onFocus={() => setShowVehSuggestions(true)}
              onBlur={() => setTimeout(() => setShowVehSuggestions(false), 200)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 uppercase font-mono tracking-wider bg-white"
            />
          </div>

          {/* Autocomplete suggestions */}
          {showVehSuggestions && vehicleSuggestions.length > 0 && (
            <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-56 overflow-y-auto divide-y divide-slate-100">
              {vehicleSuggestions.map((veh) => (
                <button
                  key={veh.id}
                  type="button"
                  onMouseDown={() => {
                    setLicensePlate(veh.licensePlate);
                    setShowVehSuggestions(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs sm:text-sm hover:bg-slate-50 flex items-center justify-between"
                >
                  <span className="font-mono font-bold text-slate-900">{veh.licensePlate}</span>
                  <span className="text-slate-400 text-xs">{veh.manufacturer} {veh.model}</span>
                </button>
              ))}
            </div>
          )}
          {showVehSuggestions && licensePlate.trim() !== "" && vehicleSuggestions.length === 0 && (
            <div className="absolute z-50 left-0 right-0 mt-1 bg-indigo-50 border border-indigo-100 rounded-xl p-3 shadow-md text-xs text-indigo-800">
              Novo veículo detectado! Será cadastrado e vinculado a este cliente.
            </div>
          )}
        </div>

        {/* 4. Mechanic Assignment (Optional) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Mecânico Responsável (Opcional)
            </label>
            <select
              value={mechanicId}
              onChange={(e) => setMechanicId(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Nenhum - Definir depois</option>
              {mechanics.map((mec) => (
                <option key={mec.id} value={mec.id}>
                  {mec.name}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Status Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Status Inicial
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-semibold"
            >
              <option value="NEW">Nova (Aguardando)</option>
              <option value="DIAGNOSING">Em Diagnóstico</option>
              <option value="IN_PROGRESS">Em Execução</option>
            </select>
          </div>
        </div>

        {/* Submit action - BIG FAT BUTTON FOR SMARTPHONES */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-base rounded-2xl transition-all shadow-md shadow-emerald-900/10 active:scale-[0.98] flex items-center justify-center gap-2 border-t border-emerald-400/20"
        >
          {isPending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" /> Salvando Ordem de Serviço...
            </>
          ) : (
            <>
              <Wrench className="h-5 w-5" /> Abrir Ordem de Serviço
            </>
          )}
        </button>
      </form>
    </div>
  );
}
