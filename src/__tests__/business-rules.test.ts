import {
  createQuickServiceOrder,
  updateServiceOrder,
  addServiceItem
} from "../app/actions/serviceOrders";
import { createCustomer } from "../app/actions/customers";
import { createVehicle } from "../app/actions/vehicles";
import { prisma } from "../lib/prisma";

// Mock the prisma client fully
jest.mock("../lib/prisma", () => ({
  prisma: {
    customer: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    vehicle: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    serviceOrder: {
      count: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    statusHistory: {
      create: jest.fn(),
    },
    serviceOrderItem: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    partItem: {
      create: jest.fn(),
      findMany: jest.fn(),
    }
  }
}));

describe("Regras de Negócio da Oficina ERP", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Validação e Cadastro de Clientes", () => {
    it("deve lançar erro se o nome ou telefone não forem informados", async () => {
      await expect(createCustomer({ name: "", phone: "1199999999" }))
        .rejects.toThrow("Nome e telefone são campos obrigatórios.");

      await expect(createCustomer({ name: "João", phone: "" }))
        .rejects.toThrow("Nome e telefone são campos obrigatórios.");
    });

    it("deve criar cliente corretamente quando todos os campos obrigatórios estão presentes", async () => {
      const mockCustomer = { id: "cust-1", name: "João", phone: "1199999999", notes: "Peças originais" };
      (prisma.customer.create as jest.Mock).mockResolvedValue(mockCustomer);

      const result = await createCustomer({ name: "João", phone: "1199999999", notes: "Peças originais" });
      expect(result).toEqual(mockCustomer);
      expect(prisma.customer.create).toHaveBeenCalledWith({
        data: { name: "João", phone: "1199999999", notes: "Peças originais" }
      });
    });
  });

  describe("Cadastro de Veículos", () => {
    it("deve impedir veículo com placa duplicada", async () => {
      (prisma.vehicle.findUnique as jest.Mock).mockResolvedValue({ id: "v-1", licensePlate: "ABC1D23" });

      await expect(createVehicle({
        licensePlate: "ABC1D23",
        manufacturer: "Fiat",
        model: "Uno",
        customerId: "cust-1"
      })).rejects.toThrow("Já existe um veículo cadastrado com esta placa.");
    });
  });

  describe("Abertura Rápida de Ordens de Serviço", () => {
    it("deve criar cliente e veículo inexistentes automaticamente durante a abertura rápida", async () => {
      // Setup mock queries to return null (meaning they don't exist yet)
      (prisma.customer.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.customer.create as jest.Mock).mockResolvedValue({ id: "cust-new", name: "Marcio", phone: "11988887777" });
      (prisma.vehicle.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.vehicle.create as jest.Mock).mockResolvedValue({ id: "veh-new", licensePlate: "XYZ9D87" });
      (prisma.serviceOrder.count as jest.Mock).mockResolvedValue(0);
      (prisma.serviceOrder.create as jest.Mock).mockResolvedValue({
        id: "os-123",
        osNumber: "OS-1001",
        customerComplaint: "Freio duro",
        status: "NEW",
      });

      const result = await createQuickServiceOrder({
        customerNameOrPhone: "Marcio",
        licensePlate: "XYZ9D87",
        customerComplaint: "Freio duro",
        status: "NEW"
      });

      expect(result.osNumber).toBe("OS-1001");
      expect(prisma.customer.create).toHaveBeenCalled();
      expect(prisma.vehicle.create).toHaveBeenCalled();
      expect(prisma.statusHistory.create).toHaveBeenCalled();
    });
  });

  describe("Gestão Financeira e Totais das Ordens de Serviço", () => {
    it("deve calcular corretamente o valor total somando mão de obra e peças", async () => {
      const mockOs = {
        id: "os-abc",
        osNumber: "OS-1002",
        status: "NEW",
        laborPrice: 100,
        partsPrice: 50,
        totalPrice: 150
      };

      (prisma.serviceOrder.findUnique as jest.Mock).mockResolvedValue(mockOs);
      (prisma.serviceOrderItem.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.partItem.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.serviceOrder.update as jest.Mock).mockResolvedValue({
        ...mockOs,
        laborPrice: 150,
        totalPrice: 200
      });

      const result = await updateServiceOrder("os-abc", {
        laborPrice: 150,
        partsPrice: 50
      });

      expect(result.totalPrice).toBe(200);
      expect(prisma.serviceOrder.update).toHaveBeenCalledWith({
        where: { id: "os-abc" },
        data: expect.objectContaining({
          laborPrice: 150,
          partsPrice: 50,
          totalPrice: 200
        })
      });
    });

    it("deve recalcular automaticamente ao adicionar novos itens de serviços ou peças", async () => {
      const mockOs = { id: "os-99", laborPrice: 100, partsPrice: 150, totalPrice: 250 };
      (prisma.serviceOrder.findUnique as jest.Mock).mockResolvedValue(mockOs);

      // Mocking service item list and recalculations
      (prisma.serviceOrderItem.create as jest.Mock).mockResolvedValue({ id: "srv-new", price: 80 });
      (prisma.serviceOrderItem.findMany as jest.Mock).mockResolvedValue([
        { price: 100 },
        { price: 80 }
      ]);

      await addServiceItem("os-99", "Limpeza de bicos", 80);

      // labor should be recalculated to 180 (100 + 80) and total should be 330 (180 + 150)
      expect(prisma.serviceOrder.update).toHaveBeenCalledWith({
        where: { id: "os-99" },
        data: {
          laborPrice: 180,
          totalPrice: 330
        }
      });
    });
  });
});
