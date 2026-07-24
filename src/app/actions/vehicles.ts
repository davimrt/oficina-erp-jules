import { prisma } from "@/lib/prisma";

export interface VehicleData {
  licensePlate: string;
  manufacturer: string;
  model: string;
  year?: number | null;
  customerId: string;
}

export async function getVehicles() {
  return await prisma.vehicle.findMany({
    include: { customer: true },
    orderBy: { licensePlate: "asc" },
  });
}

export async function getVehicleById(id: string) {
  return await prisma.vehicle.findUnique({
    where: { id },
    include: {
      customer: true,
      serviceOrders: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function createVehicle(data: VehicleData) {
  if (!data.licensePlate || !data.manufacturer || !data.model || !data.customerId) {
    throw new Error("Placa, marca, modelo e cliente são campos obrigatórios.");
  }

  const plateUpper = data.licensePlate.trim().toUpperCase();

  // Check unique constraint manually to provide a clear error message
  const existing = await prisma.vehicle.findUnique({
    where: { licensePlate: plateUpper },
  });
  if (existing) {
    throw new Error("Já existe um veículo cadastrado com esta placa.");
  }

  return await prisma.vehicle.create({
    data: {
      licensePlate: plateUpper,
      manufacturer: data.manufacturer,
      model: data.model,
      year: data.year || null,
      customerId: data.customerId,
    },
  });
}

export async function updateVehicle(id: string, data: VehicleData) {
  if (!data.licensePlate || !data.manufacturer || !data.model || !data.customerId) {
    throw new Error("Placa, marca, modelo e cliente são campos obrigatórios.");
  }

  const plateUpper = data.licensePlate.trim().toUpperCase();

  // Check unique constraint manually
  const existing = await prisma.vehicle.findUnique({
    where: { licensePlate: plateUpper },
  });
  if (existing && existing.id !== id) {
    throw new Error("Já existe um veículo cadastrado com esta placa.");
  }

  return await prisma.vehicle.update({
    where: { id },
    data: {
      licensePlate: plateUpper,
      manufacturer: data.manufacturer,
      model: data.model,
      year: data.year || null,
      customerId: data.customerId,
    },
  });
}

export async function deleteVehicle(id: string) {
  return await prisma.vehicle.delete({
    where: { id },
  });
}
