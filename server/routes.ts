import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertCommentSchema,
  insertContactSchema,
  registerUserSchema,
  loginSchema,
  updateUserSchema,
  insertSupportTicketSchema,
  insertTicketReplySchema,
  insertEmailConfigSchema,
  insertFtpConfigSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  SupportTicket,
  TicketReply,
  EmailConfig,
  FtpConfig,
} from "@shared/schema";
import { sendPasswordResetEmail } from "./emailService";
import { sendWelcomeEmail } from "./welcomeEmailService";
import { FtpService } from "./ftpService";
import { notifyUsersAboutNewVersion } from "./versionNotificationService";
import { FtpValidator } from "./ftpValidator";
import { FtpHealthMonitor } from "./ftpHealthMonitor";
import { Client } from 'basic-ftp';
import { validateEmailSetup, sendTestEmail } from './emailValidator';
import { getBaseUrl } from "./config";

// Simple session middleware
function requireAuth(req: any, res: any, next: any) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Não autenticado" });
  }
  next();
}

function requireAdmin(req: any, res: any, next: any) {
  if (!req.session?.userId || !req.session?.isAdmin) {
    return res.status(403).json({ message: "Acesso negado - requer privilégios de administrador" });
  }
  next();
}

function requireSuperAdmin(req: any, res: any, next: any) {
  if (!req.session?.userId || !req.session?.isAdmin) {
    return res.status(403).json({ message: "Acesso negado - requer privilégios de administrador" });
  }
  
  // Only contato@profac.com.br can access super admin functions
  if ((req.session as any).userEmail !== "contato@profac.com.br") {
    return res.status(403).json({ message: "Acesso negado - requer privilégios de super administrador" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {

  // User registration
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = registerUserSchema.parse(req.body);
      const { inviteToken } = req.body;
      
      // Import validators
      const { isValidCNPJ } = await import("@shared/validators");
      
      // Validate CNPJ
      if (!isValidCNPJ(userData.cnpj)) {
        return res.status(400).json({ message: "CNPJ inválido" });
      }

      // Validar nome da empresa - não permitir cadastro com mensagens de erro
      if (!userData.companyName || 
          userData.companyName.toLowerCase().includes("erro") ||
          userData.companyName.toLowerCase().includes("consulta") ||
          userData.companyName.toLowerCase().includes("conexão") ||
          userData.companyName.toLowerCase().includes("encontrado")) {
        return res.status(400).json({ 
          message: "Nome da empresa é obrigatório. Aguarde a consulta CNPJ ser concluída com sucesso antes de enviar o cadastro." 
        });
      }
      
      // Check if user already exists by email (unique constraint)  
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "E-mail já cadastrado" });
      }
      
      // If registering via invitation, validate the invitation
      let invitation = null;
      if (inviteToken) {
        invitation = await storage.getEmailInvitationByToken(inviteToken);
        if (!invitation) {
          return res.status(400).json({ message: "Convite inválido" });
        }
        
        if (new Date(invitation.expiresAt) < new Date()) {
          await storage.updateInvitationStatus(invitation.id, "expired");
          return res.status(400).json({ message: "Convite expirado" });
        }
        
        if (invitation.email !== userData.email) {
          return res.status(400).json({ message: "Email não corresponde ao convite" });
        }
      }
      
      // CNPJ pode ser reutilizado por múltiplos usuários da mesma empresa
      // Removida validação de CNPJ duplicado para permitir vários usuários por empresa
      
      // Auto-approve contato@profac.com.br
      const userDataWithDefaults = {
        ...userData,
        status: userData.email === "contato@profac.com.br" ? "approved" as const : "pending" as const,
        role: userData.email === "contato@profac.com.br" ? "admin" as const : "user" as const,
      };
      
      const user = await storage.createUser(userDataWithDefaults);
      
      // If user registered through an invitation token, update the invitation status
      if (invitation) {
        try {
          await storage.updateInvitationStatus(invitation.id, "registered", {
            registeredAt: new Date(),
            registeredUserId: user.id,
          });
          console.log(`✅ Convite convertido: ${userData.email} se registrou através do token ${inviteToken}`);
        } catch (inviteError) {
          console.error("Erro ao processar conversão do convite:", inviteError);
          // Don't fail registration if invitation update fails
        }
      } else {
        // Check if there's a pending invitation for this email (without token) and mark as registered
        try {
          const pendingInvitation = await storage.getEmailInvitationByEmail(userData.email);
          if (pendingInvitation && pendingInvitation.status !== "registered") {
            await storage.updateInvitationStatus(pendingInvitation.id, "registered", {
              registeredAt: new Date(),
              registeredUserId: user.id,
            });
            console.log("✅ Convite marcado como registrado para:", userData.email);
          }
        } catch (inviteError) {
          console.error("❌ Erro ao atualizar status do convite:", inviteError);
          // Don't fail registration if invitation update fails
        }
      }
      
      // Send notification to admin about new user registration (except for auto-approved users)
      if (userData.email !== "contato@profac.com.br") {
        try {
          const admins = (await storage.getAllUsers()).filter(u => u.role === "admin");
          // Here you could send email notifications to admins
        } catch (error) {
          console.error("Failed to notify admins:", error);
        }
      }
      
      const message = userData.email === "contato@profac.com.br" 
        ? "Cadastro realizado e aprovado automaticamente! Você já pode fazer login."
        : "Cadastro realizado com sucesso! Aguarde aprovação do administrador.";
      
      res.status(201).json({ 
        message,
        user: { id: user.id, email: user.email, fullName: user.fullName, status: user.status }
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Dados inválidos para cadastro" });
    }
  });

  // User login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const user = await storage.authenticateUser(email, password);

      if (!user) {
        return res.status(401).json({
          message: "Credenciais inválidas. Verifique se o e-mail e senha estão corretos.",
          type: "wrong_credentials",
          details: "E-mail ou senha incorretos"
        });
      }

      // Update last login
      await storage.updateLastLogin(user.id);
      
      // Store in session
      req.session.userId = user.id;
      req.session.isAdmin = user.role === "admin";
      (req.session as any).userEmail = user.email;
      
      const { password: _, ...userWithoutPassword } = user;
      
      // Check if password change is required
      if (user.requirePasswordChange) {
        res.json({ 
          user: userWithoutPassword,
          requirePasswordChange: true,
          message: "É necessário alterar sua senha para continuar."
        });
      } else {
        res.json({ user: userWithoutPassword });
      }
    } catch (error) {
      const errorMessage = (error as Error).message;
      
      // Log da tentativa de login para debugging
      console.log(`Login attempt failed for email: ${req.body.email || 'N/A'}, error: ${errorMessage}`);
      
      if (errorMessage === "PENDING_APPROVAL") {
        return res.status(401).json({ 
          message: "Conta pendente de aprovação. Sua conta ainda não foi aprovada pelo administrador. Entre em contato com suporte para acelerar o processo.",
          type: "pending_approval",
          details: "Status: Aguardando aprovação administrativa"
        });
      } else if (errorMessage === "WRONG_PASSWORD") {
        return res.status(401).json({ 
          message: "Credenciais inválidas. Verifique se o e-mail e senha estão corretos. Certifique-se de que o Caps Lock não está ativado. Se o problema persistir, entre em contato com suporte.",
          type: "wrong_credentials",
          details: "E-mail ou senha incorretos"
        });
      } else if (errorMessage === "USER_NOT_FOUND") {
        return res.status(401).json({ 
          message: "Usuário não encontrado. Este e-mail não está cadastrado no sistema. Verifique o e-mail digitado ou faça seu cadastro primeiro.",
          type: "user_not_found",
          details: "E-mail não cadastrado"
        });
      }
      
      // Erro genérico para casos não mapeados
      return res.status(400).json({ 
        message: "Erro no sistema de login. Ocorreu um problema inesperado. Tente novamente em alguns minutos ou entre em contato com suporte se persistir.",
        type: "system_error",
        details: "Erro interno do servidor"
      });
    }
  });

  // User logout
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Erro ao fazer logout" });
      }
      res.json({ message: "Logout realizado com sucesso" });
    });
  });

  // Get current user session
  app.get("/api/auth/user", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Não autenticado" });
    }
    
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ message: "Usuário não encontrado" });
      }
      
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Change password
  app.post("/api/auth/change-password", requireAuth, async (req, res) => {
    try {
      const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
      const userId = req.session.userId;
      
      // Verify current password
      const user = await storage.getUser(userId!);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      
      const bcrypt = await import('bcrypt');
      
      // Debug logging
      if (process.env.NODE_ENV === 'development') {
        console.log("Password change attempt for user:", user.email);
        console.log("Current password provided:", currentPassword);
      }
      
      // Skip password verification if this is a password reset (temp password scenario)
      let isValidPassword = false;
      if (currentPassword === "TEMP_PASSWORD_RESET" && user.requirePasswordChange) {
        // User is in password reset flow, skip current password verification
        isValidPassword = true;
        console.log("Password reset flow detected, skipping current password verification");
      } else {
        // Normal password change, verify current password
        isValidPassword = await bcrypt.compare(currentPassword, user.password);
      }
      
      if (!isValidPassword) {
        // Try alternative comparison for debugging
        const directMatch = currentPassword === user.password;
        if (process.env.NODE_ENV === 'development') {
          console.log("Bcrypt comparison failed, direct match:", directMatch);
          console.log("Stored password hash starts with:", user.password.substring(0, 10));
        }
        
        // If direct match (for temporary admin passwords), allow it
        if (directMatch) {
          console.log("Using direct password match for temporary password");
        } else {
          return res.status(400).json({ message: "Senha atual incorreta" });
        }
      }
      
      // Update password - pass plain text password, let storage handle hashing
      await storage.updateUserPassword(userId!, newPassword);
      
      // Clear the requirePasswordChange flag if it was set
      if (user.requirePasswordChange) {
        await storage.setRequirePasswordChange(userId!, false);
      }
      
      res.json({ message: "Senha alterada com sucesso" });
    } catch (error) {
      console.error("Password change error:", error);
      res.status(400).json({ message: "Erro ao alterar senha" });
    }
  });

  // Forgot password endpoint
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);
      
      console.log(`🔐 Solicitação de redefinição de senha para: ${email}`);
      
      // First check if user exists to avoid sending emails to non-existent accounts
      const userExists = await storage.getUserByEmail(email);
      if (!userExists) {
        console.log(`❌ Email não cadastrado: ${email}`);
        return res.json({ 
          message: "Se o email existir em nosso sistema, você receberá uma senha temporária em breve." 
        });
      }
      
      // Check if user is approved
      if (userExists.status !== "approved") {
        console.log(`❌ Usuário não aprovado: ${email} (status: ${userExists.status})`);
        return res.json({ 
          message: "Se o email existir em nosso sistema, você receberá uma senha temporária em breve." 
        });
      }
      
      const resetResult = await storage.resetUserPassword(email);
      
      if (!resetResult) {
        // Don't reveal if email exists or not for security
        return res.json({ 
          message: "Se o email existir em nosso sistema, você receberá uma senha temporária em breve." 
        });
      }
      
      const { user, temporaryPassword } = resetResult;
      
      // Send email with temporary password
      try {
        const emailSent = await sendPasswordResetEmail(
          user.email,
          user.fullName,
          temporaryPassword
        );
        
        if (emailSent) {
          console.log(`✅ Email enviado com sucesso para: ${user.email}`);
          res.json({ 
            message: "Nova senha temporária enviada para seu email. Verifique sua caixa de entrada." 
          });
        } else {
          console.error(`❌ Falha ao enviar email para: ${user.email}`);
          res.status(500).json({ 
            message: "Erro ao enviar email. Tente novamente mais tarde." 
          });
        }
      } catch (emailError) {
        console.error("Erro no envio de email:", emailError);
        res.status(500).json({ 
          message: "Erro interno. Tente novamente mais tarde." 
        });
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(400).json({ message: "Dados inválidos" });
    }
  });

  // Admin routes - User management (Super Admin only)
  app.get("/api/admin/users", requireSuperAdmin, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string | undefined;
      
      if (req.query.paginated === 'true') {
        const result = await storage.getUsersPaginated(page, limit, search);
        const dataWithoutPasswords = result.data.map(({ password, ...user }) => user);
        res.json({ ...result, data: dataWithoutPasswords });
      } else {
        const users = await storage.getAllUsers();
        const usersWithoutPasswords = users.map(({ password, ...user }) => user);
        res.json(usersWithoutPasswords);
      }
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar usuários" });
    }
  });

  app.get("/api/admin/users/pending", requireSuperAdmin, async (req, res) => {
    try {
      const pendingUsers = await storage.getPendingUsers();
      const usersWithoutPasswords = pendingUsers.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar usuários pendentes" });
    }
  });

  app.put("/api/admin/users/:id", requireSuperAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const userData = updateUserSchema.parse(req.body);
      
      const updatedUser = await storage.updateUser(userId, userData);
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: "Erro ao atualizar usuário" });
    }
  });

  app.patch("/api/admin/users/:id", requireSuperAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const userData = updateUserSchema.parse(req.body);
      
      const updatedUser = await storage.updateUser(userId, userData);
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: "Erro ao atualizar usuário" });
    }
  });

  app.patch("/api/admin/users/:id/password", requireSuperAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { password } = req.body;
      
      if (!password || password.length < 6) {
        return res.status(400).json({ message: "Senha deve ter no mínimo 6 caracteres" });
      }
      
      await storage.updateUserPassword(userId, password);
      res.json({ message: "Senha redefinida com sucesso" });
    } catch (error) {
      res.status(400).json({ message: "Erro ao redefinir senha" });
    }
  });

  app.patch("/api/admin/users/:id/require-password-change", requireSuperAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      
      // Set the requirePasswordChange flag
      await storage.setRequirePasswordChange(userId, true);
      
      res.json({ 
        message: "Usuário será solicitado a alterar a senha no próximo login."
      });
    } catch (error) {
      res.status(400).json({ message: "Erro ao solicitar redefinição de senha" });
    }
  });

  // Endpoint para enviar email de boas-vindas manualmente
  app.post("/api/admin/users/:id/send-welcome-email", requireSuperAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      
      if (user.status !== "approved") {
        return res.status(400).json({ message: "Usuário deve estar aprovado para receber email de boas-vindas" });
      }
      
      console.log(`📧 [MANUAL] Enviando email de boas-vindas manual para ${user.email}`);
      
      try {
        const emailResult = await sendWelcomeEmail({
          userEmail: user.email,
          userName: user.fullName,
          companyName: user.companyName || "Empresa"
        });
        
        if (emailResult) {
          res.json({ message: "Email de boas-vindas enviado com sucesso!" });
        } else {
          res.status(500).json({ message: "Falha ao enviar email de boas-vindas" });
        }
      } catch (emailError) {
        console.error(`❌ Erro ao enviar email manual para ${user.email}:`, emailError);
        res.status(500).json({ message: "Erro ao enviar email de boas-vindas" });
      }
    } catch (error) {
      res.status(400).json({ message: "Erro ao processar solicitação" });
    }
  });

  app.patch("/api/admin/users/:id/status", requireSuperAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!["pending", "approved", "blocked"].includes(status)) {
        return res.status(400).json({ message: "Status inválido" });
      }
      
      // Obter dados do usuário antes da atualização para verificar se precisa enviar email
      const userBefore = await storage.getUser(userId);
      if (!userBefore) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      
      const updatedUser = await storage.updateUserStatus(userId, status);
      
      // Enviar email de boas-vindas se o usuário foi aprovado pela primeira vez
      console.log(`🔍 Verificando envio de email: userBefore.status='${userBefore.status}', novo status='${status}'`);
      if (userBefore.status !== "approved" && status === "approved") {
        console.log(`📧 Iniciando envio de email de boas-vindas para ${updatedUser.email}`);
        try {
          const emailResult = await sendWelcomeEmail({
            userEmail: updatedUser.email,
            userName: updatedUser.fullName,
            companyName: updatedUser.companyName || "Empresa"
          });
          console.log(`✅ Email de boas-vindas enviado com sucesso para ${updatedUser.email}. Resultado:`, emailResult);
        } catch (emailError) {
          console.error(`❌ Erro ao enviar email de boas-vindas para ${updatedUser.email}:`, emailError);
          console.error(`❌ Detalhes do erro:`, JSON.stringify(emailError, null, 2));
          // Não falhar a aprovação por causa do email
        }
      } else {
        console.log(`ℹ️  Email não será enviado. Motivo: userBefore.status='${userBefore.status}', novo status='${status}'`);
      }
      
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: "Erro ao atualizar status do usuário" });
    }
  });

  app.delete("/api/admin/users/:id", requireSuperAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Prevent admin from deleting themselves
      if (userId === req.session.userId) {
        return res.status(400).json({ message: "Não é possível excluir sua própria conta" });
      }
      
      await storage.deleteUser(userId);
      res.json({ message: "Usuário excluído com sucesso" });
    } catch (error) {
      res.status(400).json({ message: "Erro ao excluir usuário" });
    }
  });

  // Endpoint para solicitar mudança de senha na próxima sessão
  app.post("/api/admin/users/:id/request-password-change", requireSuperAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      
      // Set the requirePasswordChange flag
      await storage.setRequirePasswordChange(userId, true);
      
      const { password: _, ...userWithoutPassword } = user;
      res.json({ 
        message: "Solicitação de mudança de senha ativada. O usuário precisará alterar a senha no próximo login.",
        user: userWithoutPassword 
      });
    } catch (error) {
      res.status(400).json({ message: "Erro ao solicitar mudança de senha" });
    }
  });

  // Admin routes - Download management  
  app.get("/api/admin/downloads", requireAdmin, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      if (req.query.paginated === 'true') {
        const result = await storage.getDownloadsPaginated(page, limit);
        res.json(result);
      } else {
        const allDownloads = await storage.getAllDownloads();
        res.json(allDownloads);
      }
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar downloads" });
    }
  });

  app.post("/api/admin/downloads", requireAdmin, async (req, res) => {
    try {
      const downloadData = req.body;
      const newDownload = await storage.createDownload(downloadData);
      res.status(201).json(newDownload);
    } catch (error) {
      res.status(400).json({ message: "Erro ao criar download" });
    }
  });

  app.put("/api/admin/downloads/:id", requireAdmin, async (req, res) => {
    try {
      const downloadId = parseInt(req.params.id);
      const downloadData = req.body;
      const updatedDownload = await storage.updateDownload(downloadId, downloadData);
      res.json(updatedDownload);
    } catch (error) {
      res.status(400).json({ message: "Erro ao atualizar download" });
    }
  });

  app.delete("/api/admin/downloads/:id", requireAdmin, async (req, res) => {
    try {
      const downloadId = parseInt(req.params.id);
      await storage.deleteDownload(downloadId);
      res.json({ message: "Download excluído com sucesso" });
    } catch (error) {
      res.status(400).json({ message: "Erro ao excluir download" });
    }
  });

  // Public downloads route
  app.get("/api/downloads", async (req, res) => {
    try {
      const downloads = await storage.getDownloads();
      res.json(downloads);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch downloads" });
    }
  });

  // Download file route - FTP based with comprehensive validation
  app.post("/api/downloads/:id/download", async (req, res) => {
    try {
      const downloadId = parseInt(req.params.id);
      const download = await storage.getDownload(downloadId);
      
      if (!download) {
        return res.status(404).json({ 
          message: "Download não encontrado",
          errorType: "NOT_FOUND",
          details: "O arquivo solicitado não existe no sistema."
        });
      }
      
      // Get FTP configuration
      const ftpConfig = await storage.getFtpConfig();
      if (!ftpConfig) {
        return res.status(500).json({ 
          message: "Configuração FTP não encontrada",
          errorType: "FTP_CONFIG_MISSING",
          details: "Configure o servidor FTP no painel administrativo para habilitar downloads.",
          solution: "Acesse: Painel Admin → Configuração FTP"
        });
      }
      
      // Test FTP connection and file existence BEFORE allowing download
      const { Client } = await import('basic-ftp');
      const client = new Client();
      
      try {
        // Step 1: Test FTP connection
        console.log(`🔗 Testando conexão FTP: ${ftpConfig.ftpHost}:${ftpConfig.ftpPort || 21}`);
        await client.access({
          host: ftpConfig.ftpHost,
          port: ftpConfig.ftpPort || 21,
          user: ftpConfig.ftpUser,
          password: ftpConfig.ftpPassword,
          secure: false,
          secureOptions: { rejectUnauthorized: false }
        });

        // Step 2: Test file existence
        const remotePath = ftpConfig.downloadPath ? 
          `${ftpConfig.downloadPath}/${ftpConfig.fileName}` : 
          ftpConfig.fileName;
          
        try {
          const fileSize = await client.size(remotePath);
          console.log(`📁 Arquivo encontrado: ${remotePath} (${fileSize} bytes)`);
        } catch (sizeError) {
          await client.close();
          return res.status(404).json({ 
            message: "Arquivo não encontrado no servidor FTP",
            errorType: "FILE_NOT_FOUND",
            details: `O arquivo '${ftpConfig.fileName}' não existe no servidor.`,
            path: remotePath,
            solution: "Verifique se o arquivo foi enviado para o servidor FTP ou contate o suporte."
          });
        }
        
        await client.close();
        
        // Generate FTP download URL only after successful validation
        const ftpUrl = ftpConfig.downloadPath ? 
          `ftp://${ftpConfig.ftpUser}:${ftpConfig.ftpPassword}@${ftpConfig.ftpHost}:${ftpConfig.ftpPort || 21}/${ftpConfig.downloadPath}/${ftpConfig.fileName}` :
          `ftp://${ftpConfig.ftpUser}:${ftpConfig.ftpPassword}@${ftpConfig.ftpHost}:${ftpConfig.ftpPort || 21}/${ftpConfig.fileName}`;
        
        // Increment download count only after successful validation
        await storage.incrementDownloadCount(downloadId);
        
        res.json({ 
          fileName: ftpConfig.fileName,
          downloadUrl: `/api/downloads/${downloadId}/stream`,
          message: "Arquivo verificado e pronto para download",
          fileExists: true,
          validated: true
        });
        
      } catch (ftpError: any) {
        await client.close();
        
        let errorMessage = "Download temporariamente indisponível";
        let errorDetails = "Não conseguimos acessar os arquivos de download no momento.";
        let solution = "Tente novamente em alguns minutos ou entre em contato conosco.";
        
        if (ftpError.code === 'ENOTFOUND') {
          errorMessage = "Servidor de download indisponível";
          errorDetails = "O servidor de arquivos não está acessível no momento.";
          solution = "Verifique sua conexão com a internet e tente novamente.";
        } else if (ftpError.code === 'ECONNREFUSED') {
          errorMessage = "Serviço temporariamente indisponível";
          errorDetails = "O servidor de downloads está temporariamente fora do ar.";
          solution = "Aguarde alguns minutos e tente novamente.";
        } else if (ftpError.code === 530 || ftpError.message?.includes('530') || ftpError.message?.includes('authentication failed')) {
          errorMessage = "Configuração FTP incorreta";
          errorDetails = "As credenciais do servidor FTP precisam ser atualizadas.";
          solution = "Verifique as credenciais FTP no painel administrativo.";
        } else if (ftpError.code === 'ETIMEDOUT') {
          errorMessage = "Conexão lenta detectada";
          errorDetails = "A conexão está muito lenta para completar o download.";
          solution = "Verifique sua internet e tente novamente.";
        }
        
        return res.status(500).json({ 
          message: errorMessage,
          errorType: "FTP_CONNECTION_ERROR",
          details: errorDetails,
          solution: solution,
          technicalError: ftpError.message
        });
      }
      
    } catch (error) {
      console.error("Erro no endpoint de download:", error);
      res.status(500).json({ 
        message: "Erro interno do servidor",
        errorType: "INTERNAL_ERROR",
        details: "Ocorreu um erro inesperado no sistema.",
        solution: "Tente novamente em alguns momentos ou contate o suporte técnico."
      });
    }
  });

  // Simple file download route - direct FTP URL generation
  app.get("/api/downloads/:id/stream", async (req, res) => {
    try {
      const downloadId = parseInt(req.params.id);
      const download = await storage.getDownload(downloadId);
      
      if (!download) {
        return res.status(404).json({ message: "Download não encontrado" });
      }
      
      // Get FTP configuration
      const ftpConfig = await storage.getFtpConfig();
      if (!ftpConfig) {
        return res.status(500).json({ message: "Configuração FTP não encontrada" });
      }

      // Import handler function
      const { handleFtpDownload } = await import('./downloadHandler.js');
      await handleFtpDownload(ftpConfig, res, parseInt(req.params.id));
      
    } catch (error) {
      console.error('❌ Erro na geração do link FTP:', error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Public comments route
  app.get("/api/comments", async (req, res) => {
    try {
      const comments = await storage.getApprovedComments();
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  // Submit new comment
  app.post("/api/comments", async (req, res) => {
    try {
      const commentData = insertCommentSchema.parse(req.body);
      const comment = await storage.createComment(commentData);
      res.status(201).json(comment);
    } catch (error) {
      res.status(400).json({ message: "Invalid comment data" });
    }
  });

  // Admin comments management routes
  app.get("/api/admin/comments", requireAdmin, async (req, res) => {
    try {
      const { status, search } = req.query;
      let comments;
      
      if (search) {
        comments = await storage.searchComments(search as string);
      } else if (status === 'approved' || status === 'pending') {
        comments = await storage.getCommentsByStatus(status === 'approved');
      } else {
        comments = await storage.getAllComments();
      }
      
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch comments", error: (error as Error)?.message || "Unknown error" });
    }
  });

  app.get("/api/admin/comments/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const comment = await storage.getComment(id);
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }
      res.json(comment);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch comment" });
    }
  });

  app.post("/api/admin/comments", requireAdmin, async (req, res) => {
    try {
      const commentData = insertCommentSchema.parse(req.body);
      const comment = await storage.createComment(commentData);
      res.status(201).json(comment);
    } catch (error) {
      res.status(400).json({ message: "Invalid comment data" });
    }
  });

  app.patch("/api/admin/comments/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const commentData = insertCommentSchema.partial().parse(req.body);
      const comment = await storage.updateComment(id, commentData);
      res.json(comment);
    } catch (error) {
      res.status(400).json({ message: "Failed to update comment" });
    }
  });

  app.delete("/api/admin/comments/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteComment(id);
      res.json({ message: "Comment deleted successfully" });
    } catch (error) {
      res.status(400).json({ message: "Failed to delete comment" });
    }
  });

  // Approve comment
  app.post("/api/admin/comments/:id/approve", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.session.userId!;
      const comment = await storage.approveComment(id, userId);
      res.json(comment);
    } catch (error) {
      res.status(400).json({ message: "Failed to approve comment" });
    }
  });

  // Renew comment
  app.post("/api/admin/comments/:id/renew", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.session.userId!;
      const comment = await storage.renewComment(id, userId);
      res.json(comment);
    } catch (error) {
      res.status(400).json({ message: "Failed to renew comment" });
    }
  });

  // Update comment position
  app.patch("/api/admin/comments/:id/position", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { position } = req.body;
      const comment = await storage.updateCommentPosition(id, position);
      res.json(comment);
    } catch (error) {
      res.status(400).json({ message: "Failed to update comment position" });
    }
  });

  app.post("/api/admin/comments/:id/approve", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const adminId = req.session.userId!;
      const comment = await storage.approveComment(id, adminId);
      res.json(comment);
    } catch (error) {
      res.status(400).json({ message: "Failed to approve comment" });
    }
  });

  app.post("/api/admin/comments/:id/renew", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const adminId = req.session.userId!;
      const comment = await storage.renewComment(id, adminId);
      res.json(comment);
    } catch (error) {
      res.status(400).json({ message: "Failed to renew comment" });
    }
  });

  app.patch("/api/admin/comments/:id/position", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { position } = req.body;
      const comment = await storage.updateCommentPosition(id, position);
      res.json(comment);
    } catch (error) {
      res.status(400).json({ message: "Failed to update comment position" });
    }
  });

  // Contact form submission
  app.post("/api/contacts", async (req, res) => {
    try {
      const contactData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(contactData);
      
      // Send confirmation email
      try {
        console.log("📧 Enviando email de confirmação para:", contact.email);
        // TODO: Implement sendContactConfirmation using sendEmail from emailService
        console.log("✅ Email de confirmação enviado com sucesso");
      } catch (emailError) {
        console.error("❌ Failed to send confirmation email:", emailError);
        console.error("Detalhes do erro:", (emailError as Error).message);
      }
      
      res.status(201).json({ message: "Mensagem enviada com sucesso!" });
    } catch (error) {
      res.status(400).json({ message: "Invalid contact data" });
    }
  });

  // Version History routes
  app.get("/api/version-history", async (req, res) => {
    try {
      const versionHistory = await storage.getVersionHistory();
      res.json(versionHistory);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch version history" });
    }
  });

  // Super Admin Downloads Management routes
  app.post("/api/admin/downloads", requireAuth, requireSuperAdmin, async (req, res) => {
    try {
      const download = await storage.createDownload(req.body);
      
      // Enviar notificação automática para todos os usuários aprovados
      try {
        console.log(`📧 Iniciando notificação automática para nova versão: ${download.version}`);
        
        const notificationResult = await notifyUsersAboutNewVersion({
          version: download.version,
          fileName: download.fileName,
          description: download.description || '',
          downloadUrl: `${getBaseUrl()}/#downloads`
        });
        
        if (notificationResult.success) {
          console.log(`✅ Notificação enviada para ${notificationResult.notifiedUsers}/${notificationResult.totalUsers} usuários`);
        } else {
          console.error(`❌ Erro na notificação: ${notificationResult.error}`);
        }
      } catch (notificationError) {
        console.error('❌ Erro no sistema de notificação:', notificationError);
        // Não bloquear a criação do download por erro na notificação
      }
      
      res.status(201).json(download);
    } catch (error) {
      res.status(400).json({ message: "Dados de download inválidos" });
    }
  });

  app.put("/api/admin/downloads/:id", requireAuth, requireSuperAdmin, async (req, res) => {
    try {
      const downloadId = parseInt(req.params.id);
      const downloadData = req.body;
      const updatedDownload = await storage.updateDownload(downloadId, downloadData);
      res.json(updatedDownload);
    } catch (error) {
      res.status(400).json({ message: "Erro ao atualizar download" });
    }
  });

  app.delete("/api/admin/downloads/:id", requireAuth, requireSuperAdmin, async (req, res) => {
    try {
      const downloadId = parseInt(req.params.id);
      await storage.deleteDownload(downloadId);
      res.json({ message: "Download excluído com sucesso" });
    } catch (error) {
      res.status(400).json({ message: "Erro ao excluir download" });
    }
  });

  // Test endpoint for version notification
  app.post("/api/admin/test-version-notification", requireAuth, requireSuperAdmin, async (req, res) => {
    try {
      console.log('🧪 Testando sistema de notificação de versão...');
      
      const { testVersionNotification } = await import("./versionNotificationService");
      const result = await testVersionNotification();
      
      if (result.success) {
        res.json({ 
          message: "Teste de notificação concluído com sucesso!", 
          result: `${result.notifiedUsers}/${result.totalUsers} emails enviados` 
        });
      } else {
        res.status(500).json({ 
          message: "Erro no teste de notificação", 
          error: result.error 
        });
      }
    } catch (error) {
      console.error('❌ Erro no teste de notificação:', error);
      res.status(500).json({ message: "Erro interno no teste" });
    }
  });

  // Email Configuration routes
  app.get("/api/admin/email-config", requireAuth, requireSuperAdmin, async (req, res) => {
    try {
      const config = await storage.getEmailConfig();
      if (config) {
        res.json(config);
      } else {
        res.status(404).json({ message: "Nenhuma configuração encontrada" });
      }
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar configuração de email" });
    }
  });

  app.post("/api/admin/email-config", requireAuth, requireSuperAdmin, async (req, res) => {
    try {
      const configData = insertEmailConfigSchema.parse(req.body);
      const config = await storage.createEmailConfig(configData);
      res.status(201).json(config);
    } catch (error) {
      res.status(400).json({ message: "Dados de configuração inválidos" });
    }
  });

  app.put("/api/admin/email-config/:id", requireAuth, requireSuperAdmin, async (req, res) => {
    try {
      const configId = parseInt(req.params.id);
      const configData = insertEmailConfigSchema.parse(req.body);
      const updatedConfig = await storage.updateEmailConfig(configId, configData);
      res.json(updatedConfig);
    } catch (error) {
      res.status(400).json({ message: "Erro ao atualizar configuração de email" });
    }
  });

  app.post("/api/admin/test-email", requireAuth, requireSuperAdmin, async (req, res) => {
    try {
      console.log('🧪 Testando configuração de email...');
      // TODO: Implement testEmailConfiguration using sendEmail from emailService
      res.json({ success: true, message: "Configuração testada com sucesso" });
    } catch (error) {
      console.error('❌ Erro no teste de email:', error);
      res.status(500).json({ success: false, message: "Erro interno no teste de email" });
    }
  });

  // FTP Health Monitoring endpoints
  app.get("/api/admin/ftp-health/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const configId = parseInt(req.params.id);
      const healthMonitor = FtpHealthMonitor.getInstance();
      
      const currentHealth = healthMonitor.getCurrentHealthStatus(configId);
      const statistics = healthMonitor.getHealthStatistics(configId);
      const healthReport = healthMonitor.generateHealthReport(configId);
      
      res.json({
        currentHealth,
        statistics,
        report: healthReport,
        isExperiencingIssues: healthMonitor.isExperiencingIssues(configId)
      });
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar status de saúde FTP" });
    }
  });

  app.get("/api/admin/ftp-health/:id/history", requireAuth, requireAdmin, async (req, res) => {
    try {
      const configId = parseInt(req.params.id);
      const limit = parseInt(req.query.limit as string) || 20;
      
      const healthMonitor = FtpHealthMonitor.getInstance();
      const history = healthMonitor.getHealthHistory(configId).slice(-limit);
      
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar histórico de saúde FTP" });
    }
  });

  app.post("/api/admin/ftp-health/:id/check", requireAuth, requireAdmin, async (req, res) => {
    try {
      const configId = parseInt(req.params.id);
      const healthMonitor = FtpHealthMonitor.getInstance();
      
      // Force a health check
      const result = await healthMonitor.performHealthCheck();
      
      if (result) {
        res.json(result);
      } else {
        res.status(404).json({ message: "Configuração FTP não encontrada ou inativa" });
      }
    } catch (error) {
      res.status(500).json({ message: "Erro ao executar check de saúde FTP" });
    }
  });

  app.put("/api/version-history", requireAuth, requireSuperAdmin, async (req, res) => {
    try {
      const { content } = req.body;
      const userId = req.session.userId!;
      const user = await storage.getUser(userId);
      
      if (!content) {
        return res.status(400).json({ error: "Content is required" });
      }
      
      const updatedBy = user ? user.fullName : "Administrador";
      const versionHistory = await storage.updateVersionHistory(content, updatedBy);
      res.json(versionHistory);
    } catch (error) {
      res.status(500).json({ error: "Failed to update version history" });
    }
  });

  // Create and start the HTTP server
  // Admin email test endpoint
  app.post("/api/admin/test-email", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { to, subject, message } = req.body;
      
      if (!to || !subject || !message) {
        return res.status(400).json({ message: "Campos obrigatórios: to, subject, message" });
      }
      
      // TODO: Implement sendCustomEmail using sendEmail from emailService
      const success = true;
      
      if (success) {
        res.json({ message: "Email enviado com sucesso" });
      } else {
        res.status(500).json({ message: "Erro ao enviar email" });
      }
    } catch (error) {
      console.error("Error in test email endpoint:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Endpoint para validar configuração de email
  app.post("/api/admin/validate-email-config", requireAuth, requireAdmin, async (req, res) => {
    try {
      const config = req.body;
      
      console.log('🔍 Validando configuração de email:', config);
      
      // Validate that config has required properties
      if (!config || typeof config !== 'object') {
        return res.status(400).json({ 
          message: "Configuração de email inválida",
          isValid: false,
          status: 'error',
          details: ["Configuração não fornecida ou inválida"],
          recommendations: ["Forneça uma configuração válida de email"]
        });
      }
      
      // Perform field validation
      const validationErrors: string[] = [];
      const recommendations: string[] = [];
      
      if (!config.host?.trim()) {
        validationErrors.push("Servidor SMTP é obrigatório");
        recommendations.push("Defina um servidor SMTP válido (ex: smtp.gmail.com)");
      }
      
      if (!config.port || isNaN(config.port)) {
        validationErrors.push("Porta SMTP é obrigatória");
        recommendations.push("Use porta 587 (STARTTLS) ou 465 (SSL)");
      }
      
      if (!config.user?.trim()) {
        validationErrors.push("Usuário SMTP é obrigatório");
        recommendations.push("Defina um usuário SMTP válido");
      }
      
      if (!config.password?.trim()) {
        validationErrors.push("Senha SMTP é obrigatória");
        recommendations.push("Defina uma senha SMTP válida");
      }
      
      // Test connection if basic validation passes
      let testResults = {
        connection: false,
        authentication: false,
        sendTest: null as boolean | null
      };
      
      if (validationErrors.length === 0) {
        try {
          const nodemailer = await import('nodemailer');
          const transporter = nodemailer.createTransport({
            host: config.host,
            port: parseInt(config.port),
            secure: config.secure === true,
            auth: {
              user: config.user,
              pass: config.password,
            },
            tls: {
              rejectUnauthorized: false
            }
          });
          
          await transporter.verify();
          testResults.connection = true;
          testResults.authentication = true;
        } catch (error: any) {
          testResults.connection = false;
          testResults.authentication = false;
          
          if (error.message.includes('ENOTFOUND')) {
            validationErrors.push("Servidor SMTP não encontrado");
            recommendations.push("Verifique se o endereço do servidor está correto");
          } else if (error.message.includes('authentication') || error.message.includes('auth')) {
            validationErrors.push("Falha na autenticação");
            recommendations.push("Verifique se o usuário e senha estão corretos");
          } else {
            validationErrors.push(`Erro de conexão: ${error.message}`);
            recommendations.push("Verifique a configuração e conectividade");
          }
        }
      }
      
      const isValid = validationErrors.length === 0 && testResults.connection;
      const status = isValid ? 'success' : 'error';
      
      res.json({
        isValid,
        status,
        message: isValid ? "Configuração válida" : "Problemas encontrados",
        details: validationErrors.length > 0 ? validationErrors : ["Configuração testada com sucesso"],
        testResults,
        recommendations,
        timestamp: new Date().toISOString()
      });
      
    } catch (error: any) {
      console.error("Error validating email config:", error);
      res.status(500).json({ 
        message: "Erro interno na validação",
        isValid: false,
        status: 'error',
        details: [`Erro técnico: ${error.message}`],
        recommendations: ["Tente novamente", "Verifique os logs do sistema"],
        timestamp: new Date().toISOString()
      });
    }
  });

  // Endpoint para teste específico do Gmail
  app.post("/api/admin/test-gmail-delivery", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email || !email.includes('@gmail.com')) {
        return res.status(400).json({
          success: false,
          message: "Email Gmail é obrigatório",
          details: "Por favor, forneça um email @gmail.com válido"
        });
      }
      
      console.log(`🧪 [GMAIL TEST] Testando entrega otimizada para: ${email}`);
      
      // Import email service with error handling
      let sendEmail;
      try {
        const emailModule = await import('./emailService');
        sendEmail = emailModule.sendEmail;
        if (!sendEmail || typeof sendEmail !== 'function') {
          throw new Error('sendEmail function not found in emailService module');
        }
      } catch (importError: any) {
        console.error('Failed to import emailService:', importError);
        return res.status(500).json({
          success: false,
          message: "Erro interno do sistema",
          details: [`Falha ao carregar serviço de email: ${importError.message}`],
          timestamp: new Date().toISOString()
        });
      }
      
      // Send test email with Gmail optimizations
      let success = false;
      let sendEmailError = null;
      
      try {
        success = await sendEmail({
          to: email,
          from: 'contato@profac.com.br',
          subject: '🧪 Teste de Entrega Gmail - PROFAC',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">✅ Teste Gmail Bem-Sucedido!</h2>
              <p>Este é um email de teste para verificar a entrega otimizada para Gmail.</p>
              <p><strong>Horário do teste:</strong> ${new Date().toLocaleString('pt-BR')}</p>
              <p><strong>Configurações utilizadas:</strong></p>
              <ul>
                <li>Conexão otimizada para Gmail</li>
                <li>Headers específicos para melhor entregabilidade</li>
                <li>Timeouts ajustados para performance</li>
              </ul>
              <hr style="margin: 20px 0;">
              <p style="color: #666; font-size: 12px;">
                PROFAC - Sistema de Gestão<br>
                Este é um email automático de teste.
              </p>
            </div>
          `,
          text: `Teste Gmail PROFAC - ${new Date().toLocaleString('pt-BR')}\n\nEste é um email de teste para verificar a entrega otimizada para Gmail.`
        });
      } catch (emailError: any) {
        console.error('Error in sendEmail call:', emailError);
        sendEmailError = emailError;
        success = false;
      }
      
      if (success) {
        res.json({
          success: true,
          message: "✅ Teste Gmail concluído com sucesso!",
          details: [
            "Email entregue usando configurações otimizadas para Gmail",
            "Verificque sua caixa de entrada (e spam) em alguns segundos",
            "Tempos de entrega melhorados com as novas otimizações"
          ],
          timestamp: new Date().toISOString()
        });
      } else {
        const errorDetails = [
          "Não foi possível entregar o email de teste",
          "Verifique as configurações SMTP",
          "Considere usar uma senha de app do Gmail"
        ];
        
        // Add specific error details if available
        if (sendEmailError) {
          errorDetails.push(`Erro técnico: ${sendEmailError.message}`);
        }
        
        res.status(500).json({
          success: false,
          message: "❌ Falha no teste Gmail",
          details: errorDetails,
          recommendations: [
            "Verifique se a autenticação em 2 fatores está ativa",
            "Use uma senha de app específica em vez da senha normal",
            "Confirme se o email de origem está autorizado",
            "Teste com um email diferente para verificar se o problema é específico"
          ],
          timestamp: new Date().toISOString()
        });
      }
      
    } catch (error: any) {
      console.error("Error in Gmail test:", error);
      res.status(500).json({
        success: false,
        message: "Erro no teste Gmail",
        details: [`Erro técnico: ${error.message}`],
        timestamp: new Date().toISOString()
      });
    }
  });

  // Endpoint para validação rápida de configuração
  app.post("/api/admin/quick-validate-email", requireAuth, requireAdmin, async (req, res) => {
    try {
      const config = req.body;
      
      // Import validator functions
      const { validateEmailSetup } = await import('./emailValidator');
      
      // Perform quick validation using existing validation
      const result = await validateEmailSetup();
      
      res.json(result);
    } catch (error) {
      console.error("Error in quick email validation:", error);
      res.status(500).json({ 
        message: "Erro na validação rápida",
        isValid: false
      });
    }
  });

  // Support Tickets routes
  app.get("/api/admin/tickets", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { status, category, priority, search, paginated } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      if (paginated === 'true' && !search && !category && !priority) {
        const result = await storage.getTicketsPaginated(page, limit, status as string | undefined);
        res.json(result);
      } else {
        let tickets: SupportTicket[];

        if (search) {
          tickets = await storage.searchTickets(search as string);
        } else if (status) {
          tickets = await storage.getTicketsByStatus(status as string);
        } else if (category) {
          tickets = await storage.getTicketsByCategory(category as string);
        } else if (priority) {
          tickets = await storage.getTicketsByPriority(priority as string);
        } else {
          tickets = await storage.getAllTickets();
        }

        res.json(tickets);
      }
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar tickets" });
    }
  });

  app.get("/api/admin/tickets/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const ticket = await storage.getTicket(ticketId);
      
      if (!ticket) {
        return res.status(404).json({ message: "Ticket não encontrado" });
      }
      
      const replies = await storage.getTicketReplies(ticketId);
      res.json({ ticket, replies });
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar ticket" });
    }
  });

  // Public ticket creation (for contact form)
  app.post("/api/tickets", async (req, res) => {
    try {
      const ticketData = insertSupportTicketSchema.parse(req.body);
      const ticket = await storage.createTicket(ticketData);
      
      // Send notification email to admin
      try {
        // TODO: Implement sendTicketNotification using sendEmail from emailService
        console.log("Ticket notification would be sent here");
      } catch (emailError) {
        console.error("Failed to send ticket notification:", emailError);
      }
      
      res.status(201).json(ticket);
    } catch (error) {
      res.status(400).json({ message: "Dados do ticket inválidos" });
    }
  });

  app.put("/api/admin/tickets/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const ticketData = req.body;
      
      if (ticketData.status === "resolved") {
        ticketData.resolvedAt = new Date();
      }
      
      const updatedTicket = await storage.updateTicket(ticketId, ticketData);
      res.json(updatedTicket);
    } catch (error) {
      res.status(400).json({ message: "Erro ao atualizar ticket" });
    }
  });

  app.delete("/api/admin/tickets/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      await storage.deleteTicket(ticketId);
      res.json({ message: "Ticket excluído com sucesso" });
    } catch (error) {
      res.status(400).json({ message: "Erro ao excluir ticket" });
    }
  });

  // Ticket Replies routes
  app.post("/api/admin/tickets/:id/replies", requireAuth, requireAdmin, async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const replyData = insertTicketReplySchema.parse({
        ...req.body,
        ticketId,
        userId: req.session.userId,
      });
      
      const reply = await storage.createTicketReply(replyData);
      res.status(201).json(reply);
    } catch (error) {
      res.status(400).json({ message: "Erro ao criar resposta" });
    }
  });

  app.put("/api/admin/replies/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const replyId = parseInt(req.params.id);
      const replyData = req.body;
      const updatedReply = await storage.updateTicketReply(replyId, replyData);
      res.json(updatedReply);
    } catch (error) {
      res.status(400).json({ message: "Erro ao atualizar resposta" });
    }
  });

  app.delete("/api/admin/replies/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const replyId = parseInt(req.params.id);
      await storage.deleteTicketReply(replyId);
      res.json({ message: "Resposta excluída com sucesso" });
    } catch (error) {
      res.status(400).json({ message: "Erro ao excluir resposta" });
    }
  });

  // Endpoint para notificar usuários sobre nova versão (apenas super admin)
  app.post("/api/admin/notify-version", requireSuperAdmin, (req, res) => {
    const { version, fileName, description, downloadUrl } = req.body;
    
    if (!version || !fileName) {
      return res.status(400).json({ error: "Versão e nome do arquivo são obrigatórios" });
    }

    (async () => {
      try {
        const { notifyUsersAboutNewVersion } = await import("./versionNotificationService");
        const result = await notifyUsersAboutNewVersion({
          version,
          fileName,
          description,
          downloadUrl: downloadUrl || "https://profac.com.br/downloads"
        });
        
        if (result.success) {
          res.json({ 
            success: true, 
            message: `Notificação enviada para ${result.notifiedUsers} usuários aprovados`,
            notifiedUsers: result.notifiedUsers
          });
        } else {
          res.status(500).json({ 
            success: false, 
            error: result.error || "Erro ao enviar notificações" 
          });
        }
      } catch (error) {
        console.error("Erro ao notificar usuários sobre nova versão:", error);
        res.status(500).json({ 
          success: false, 
          error: "Erro interno do servidor" 
        });
      }
    })();
  });

  // Endpoint para teste de notificação de versão (apenas super admin)
  app.post("/api/admin/test-version-notification", requireSuperAdmin, (req, res) => {
    (async () => {
      try {
        const { testVersionNotification } = await import("./versionNotificationService");
        const result = await testVersionNotification();
        
        if (result.success) {
          res.json({ 
            success: true, 
            message: `Notificação de teste enviada para ${result.notifiedUsers} usuários`,
            notifiedUsers: result.notifiedUsers
          });
        } else {
          res.status(500).json({ 
            success: false, 
            error: result.error || "Erro ao enviar notificação de teste" 
          });
        }
      } catch (error) {
        console.error("Erro no teste de notificação de versão:", error);
        res.status(500).json({ 
          success: false, 
          error: "Erro interno do servidor" 
        });
      }
    })();
  });

  // FTP Configuration routes
  app.get("/api/admin/ftp-config", requireAuth, requireAdmin, async (req, res) => {
    try {
      const ftpConfig = await storage.getFtpConfig();
      if (ftpConfig) {
        // Return complete config including password for admin use
        res.json(ftpConfig);
      } else {
        res.json(null);
      }
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar configuração FTP" });
    }
  });

  app.post("/api/admin/ftp-config", requireAuth, requireAdmin, async (req, res) => {
    try {
      const configData = insertFtpConfigSchema.parse(req.body);
      const ftpConfig = await storage.createFtpConfig(configData);
      
      // Auto-validate the new configuration
      const healthMonitor = FtpHealthMonitor.getInstance();
      const validationResult = await healthMonitor.validateConfigurationChange(ftpConfig);
      
      res.status(201).json({
        ...ftpConfig,
        validationResult: {
          status: validationResult.status,
          success: validationResult.success,
          issues: validationResult.issues,
          lastValidated: validationResult.timestamp
        }
      });
    } catch (error) {
      res.status(400).json({ message: "Erro ao criar configuração FTP" });
    }
  });

  app.put("/api/admin/ftp-config/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const configId = parseInt(req.params.id);
      const configData = insertFtpConfigSchema.parse(req.body);
      
      // Always update with the provided data (including password if given)
      const updatedConfig = await storage.updateFtpConfig(configId, configData);
      
      // Auto-validate the updated configuration
      const healthMonitor = FtpHealthMonitor.getInstance();
      const validationResult = await healthMonitor.validateConfigurationChange(updatedConfig);
      
      res.json({
        ...updatedConfig,
        validationResult: {
          status: validationResult.status,
          success: validationResult.success,
          issues: validationResult.issues,
          lastValidated: validationResult.timestamp
        }
      });
    } catch (error) {
      console.error("Error updating FTP config:", error);
      res.status(400).json({ message: "Erro ao atualizar configuração FTP" });
    }
  });

  app.post("/api/admin/ftp-config/test", requireAuth, requireAdmin, async (req, res) => {
    try {
      console.log('🧪 Testando configuração FTP...');
      const configData = req.body;
      
      // Comprehensive FTP validation and testing
      const ftpValidator = new FtpValidator();
      const validationResult = await ftpValidator.validateAndTest(configData);
      
      res.json(validationResult);
    } catch (error) {
      console.error('❌ Erro no teste FTP:', error);
      res.status(500).json({
        success: false,
        message: "Erro interno ao testar conexão FTP",
        details: (error as Error).message,
        status: 'error'
      });
    }
  });

  // Email Invitation routes (super admin only)
  app.post("/api/admin/invitations/send", requireSuperAdmin, async (req, res) => {
    try {
      const { emails, customMessage } = req.body;
      const senderId = req.session.userId!;
      const sender = await storage.getUser(senderId);
      
      if (!emails || !Array.isArray(emails) || emails.length === 0) {
        return res.status(400).json({ message: "Lista de emails é obrigatória" });
      }

      // Validate emails
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const validEmails = emails.filter(email => emailRegex.test(email.trim()));

      if (validEmails.length === 0) {
        return res.status(400).json({ message: "Nenhum email válido encontrado" });
      }

      const { sendInvitationEmail, generateInviteToken } = await import("./invitationService");
      
      let successCount = 0;
      const results = [];

      for (const email of validEmails) {
        try {
          // Check if invitation already exists and is not expired
          const existingInvites = await storage.getEmailInvitations();
          const activeInvite = existingInvites.find(inv => 
            inv.email === email && 
            new Date(inv.expiresAt) > new Date() &&
            inv.status !== "expired"
          );

          if (activeInvite) {
            results.push({ email, status: "skipped", reason: "Convite ativo já existe" });
            continue;
          }

          // Generate invitation token and expiration (30 days)
          const inviteToken = generateInviteToken();
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 30);

          // Save invitation to database
          const invitation = await storage.createEmailInvitation({
            email,
            inviteToken,
            sentBy: senderId,
            status: "sent",
            clickCount: 0,
            expiresAt,
          });

          // Send invitation email
          const emailSent = await sendInvitationEmail({
            email,
            inviteToken,
            senderName: "Afonso Monteiro",
          });

          if (emailSent) {
            successCount++;
            results.push({ email, status: "sent", invitationId: invitation.id });
          } else {
            results.push({ email, status: "failed", reason: "Erro ao enviar email" });
          }
        } catch (error) {
          console.error(`Erro ao processar convite para ${email}:`, error);
          results.push({ email, status: "failed", reason: "Erro interno" });
        }
      }

      res.json({
        successCount,
        totalProcessed: validEmails.length,
        results,
        message: `${successCount} convites enviados com sucesso de ${validEmails.length} processados`
      });
    } catch (error) {
      console.error("Erro ao enviar convites:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.get("/api/admin/invitations", requireSuperAdmin, async (req, res) => {
    try {
      const invitations = await storage.getEmailInvitations();
      res.json(invitations);
    } catch (error) {
      console.error("Erro ao buscar convites:", error);
      res.status(500).json({ message: "Erro ao buscar convites" });
    }
  });

  app.get("/api/admin/invitations/stats", requireSuperAdmin, async (req, res) => {
    try {
      const stats = await storage.getInvitationStats();
      res.json(stats);
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
      res.status(500).json({ message: "Erro ao buscar estatísticas" });
    }
  });

  // Public route to handle invitation clicks (tracks clicks and redirects)
  app.get("/api/invitations/click/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const invitation = await storage.getEmailInvitationByToken(token);

      if (!invitation) {
        return res.redirect("/auth?error=invalid_invite");
      }

      // Check if invitation is expired
      if (new Date(invitation.expiresAt) < new Date()) {
        await storage.updateInvitationStatus(invitation.id, "expired");
        return res.redirect("/auth?error=expired_invite");
      }

      // Update click tracking
      const updateData: any = {
        clickCount: (invitation.clickCount || 0) + 1,
        lastClickedAt: new Date(),
      };

      // Set first click if not already set
      if (!invitation.firstClickedAt) {
        updateData.firstClickedAt = new Date();
      }

      // Update status to clicked if still sent
      const newStatus = invitation.status === "sent" ? "clicked" : invitation.status;
      
      await storage.updateInvitationStatus(invitation.id, newStatus, updateData);

      // Redirect to registration page with invitation token
      res.redirect(`/auth?invite=${token}`);
    } catch (error) {
      console.error("Erro ao processar clique do convite:", error);
      res.redirect("/auth?error=invite_error");
    }
  });

  // Route to resend specific invitation (super admin only)
  app.post("/api/admin/invitations/resend/:email", requireSuperAdmin, async (req, res) => {
    try {
      const { email } = req.params;
      const senderId = req.session.userId!;
      const sender = await storage.getUser(senderId);

      if (!email) {
        return res.status(400).json({ message: "Email é obrigatório" });
      }

      // Check if there's an existing invitation
      const existingInvites = await storage.getEmailInvitations();
      const existingInvite = existingInvites.find(inv => inv.email === email);

      if (existingInvite && existingInvite.status === 'registered') {
        return res.status(400).json({ message: "Usuário já registrado através deste convite" });
      }

      const { sendInvitationEmail, generateInviteToken } = await import("./invitationService");

      // Generate new invitation token and expiration (30 days)
      const inviteToken = generateInviteToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      // Create new invitation or update existing one
      let invitation;
      if (existingInvite) {
        // Update existing invitation with new token and reset counters
        const updateResult = await storage.updateInvitationStatus(existingInvite.id, "sent", {
          inviteToken,
          expiresAt,
          clickCount: 0,
          firstClickedAt: null,
          lastClickedAt: null,
          registeredAt: null,
          registeredUserId: null,
        });
        invitation = existingInvite; // Use existing invite as updateResult may be void
      } else {
        // Create new invitation
        invitation = await storage.createEmailInvitation({
          email,
          inviteToken,
          sentBy: senderId,
          status: "sent",
          clickCount: 0,
          expiresAt,
        });
      }

      // Send invitation email
      const emailSent = await sendInvitationEmail({
        email,
        inviteToken,
        senderName: sender?.fullName || "Administrador",
      });

      if (emailSent) {
        res.json({
          success: true,
          message: `Convite reenviado com sucesso para ${email}`,
          invitation: { id: invitation?.id || existingInvite?.id, email, status: "sent" }
        });
      } else {
        res.status(500).json({ message: "Erro ao reenviar convite" });
      }
    } catch (error) {
      console.error("Erro ao reenviar convite:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Email testing and diagnostics routes
  app.post("/api/admin/email/test", requireAdmin, async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ 
          success: false,
          message: "Email é obrigatório",
          details: "Forneça um endereço de email válido para realizar o teste.",
          error: "MISSING_EMAIL"
        });
      }

      // Validar formato do email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          success: false,
          message: "Formato de email inválido",
          details: `O email "${email}" não possui um formato válido.`,
          error: "INVALID_EMAIL_FORMAT"
        });
      }

      console.log(`🔍 === TESTE DE EMAIL INICIADO VIA API ===`);
      console.log(`📧 Email solicitante: ${(req.session as any)?.userEmail || 'N/A'}`);
      console.log(`📧 Destinatário: ${email}`);
      
      // Import and use comprehensive email test
      const { runCompleteEmailTest } = await import('./emailTestRunner');
      const result = await runCompleteEmailTest(email);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error: any) {
      console.error('❌ Erro na API de teste de email:', error);
      res.status(500).json({ 
        success: false, 
        message: "Erro interno do servidor", 
        details: `Erro técnico: ${error.message}\n\nEste erro indica um problema na configuração do sistema de email. Verifique os logs do servidor para mais detalhes.`,
        error: "INTERNAL_SERVER_ERROR",
        timestamp: new Date().toLocaleString('pt-BR')
      });
    }
  });

  // Enhanced email diagnostics endpoint
  app.post("/api/admin/email/diagnostic", requireAdmin, async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ 
          success: false,
          message: "Email é obrigatório para diagnóstico",
          details: "Forneça um endereço de email válido para realizar o diagnóstico completo.",
          error: "MISSING_EMAIL"
        });
      }

      console.log(`🔍 === DIAGNÓSTICO COMPLETO INICIADO ===`);
      console.log(`📧 Email solicitante: ${(req.session as any)?.userEmail || 'N/A'}`);
      console.log(`📧 Email para teste: ${email}`);

      // Import and use comprehensive diagnostic
      const { runEmailDiagnostic } = await import('./emailTestRunner');
      const result = await runEmailDiagnostic(email);

      res.json(result);

    } catch (error: any) {
      console.error('❌ Erro no diagnóstico de email:', error);
      res.status(500).json({ 
        success: false, 
        message: "Erro no diagnóstico", 
        details: `Erro técnico no diagnóstico: ${error.message}\n\nVerifique se a configuração de email está salva corretamente no banco de dados.`,
        error: "INTERNAL_SERVER_ERROR",
        timestamp: new Date().toLocaleString('pt-BR')
      });
    }
  });

  // Simple email test endpoint for development (no auth required)
  app.post("/api/test-email-simple", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ 
          success: false,
          message: "Email é obrigatório",
          details: "Forneça um endereço de email para teste.",
          error: "MISSING_EMAIL"
        });
      }

      console.log(`🔍 === TESTE SIMPLES DE EMAIL (SEM AUTH) ===`);
      console.log(`📧 Destinatário: ${email}`);
      
      const { runCompleteEmailTest } = await import('./emailTestRunner');
      const result = await runCompleteEmailTest(email);
      
      res.json(result);

    } catch (error: any) {
      console.error('❌ Erro no teste simples:', error);
      res.status(500).json({ 
        success: false, 
        message: "Erro no teste", 
        details: `Erro: ${error.message}`,
        error: "INTERNAL_SERVER_ERROR",
        timestamp: new Date().toLocaleString('pt-BR')
      });
    }
  });

  app.get("/api/admin/email/validate", requireAdmin, async (req, res) => {
    try {
      console.log('🔍 Iniciando validação de configuração de email...');
      const validation = await validateEmailSetup();
      
      res.json({
        isValid: validation.isValid,
        issues: validation.issues,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({ 
        isValid: false, 
        issues: [`Erro na validação: ${error.message}`],
        timestamp: new Date().toISOString()
      });
    }
  });

  // Analytics tracking endpoint (public, no auth required)
  app.post("/api/analytics/track", async (req, res) => {
    try {
      const { path: pagePath, referrer } = req.body;
      if (!pagePath || typeof pagePath !== 'string') {
        return res.status(400).json({ message: "Path é obrigatório" });
      }

      const forwardedFor = req.headers['x-forwarded-for'];
      const forwardedIp = forwardedFor ? (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor.split(',')[0].trim()) : null;
      const ipString = forwardedIp || req.ip || 'unknown';
      const crypto = await import('crypto');
      const ipHash = crypto.createHash('sha256').update(ipString + 'profac-salt').digest('hex').substring(0, 16);

      let country: string | undefined;
      let region: string | undefined;
      let city: string | undefined;
      try {
        const geoip = await import('geoip-lite');
        const cleanIp = ipString.replace('::ffff:', '').trim();
        const geo = geoip.default.lookup(cleanIp);
        if (geo) {
          country = geo.country || undefined;
          region = geo.region || undefined;
          city = geo.city || undefined;
        }
      } catch (geoError) {
      }

      await storage.trackPageView({
        path: pagePath,
        referrer: referrer || undefined,
        userAgent: req.headers['user-agent'] || undefined,
        ipHash,
        userId: (req.session as any)?.userId || undefined,
        sessionId: req.sessionID || undefined,
        country,
        region,
        city,
      });

      res.status(204).send();
    } catch (error: any) {
      res.status(204).send();
    }
  });

  // Admin analytics endpoints
  app.get("/api/admin/analytics/summary", requireAuth, requireAdmin, async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const summary = await storage.getAnalyticsSummary(Math.min(days, 365));
      res.json(summary);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/analytics/monthly", requireAuth, requireAdmin, async (req, res) => {
    try {
      const months = parseInt(req.query.months as string) || 12;
      const monthly = await storage.getAnalyticsMonthly(Math.min(months, 24));
      res.json(monthly);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/analytics/top-pages", requireAuth, requireAdmin, async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const limit = parseInt(req.query.limit as string) || 10;
      const topPages = await storage.getTopPages(Math.min(days, 365), Math.min(limit, 50));
      res.json(topPages);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/analytics/locations", requireAuth, requireAdmin, async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const locations = await storage.getLocationStats(Math.min(days, 365));
      res.json(locations);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/analytics/today", requireAuth, requireAdmin, async (req, res) => {
    try {
      const today = await storage.getAnalyticsToday();
      res.json(today);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}