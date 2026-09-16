// Utility functions for handling downloads

export async function initiateDownload(url: string, fileName: string) {
  try {
    // Usar iframe invisível para forçar download no Chrome sem .crdownload
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = url;
    document.body.appendChild(iframe);
    
    // Remover iframe após um tempo para limpar o DOM
    setTimeout(() => {
      try {
        document.body.removeChild(iframe);
      } catch (e) {
        // Ignore se já foi removido
      }
    }, 5000);
    
    return { success: true, message: 'Download iniciado com sucesso' };
  } catch (error) {
    return { 
      success: false, 
      message: 'Não foi possível iniciar o download. Verifique sua conexão com a internet.' 
    };
  }
}

export function createDownloadLink(url: string, fileName: string) {
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}