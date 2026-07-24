import React from "react";
import { getMechanics, createQuickServiceOrder } from "../../actions/serviceOrders";
import { getCustomers } from "../../actions/customers";
import { getVehicles } from "../../actions/vehicles";
import NovaOSClient from "./nova-os-client";

export const dynamic = "force-dynamic";

export default async function NovaOSPage() {
  const [mechanics, customers, vehicles] = await Promise.all([
    getMechanics(),
    getCustomers(),
    getVehicles(),
  ]);

  async function handleCreate(data: {
    customerNameOrPhone: string;
    licensePlate: string;
    customerComplaint: string;
    mechanicId?: string | null;
    status: string;
  }) {
    "use server";
    return await createQuickServiceOrder(data);
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Abertura Rápida de OS</h1>
        <p className="mt-1 text-sm text-slate-500">Cadastre uma nova ordem de serviço em menos de 1 minuto pelo celular.</p>
      </div>

      <NovaOSClient
        mechanics={mechanics}
        initialCustomers={customers}
        initialVehicles={vehicles}
        onCreate={handleCreate}
      />
    </div>
  );
}
