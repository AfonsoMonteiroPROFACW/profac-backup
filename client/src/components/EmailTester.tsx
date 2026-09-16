import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Mail, CheckCircle, XCircle, AlertTriangle, Loader2, Settings } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface EmailTestResults {
  success: boolean;
  message: string;
  details: string;
  timestamp: string;
  configuration?: {
    host: string;
    port: number;
    user: string;
    secure: boolean;
    fromEmail: string;
  };
  validationResults?: {
    isValid: boolean;
    issues: string[];
  };
  error?: string;
}

export function EmailTester() {
  const [email, setEmail] = useState("");
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [isRunningDiagnostic, setIsRunningDiagnostic] = useState(false);
  const [testResult, setTestResult] = useState<EmailTestResults | null>(null);
  const [diagnosticResult, setDiagnosticResult] = useState<EmailTestResults | null>(null);

  const formatDetails = (details: string) => {
    return details.split('\n').map((line, index) => (
      <div key={index} className="whitespace-pre-wrap">
        {line}
      </div>
    ));
  };

  const testEmail = async () => {
    if (!email.trim()) {
      setTestResult({
        success: false,
        message: "Email é obrigatório",
        details: "Por favor, forneça um endereço de email válido para realizar o teste.",
        timestamp: new Date().toLocaleString('pt-BR'),
        error: "MISSING_EMAIL"
      });
      return;
    }

    setIsTestingEmail(true);
    setTestResult(null);

    try {
      const response = await apiRequest("POST", "/api/admin/email/test", { email });
      const result = await response.json();
      setTestResult(result);
    } catch (error: any) {
      console.error("Email test error:", error);
      setTestResult({
        success: false,
        message: "Erro na comunicação",
        details: `Erro ao conectar com o servidor: ${error.message || "Erro desconhecido"}`,
        timestamp: new Date().toLocaleString('pt-BR'),
        error: "NETWORK_ERROR"
      });
    } finally {
      setIsTestingEmail(false);
    }
  };

  const runDiagnostic = async () => {
    if (!email.trim()) {
      setDiagnosticResult({
        success: false,
        message: "Email é obrigatório",
        details: "Por favor, forneça um endereço de email válido para realizar o diagnóstico.",
        timestamp: new Date().toLocaleString('pt-BR'),
        error: "MISSING_EMAIL"
      });
      return;
    }

    setIsRunningDiagnostic(true);
    setDiagnosticResult(null);

    try {
      const response = await apiRequest("POST", "/api/admin/email/diagnostic", { email });
      const result = await response.json();
      setDiagnosticResult(result);
    } catch (error: any) {
      console.error("Email diagnostic error:", error);
      setDiagnosticResult({
        success: false,
        message: "Erro no diagnóstico",
        details: `Erro ao executar diagnóstico: ${error.message || "Erro desconhecido"}`,
        timestamp: new Date().toLocaleString('pt-BR'),
        error: "DIAGNOSTIC_ERROR"
      });
    } finally {
      setIsRunningDiagnostic(false);
    }
  };

  const ResultCard = ({ result, title }: { result: EmailTestResults; title: string }) => (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          {result.success ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600" />
          )}
          <CardTitle className="text-lg">{title}</CardTitle>
          <Badge variant={result.success ? "default" : "destructive"}>
            {result.success ? "Sucesso" : "Falha"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant={result.success ? "default" : "destructive"}>
          <AlertDescription>
            <div className="font-medium mb-2">{result.message}</div>
            <div className="text-sm text-muted-foreground">
              {formatDetails(result.details)}
            </div>
          </AlertDescription>
        </Alert>

        {result.configuration && (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <h4 className="text-sm font-semibold">Configuração Utilizada</h4>
              </div>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <div>Host: <code className="bg-muted px-1 rounded">{result.configuration.host}</code></div>
              <div>Porta: <code className="bg-muted px-1 rounded">{result.configuration.port}</code></div>
              <div>Usuário: <code className="bg-muted px-1 rounded">{result.configuration.user}</code></div>
              <div>Segurança: <code className="bg-muted px-1 rounded">{result.configuration.secure ? 'SSL/TLS' : 'STARTTLS/Nenhuma'}</code></div>
              <div>Email de envio: <code className="bg-muted px-1 rounded">{result.configuration.fromEmail}</code></div>
            </CardContent>
          </Card>
        )}

        {result.validationResults && result.validationResults.issues.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <h4 className="text-sm font-semibold">Problemas Detectados</h4>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1">
                {result.validationResults.issues.map((issue, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <AlertTriangle className="h-3 w-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                    {issue}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <div className="text-xs text-muted-foreground">
          Executado em: {result.timestamp}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            <CardTitle>Teste de Email</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="test-email" className="text-sm font-medium">
              Email para teste
            </label>
            <Input
              id="test-email"
              type="email"
              placeholder="exemplo@dominio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && testEmail()}
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={testEmail} 
              disabled={isTestingEmail || !email.trim()}
              className="flex-1"
            >
              {isTestingEmail ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar Teste
                </>
              )}
            </Button>

            <Button 
              variant="outline"
              onClick={runDiagnostic} 
              disabled={isRunningDiagnostic || !email.trim()}
              className="flex-1"
            >
              {isRunningDiagnostic ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Diagnosticando...
                </>
              ) : (
                <>
                  <Settings className="mr-2 h-4 w-4" />
                  Diagnóstico Completo
                </>
              )}
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            <p><strong>Enviar Teste:</strong> Envia um email de teste para verificar se a entrega está funcionando.</p>
            <p><strong>Diagnóstico Completo:</strong> Executa verificações detalhadas da configuração e testa múltiplas opções.</p>
          </div>
        </CardContent>
      </Card>

      {testResult && (
        <ResultCard result={testResult} title="Resultado do Teste de Email" />
      )}

      {diagnosticResult && (
        <ResultCard result={diagnosticResult} title="Resultado do Diagnóstico" />
      )}
    </div>
  );
}