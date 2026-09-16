import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  cnpj: text("cnpj").notNull(),
  companyName: text("company_name").notNull(),
  phone: text("phone"),
  status: text("status").notNull().default("pending"), // pending, approved, blocked
  role: text("role").notNull().default("user"), // user, admin
  requirePasswordChange: boolean("require_password_change").notNull().default(false),
  lastLogin: timestamp("last_login"),
  loginCount: integer("login_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela detalhada de clientes para gestão administrativa
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  cnpj: text("cnpj").unique(),
  cpf: text("cpf").unique(),
  legalName: text("legal_name"), // Razão social
  tradeName: text("trade_name"), // Nome fantasia
  clientType: text("client_type").notNull().default("pj"), // "pj" (pessoa jurídica) ou "pf" (pessoa física)
  phone: text("phone"),
  mobile: text("mobile"),
  website: text("website"),
  
  // Endereço
  address: text("address"),
  number: text("number"),
  complement: text("complement"),
  neighborhood: text("neighborhood"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  
  // Informações comerciais
  monthlyRevenue: decimal("monthly_revenue", { precision: 15, scale: 2 }),
  creditLimit: decimal("credit_limit", { precision: 15, scale: 2 }),
  riskRating: text("risk_rating").default("medium"), // "low", "medium", "high"
  accountManager: text("account_manager"),
  
  // Status e datas
  status: text("status").notNull().default("active"), // "active", "inactive", "suspended"
  contractStartDate: timestamp("contract_start_date"),
  lastOperationDate: timestamp("last_operation_date"),
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const downloads = pgTable("downloads", {
  id: serial("id").primaryKey(),
  version: text("version").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: text("file_size").notNull(),
  releaseDate: timestamp("release_date").notNull(),
  downloadCount: integer("download_count").default(0),
  isActive: boolean("is_active").default(true),
  isBeta: boolean("is_beta").default(false),
  description: text("description"),
  changeLog: text("change_log"),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  companyName: text("company_name").notNull(),
  rating: integer("rating").notNull(),
  content: text("content").notNull(),
  isApproved: boolean("is_approved").default(false),
  isRenewed: boolean("is_renewed").default(false), // Para comentários renovados
  originalCommentId: integer("original_comment_id"), // Referência ao comentário original
  approvedBy: integer("approved_by").references(() => users.id), // Admin que aprovou
  approvedAt: timestamp("approved_at"), // Data de aprovação
  renewedAt: timestamp("renewed_at"), // Data de renovação
  expiresAt: timestamp("expires_at"), // Data de expiração (opcional)
  position: integer("position").default(0), // Para ordenação
  isActive: boolean("is_active").default(true), // Status ativo/inativo
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  invoiceNumber: text("invoice_number").notNull(),
  companyName: text("company_name").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  dueDate: timestamp("due_date").notNull(),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bills = pgTable("bills", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  billType: text("bill_type").notNull(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  dueDate: timestamp("due_date").notNull(),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const features = pgTable("features", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  isNew: boolean("is_new").default(false),
  releaseDate: timestamp("release_date").defaultNow(),
  isActive: boolean("is_active").default(true),
});

export const versionHistory = pgTable("version_history", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  updatedBy: text("updated_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Sistema de tickets de suporte
export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  ticketNumber: text("ticket_number").notNull().unique(), // PROF-2025-001
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull().default("general"), // "technical", "billing", "general", "bug", "feature"
  priority: text("priority").notNull().default("medium"), // "low", "medium", "high", "urgent"
  status: text("status").notNull().default("open"), // "open", "in_progress", "waiting_customer", "resolved", "closed"
  assignedTo: integer("assigned_to").references(() => users.id), // Admin responsável
  attachments: text("attachments").array(), // URLs dos arquivos anexados
  tags: text("tags").array(), // Tags para categorização
  customerEmail: text("customer_email").notNull(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone"),
  estimatedResolution: timestamp("estimated_resolution"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Respostas e comentários dos tickets
export const ticketReplies = pgTable("ticket_replies", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").references(() => supportTickets.id),
  userId: integer("user_id").references(() => users.id), // Quem respondeu
  content: text("content").notNull(),
  isInternal: boolean("is_internal").default(false), // Nota interna ou resposta ao cliente
  attachments: text("attachments").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Configuração de email do sistema
export const emailConfig = pgTable("email_config", {
  id: serial("id").primaryKey(),
  smtpHost: text("smtp_host").notNull(),
  smtpPort: integer("smtp_port").notNull(),
  smtpSecure: boolean("smtp_secure").default(true),
  smtpUser: text("smtp_user").notNull(),
  smtpPassword: text("smtp_password").notNull(),
  fromEmail: text("from_email").notNull(),
  fromName: text("from_name").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Configuração FTP para downloads
export const ftpConfig = pgTable("ftp_config", {
  id: serial("id").primaryKey(),
  ftpHost: text("ftp_host").notNull(),
  ftpPort: integer("ftp_port").default(21),
  ftpUser: text("ftp_user").notNull(),
  ftpPassword: text("ftp_password").notNull(),
  ftpSecure: boolean("ftp_secure").default(false), // FTPS
  downloadPath: text("download_path").notNull(), // Caminho para o arquivo de download
  fileName: text("file_name").notNull(), // Nome do arquivo
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Security badges configuration
export const securityBadgeConfigs = pgTable("security_badge_configs", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  selectedBadges: jsonb("selected_badges").notNull().default('["verified-safe", "ssl-protected", "authentic-source"]'),
  layout: varchar("layout", { length: 20 }).notNull().default("horizontal"),
  size: varchar("size", { length: 10 }).notNull().default("sm"),
  showTooltips: boolean("show_tooltips").notNull().default(true),
  isActive: boolean("is_active").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela para gerenciar convites por email
export const emailInvitations = pgTable("email_invitations", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  inviteToken: text("invite_token").notNull().unique(),
  sentBy: integer("sent_by").references(() => users.id),
  status: text("status").notNull().default("sent"), // sent, clicked, registered, expired
  clickCount: integer("click_count").default(0),
  firstClickedAt: timestamp("first_clicked_at"),
  lastClickedAt: timestamp("last_clicked_at"),
  registeredAt: timestamp("registered_at"),
  registeredUserId: integer("registered_user_id").references(() => users.id),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const pageViews = pgTable("page_views", {
  id: serial("id").primaryKey(),
  path: text("path").notNull(),
  referrer: text("referrer"),
  userAgent: text("user_agent"),
  ipHash: text("ip_hash"),
  userId: integer("user_id"),
  sessionId: text("session_id"),
  country: text("country"),
  region: text("region"),
  city: text("city"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
// Email invitation schemas
export const insertEmailInvitationSchema = createInsertSchema(emailInvitations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertEmailInvitation = z.infer<typeof insertEmailInvitationSchema>;
export type EmailInvitation = typeof emailInvitations.$inferSelect;

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLogin: true,
  loginCount: true,
});

// User registration schema (for new user requests)
export const registerUserSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  fullName: z.string().min(2, "Nome completo é obrigatório"),
  cnpj: z.string().min(14, "CNPJ é obrigatório").max(18, "CNPJ inválido"),
  companyName: z.string().min(2, "Nome da empresa é obrigatório"),
  phone: z.string().optional(),
});

// User update schema (for admin management)
export const updateUserSchema = z.object({
  fullName: z.string().min(2, "Nome completo é obrigatório"),
  cnpj: z.string().optional(),
  companyName: z.string().optional(),
  phone: z.string().optional(),
  status: z.enum(["pending", "approved", "blocked"]),
  role: z.enum(["user", "admin"]),
});

// Password update schema (for admin password reset)
export const updatePasswordSchema = z.object({
  newPassword: z.string().min(6, "Nova senha deve ter no mínimo 6 caracteres"),
  confirmPassword: z.string().min(6, "Confirmação de senha é obrigatória"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

export const insertDownloadSchema = createInsertSchema(downloads).omit({
  id: true,
  downloadCount: true,
  releaseDate: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isApproved: true,
  approvedBy: true,
  approvedAt: true,
  renewedAt: true,
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
  status: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
});

export const insertBillSchema = createInsertSchema(bills).omit({
  id: true,
  createdAt: true,
});

export const insertFeatureSchema = createInsertSchema(features).omit({
  id: true,
  releaseDate: true,
});

export const insertVersionHistorySchema = createInsertSchema(versionHistory).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({
  id: true,
  ticketNumber: true,
  createdAt: true,
  updatedAt: true,
  resolvedAt: true,
});

export const insertTicketReplySchema = createInsertSchema(ticketReplies).omit({
  id: true,
  createdAt: true,
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmailConfigSchema = createInsertSchema(emailConfig).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Authentication schemas
export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Senha atual é obrigatória"),
  newPassword: z.string().min(6, "Nova senha deve ter no mínimo 6 caracteres"),
  confirmPassword: z.string().min(1, "Confirmação de senha é obrigatória")
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"]
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("E-mail inválido").min(1, "E-mail é obrigatório")
});

export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export const insertFtpConfigSchema = createInsertSchema(ftpConfig).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSecurityBadgeConfigSchema = createInsertSchema(securityBadgeConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Duplicate schemas removed - using the ones defined above

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type RegisterUser = z.infer<typeof registerUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type UpdatePassword = z.infer<typeof updatePasswordSchema>;
export type Download = typeof downloads.$inferSelect;
export type InsertDownload = z.infer<typeof insertDownloadSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Bill = typeof bills.$inferSelect;
export type InsertBill = z.infer<typeof insertBillSchema>;
export type Feature = typeof features.$inferSelect;
export type InsertFeature = z.infer<typeof insertFeatureSchema>;
export type VersionHistory = typeof versionHistory.$inferSelect;
export type InsertVersionHistory = z.infer<typeof insertVersionHistorySchema>;
export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type TicketReply = typeof ticketReplies.$inferSelect;
export type InsertTicketReply = z.infer<typeof insertTicketReplySchema>;
export type EmailConfig = typeof emailConfig.$inferSelect;
export type InsertEmailConfig = z.infer<typeof insertEmailConfigSchema>;
export type FtpConfig = typeof ftpConfig.$inferSelect;
export type InsertFtpConfig = z.infer<typeof insertFtpConfigSchema>;
export type SecurityBadgeConfig = typeof securityBadgeConfigs.$inferSelect;
export type InsertSecurityBadgeConfig = z.infer<typeof insertSecurityBadgeConfigSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
export type PageView = typeof pageViews.$inferSelect;
