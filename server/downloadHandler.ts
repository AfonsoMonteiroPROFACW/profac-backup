import { Client } from 'basic-ftp';
import { Response } from 'express';
import { Writable } from 'stream';

export async function handleFtpDownload(
  ftpConfig: any,
  res: Response,
  downloadId: number
): Promise<void> {
  const ftp = new Client();
  let buffer: Buffer | null = null;
  
  try {
    console.log(`📡 Validando existência do arquivo: ${ftpConfig.fileName}`);
    
    // Conectar ao FTP
    await ftp.access({
      host: ftpConfig.ftpHost,
      port: ftpConfig.ftpPort || 21,
      user: ftpConfig.ftpUser,
      password: ftpConfig.ftpPassword,
      secure: false,
      secureOptions: { rejectUnauthorized: false }
    });

    const remotePath = ftpConfig.downloadPath ? 
      `${ftpConfig.downloadPath}/${ftpConfig.fileName}` : 
      ftpConfig.fileName;

    // CRÍTICO: Verificar se arquivo existe antes de prosseguir
    let fileSize: number;
    try {
      fileSize = await ftp.size(remotePath);
      console.log(`✅ Arquivo existe: ${(fileSize / 1024 / 1024).toFixed(1)} MB`);
    } catch (sizeError: any) {
      console.error(`❌ Arquivo não encontrado no FTP: ${remotePath}`);
      ftp.close();
      res.status(404).json({ 
        message: "Arquivo não encontrado no servidor",
        fileName: ftpConfig.fileName 
      });
      return;
    }

    // Verificar se arquivo não está vazio
    if (fileSize === 0) {
      console.error(`❌ Arquivo vazio: ${remotePath}`);
      ftp.close();
      res.status(400).json({ 
        message: "Arquivo está vazio",
        fileName: ftpConfig.fileName 
      });
      return;
    }

    console.log(`📡 Iniciando download: ${ftpConfig.fileName}`);
    
    // Baixar arquivo para buffer usando Writable stream
    console.log(`⬇️ Baixando arquivo para buffer...`);
    const chunks: Buffer[] = [];
    let downloadedBytes = 0;
    
    const writeStream = new Writable({
      write(chunk: Buffer, encoding: string, callback: (error?: Error | null) => void) {
        chunks.push(chunk);
        downloadedBytes += chunk.length;
        const progress = (downloadedBytes / fileSize) * 100;
        if (progress % 10 < 1) {
          console.log(`📊 Progresso: ${progress.toFixed(0)}%`);
        }
        callback();
      }
    });
    
    // Download do arquivo
    await ftp.downloadTo(writeStream, remotePath);
    
    // Combinar chunks em um único buffer
    buffer = Buffer.concat(chunks);
    console.log(`✅ Download completo: ${buffer.length} bytes`);
    
    // Fechar conexão FTP
    ftp.close();
    
    // Verificar integridade
    if (buffer.length !== fileSize) {
      console.warn(`⚠️ Tamanho não corresponde: esperado ${fileSize}, recebido ${buffer.length}`);
    }
    
    // Configurar headers para download seguro
    const fileExtension = ftpConfig.fileName.toLowerCase().split('.').pop();
    let contentType = 'application/octet-stream';
    
    // Usar content-type específico para executáveis
    if (fileExtension === 'exe') {
      contentType = 'application/x-msdownload';
    } else if (fileExtension === 'zip') {
      contentType = 'application/zip';
    }
    
    // Headers otimizados para evitar .crdownload
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${ftpConfig.fileName}"`);
    res.setHeader('Content-Length', buffer.length.toString());
    res.setHeader('Accept-Ranges', 'none');
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Download-Options', 'noopen');
    res.setHeader('Content-Transfer-Encoding', 'binary');
    
    // Enviar buffer completo de uma vez
    res.status(200);
    res.end(buffer, 'binary');
    
    console.log(`✅ Arquivo enviado com sucesso: ${ftpConfig.fileName} (${buffer.length} bytes)`);
    
  } catch (error: any) {
    console.error(`❌ Erro no download FTP:`, error);
    
    // Se já temos algum buffer, tentar enviar mesmo assim
    if (buffer && buffer.length > 0) {
      const fileExtension = ftpConfig.fileName.toLowerCase().split('.').pop();
      let contentType = 'application/octet-stream';
      
      if (fileExtension === 'exe') {
        contentType = 'application/x-msdownload';
      } else if (fileExtension === 'zip') {
        contentType = 'application/zip';
      }
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${ftpConfig.fileName}"`);
      res.setHeader('Content-Length', buffer.length.toString());
      res.setHeader('Accept-Ranges', 'none');
      res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.setHeader('Content-Transfer-Encoding', 'binary');
      res.status(200);
      res.end(buffer, 'binary');
    } else {
      // Se não temos buffer, verificar novamente se arquivo existe
      const ftp2 = new Client();
      try {
        await ftp2.access({
          host: ftpConfig.ftpHost,
          port: ftpConfig.ftpPort || 21,
          user: ftpConfig.ftpUser,
          password: ftpConfig.ftpPassword,
          secure: false,
          secureOptions: { rejectUnauthorized: false }
        });

        const remotePath = ftpConfig.downloadPath ? 
          `${ftpConfig.downloadPath}/${ftpConfig.fileName}` : 
          ftpConfig.fileName;

        const fileSize2 = await ftp2.size(remotePath);
        console.log(`⚠️ Arquivo ainda existe (${fileSize2} bytes), mas download falhou`);
        ftp2.close();
        
        res.status(500).json({ 
          message: "Erro durante o download do arquivo. Tente novamente.",
          fileName: ftpConfig.fileName 
        });
      } catch (fallbackError: any) {
        console.error(`❌ Arquivo não existe mais no FTP: ${fallbackError.message}`);
        res.status(404).json({ 
          message: "Arquivo não está disponível no servidor FTP",
          fileName: ftpConfig.fileName 
        });
      }
    }
  }
}