import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useDiveTours } from '@/hooks/useDiveTours';
import { DollarSign, Users, Calendar, TrendingUp } from 'lucide-react';

export const DashboardStats = () => {
  const { tours, metrics } = useDiveTours();

  const stats = {
    total_tours: metrics?.total_count,
    total_revenue: metrics?.total_value,
    total_commissions: metrics?.total_guide_commission,
    pending_payments: metrics?.total_pending_payments,
    paid_tours: metrics?.total_paid_tours,
    pending_guide_payments: metrics?.total_guide_commission_pedding,
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const statCards = [
    {
      title: 'Total de Passeios',
      value: stats.total_tours,
      icon: Calendar,
      description: `${stats.paid_tours} pagos, ${stats.pending_payments} pendentes`,
      className: 'bg-ocean-light text-ocean-blue',
    },
    {
      title: 'Receita Total',
      value: formatCurrency(stats.total_revenue),
      icon: DollarSign,
      description: 'Valor total de todos os passeios',
      className: 'bg-ocean-blue text-white',
    },
    {
      title: 'Comissões Totais',
      value: formatCurrency(stats.total_commissions),
      icon: TrendingUp,
      description: `${stats.pending_guide_payments} pendentes`,
      className: 'bg-sea-green text-ocean-blue',
    },
    {
      title: 'Clientes Únicos',
      value: new Set(tours.map(tour => tour.client_name.toLowerCase())).size,
      icon: Users,
      description: 'Total de clientes únicos',
      className: 'bg-wave-blue text-ocean-blue',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <Card key={index} className={`${stat.className} border-0 shadow-lg`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs opacity-80 mt-1">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};