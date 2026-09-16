// Validadores para CNPJ e CPF
export function isValidCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (cpf.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(9))) return false;
  
  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(10))) return false;
  
  return true;
}

export function isValidCNPJ(cnpj: string): boolean {
  // Remove caracteres não numéricos
  cnpj = cnpj.replace(/\D/g, '');
  
  // Verifica se tem 14 dígitos
  if (cnpj.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cnpj)) return false;
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  let weight = 2;
  for (let i = 11; i >= 0; i--) {
    sum += parseInt(cnpj.charAt(i)) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  let remainder = sum % 11;
  const firstDigit = remainder < 2 ? 0 : 11 - remainder;
  if (firstDigit !== parseInt(cnpj.charAt(12))) return false;
  
  // Validação do segundo dígito verificador
  sum = 0;
  weight = 2;
  for (let i = 12; i >= 0; i--) {
    sum += parseInt(cnpj.charAt(i)) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  remainder = sum % 11;
  const secondDigit = remainder < 2 ? 0 : 11 - remainder;
  if (secondDigit !== parseInt(cnpj.charAt(13))) return false;
  
  return true;
}

export function formatCPF(cpf: string): string {
  cpf = cpf.replace(/\D/g, '');
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export function formatCNPJ(cnpj: string): string {
  const digits = cnpj.replace(/\D/g, '');
  
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
}

// Formatação de telefone
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

export function isValidCNPJorCPF(document: string): { isValid: boolean; type: 'cnpj' | 'cpf' | null } {
  const cleanDocument = document.replace(/\D/g, '');
  
  if (cleanDocument.length === 11) {
    return {
      isValid: isValidCPF(cleanDocument),
      type: 'cpf'
    };
  } else if (cleanDocument.length === 14) {
    return {
      isValid: isValidCNPJ(cleanDocument),
      type: 'cnpj'
    };
  }
  
  return {
    isValid: false,
    type: null
  };
}

// Consulta CNPJ usando múltiplas APIs como fallback
export async function consultCNPJ(cnpj: string): Promise<{ success: boolean; companyName?: string; error?: string }> {
  const cleanCNPJ = cnpj.replace(/\D/g, '');
  
  if (!isValidCNPJ(cleanCNPJ)) {
    return { success: false, error: "CNPJ inválido" };
  }
  
  // Lista de APIs para tentar
  const apis = [
    {
      name: "BrasilAPI",
      url: `https://brasilapi.com.br/api/cnpj/v1/${cleanCNPJ}`,
      parser: (data: any) => data.razao_social || data.nome_fantasia
    },
    {
      name: "ReceitaWS",
      url: `https://www.receitaws.com.br/v1/cnpj/${cleanCNPJ}`,
      parser: (data: any) => data.status === "OK" ? data.nome : null
    },
    {
      name: "CNPJ-WS",
      url: `https://cnpj.ws/cnpj/${cleanCNPJ}`,
      parser: (data: any) => data.razao_social
    }
  ];
  
  for (const api of apis) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      
      const response = await fetch(api.url, {
        signal: controller.signal,
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'PROFAC-System/1.0'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        const companyName = api.parser(data);
        
        if (companyName && companyName.trim()) {
          return { 
            success: true, 
            companyName: companyName.trim()
          };
        }
      }
    } catch (error) {
      // Continue para próxima API
      continue;
    }
  }
  
  // Se todas as APIs falharam
  return { 
    success: false, 
    error: "CNPJ não encontrado. Verifique o número e tente novamente."
  };
}