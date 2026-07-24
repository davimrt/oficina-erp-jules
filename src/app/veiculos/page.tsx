import React from "react";
import { getVehicles, createVehicle, updateVehicle, deleteVehicle } from "../actions/vehicles";
import { getCustomers } from "../actions/customers";
import VeiculosClient from "./veiculos-client";

export const dynamic = "force-dynamic";

export default async function VeiculosPage() {
  const [vehicles, customers] = await Promise.all([
    getVehicles(),
    getCustomers(),
  ]);

  // Create Server Actions wrappers to pass to client component securely
  async function handleCreate(formData: {
    licensePlate: string;
    manufacturer: string;
    model: string;
    year?: number | null;
    customerId: string;
  }) {
    "use server";
    return await createVehicle(formData);
  }

  async function handleUpdate(
    id: string,
    formData: {
      licensePlate: string;
      manufacturer: string;
      model: string;
      year?: number | null;
      customerId: string;
    }
  ) {
    "use server";
    return await updateVehicle(id, formData);
  }

  async function handleDelete(id: string) {
    "use server";
    return await deleteVehicle(id);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Veículos</h1>
        <p className="mt-1 text-sm text-slate-500">Gerencie a frota de veículos e vincule-os aos respectivos proprietários.</p>
      </div>

      <VeiculosClient
        initialVehicles={vehicles}
        customers={customers}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </div>
  );
}
