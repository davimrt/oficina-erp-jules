import { prisma } from "@/lib/prisma";

export interface QuickOSData {
  customerNameOrPhone: string;
  licensePlate: string;
  customerComplaint: string;
  mechanicId?: string | null;
  status: string;
}

export interface OSUpdateData {
  customerComplaint?: string;
  internalDiagnosis?: string | null;
  laborPrice?: number;
  partsPrice?: number;
  status?: string;
  mechanicId?: string | null;
}

export async function getMechanics() {
  return await prisma.mechanic.findMany({
    orderBy: { name: "asc" },
  });
}

export async function getServiceOrders() {
  return await prisma.serviceOrder.findMany({
    include: {
      customer: true,
      vehicle: true,
      mechanic: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getServiceOrderById(id: string) {
  return await prisma.serviceOrder.findUnique({
    where: { id },
    include: {
      customer: true,
      vehicle: true,
      mechanic: true,
      services: true,
      parts: true,
      statusHistory: {
        orderBy: { changedAt: "desc" },
      },
    },
  });
}

// Quick opening service order (less than 1 minute, smartphone-friendly)
export async function createQuickServiceOrder(data: QuickOSData) {
  if (!data.customerNameOrPhone || !data.licensePlate || !data.customerComplaint) {
    throw new Error("Cliente/telefone, placa do veículo e queixa do cliente são obrigatórios.");
  }

  const queryText = data.customerNameOrPhone.trim();
  const plateText = data.licensePlate.trim().toUpperCase();

  // 1. Find or create customer
  let customer = await prisma.customer.findFirst({
    where: {
      OR: [
        { name: { contains: queryText } },
        { phone: { contains: queryText } },
      ],
    },
  });

  if (!customer) {
    // If phone is supplied, try to use it or parse it, otherwise we'll set phone to queryText
    customer = await prisma.customer.create({
      data: {
        name: queryText,
        phone: queryText, // temporary phone
        notes: "Criado automaticamente via abertura rápida de OS.",
      },
    });
  }

  // 2. Find or create vehicle
  let vehicle = await prisma.vehicle.findUnique({
    where: { licensePlate: plateText },
  });

  if (!vehicle) {
    vehicle = await prisma.vehicle.create({
      data: {
        licensePlate: plateText,
        manufacturer: "Não especificada",
        model: "Não especificado",
        customerId: customer.id,
      },
    });
  }

  // Generate unique OS Number formatted as OS-XXXX
  const count = await prisma.serviceOrder.count();
  const osNumber = `OS-${1001 + count}`;

  const initialStatus = data.status || "NEW";

  const os = await prisma.serviceOrder.create({
    data: {
      osNumber,
      customerComplaint: data.customerComplaint,
      status: initialStatus,
      customerId: customer.id,
      vehicleId: vehicle.id,
      mechanicId: data.mechanicId || null,
      laborPrice: 0,
      partsPrice: 0,
      totalPrice: 0,
    },
  });

  // Track status history
  await prisma.statusHistory.create({
    data: {
      serviceOrderId: os.id,
      fromStatus: null,
      toStatus: initialStatus,
      notes: "Abertura rápida da OS.",
    },
  });

  return os;
}

// Detailed update of the service order
export async function updateServiceOrder(id: string, data: OSUpdateData) {
  const currentOs = await prisma.serviceOrder.findUnique({
    where: { id },
  });

  if (!currentOs) {
    throw new Error("Ordem de serviço não encontrada.");
  }

  const isStatusChanged = data.status && data.status !== currentOs.status;

  // Fetch all services and parts to recalculate totals
  const services = await prisma.serviceOrderItem.findMany({
    where: { serviceOrderId: id },
  });
  const parts = await prisma.partItem.findMany({
    where: { serviceOrderId: id },
  });

  const calculatedLabor = services.reduce((sum, item) => sum + item.price, 0);
  const calculatedParts = parts.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const finalLabor = data.laborPrice !== undefined ? data.laborPrice : (currentOs.laborPrice || calculatedLabor);
  const finalParts = data.partsPrice !== undefined ? data.partsPrice : (currentOs.partsPrice || calculatedParts);
  const finalTotal = finalLabor + finalParts;

  const updatedOs = await prisma.serviceOrder.update({
    where: { id },
    data: {
      customerComplaint: data.customerComplaint ?? currentOs.customerComplaint,
      internalDiagnosis: data.internalDiagnosis !== undefined ? data.internalDiagnosis : currentOs.internalDiagnosis,
      laborPrice: finalLabor,
      partsPrice: finalParts,
      totalPrice: finalTotal,
      status: data.status ?? currentOs.status,
      mechanicId: data.mechanicId !== undefined ? data.mechanicId : currentOs.mechanicId,
    },
  });

  if (isStatusChanged) {
    await prisma.statusHistory.create({
      data: {
        serviceOrderId: id,
        fromStatus: currentOs.status,
        toStatus: data.status!,
        notes: "Atualização de status na tela de gestão.",
      },
    });
  }

  return updatedOs;
}

// Add Service Item
export async function addServiceItem(serviceOrderId: string, description: string, price: number) {
  if (!description || price === undefined) {
    throw new Error("Descrição e preço são obrigatórios.");
  }

  const item = await prisma.serviceOrderItem.create({
    data: {
      serviceOrderId,
      description,
      price,
    },
  });

  // Recalculate Service Order totalPrice and laborPrice
  const services = await prisma.serviceOrderItem.findMany({
    where: { serviceOrderId },
  });
  const newLaborPrice = services.reduce((sum, s) => sum + s.price, 0);

  const currentOs = await prisma.serviceOrder.findUnique({
    where: { id: serviceOrderId },
  });
  const partsPrice = currentOs?.partsPrice || 0;

  await prisma.serviceOrder.update({
    where: { id: serviceOrderId },
    data: {
      laborPrice: newLaborPrice,
      totalPrice: newLaborPrice + partsPrice,
    },
  });

  return item;
}

// Delete Service Item
export async function deleteServiceItem(itemId: string) {
  const item = await prisma.serviceOrderItem.delete({
    where: { id: itemId },
  });

  const serviceOrderId = item.serviceOrderId;
  const services = await prisma.serviceOrderItem.findMany({
    where: { serviceOrderId },
  });
  const newLaborPrice = services.reduce((sum, s) => sum + s.price, 0);

  const currentOs = await prisma.serviceOrder.findUnique({
    where: { id: serviceOrderId },
  });
  const partsPrice = currentOs?.partsPrice || 0;

  await prisma.serviceOrder.update({
    where: { id: serviceOrderId },
    data: {
      laborPrice: newLaborPrice,
      totalPrice: newLaborPrice + partsPrice,
    },
  });

  return item;
}

// Add Part Item
export async function addPartItem(serviceOrderId: string, name: string, quantity: number, price: number) {
  if (!name || !quantity || price === undefined) {
    throw new Error("Nome da peça, quantidade e preço unitário são obrigatórios.");
  }

  const item = await prisma.partItem.create({
    data: {
      serviceOrderId,
      name,
      quantity,
      price,
    },
  });

  // Recalculate Service Order totalPrice and partsPrice
  const parts = await prisma.partItem.findMany({
    where: { serviceOrderId },
  });
  const newPartsPrice = parts.reduce((sum, p) => sum + (p.price * p.quantity), 0);

  const currentOs = await prisma.serviceOrder.findUnique({
    where: { id: serviceOrderId },
  });
  const laborPrice = currentOs?.laborPrice || 0;

  await prisma.serviceOrder.update({
    where: { id: serviceOrderId },
    data: {
      partsPrice: newPartsPrice,
      totalPrice: laborPrice + newPartsPrice,
    },
  });

  return item;
}

// Delete Part Item
export async function deletePartItem(itemId: string) {
  const item = await prisma.partItem.delete({
    where: { id: itemId },
  });

  const serviceOrderId = item.serviceOrderId;
  const parts = await prisma.partItem.findMany({
    where: { serviceOrderId },
  });
  const newPartsPrice = parts.reduce((sum, p) => sum + (p.price * p.quantity), 0);

  const currentOs = await prisma.serviceOrder.findUnique({
    where: { id: serviceOrderId },
  });
  const laborPrice = currentOs?.laborPrice || 0;

  await prisma.serviceOrder.update({
    where: { id: serviceOrderId },
    data: {
      partsPrice: newPartsPrice,
      totalPrice: laborPrice + newPartsPrice,
    },
  });

  return item;
}

// Delete Service Order
export async function deleteServiceOrder(id: string) {
  return await prisma.serviceOrder.delete({
    where: { id },
  });
}
