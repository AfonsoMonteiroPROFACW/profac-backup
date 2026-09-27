import { 
  mysqlTable, 
  text, 
  int, 
  boolean, 
  timestamp, 
  decimal, 
  json, 
  varchar 
} from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  cnpj: varchar("cnpj", { length: 20 }).notNull(),
  companyName: text("company_name").notNull(),
  phone: text("phone"),
  status: text("status").notNull().default("pending"), // pending, approved, blocked
  role: text("role").notNull().default("user"), // user, admin
  requirePasswordChange: boolean("require_password_change").notNull().default(false),
  lastLogin: timestamp("last_login"),
  loginCount: int("login_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela detalhada de clientes para gestão administrativa
export const clients = mysqlTable("clients", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").references(() => users.id),
  cnpj: varchar("cnpj", { length: 20 }).unique(),
  cpf: varchar("cpf", { length: 20 }).unique(),
  legalName: text("legal_name"), // Razão social
  tradeName: text("trade_name"), // Nome fantasia
  clientType: varchar("client_type", { length: 10 }).notNull().default("pj"), // "pj" ou "pf"
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
  riskRating: text("risk_rating").default("medium"),
  accountManager: text("account_manager"),
  
  // Status e datas
  status: text("status").notNull().default("active"),
  contractStartDate: timestamp("contract_start_date"),
  lastOperationDate: timestamp("last_operation_date"),
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const downloads = mysqlTable("downloads", {
  id: int("id").autoincrement().primaryKey(),
  version: text("version").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: text("file_size").notNull(),
  releaseDate: timestamp("release_date").notNull(),
  downloadCount: int("download_count").default(0),
  isActive: boolean("is_active").default(true),
  isBeta: boolean("is_beta").default(false),
  description: text("description"),
  changeLog: text("change_log"),
});

export const comments = mysqlTable("comments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").references(() => users.id),
  name: text("name").notNull(),
  companyName: text("company_name").notNull(),
  rating: int("rating").notNull(),
  content: text("content").notNull(),
  isApproved: boolean("is_approved").default(false),
  isRenewed: boolean("is_renewed").default(false),
  originalCommentId: int("original_comment_id"),
  approvedBy: int("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  renewedAt: timestamp("renewed_at"),
  expiresAt: timestamp("expires_at"),
  position: int("position").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const contacts = mysqlTable("contacts", {
  id: int("id").autoincrement().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const invoices = mysqlTable("invoices", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").references(() => users.id),
  invoiceNumber: text("invoice_number").notNull(),
  companyName: text("company_name").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  dueDate: timestamp("due_date").notNull(),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bills = mysqlTable("bills", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").references(() => users.id),
  billType: text("bill_type").notNull(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  dueDate: timestamp("due_date").notNull(),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const features = mysqlTable("features", {
  id: int("id").autoincrement().primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  isNew: boolean("is_new").default(false),
  releaseDate: timestamp("release_date").defaultNow(),
  isActive: boolean("is_active").default(true),
});

export const versionHistory = mysqlTable("version_history", {
  id: int("id").autoincrement().primaryKey(),
  content: text("content").notNull(),
  updatedBy: text("updated_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Sistema de tickets de suporte
export const supportTickets = mysqlTable("support_tickets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").references(() => users.id),
  ticketNumber: varchar("ticket_number", { length: 50 }).notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull().default("general"),
  priority: text("priority").notNull().default("medium"),
  status: text("status").notNull().default("open"),
  assignedTo: int("assigned_to").references(() => users.id),
  attachments: json("attachments").$type<string[]>(),
  tags: json("tags").$type<string[]>(),
  customerEmail: text("customer_email").notNull(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone"),
  estimatedResolution: timestamp("estimated_resolution"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Respostas e comentários dos tickets
export const ticketReplies = mysqlTable("ticket_replies", {
  id: int("id").autoincrement().primaryKey(),
  ticketId: int("ticket_id").references(() => supportTickets.id),
  userId: int("user_id").references(() => users.id),
  content: text("content").notNull(),
  isInternal: boolean("is_internal").default(false),
  attachments: json("attachments").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Configuração de email do sistema
export const emailConfig = mysqlTable("email_config", {
  id: int("id").autoincrement().primaryKey(),
  smtpHost: text("smtp_host").notNull(),
  smtpPort: int("smtp_port").notNull(),
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
export const ftpConfig = mysqlTable("ftp_config", {
  id: int("id").autoincrement().primaryKey(),
  ftpHost: text("ftp_host").notNull(),
  ftpPort: int("ftp_port").default(21),
  ftpUser: text("ftp_user").notNull(),
  ftpPassword: text("ftp_password").notNull(),
  ftpSecure: boolean("ftp_secure").default(false),
  downloadPath: text("download_path").notNull(),
  fileName: text("file_name").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Security badges configuration
export const securityBadgeConfigs = mysqlTable("security_badge_configs", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  selectedBadges: json("selected_badges").notNull(),
  layout: varchar("layout", { length: 20 }).notNull().default("horizontal"),
  size: varchar("size", { length: 10 }).notNull().default("sm"),
  showTooltips: boolean("show_tooltips").notNull().default(true),
  isActive: boolean("is_active").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela para gerenciar convites por email
export const emailInvitations = mysqlTable("email_invitations", {
  id: int("id").autoincrement().primaryKey(),
  email: text("email").notNull(),
  inviteToken: varchar("invite_token", { length: 255 }).notNull().unique(),
  sentBy: int("sent_by").references(() => users.id),
  status: text("status").notNull().default("sent"),
  clickCount: int("click_count").default(0),
  firstClickedAt: timestamp("first_clicked_at"),
  lastClickedAt: timestamp("last_clicked_at"),
  registeredAt: timestamp("registered_at"),
  registeredUserId: int("registered_user_id").references(() => users.id),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const pageViews = mysqlTable("page_views", {
  id: int("id").autoincrement().primaryKey(),
  path: text("path").notNull(),
  referrer: text("referrer"),
  userAgent: text("user_agent"),
  ipHash: text("ip_hash"),
  userId: int("user_id"),
  sessionId: text("session_id"),
  country: text("country"),
  region: text("region"),
  city: text("city"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
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

// User registration schema
export const registerUserSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  fullName: z.string().min(2, "Nome completo é obrigatório"),
  cnpj: z.string().min(14, "CNPJ é obrigatório").max(18, "CNPJ inválido"),
  companyName: z.string().min(2, "Nome da empresa é obrigatório"),
  phone: z.string().optional(),
});

// User update schema
export const updateUserSchema = z.object({
  fullName: z.string().min(2, "Nome completo é obrigatório"),
  cnpj: z.string().optional(),
  companyName: z.string().optional(),
  phone: z.string().optional(),
  status: z.enum(["pending", "approved", "blocked"]),
  role: z.enum(["user", "admin"]),
});

// Password update schema
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

export const insertSupportTicketSchema = createInsertSchema(supportTickets, {
  attachments: z.array(z.string()).optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
}).omit({
  id: true,
  ticketNumber: true,
  createdAt: true,
  updatedAt: true,
  resolvedAt: true,
});

export const insertTicketReplySchema = createInsertSchema(ticketReplies, {
  attachments: z.array(z.string()).optional().nullable(),
}).omit({
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
