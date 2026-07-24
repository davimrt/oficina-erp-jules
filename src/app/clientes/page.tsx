import React from "react";
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from "../actions/customers";
import ClientesClient from "./clientes-client";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const customersData = await getCustomers();

  // Create Server Actions wrappers to pass to client component securely
  async function handleCreate(formData: { name: string; phone: string; notes?: string | null }) {
    "use server";
    return await createCustomer(formData);
  }

  async function handleUpdate(id: string, formData: { name: string; phone: string; notes?: string | null }) {
    "use server";
    return await updateCustomer(id, formData);
  }

  async function handleDelete(id: string) {
    "use server";
    return await deleteCustomer(id);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Clientes</h1>
        <p className="mt-1 text-sm text-slate-500">Gerencie o cadastro de clientes da sua oficina.</p>
      </div>

      <ClientesClient
        initialCustomers={customersData}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </div>
  );
}
