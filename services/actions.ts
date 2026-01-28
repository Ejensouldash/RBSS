
import { db } from "../db";
import { quotations, clients, projects, invoices, services, companyInfo, aiProjects } from "../db/schema";
import { eq } from "drizzle-orm";
import { Quotation, Client, Project, Invoice, ServiceItem, CompanyInfo, AIProject } from "../types";

// --- Clients ---
export async function getClients() {
  return await db.select().from(clients);
}

export async function upsertClient(client: Client) {
  return await db.insert(clients).values(client).onConflictDoUpdate({
    target: clients.id,
    set: client,
  });
}

// --- Quotations ---
export async function getQuotations() {
  // We need to join with clients to match the 'Quotation' type which expects a nested 'client' object
  const result = await db.select({
    quotation: quotations,
    client: clients
  })
  .from(quotations)
  .innerJoin(clients, eq(quotations.clientId, clients.id));

  return result.map(({ quotation, client }) => ({
    ...quotation,
    client: client
  })) as Quotation[];
}

export async function saveQuotation(quotation: Quotation) {
  // Ensure client exists first
  await upsertClient(quotation.client);
  
  await db.insert(quotations).values({
    id: quotation.id,
    quotationNo: quotation.quotationNo,
    clientId: quotation.client.id,
    date: quotation.date,
    items: quotation.items,
    terms: quotation.terms,
    status: quotation.status
  }).onConflictDoUpdate({
    target: quotations.id,
    set: {
      clientId: quotation.client.id,
      date: quotation.date,
      items: quotation.items,
      terms: quotation.terms,
      status: quotation.status
    }
  });
}

export async function updateQuotationStatus(id: string, status: string) {
  await db.update(quotations).set({ status }).where(eq(quotations.id, id));
}

// --- Projects ---
export async function getProjects() {
  const result = await db.select({
    project: projects,
    client: clients
  })
  .from(projects)
  .innerJoin(clients, eq(projects.clientId, clients.id));

  return result.map(({ project, client }) => ({
    ...project,
    client: client
  })) as Project[];
}

export async function saveProject(project: Project) {
  await db.insert(projects).values({
    ...project,
    clientId: project.client.id
  }).onConflictDoUpdate({
    target: projects.id,
    set: {
      status: project.status,
      endDate: project.endDate,
      notes: project.notes,
      items: project.items
    }
  });
}

// --- Invoices ---
export async function getInvoices() {
  const result = await db.select({
    invoice: invoices,
    client: clients
  })
  .from(invoices)
  .innerJoin(clients, eq(invoices.clientId, clients.id));

  return result.map(({ invoice, client }) => ({
    ...invoice,
    client: client
  })) as Invoice[];
}

export async function saveInvoice(invoice: Invoice) {
  await db.insert(invoices).values({
    ...invoice,
    clientId: invoice.client.id
  }).onConflictDoUpdate({
    target: invoices.id,
    set: { status: invoice.status }
  });
}

// --- Services ---
export async function getServices() {
  return await db.select().from(services);
}

export async function saveService(service: ServiceItem) {
  await db.insert(services).values(service).onConflictDoUpdate({
    target: services.id,
    set: service
  });
}

export async function deleteService(id: string) {
  await db.delete(services).where(eq(services.id, id));
}

// --- Company Info ---
export async function getCompanyInfo() {
  const result = await db.select().from(companyInfo).limit(1);
  return result[0] as unknown as CompanyInfo;
}

export async function saveCompanyInfo(info: CompanyInfo) {
  // Assuming a single row with id 'default'
  await db.insert(companyInfo).values({ ...info, id: 'default' }).onConflictDoUpdate({
    target: companyInfo.id,
    set: info
  });
}

// --- AI Projects ---
export async function getAIProjects() {
  const result = await db.select().from(aiProjects);
  // Casting strict JSONB types back to their interface
  return result as unknown as AIProject[]; 
}

export async function saveAIProject(project: AIProject) {
  // Explicitly cast the complex JSON objects to any to satisfy Drizzle's strict typing if needed
  await db.insert(aiProjects).values(project as any).onConflictDoUpdate({
    target: aiProjects.id,
    set: project as any
  });
}
