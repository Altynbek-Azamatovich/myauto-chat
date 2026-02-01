import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Download, RefreshCw, Shield, AlertTriangle, Info, Bug, AlertCircle, Bell, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface AuditLog {
  id: string;
  date: string;
  time: string;
  source: string;
  user_account: string;
  client_ip: string;
  start_time: string;
  end_time: string;
  level: string;
  category: string;
  event_type: string;
  description: string;
  request_id: string;
  success: boolean;
  error_message: string | null;
}

interface AuditStats {
  total_events: number;
  failed_events: number;
  unique_users: number;
  events_by_level: Record<string, number>;
  events_by_category: Record<string, number>;
  events_by_source: Record<string, number>;
}

const levelIcons: Record<string, React.ReactNode> = {
  'DEBUG': <Bug className="h-4 w-4" />,
  'INFO': <Info className="h-4 w-4" />,
  'NOTIFICATION': <Bell className="h-4 w-4" />,
  'WARNING': <AlertTriangle className="h-4 w-4" />,
  'ERROR': <AlertCircle className="h-4 w-4" />,
  'CRITICAL': <Zap className="h-4 w-4" />,
  'ALERT': <Shield className="h-4 w-4" />,
};

const AuditLogs = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminAndFetch();
  }, []);

  const checkAdminAndFetch = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/welcome');
      return;
    }

    // Check if user is admin
    const { data: adminRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!adminRole) {
      toast.error('Доступ запрещён. Требуется роль администратора.');
      navigate('/home');
      return;
    }

    setIsAdmin(true);
    fetchLogs();
    fetchStats();
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Call edge function or use direct query since RPC has type issues
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/siem-export?format=json&limit=500` +
        (levelFilter !== 'all' ? `&level=${levelFilter}` : '') +
        (categoryFilter !== 'all' ? `&category=${categoryFilter}` : ''),
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch logs');
      }

      const result = await response.json();
      setLogs(result.logs || []);
    } catch (err: any) {
      toast.error('Ошибка загрузки логов: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_audit_statistics');
      if (error) throw error;
      if (data && typeof data === 'object') {
        setStats(data as unknown as AuditStats);
      }
    } catch (err: any) {
      console.error('Stats error:', err);
    }
  };

  const exportToCSV = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/siem-export?format=csv`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          }
        }
      );

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_logs_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Логи экспортированы');
    } catch (err: any) {
      toast.error('Ошибка экспорта: ' + err.message);
    }
  };

  const exportToSyslog = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/siem-export?format=syslog`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          }
        }
      );

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const text = await response.text();
      const blob = new Blob([text], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `syslog_${format(new Date(), 'yyyy-MM-dd')}.log`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Syslog экспортирован (RFC 5424)');
    } catch (err: any) {
      toast.error('Ошибка экспорта: ' + err.message);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchLogs();
    }
  }, [levelFilter, categoryFilter, isAdmin]);

  const filteredLogs = logs.filter(log => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      log.description?.toLowerCase().includes(query) ||
      log.event_type?.toLowerCase().includes(query) ||
      log.user_account?.toLowerCase().includes(query) ||
      log.source?.toLowerCase().includes(query)
    );
  });

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Проверка доступа...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Журнал аудита (ШЭП/ВШЭП)
          </h1>
          <p className="text-sm text-muted-foreground">
            СТ РК ИСО/МЭК 27002-2015
          </p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <p className="text-2xl font-bold">{stats.total_events}</p>
            <p className="text-sm text-muted-foreground">Всего событий</p>
          </Card>
          <Card className="p-4">
            <p className="text-2xl font-bold text-destructive">{stats.failed_events}</p>
            <p className="text-sm text-muted-foreground">Неудачных</p>
          </Card>
          <Card className="p-4">
            <p className="text-2xl font-bold text-primary">{stats.unique_users}</p>
            <p className="text-sm text-muted-foreground">Уникальных пользователей</p>
          </Card>
          <Card className="p-4">
            <p className="text-2xl font-bold text-accent-foreground">
              {stats.events_by_category?.AUTH || 0}
            </p>
            <p className="text-sm text-muted-foreground">Событий авторизации</p>
          </Card>
        </div>
      )}

      {/* Filters & Actions */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Input
          placeholder="Поиск..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-64"
        />
        
        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Уровень" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все уровни</SelectItem>
            <SelectItem value="DEBUG">DEBUG</SelectItem>
            <SelectItem value="INFO">INFO</SelectItem>
            <SelectItem value="NOTIFICATION">NOTIFICATION</SelectItem>
            <SelectItem value="WARNING">WARNING</SelectItem>
            <SelectItem value="ERROR">ERROR</SelectItem>
            <SelectItem value="CRITICAL">CRITICAL</SelectItem>
            <SelectItem value="ALERT">ALERT</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Категория" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все категории</SelectItem>
            <SelectItem value="AUTH">AUTH</SelectItem>
            <SelectItem value="USER_ACTION">USER_ACTION</SelectItem>
            <SelectItem value="DATA_ACCESS">DATA_ACCESS</SelectItem>
            <SelectItem value="DATA_MODIFY">DATA_MODIFY</SelectItem>
            <SelectItem value="SYSTEM">SYSTEM</SelectItem>
            <SelectItem value="EXTERNAL_API">EXTERNAL_API</SelectItem>
            <SelectItem value="CONFIG_CHANGE">CONFIG_CHANGE</SelectItem>
            <SelectItem value="SECURITY">SECURITY</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={fetchLogs} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Обновить
        </Button>

        <Button variant="outline" onClick={exportToCSV}>
          <Download className="h-4 w-4 mr-2" />
          CSV
        </Button>

        <Button variant="outline" onClick={exportToSyslog}>
          <Download className="h-4 w-4 mr-2" />
          Syslog (RFC 5424)
        </Button>
      </div>

      {/* Logs Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-2 text-left">Дата/Время</th>
              <th className="p-2 text-left">Уровень</th>
              <th className="p-2 text-left">Категория</th>
              <th className="p-2 text-left">Источник</th>
              <th className="p-2 text-left">Пользователь</th>
              <th className="p-2 text-left">IP</th>
              <th className="p-2 text-left">Событие</th>
              <th className="p-2 text-left">Описание</th>
              <th className="p-2 text-left">Статус</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log.id} className="border-b hover:bg-muted/50">
                <td className="p-2 whitespace-nowrap">
                  <div>{log.date}</div>
                  <div className="text-xs text-muted-foreground">{log.time}</div>
                </td>
                <td className="p-2">
                  <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                    {levelIcons[log.level]}
                    {log.level}
                  </Badge>
                </td>
                <td className="p-2">
                  <Badge variant="outline">
                    {log.category}
                  </Badge>
                </td>
                <td className="p-2 text-xs">{log.source}</td>
                <td className="p-2 text-xs">{log.user_account}</td>
                <td className="p-2 text-xs font-mono">{log.client_ip}</td>
                <td className="p-2 text-xs font-medium">{log.event_type}</td>
                <td className="p-2 max-w-xs truncate" title={log.description}>
                  {log.description}
                </td>
                <td className="p-2">
                  {log.success ? (
                    <Badge variant="default">OK</Badge>
                  ) : (
                    <Badge variant="destructive">FAIL</Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredLogs.length === 0 && !loading && (
          <div className="text-center py-12 text-muted-foreground">
            Нет записей в журнале аудита
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
