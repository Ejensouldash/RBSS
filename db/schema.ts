
import { pgTable, text, integer, doublePrecision, jsonb, timestamp } from "drizzle-orm/pg-core";
import { QuotationItem, Client, ServiceItem, ProjectFile } from "../types";

// Clients Table
export const clients = pgTable("clients", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  company: text("company"),
  address: text("address").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
});

// Quotations Table
export const quotations = pgTable("quotations", {
  id: text("id").primaryKey(),
  quotationNo: text("quotation_no").notNull(),
  clientId: text("client_id").references(() => clients.id).notNull(),
  date: text("date").notNull(),
  items: jsonb("items").$type<QuotationItem[]>().notNull(), // Storing items as JSONB for simplicity
  terms: text("terms").notNull(),
  status: text("status").notNull(), // 'Draft' | 'Sent' | 'Approved' | 'Rejected'
});

// Projects Table
export const projects = pgTable("projects", {
  id: text("id").primaryKey(),
  projectName: text("project_name").notNull(),
  quotationId: text("quotation_id").notNull(),
  quotationNo: text("quotation_no").notNull(),
  clientId: text("client_id").references(() => clients.id).notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  notes: text("notes"),
  status: text("status").notNull(), // 'In Progress' | 'Completed' | 'On Hold'
  totalValue: doublePrecision("total_value").notNull(),
  items: jsonb("items").$type<QuotationItem[]>().notNull(),
});

// Invoices Table
export const invoices = pgTable("invoices", {
  id: text("id").primaryKey(),
  invoiceNo: text("invoice_no").notNull(),
  quotationNo: text("quotation_no").notNull(),
  clientId: text("client_id").references(() => clients.id).notNull(),
  date: text("date").notNull(),
  dueDate: text("due_date").notNull(),
  items: jsonb("items").$type<QuotationItem[]>().notNull(),
  totalValue: doublePrecision("total_value").notNull(),
  status: text("status").notNull(), // 'Draft' | 'Sent' | 'Paid' | 'Overdue'
});

// Services Table
export const services = pgTable("services", {
  id: text("id").primaryKey(),
  description: text("description").notNull(),
  unitPrice: doublePrecision("unit_price").notNull(),
});

// Company Info Table (Single Row expected)
export const companyInfo = pgTable("company_info", {
  id: text("id").primaryKey().default('default'),
  name: text("name").notNull(),
  registrationNo: text("registration_no").notNull(),
  address: text("address").notNull(),
  tel: text("tel").notNull(),
  email: text("email").notNull(),
  bankInfo: text("bank_info").notNull(),
  logo: text("logo"),
  defaultTerms: text("default_terms").notNull(),
  taxRate: doublePrecision("tax_rate").notNull(),
  cidbGrade: text("cidb_grade"),
  ssmExpiry: text("ssm_expiry"),
  cidbExpiry: text("cidb_expiry"),
  pkkStatus: text("pkk_status"),
});

// AI Projects Table
export const aiProjects = pgTable("ai_projects", {
  id: text("id").primaryKey(),
  projectName: text("project_name").notNull(),
  projectCode: text("project_code").notNull(),
  dateCreated: text("date_created").notNull(),
  status: text("status").notNull(),
  projectValue: doublePrecision("project_value").notNull(),
  coverThumbnail: text("cover_thumbnail"),
  files: jsonb("files").$type<ProjectFile[]>().notNull(), // Complex nested files stored as JSON
  insights: jsonb("insights").notNull(), // Storing the complex insights object as JSON
});
