import {
  users,
  downloads,
  comments,
  contacts,
  invoices,
  bills,
  features,
  clients,
  versionHistory,
  supportTickets,
  ticketReplies,
  emailConfig,
  ftpConfig,
  emailInvitations,
  pageViews,
  type User,
  type InsertUser,
  type RegisterUser,
  type UpdateUser,
  type Download,
  type InsertDownload,
  type Comment,
  type InsertComment,
  type Contact,
  type InsertContact,
  type Invoice,
  type InsertInvoice,
  type Bill,
  type InsertBill,
  type Feature,
  type InsertFeature,
  type VersionHistory,
  type InsertVersionHistory,
  type Client,
  type InsertClient,
  type SupportTicket,
  type InsertSupportTicket,
  type TicketReply,
  type InsertTicketReply,
  type EmailConfig,
  type InsertEmailConfig,
  type FtpConfig,
  type InsertFtpConfig,
  type EmailInvitation,
  type InsertEmailInvitation,
} from "@shared/schema";

import { db } from "./db";
import { eq, desc, asc, and, or, like, sql } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByDocument(cnpjCpf: string): Promise<User | undefined>;
  createUser(user: RegisterUser): Promise<User>;
  authenticateUser(email: string, password: string): Promise<User | undefined>;
  updateLastLogin(userId: number): Promise<void>;
  
  // Admin user operations
  getAllUsers(): Promise<User[]>;
  updateUser(id: number, userData: UpdateUser): Promise<User>;
  updateUserPassword(id: number, password: string): Promise<User>;
  updateUserStatus(id: number, status: "pending" | "approved" | "blocked"): Promise<User>;
  setRequirePasswordChange(id: number, require: boolean): Promise<void>;
  deleteUser(id: number): Promise<void>;
  getPendingUsers(): Promise<User[]>;
  
  // Download operations
  getDownloads(): Promise<Download[]>;
  getAllDownloads(): Promise<Download[]>;
  getDownload(id: number): Promise<Download | undefined>;
  createDownload(download: InsertDownload): Promise<Download>;
  updateDownload(id: number, download: Partial<InsertDownload>): Promise<Download>;
  deleteDownload(id: number): Promise<void>;
  incrementDownloadCount(id: number): Promise<void>;
  
  // Comment operations
  getApprovedComments(): Promise<Comment[]>;
  getAllComments(): Promise<Comment[]>;
  getComment(id: number): Promise<Comment | undefined>;
  createComment(comment: InsertComment): Promise<Comment>;
  updateComment(id: number, commentData: Partial<InsertComment>): Promise<Comment>;
  deleteComment(id: number): Promise<void>;
  approveComment(id: number, approvedBy: number): Promise<Comment>;
  renewComment(id: number, renewedBy: number): Promise<Comment>;
  updateCommentPosition(id: number, position: number): Promise<Comment>;
  getCommentsByStatus(isApproved: boolean): Promise<Comment[]>;
  searchComments(query: string): Promise<Comment[]>;
  
  // Contact operations
  createContact(contact: InsertContact): Promise<Contact>;
  
  // Invoice operations
  getInvoicesByUserId(userId: number): Promise<Invoice[]>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  
  // Bill operations
  getBillsByUserId(userId: number): Promise<Bill[]>;
  createBill(bill: InsertBill): Promise<Bill>;
  
  // Feature operations
  getFeatures(): Promise<Feature[]>;
  getNewFeatures(): Promise<Feature[]>;
  createFeature(feature: InsertFeature): Promise<Feature>;
  
  // Version History operations
  getVersionHistory(): Promise<VersionHistory[]>;
  updateVersionHistory(content: string, updatedBy: string): Promise<VersionHistory>;
  
  // Client operations
  getAllClients(): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  getClientByUserId(userId: number): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, clientData: Partial<InsertClient>): Promise<Client>;
  deleteClient(id: number): Promise<void>;
  getClientsByStatus(status: string): Promise<Client[]>;
  getClientsByRiskRating(riskRating: string): Promise<Client[]>;
  searchClients(query: string): Promise<Client[]>;
  
  // Support Ticket operations
  getAllTickets(): Promise<SupportTicket[]>;
  getTicket(id: number): Promise<SupportTicket | undefined>;
  getTicketByNumber(ticketNumber: string): Promise<SupportTicket | undefined>;
  createTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  updateTicket(id: number, ticketData: Partial<InsertSupportTicket>): Promise<SupportTicket>;
  deleteTicket(id: number): Promise<void>;
  getTicketsByStatus(status: string): Promise<SupportTicket[]>;
  getTicketsByCategory(category: string): Promise<SupportTicket[]>;
  getTicketsByPriority(priority: string): Promise<SupportTicket[]>;
  getTicketsByUser(userId: number): Promise<SupportTicket[]>;
  searchTickets(query: string): Promise<SupportTicket[]>;
  
  // Ticket Reply operations
  getTicketReplies(ticketId: number): Promise<TicketReply[]>;
  createTicketReply(reply: InsertTicketReply): Promise<TicketReply>;
  updateTicketReply(id: number, replyData: Partial<InsertTicketReply>): Promise<TicketReply>;
  deleteTicketReply(id: number): Promise<void>;

  // Email Config operations
  getEmailConfig(): Promise<EmailConfig | undefined>;
  createEmailConfig(config: InsertEmailConfig): Promise<EmailConfig>;
  updateEmailConfig(id: number, config: Partial<InsertEmailConfig>): Promise<EmailConfig>;
  
  // FTP Config operations
  getFtpConfig(): Promise<FtpConfig | undefined>;
  createFtpConfig(config: InsertFtpConfig): Promise<FtpConfig>;
  updateFtpConfig(id: number, config: Partial<InsertFtpConfig>): Promise<FtpConfig>;

  // Email Invitation operations
  createEmailInvitation(invitation: InsertEmailInvitation): Promise<EmailInvitation>;
  getEmailInvitations(): Promise<EmailInvitation[]>;
  getEmailInvitationByToken(token: string): Promise<EmailInvitation | undefined>;
  updateInvitationStatus(id: number, status: string, additionalData?: Partial<EmailInvitation>): Promise<void>;
  // Analytics operations
  trackPageView(data: { path: string; referrer?: string; userAgent?: string; ipHash?: string; userId?: number; sessionId?: string; country?: string; region?: string; city?: string }): Promise<void>;
  getLocationStats(days: number): Promise<Array<{ country: string; region: string; city: string; views: number; uniqueVisitors: number }>>;
  getAnalyticsSummary(days: number): Promise<{ totalViews: number; uniqueVisitors: number; dailySeries: Array<{ date: string; views: number; uniqueVisitors: number }> }>;
  getAnalyticsMonthly(months: number): Promise<Array<{ month: string; views: number; uniqueVisitors: number }>>;
  getTopPages(days: number, limit: number): Promise<Array<{ path: string; views: number }>>;
  getAnalyticsToday(): Promise<{ views: number; uniqueVisitors: number }>;

  getInvitationStats(): Promise<{
    total: number;
    sent: number;
    clicked: number;
    registered: number;
    expired: number;
    conversionRate: number;
    clickRate: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByDocument(cnpjCpf: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.cnpj, cnpjCpf));
    return user;
  }

  async createUser(user: RegisterUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const [newUser] = await db
      .insert(users)
      .values({
        email: user.email,
        password: hashedPassword,
        fullName: user.fullName,
        cnpj: user.cnpj,
        companyName: user.companyName,
        phone: user.phone,
        status: "pending",
        role: "user",
      })
      .returning();
    return newUser;
  }

  async authenticateUser(email: string, password: string): Promise<User | undefined> {
    const user = await this.getUserByEmail(email);
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }
    
    // Check if account is approved
    if (user.status !== "approved") {
      throw new Error("PENDING_APPROVAL");
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error("WRONG_PASSWORD");
    }
    
    return user;
  }

  async updateLastLogin(userId: number): Promise<void> {
    await db
      .update(users)
      .set({ 
        lastLogin: new Date(),
        loginCount: sql`${users.loginCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  // Admin user operations
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getUsersPaginated(page: number = 1, limit: number = 20, search?: string): Promise<{ data: User[], total: number, page: number, totalPages: number }> {
    const offset = (page - 1) * limit;
    
    let query = db.select().from(users);
    let countQuery = db.select({ count: sql<number>`count(*)` }).from(users);
    
    if (search) {
      const searchCondition = or(
        like(users.email, `%${search}%`),
        like(users.fullName, `%${search}%`),
        like(users.companyName, `%${search}%`)
      );
      query = query.where(searchCondition) as typeof query;
      countQuery = countQuery.where(searchCondition) as typeof countQuery;
    }
    
    const [totalResult] = await countQuery;
    const total = Number(totalResult.count);
    const data = await query.orderBy(desc(users.createdAt)).limit(limit).offset(offset);
    
    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async updateUser(id: number, userData: UpdateUser): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async updateUserPassword(id: number, password: string): Promise<User> {
    // Check if password is already hashed (starts with $2b$)
    const isAlreadyHashed = password.startsWith('$2b$') || password.startsWith('$2a$');
    const finalPassword = isAlreadyHashed ? password : await bcrypt.hash(password, 10);
    
    console.log(`🔐 Updating password for user ID ${id}`);
    console.log(`📝 Password is${isAlreadyHashed ? ' already' : ' not'} hashed`);
    
    const [updatedUser] = await db
      .update(users)
      .set({ 
        password: finalPassword, 
        requirePasswordChange: false,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async updateUserStatus(id: number, status: "pending" | "approved" | "blocked"): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ status, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async setRequirePasswordChange(id: number, require: boolean): Promise<void> {
    await db
      .update(users)
      .set({ requirePasswordChange: require, updatedAt: new Date() })
      .where(eq(users.id, id));
  }

  // Generate temporary password for forgot password functionality
  generateTemporaryPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async resetUserPassword(email: string): Promise<{ user: User; temporaryPassword: string } | null> {
    const user = await this.getUserByEmail(email);
    if (!user) {
      console.log(`❌ Usuário não encontrado para email: ${email}`);
      return null;
    }

    // Check if user account is approved
    if (user.status !== "approved") {
      console.log(`❌ Usuário ${email} não aprovado (status: ${user.status})`);
      return null;
    }

    const temporaryPassword = this.generateTemporaryPassword();
    console.log(`🔑 Senha temporária gerada para ${email}: ${temporaryPassword}`);
    
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
    
    const [updatedUser] = await db
      .update(users)
      .set({ 
        password: hashedPassword,
        requirePasswordChange: true,
        updatedAt: new Date()
      })
      .where(eq(users.id, user.id))
      .returning();

    console.log(`✅ Senha atualizada no banco para usuário: ${updatedUser.email}`);
    return { user: updatedUser, temporaryPassword };
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getPendingUsers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.status, "pending"));
  }

  // Download operations
  async getDownloads(): Promise<Download[]> {
    return await db.select().from(downloads).where(eq(downloads.isActive, true)).orderBy(desc(downloads.releaseDate));
  }

  async getAllDownloads(): Promise<Download[]> {
    return await db.select().from(downloads).orderBy(desc(downloads.releaseDate));
  }

  async getDownloadsPaginated(page: number = 1, limit: number = 20): Promise<{ data: Download[], total: number, page: number, totalPages: number }> {
    const offset = (page - 1) * limit;
    const [totalResult] = await db.select({ count: sql<number>`count(*)` }).from(downloads);
    const total = Number(totalResult.count);
    const data = await db.select().from(downloads).orderBy(desc(downloads.releaseDate)).limit(limit).offset(offset);
    
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getDownload(id: number): Promise<Download | undefined> {
    const [download] = await db.select().from(downloads).where(eq(downloads.id, id));
    return download;
  }

  async createDownload(download: InsertDownload): Promise<Download> {
    const downloadWithDefaults = {
      ...download,
      releaseDate: new Date()
    };
    const [newDownload] = await db
      .insert(downloads)
      .values(downloadWithDefaults)
      .returning();
    return newDownload;
  }

  async updateDownload(id: number, download: Partial<InsertDownload>): Promise<Download> {
    const [updatedDownload] = await db
      .update(downloads)
      .set(download)
      .where(eq(downloads.id, id))
      .returning();
    return updatedDownload;
  }

  async deleteDownload(id: number): Promise<void> {
    await db.delete(downloads).where(eq(downloads.id, id));
  }

  async incrementDownloadCount(id: number): Promise<void> {
    await db
      .update(downloads)
      .set({ downloadCount: sql`${downloads.downloadCount} + 1` })
      .where(eq(downloads.id, id));
  }

  // Comment operations
  async getApprovedComments(): Promise<Comment[]> {
    return await db.select().from(comments)
      .where(and(eq(comments.isApproved, true), eq(comments.isActive, true)))
      .orderBy(asc(comments.position));
  }

  async getAllComments(): Promise<Comment[]> {
    return await db.select().from(comments).orderBy(desc(comments.createdAt));
  }

  async getComment(id: number): Promise<Comment | undefined> {
    const [comment] = await db.select().from(comments).where(eq(comments.id, id));
    return comment;
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db
      .insert(comments)
      .values(comment)
      .returning();
    return newComment;
  }

  async updateComment(id: number, commentData: Partial<InsertComment>): Promise<Comment> {
    const [updatedComment] = await db
      .update(comments)
      .set({ ...commentData, updatedAt: new Date() })
      .where(eq(comments.id, id))
      .returning();
    return updatedComment;
  }

  async deleteComment(id: number): Promise<void> {
    await db.delete(comments).where(eq(comments.id, id));
  }

  async approveComment(id: number, approvedBy: number): Promise<Comment> {
    const [approvedComment] = await db
      .update(comments)
      .set({ 
        isApproved: true, 
        approvedBy, 
        approvedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(comments.id, id))
      .returning();
    return approvedComment;
  }

  async renewComment(id: number, renewedBy: number): Promise<Comment> {
    const [renewedComment] = await db
      .update(comments)
      .set({ 
        isRenewed: true, 
        renewedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(comments.id, id))
      .returning();
    return renewedComment;
  }

  async updateCommentPosition(id: number, position: number): Promise<Comment> {
    const [updatedComment] = await db
      .update(comments)
      .set({ position, updatedAt: new Date() })
      .where(eq(comments.id, id))
      .returning();
    return updatedComment;
  }

  async getCommentsByStatus(isApproved: boolean): Promise<Comment[]> {
    return await db.select().from(comments)
      .where(eq(comments.isApproved, isApproved))
      .orderBy(desc(comments.createdAt));
  }

  async searchComments(query: string): Promise<Comment[]> {
    return await db.select().from(comments)
      .where(
        or(
          like(comments.name, `%${query}%`),
          like(comments.companyName, `%${query}%`),
          like(comments.content, `%${query}%`)
        )
      )
      .orderBy(desc(comments.createdAt));
  }

  // Contact operations
  async createContact(contact: InsertContact): Promise<Contact> {
    const [newContact] = await db
      .insert(contacts)
      .values(contact)
      .returning();
    return newContact;
  }

  // Invoice operations
  async getInvoicesByUserId(userId: number): Promise<Invoice[]> {
    return await db.select().from(invoices).where(eq(invoices.userId, userId));
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const [newInvoice] = await db
      .insert(invoices)
      .values(invoice)
      .returning();
    return newInvoice;
  }

  // Bill operations
  async getBillsByUserId(userId: number): Promise<Bill[]> {
    return await db.select().from(bills).where(eq(bills.userId, userId));
  }

  async createBill(bill: InsertBill): Promise<Bill> {
    const [newBill] = await db
      .insert(bills)
      .values(bill)
      .returning();
    return newBill;
  }

  // Feature operations
  async getFeatures(): Promise<Feature[]> {
    return await db.select().from(features).where(eq(features.isActive, true));
  }

  async getNewFeatures(): Promise<Feature[]> {
    return await db.select().from(features)
      .where(and(eq(features.isNew, true), eq(features.isActive, true)));
  }

  async createFeature(feature: InsertFeature): Promise<Feature> {
    const [newFeature] = await db
      .insert(features)
      .values(feature)
      .returning();
    return newFeature;
  }

  // Version History operations
  async getVersionHistory(): Promise<VersionHistory[]> {
    return await db.select().from(versionHistory).orderBy(desc(versionHistory.updatedAt));
  }

  async updateVersionHistory(content: string, updatedBy: string): Promise<VersionHistory> {
    // Try to update existing record first
    const existing = await db.select().from(versionHistory).limit(1);
    
    if (existing.length > 0) {
      const [updated] = await db
        .update(versionHistory)
        .set({ content, updatedBy, updatedAt: new Date() })
        .where(eq(versionHistory.id, existing[0].id))
        .returning();
      return updated;
    } else {
      // Create new record if none exists
      const [newHistory] = await db
        .insert(versionHistory)
        .values({ content, updatedBy })
        .returning();
      return newHistory;
    }
  }

  // Client operations
  async getAllClients(): Promise<Client[]> {
    return await db.select().from(clients).orderBy(desc(clients.createdAt));
  }

  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client;
  }

  async getClientByUserId(userId: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.userId, userId));
    return client;
  }

  async createClient(client: InsertClient): Promise<Client> {
    const [newClient] = await db
      .insert(clients)
      .values(client)
      .returning();
    return newClient;
  }

  async updateClient(id: number, clientData: Partial<InsertClient>): Promise<Client> {
    const [updatedClient] = await db
      .update(clients)
      .set({ ...clientData, updatedAt: new Date() })
      .where(eq(clients.id, id))
      .returning();
    return updatedClient;
  }

  async deleteClient(id: number): Promise<void> {
    await db.delete(clients).where(eq(clients.id, id));
  }

  async getClientsByStatus(status: string): Promise<Client[]> {
    return await db.select().from(clients).where(eq(clients.status, status));
  }

  async getClientsByRiskRating(riskRating: string): Promise<Client[]> {
    return await db.select().from(clients).where(eq(clients.riskRating, riskRating));
  }

  async searchClients(query: string): Promise<Client[]> {
    return await db.select().from(clients)
      .where(
        or(
          like(clients.legalName, `%${query}%`),
          like(clients.tradeName, `%${query}%`),
          like(clients.cnpj, `%${query}%`),
          like(clients.cpf, `%${query}%`)
        )
      )
      .orderBy(desc(clients.createdAt));
  }

  // Support Ticket operations
  async getAllTickets(): Promise<SupportTicket[]> {
    return await db.select().from(supportTickets).orderBy(desc(supportTickets.createdAt));
  }

  async getTicketsPaginated(page: number = 1, limit: number = 20, status?: string): Promise<{ data: SupportTicket[], total: number, page: number, totalPages: number }> {
    const offset = (page - 1) * limit;
    
    let query = db.select().from(supportTickets);
    let countQuery = db.select({ count: sql<number>`count(*)` }).from(supportTickets);
    
    if (status) {
      query = query.where(eq(supportTickets.status, status)) as typeof query;
      countQuery = countQuery.where(eq(supportTickets.status, status)) as typeof countQuery;
    }
    
    const [totalResult] = await countQuery;
    const total = Number(totalResult.count);
    const data = await query.orderBy(desc(supportTickets.createdAt)).limit(limit).offset(offset);
    
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getTicket(id: number): Promise<SupportTicket | undefined> {
    const [ticket] = await db.select().from(supportTickets).where(eq(supportTickets.id, id));
    return ticket;
  }

  async getTicketByNumber(ticketNumber: string): Promise<SupportTicket | undefined> {
    const [ticket] = await db.select().from(supportTickets).where(eq(supportTickets.ticketNumber, ticketNumber));
    return ticket;
  }

  async createTicket(ticket: InsertSupportTicket): Promise<SupportTicket> {
    // Generate unique ticket number
    const timestamp = Date.now().toString();
    const ticketNumber = `PROF-${new Date().getFullYear()}-${timestamp.slice(-6)}`;
    
    const ticketWithDefaults = {
      ...ticket,
      ticketNumber
    };
    const [newTicket] = await db
      .insert(supportTickets)
      .values(ticketWithDefaults)
      .returning();
    return newTicket;
  }

  async updateTicket(id: number, ticketData: Partial<InsertSupportTicket>): Promise<SupportTicket> {
    const [updatedTicket] = await db
      .update(supportTickets)
      .set({ ...ticketData, updatedAt: new Date() })
      .where(eq(supportTickets.id, id))
      .returning();
    return updatedTicket;
  }

  async deleteTicket(id: number): Promise<void> {
    await db.delete(supportTickets).where(eq(supportTickets.id, id));
  }

  async getTicketsByStatus(status: string): Promise<SupportTicket[]> {
    return await db.select().from(supportTickets).where(eq(supportTickets.status, status));
  }

  async getTicketsByCategory(category: string): Promise<SupportTicket[]> {
    return await db.select().from(supportTickets).where(eq(supportTickets.category, category));
  }

  async getTicketsByPriority(priority: string): Promise<SupportTicket[]> {
    return await db.select().from(supportTickets).where(eq(supportTickets.priority, priority));
  }

  async getTicketsByUser(userId: number): Promise<SupportTicket[]> {
    return await db.select().from(supportTickets).where(eq(supportTickets.userId, userId));
  }

  async searchTickets(query: string): Promise<SupportTicket[]> {
    return await db.select().from(supportTickets)
      .where(
        or(
          like(supportTickets.title, `%${query}%`),
          like(supportTickets.description, `%${query}%`),
          like(supportTickets.ticketNumber, `%${query}%`)
        )
      )
      .orderBy(desc(supportTickets.createdAt));
  }

  // Ticket Reply operations
  async getTicketReplies(ticketId: number): Promise<TicketReply[]> {
    return await db.select().from(ticketReplies)
      .where(eq(ticketReplies.ticketId, ticketId))
      .orderBy(asc(ticketReplies.createdAt));
  }

  async createTicketReply(reply: InsertTicketReply): Promise<TicketReply> {
    const [newReply] = await db
      .insert(ticketReplies)
      .values(reply)
      .returning();
    return newReply;
  }

  async updateTicketReply(id: number, replyData: Partial<InsertTicketReply>): Promise<TicketReply> {
    const [updatedReply] = await db
      .update(ticketReplies)
      .set(replyData)
      .where(eq(ticketReplies.id, id))
      .returning();
    return updatedReply;
  }

  async deleteTicketReply(id: number): Promise<void> {
    await db.delete(ticketReplies).where(eq(ticketReplies.id, id));
  }

  // Email Config operations
  async getEmailConfig(): Promise<EmailConfig | undefined> {
    const [config] = await db.select().from(emailConfig).limit(1);
    return config;
  }

  async createEmailConfig(config: InsertEmailConfig): Promise<EmailConfig> {
    const [newConfig] = await db
      .insert(emailConfig)
      .values(config)
      .returning();
    return newConfig;
  }

  async updateEmailConfig(id: number, config: Partial<InsertEmailConfig>): Promise<EmailConfig> {
    const [updatedConfig] = await db
      .update(emailConfig)
      .set({ ...config, updatedAt: new Date() })
      .where(eq(emailConfig.id, id))
      .returning();
    return updatedConfig;
  }

  // FTP Config operations
  async getFtpConfig(): Promise<FtpConfig | undefined> {
    const [config] = await db
      .select()
      .from(ftpConfig)
      .where(eq(ftpConfig.isActive, true))
      .limit(1);
    return config;
  }

  async createFtpConfig(config: InsertFtpConfig): Promise<FtpConfig> {
    const [newConfig] = await db
      .insert(ftpConfig)
      .values(config)
      .returning();
    return newConfig;
  }

  async updateFtpConfig(id: number, config: Partial<InsertFtpConfig>): Promise<FtpConfig> {
    const [updatedConfig] = await db
      .update(ftpConfig)
      .set({ ...config, updatedAt: new Date() })
      .where(eq(ftpConfig.id, id))
      .returning();
    return updatedConfig;
  }

  // Email Invitation operations
  async createEmailInvitation(invitation: InsertEmailInvitation): Promise<EmailInvitation> {
    const [newInvitation] = await db
      .insert(emailInvitations)
      .values(invitation)  
      .returning();
    return newInvitation;
  }

  async getEmailInvitations(): Promise<EmailInvitation[]> {
    const invitations = await db
      .select()
      .from(emailInvitations)
      .orderBy(desc(emailInvitations.createdAt));
    return invitations;
  }

  async getEmailInvitationByToken(token: string): Promise<EmailInvitation | undefined> {
    const [invitation] = await db
      .select()
      .from(emailInvitations)
      .where(eq(emailInvitations.inviteToken, token));
    return invitation;
  }

  async getEmailInvitationByEmail(email: string): Promise<EmailInvitation | undefined> {
    const [invitation] = await db
      .select()
      .from(emailInvitations)
      .where(eq(emailInvitations.email, email));
    return invitation;
  }

  async updateInvitationStatus(id: number, status: string, additionalData?: Partial<EmailInvitation>): Promise<void> {
    const updateData: any = { status, updatedAt: new Date() };
    if (additionalData) {
      Object.assign(updateData, additionalData);
    }
    
    await db
      .update(emailInvitations)
      .set(updateData)
      .where(eq(emailInvitations.id, id));
  }

  async getInvitationStats(): Promise<{
    total: number;
    sent: number;
    clicked: number;
    registered: number;
    expired: number;
    conversionRate: number;
    clickRate: number;
  }> {
    const invitations = await this.getEmailInvitations();
    const now = new Date();
    
    const stats = {
      total: invitations.length,
      sent: 0,
      clicked: 0,
      registered: 0,
      expired: 0,
      conversionRate: 0,
      clickRate: 0,
    };

    invitations.forEach(invitation => {
      if (new Date(invitation.expiresAt) < now) {
        stats.expired++;
      } else {
        switch (invitation.status) {
          case "sent":
            stats.sent++;
            break;
          case "clicked":
            stats.clicked++;
            break;
          case "registered":
            stats.registered++;
            break;
        }
      }
    });

    // Calculate rates
    if (stats.total > 0) {
      stats.clickRate = ((stats.clicked + stats.registered) / stats.total) * 100;
      stats.conversionRate = (stats.registered / stats.total) * 100;
    }

    return stats;
  }

  async trackPageView(data: { path: string; referrer?: string; userAgent?: string; ipHash?: string; userId?: number; sessionId?: string; country?: string; region?: string; city?: string }): Promise<void> {
    await db.insert(pageViews).values({
      path: data.path,
      referrer: data.referrer || null,
      userAgent: data.userAgent || null,
      ipHash: data.ipHash || null,
      userId: data.userId || null,
      sessionId: data.sessionId || null,
      country: data.country || null,
      region: data.region || null,
      city: data.city || null,
    });
  }

  async getLocationStats(days: number): Promise<Array<{ country: string; region: string; city: string; views: number; uniqueVisitors: number }>> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const result = await db.select({
      country: sql<string>`COALESCE(${pageViews.country}, 'Desconhecido')`,
      region: sql<string>`COALESCE(${pageViews.region}, 'Desconhecido')`,
      city: sql<string>`COALESCE(${pageViews.city}, 'Desconhecido')`,
      views: sql<number>`count(*)::int`,
      uniqueVisitors: sql<number>`count(distinct ${pageViews.ipHash})::int`,
    }).from(pageViews)
      .where(sql`${pageViews.createdAt} >= ${since}`)
      .groupBy(sql`COALESCE(${pageViews.country}, 'Desconhecido'), COALESCE(${pageViews.region}, 'Desconhecido'), COALESCE(${pageViews.city}, 'Desconhecido')`)
      .orderBy(sql`count(*) desc`)
      .limit(50);

    return result.map(r => ({
      country: r.country,
      region: r.region,
      city: r.city,
      views: r.views,
      uniqueVisitors: r.uniqueVisitors,
    }));
  }

  async getAnalyticsSummary(days: number): Promise<{ totalViews: number; uniqueVisitors: number; dailySeries: Array<{ date: string; views: number; uniqueVisitors: number }> }> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const totalResult = await db.select({
      totalViews: sql<number>`count(*)::int`,
      uniqueVisitors: sql<number>`count(distinct ${pageViews.ipHash})::int`,
    }).from(pageViews).where(sql`${pageViews.createdAt} >= ${since}`);

    const dailyResult = await db.select({
      date: sql<string>`to_char(${pageViews.createdAt}, 'YYYY-MM-DD')`,
      views: sql<number>`count(*)::int`,
      uniqueVisitors: sql<number>`count(distinct ${pageViews.ipHash})::int`,
    }).from(pageViews)
      .where(sql`${pageViews.createdAt} >= ${since}`)
      .groupBy(sql`to_char(${pageViews.createdAt}, 'YYYY-MM-DD')`)
      .orderBy(sql`to_char(${pageViews.createdAt}, 'YYYY-MM-DD')`);

    return {
      totalViews: totalResult[0]?.totalViews || 0,
      uniqueVisitors: totalResult[0]?.uniqueVisitors || 0,
      dailySeries: dailyResult.map(r => ({
        date: r.date,
        views: r.views,
        uniqueVisitors: r.uniqueVisitors,
      })),
    };
  }

  async getAnalyticsMonthly(months: number): Promise<Array<{ month: string; views: number; uniqueVisitors: number }>> {
    const since = new Date();
    since.setMonth(since.getMonth() - months);

    const result = await db.select({
      month: sql<string>`to_char(${pageViews.createdAt}, 'YYYY-MM')`,
      views: sql<number>`count(*)::int`,
      uniqueVisitors: sql<number>`count(distinct ${pageViews.ipHash})::int`,
    }).from(pageViews)
      .where(sql`${pageViews.createdAt} >= ${since}`)
      .groupBy(sql`to_char(${pageViews.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`to_char(${pageViews.createdAt}, 'YYYY-MM')`);

    return result.map(r => ({
      month: r.month,
      views: r.views,
      uniqueVisitors: r.uniqueVisitors,
    }));
  }

  async getTopPages(days: number, limit: number): Promise<Array<{ path: string; views: number }>> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const result = await db.select({
      path: pageViews.path,
      views: sql<number>`count(*)::int`,
    }).from(pageViews)
      .where(sql`${pageViews.createdAt} >= ${since}`)
      .groupBy(pageViews.path)
      .orderBy(sql`count(*) desc`)
      .limit(limit);

    return result.map(r => ({ path: r.path, views: r.views }));
  }

  async getAnalyticsToday(): Promise<{ views: number; uniqueVisitors: number }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await db.select({
      views: sql<number>`count(*)::int`,
      uniqueVisitors: sql<number>`count(distinct ${pageViews.ipHash})::int`,
    }).from(pageViews).where(sql`${pageViews.createdAt} >= ${today}`);

    return {
      views: result[0]?.views || 0,
      uniqueVisitors: result[0]?.uniqueVisitors || 0,
    };
  }
}

export const storage = new DatabaseStorage();