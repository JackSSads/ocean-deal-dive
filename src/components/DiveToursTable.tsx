import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DiveTour, DiveTourFilters } from '@/types/dive';
import { useDiveTours } from '@/hooks/useDiveTours';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Phone, Mail, Edit, Trash2 } from 'lucide-react';

export const DiveToursTable = () => {
  const { tours, updateTour, deleteTour, filterTours, calculateCommissionValue } = useDiveTours();
  const { toast } = useToast();

  const [filters, setFilters] = useState<DiveTourFilters>({
    clientPaymentStatus: 'all',
    guidePaymentStatus: 'all',
  });

  const filteredTours = filterTours(filters);

  const updatePaymentStatus = (
    tourId: string, 
    type: 'client' | 'guide', 
    status: 'paid' | 'pending'
  ) => {
    const updateField = type === 'client' ? 'clientPaymentStatus' : 'guidePaymentStatus';
    updateTour(tourId, { [updateField]: status });
    
    toast({
      title: "Status atualizado!",
      description: `Pagamento ${type === 'client' ? 'do cliente' : 'do guia'} marcado como ${status === 'paid' ? 'pago' : 'pendente'}.`,
    });
  };

  const getContactIcon = (type: string) => {
    switch (type) {
      case 'whatsapp':
        return <MessageCircle className="w-4 h-4" />;
      case 'phone':
        return <Phone className="w-4 h-4" />;
      case 'email':
        return <Mail className="w-4 h-4" />;
      default:
        return <Phone className="w-4 h-4" />;
    }
  };

  const handleContactClick = (tour: DiveTour) => {
    if (tour.contact_type === 'whatsapp') {
      const whatsappNumber = tour.client_contact.replace(/\D/g, '');
      window.open(`https://wa.me/55${whatsappNumber}`, '_blank');
    } else if (tour.contact_type === 'email') {
      window.open(`mailto:${tour.client_contact}`, '_blank');
    } else {
      window.open(`tel:${tour.client_contact}`, '_blank');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-ocean-blue">Filtros e Busca</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <Input
                id="search"
                placeholder="Nome ou contato do cliente..."
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateFrom">Data Inicial</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateTo">Data Final</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guideName">Nome do Guia</Label>
              <Input
                id="guideName"
                placeholder="Nome do guia..."
                value={filters.guideName || ''}
                onChange={(e) => setFilters({ ...filters, guideName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientPayment">Pagamento Cliente</Label>
              <Select
                value={filters.clientPaymentStatus || 'all'}
                onValueChange={(value) => setFilters({ ...filters, clientPaymentStatus: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="guidePayment">Pagamento Guia</Label>
              <Select
                value={filters.guidePaymentStatus || 'all'}
                onValueChange={(value) => setFilters({ ...filters, guidePaymentStatus: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => setFilters({
                  clientPaymentStatus: 'all',
                  guidePaymentStatus: 'all',
                })}
                className="w-full"
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-ocean-blue">
            Mergulhos Cadastrados ({filteredTours.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Guia</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Comissão</TableHead>
                  <TableHead>Pag. Cliente</TableHead>
                  <TableHead>Pag. Guia</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTours.map((tour) => (
                  <TableRow key={tour.tour_id}>
                    <TableCell className="font-medium">{tour.client_name}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleContactClick(tour)}
                        className="flex items-center space-x-2 p-2"
                      >
                        {getContactIcon(tour.contact_type)}
                        <span className="text-sm">{tour.client_contact}</span>
                      </Button>
                    </TableCell>
                    <TableCell>{formatDate(tour.tour_date)}</TableCell>
                    <TableCell>{tour.guide_name}</TableCell>
                    <TableCell>{formatCurrency(tour.total_value)}</TableCell>
                    <TableCell>
                      {tour.commission_type === 'percentage' 
                        ? `${tour.guide_commission}% (${formatCurrency(calculateCommissionValue(tour))})`
                        : formatCurrency(tour.guide_commission)
                      }
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updatePaymentStatus(
                          tour.tour_id, 
                          'client', 
                          tour.client_payment_status === 'paid' ? 'pending' : 'paid'
                        )}
                      >
                        <Badge variant={tour.client_payment_status === 'paid' ? 'paid' : 'pending'}>
                          {tour.client_payment_status === 'paid' ? 'Pago' : 'Pendente'}
                        </Badge>
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updatePaymentStatus(
                          tour.tour_id, 
                          'guide', 
                          tour.guide_payment_status === 'paid' ? 'pending' : 'paid'
                        )}
                      >
                        <Badge variant={tour.guide_payment_status === 'paid' ? 'paid' : 'pending'}>
                          {tour.guide_payment_status === 'paid' ? 'Pago' : 'Pendente'}
                        </Badge>
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTour(tour.tour_id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredTours.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Nenhum mergulho encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};