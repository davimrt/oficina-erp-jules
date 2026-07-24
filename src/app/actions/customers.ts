import { prisma } from "@/lib/prisma";

export interface CustomerData {
  name: string;
  phone: string;
  notes?: string | null;
}

export async function getCustomers() {
  return await prisma.customer.findMany({
    orderBy: { name: "asc" },
  });
}

export async function getCustomerById(id: string) {
  return await prisma.customer.findUnique({
    where: { id },
    include: {
      vehicles: true,
      serviceOrders: {
        include: {
          vehicle: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function createCustomer(data: CustomerData) {
  if (!data.name || !data.phone) {
    throw new Error("Nome e telefone são campos obrigatórios.");
  }
  return await prisma.customer.create({
    data: {
      name: data.name,
      phone: data.phone,
      notes: data.notes || null,
    },
  });
}

export async function updateCustomer(id: string, data: CustomerData) {
  if (!data.name || !data.phone) {
    throw new Error("Nome e telefone são campos obrigatórios.");
  }
  return await prisma.customer.update({
    where: { id },
    data: {
      name: data.name,
      phone: data.phone,
      notes: data.notes || null,
    },
  });
}

export async function deleteCustomer(id: string) {
  return await prisma.customer.delete({
    where: { id },
  });
}
