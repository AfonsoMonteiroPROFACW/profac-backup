import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, Users, TrendingUp, Globe, Calendar, BarChart3, MapPin } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

type SummaryData = {
  totalViews: number;
  uniqueVisitors: number;
  dailySeries: Array<{ date: string; views: number; uniqueVisitors: number }>;
};

type MonthlyData = Array<{ month: string; views: number; uniqueVisitors: number }>;
type TopPagesData = Array<{ path: string; views: number }>;
type TodayData = { views: number; uniqueVisitors: number };
type LocationData = Array<{ country: string; region: string; city: string; views: number; uniqueVisitors: number }>;

const COUNTRY_NAMES: Record<string, string> = {
  BR: "Brasil", US: "Estados Unidos", PT: "Portugal", AR: "Argentina",
  CL: "Chile", CO: "Colômbia", MX: "México", UY: "Uruguai",
  PY: "Paraguai", PE: "Peru", DE: "Alemanha", FR: "França",
  GB: "Reino Unido", ES: "Espanha", IT: "Itália", JP: "Japão",
  CN: "China", CA: "Canadá", AU: "Austrália", IN: "Índia",
  Desconhecido: "Desconhecido",
};

const PAGE_NAMES: Record<string, string> = {
  "/": "Página Inicial",
  "/auth": "Login / Cadastro",
  "/dashboard": "Dashboard",
  "/support": "Suporte",
  "/about": "Sobre",
  "/privacy": "Privacidade",
  "/terms": "Termos de Uso",
  "/contact": "Contato",
  "/forgot-password": "Esqueci Senha",
  "/admin": "Painel Admin",
  "/admin/users": "Admin - Usuários",
  "/admin/downloads": "Admin - Downloads",
  "/admin/tickets": "Admin - Tickets",
  "/admin/email": "Admin - Email",
  "/admin/ftp": "Admin - FTP",
  "/admin/comments": "Admin - Comentários",
  "/admin/security-badges": "Admin - Badges",
  "/admin/invitations": "Admin - Convites",
  "/admin/analytics": "Admin - Estatísticas",
};

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}`;
}

function formatMonth(monthStr: string) {
  const months: Record<string, string> = {
    "01": "Jan", "02": "Fev", "03": "Mar", "04": "Abr",
    "05": "Mai", "06": "Jun", "07": "Jul", "08": "Ago",
    "09": "Set", "10": "Out", "11": "Nov", "12": "Dez",
  };
  const [year, month] = monthStr.split("-");
  return `${months[month] || month}/${year.slice(2)}`;
}

export default function AdminAnalytics() {
  const [, setLocation] = useLocation();
  const [period, setPeriod] = useState(30);

  const { data: summary, isLoading: summaryLoading } = useQuery<SummaryData>({
    queryKey: [`/api/admin/analytics/summary?days=${period}`],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { data: monthly, isLoading: monthlyLoading } = useQuery<MonthlyData>({
    queryKey: ["/api/admin/analytics/monthly?months=12"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { data: topPages, isLoading: topPagesLoading } = useQuery<TopPagesData>({
    queryKey: [`/api/admin/analytics/top-pages?days=${period}&limit=10`],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { data: today, isLoading: todayLoading } = useQuery<TodayData>({
    queryKey: ["/api/admin/analytics/today"],
    queryFn: getQueryFn({ on401: "throw" }),
    refetchInterval: 60000,
  });

  const { data: locations, isLoading: locationsLoading } = useQuery<LocationData>({
    queryKey: [`/api/admin/analytics/locations?days=${period}`],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const dailyChartData = summary?.dailySeries.map(d => ({
    ...d,
    date: formatDate(d.date),
  })) || [];

  const monthlyChartData = monthly?.map(m => ({
    ...m,
    month: formatMonth(m.month),
  })) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
              <BarChart3 className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
              <span>Estatísticas de Acesso</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Acompanhe o tráfego e visitação do site em tempo real
            </p>
          </div>
          <Button
            onClick={() => setLocation("/admin")}
            variant="outline"
            className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card className="bg-white dark:bg-gray-800 shadow-lg border-l-4 border-l-cyan-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Hoje</CardTitle>
              <Calendar className="h-4 w-4 text-cyan-500" />
            </CardHeader>
            <CardContent>
              {todayLoading ? (
                <div className="animate-pulse h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                    {today?.views || 0}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {today?.uniqueVisitors || 0} visitantes únicos
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-lg border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Visualizações ({period}d)
              </CardTitle>
              <Eye className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              {summaryLoading ? (
                <div className="animate-pulse h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {summary?.totalViews?.toLocaleString('pt-BR') || 0}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Total de páginas visualizadas
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-lg border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Visitantes Únicos ({period}d)
              </CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              {summaryLoading ? (
                <div className="animate-pulse h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {summary?.uniqueVisitors?.toLocaleString('pt-BR') || 0}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Visitantes distintos
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-lg border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Média Diária
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              {summaryLoading ? (
                <div className="animate-pulse h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {summary && summary.dailySeries.length > 0
                      ? Math.round(summary.totalViews / summary.dailySeries.length)
                      : 0}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Visualizações por dia
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-2 mb-6">
          {[7, 14, 30, 60, 90].map(d => (
            <Button
              key={d}
              variant={period === d ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod(d)}
              className={period === d ? "bg-cyan-600 hover:bg-cyan-700" : "bg-white dark:bg-gray-800"}
            >
              {d}d
            </Button>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                Visitas Diárias ({period} dias)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {summaryLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
                </div>
              ) : dailyChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--background, #fff)",
                        border: "1px solid var(--border, #e5e7eb)",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="views"
                      stroke="#0891b2"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      name="Visualizações"
                    />
                    <Line
                      type="monotone"
                      dataKey="uniqueVisitors"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      name="Visitantes Únicos"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>Nenhum dado disponível para este período</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-500" />
                Visitas Mensais (12 meses)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
                </div>
              ) : monthlyChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--background, #fff)",
                        border: "1px solid var(--border, #e5e7eb)",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="views" fill="#0891b2" name="Visualizações" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="uniqueVisitors" fill="#22c55e" name="Visitantes Únicos" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>Nenhum dado mensal disponível</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="w-5 h-5 text-orange-500" />
              Páginas Mais Visitadas ({period} dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topPagesLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            ) : topPages && topPages.length > 0 ? (
              <div className="space-y-2">
                {topPages.map((page, index) => {
                  const maxViews = topPages[0]?.views || 1;
                  const percentage = (page.views / maxViews) * 100;
                  return (
                    <div key={page.path} className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-400 w-6 text-right">
                        {index + 1}.
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {PAGE_NAMES[page.path] || page.path}
                          </span>
                          <span className="text-sm font-semibold text-cyan-600 dark:text-cyan-400">
                            {page.views.toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Globe className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>Nenhum dado de páginas disponível</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-lg mt-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-500" />
              Localização dos Visitantes ({period} dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {locationsLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            ) : locations && locations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-2 font-semibold text-gray-600 dark:text-gray-400">#</th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-600 dark:text-gray-400">País</th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-600 dark:text-gray-400">Estado</th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-600 dark:text-gray-400">Cidade</th>
                      <th className="text-right py-3 px-2 font-semibold text-gray-600 dark:text-gray-400">Visitas</th>
                      <th className="text-right py-3 px-2 font-semibold text-gray-600 dark:text-gray-400">Únicos</th>
                      <th className="py-3 px-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {locations.map((loc, index) => {
                      const maxViews = locations[0]?.views || 1;
                      const percentage = (loc.views / maxViews) * 100;
                      return (
                        <tr key={`${loc.country}-${loc.region}-${loc.city}`} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                          <td className="py-2.5 px-2 text-gray-400 font-bold">{index + 1}.</td>
                          <td className="py-2.5 px-2 font-medium text-gray-900 dark:text-gray-100">
                            {COUNTRY_NAMES[loc.country] || loc.country}
                          </td>
                          <td className="py-2.5 px-2 text-gray-700 dark:text-gray-300">{loc.region}</td>
                          <td className="py-2.5 px-2 text-gray-700 dark:text-gray-300">{loc.city}</td>
                          <td className="py-2.5 px-2 text-right font-semibold text-cyan-600 dark:text-cyan-400">
                            {loc.views.toLocaleString('pt-BR')}
                          </td>
                          <td className="py-2.5 px-2 text-right text-green-600 dark:text-green-400">
                            {loc.uniqueVisitors.toLocaleString('pt-BR')}
                          </td>
                          <td className="py-2.5 px-2 w-24">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                              <div
                                className="bg-gradient-to-r from-red-400 to-orange-500 h-1.5 rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>Nenhum dado de localização disponível</p>
                <p className="text-xs mt-1">A localização será registrada nas próximas visitas</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
