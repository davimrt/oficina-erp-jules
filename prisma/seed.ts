import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const connectionString = "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url: connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Deletando dados existentes...");
  await prisma.statusHistory.deleteMany();
  await prisma.partItem.deleteMany();
  await prisma.serviceOrderItem.deleteMany();
  await prisma.serviceOrder.deleteMany();
  await prisma.mechanic.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.customer.deleteMany();

  console.log("Criando mecânicos...");
  const mec1 = await prisma.mechanic.create({ data: { name: "Carlos Souza" } });
  const mec2 = await prisma.mechanic.create({ data: { name: "Marcos Silva" } });
  const mec3 = await prisma.mechanic.create({ data: { name: "André Santos" } });

  console.log("Criando clientes...");
  const customer1 = await prisma.customer.create({
    data: {
      name: "João Silva",
      phone: "11988887777",
      notes: "Cliente antigo, prefere peças originais.",
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: "Maria Oliveira",
      phone: "21977776666",
      notes: "Sempre pede orçamento detalhado por WhatsApp.",
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      name: "Pedro Santos",
      phone: "31966665555",
      notes: null,
    },
  });

  console.log("Criando veículos...");
  const v1 = await prisma.vehicle.create({
    data: {
      licensePlate: "ABC1D23",
      manufacturer: "Chevrolet",
      model: "Onix",
      year: 2020,
      customerId: customer1.id,
    },
  });

  const v2 = await prisma.vehicle.create({
    data: {
      licensePlate: "XYZ9D87",
      manufacturer: "Volkswagen",
      model: "Gol",
      year: 2018,
      customerId: customer2.id,
    },
  });

  const v3 = await prisma.vehicle.create({
    data: {
      licensePlate: "KJG4F55",
      manufacturer: "Fiat",
      model: "Uno",
      year: 2015,
      customerId: customer3.id,
    },
  });

  console.log("Criando ordens de serviço...");

  // OS 1: NOVA
  const os1 = await prisma.serviceOrder.create({
    data: {
      osNumber: "OS-1001",
      customerComplaint: "Barulho forte vindo da suspensão dianteira ao passar por buracos.",
      internalDiagnosis: null,
      status: "NEW",
      customerId: customer1.id,
      vehicleId: v1.id,
      mechanicId: null,
      laborPrice: 0,
      partsPrice: 0,
      totalPrice: 0,
    },
  });
  await prisma.statusHistory.create({
    data: {
      serviceOrderId: os1.id,
      fromStatus: null,
      toStatus: "NEW",
      notes: "Abertura rápida de ordem de serviço.",
    },
  });

  // OS 2: EM DIAGNÓSTICO
  const os2 = await prisma.serviceOrder.create({
    data: {
      osNumber: "OS-1002",
      customerComplaint: "Motor falhando em subidas, luz da injeção acesa no painel.",
      internalDiagnosis: "Falta de pressão na linha de combustível. Velas de ignição desgastadas.",
      status: "DIAGNOSING",
      customerId: customer2.id,
      vehicleId: v2.id,
      mechanicId: mec1.id,
      laborPrice: 150,
      partsPrice: 120,
      totalPrice: 270,
    },
  });
  await prisma.statusHistory.create({
    data: { serviceOrderId: os2.id, fromStatus: null, toStatus: "NEW" },
  });
  await prisma.statusHistory.create({
    data: {
      serviceOrderId: os2.id,
      fromStatus: "NEW",
      toStatus: "DIAGNOSING",
      notes: "Iniciado diagnóstico pelo mecânico Carlos.",
    },
  });

  // OS 3: EM EXECUÇÃO / PROGRESS
  const os3 = await prisma.serviceOrder.create({
    data: {
      osNumber: "OS-1003",
      customerComplaint: "Revisão geral de 50.000 km e troca de óleo.",
      internalDiagnosis: "Filtros e óleos desgastados. Pastilhas de freio ainda em bom estado.",
      status: "IN_PROGRESS",
      customerId: customer3.id,
      vehicleId: v3.id,
      mechanicId: mec2.id,
      laborPrice: 200,
      partsPrice: 180,
      totalPrice: 380,
    },
  });
  await prisma.statusHistory.create({
    data: { serviceOrderId: os3.id, fromStatus: null, toStatus: "NEW" },
  });
  await prisma.statusHistory.create({
    data: { serviceOrderId: os3.id, fromStatus: "NEW", toStatus: "DIAGNOSING" },
  });
  await prisma.statusHistory.create({
    data: { serviceOrderId: os3.id, fromStatus: "DIAGNOSING", toStatus: "APPROVED", notes: "Orçamento aprovado pelo cliente." },
  });
  await prisma.statusHistory.create({
    data: { serviceOrderId: os3.id, fromStatus: "APPROVED", toStatus: "IN_PROGRESS", notes: "Peças recebidas, iniciando serviços." },
  });
  await prisma.serviceOrderItem.create({
    data: { serviceOrderId: os3.id, description: "Mão de obra troca de óleo e filtros", price: 200 },
  });
  await prisma.partItem.create({
    data: { serviceOrderId: os3.id, name: "Óleo 5W30 Sintético", quantity: 4, price: 35 },
  });
  await prisma.partItem.create({
    data: { serviceOrderId: os3.id, name: "Filtro de Óleo", quantity: 1, price: 40 },
  });

  // OS 4: PRONTA / READY
  const os4 = await prisma.serviceOrder.create({
    data: {
      osNumber: "OS-1004",
      customerComplaint: "Ar condicionado não gela quase nada.",
      internalDiagnosis: "Vazamento na mangueira de alta pressão e falta de gás.",
      status: "READY",
      customerId: customer1.id,
      vehicleId: v1.id,
      mechanicId: mec3.id,
      laborPrice: 250,
      partsPrice: 150,
      totalPrice: 400,
    },
  });
  await prisma.statusHistory.create({
    data: { serviceOrderId: os4.id, fromStatus: null, toStatus: "NEW" },
  });
  await prisma.statusHistory.create({
    data: { serviceOrderId: os4.id, fromStatus: "NEW", toStatus: "APPROVED" },
  });
  await prisma.statusHistory.create({
    data: { serviceOrderId: os4.id, fromStatus: "APPROVED", toStatus: "IN_PROGRESS" },
  });
  await prisma.statusHistory.create({
    data: { serviceOrderId: os4.id, fromStatus: "IN_PROGRESS", toStatus: "READY", notes: "Recarga de gás efetuada e testada. Gelando 100%." },
  });
  await prisma.serviceOrderItem.create({
    data: { serviceOrderId: os4.id, description: "Conserto de mangueira e carga de gás", price: 250 },
  });
  await prisma.partItem.create({
    data: { serviceOrderId: os4.id, name: "Gás R134a", quantity: 1, price: 90 },
  });
  await prisma.partItem.create({
    data: { serviceOrderId: os4.id, name: "Conectores e Mangueira", quantity: 1, price: 60 },
  });

  // OS 5: ENTREGUE / DELIVERED (Para garantir que não apareça no dashboard como ativo)
  const os5 = await prisma.serviceOrder.create({
    data: {
      osNumber: "OS-1005",
      customerComplaint: "Freio duro e assobiando ao frear.",
      internalDiagnosis: "Pastilhas de freio totalmente desgastadas, discos de freio riscados.",
      status: "DELIVERED",
      customerId: customer2.id,
      vehicleId: v2.id,
      mechanicId: mec1.id,
      laborPrice: 150,
      partsPrice: 320,
      totalPrice: 470,
    },
  });
  await prisma.statusHistory.create({
    data: { serviceOrderId: os5.id, fromStatus: null, toStatus: "NEW" },
  });
  await prisma.statusHistory.create({
    data: { serviceOrderId: os5.id, fromStatus: "NEW", toStatus: "APPROVED" },
  });
  await prisma.statusHistory.create({
    data: { serviceOrderId: os5.id, fromStatus: "APPROVED", toStatus: "IN_PROGRESS" },
  });
  await prisma.statusHistory.create({
    data: { serviceOrderId: os5.id, fromStatus: "IN_PROGRESS", toStatus: "READY" },
  });
  await prisma.statusHistory.create({
    data: { serviceOrderId: os5.id, fromStatus: "READY", toStatus: "DELIVERED", notes: "Veículo retirado pela cliente Maria Oliveira." },
  });
  await prisma.serviceOrderItem.create({
    data: { serviceOrderId: os5.id, description: "Substituição de pastilhas e discos dianteiros", price: 150 },
  });
  await prisma.partItem.create({
    data: { serviceOrderId: os5.id, name: "Pastilha de freio Cobreq", quantity: 1, price: 120 },
  });
  await prisma.partItem.create({
    data: { serviceOrderId: os5.id, name: "Discos de Freio Fremax (Par)", quantity: 1, price: 200 },
  });

  console.log("Dados de demonstração populados com sucesso!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
