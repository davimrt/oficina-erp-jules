import React from "react";
import { notFound } from "next/navigation";
import {
  getServiceOrderById,
  getMechanics,
  updateServiceOrder,
  addServiceItem,
  deleteServiceItem,
  addPartItem,
  deletePartItem,
  deleteServiceOrder
} from "../../actions/serviceOrders";
import OSDetailClient from "./os-detail-client";

export const dynamic = "force-dynamic";

interface OSDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OSDetailPage({ params }: OSDetailPageProps) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const [serviceOrder, mechanics] = await Promise.all([
    getServiceOrderById(id),
    getMechanics(),
  ]);

  if (!serviceOrder) {
    notFound();
  }

  // Wrapper Server Actions to pass to the Client details manager securely
  async function handleUpdateOS(data: {
    customerComplaint?: string;
    internalDiagnosis?: string | null;
    laborPrice?: number;
    partsPrice?: number;
    status?: string;
    mechanicId?: string | null;
  }) {
    "use server";
    return await updateServiceOrder(id, data);
  }

  async function handleAddService(description: string, price: number) {
    "use server";
    return await addServiceItem(id, description, price);
  }

  async function handleDeleteService(itemId: string) {
    "use server";
    return await deleteServiceItem(itemId);
  }

  async function handleAddPart(name: string, quantity: number, price: number) {
    "use server";
    return await addPartItem(id, name, quantity, price);
  }

  async function handleDeletePart(itemId: string) {
    "use server";
    return await deletePartItem(itemId);
  }

  async function handleDeleteOS() {
    "use server";
    return await deleteServiceOrder(id);
  }

  return (
    <div className="space-y-6">
      <OSDetailClient
        serviceOrder={serviceOrder}
        mechanics={mechanics}
        onUpdateOS={handleUpdateOS}
        onAddService={handleAddService}
        onDeleteService={handleDeleteService}
        onAddPart={handleAddPart}
        onDeletePart={handleDeletePart}
        onDeleteOS={handleDeleteOS}
      />
    </div>
  );
}
