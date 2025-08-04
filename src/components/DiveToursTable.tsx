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
import { MessageCircle, Phone, Mail, Edit, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export const DiveToursTable = () => {
  const { 
    tours, 
    updateTour, 
    deleteTour, 
    filterTours, 
    calculateCommissionValue,
    pagination,
    goToPage,
    changePageSize,
    loading 
  } = useDiveTours();
  const { toast } = useToast();

  const [filters, setFilters] = useState<DiveTourFilters>({
    client_payment_status: 'all',
    guide_payment_status: 'all',
  });

  const filteredTours = filterTours(filters);

  const updatePaymentStatus = async (
    tourId: string,
    type: 'client' | 'guide',
    client_name: string,
    client_contact: string,
    contact_type: "whatsapp" | "phone" | "email",
    tour_date: string,
    guide_name: string,
    total_value: number,
    guide_commission: number,
    commission_type: "fixed" | "percentage",
    client_payment_status: "paid" | "pending",
    guide_payment_status: "paid" | "pending",
  ) => {

    await updateTour(tourId, {
      client_payment_status: client_payment_status,
      guide_payment_status: guide_payment_status,
      client_name: client_name,
      client_contact: client_contact,
      contact_type: contact_type,
      tour_date: tour_date,
      guide_name: guide_name,
      total_value: total_value,
      guide_commission: guide_commission,
      commission_type: commission_type,
    });

    toast({
      title: "Status atualizado!",
      description: `Pagamento ${type === 'client' ? 'do cliente' : 'do guia'} marcado como ${client_payment_status === 'paid' ? 'pago' : 'pendente'}.`,
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
      window.open(`https://wa.me/55${whatsappNumber}?text=9d1a873d-3862-44b6-8244-67e1f032cd6f`, '_blank');
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

  const handlePageChange = (page: number) => {
    goToPage(page);
  };

  const handlePageSizeChange = (newLimit: number) => {
    changePageSize(newLimit);
  };

  const renderPaginationControls = () => {
    if (pagination.totalPages <= 1) return null;

    const startPage = Math.max(1, pagination.page - 2);
    const endPage = Math.min(pagination.totalPages, pagination.page + 2);

    return (
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex items-center space-x-2">
          <p className="text-sm text-muted-foreground">
            Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
            {Math.min(pagination.page * pagination.limit, pagination.totalCount)} de{' '}
            {pagination.totalCount} resultados
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Select
            value={pagination.limit.toString()}
            onValueChange={(value) => handlePageSizeChange(parseInt(value))}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={!pagination.hasPrevPage}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.hasPrevPage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((page) => (
              <Button
                key={page}
                variant={page === pagination.page ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page)}
                className="w-8 h-8"
              >
                {page}
              </Button>
            ))}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasNextPage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.totalPages)}
              disabled={!pagination.hasNextPage}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
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
                value={filters.date_from || ''}
                onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateTo">Data Final</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.date_to || ''}
                onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guideName">Nome do Guia</Label>
              <Input
                id="guideName"
                placeholder="Nome do guia..."
                value={filters.guide_name || ''}
                onChange={(e) => setFilters({ ...filters, guide_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientPayment">Pagamento Cliente</Label>
              <Select
                value={filters.client_payment_status || 'all'}
                onValueChange={(value) => setFilters({ ...filters, client_payment_status: value as any })}
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
                value={filters.guide_payment_status || 'all'}
                onValueChange={(value) => setFilters({ ...filters, guide_payment_status: value as any })}
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
                  client_payment_status: 'all',
                  guide_payment_status: 'all',
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
            Mergulhos Cadastrados ({pagination.totalCount})
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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ocean-blue"></div>
                        <span className="ml-2">Carregando...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : tours.length > 0 ? (
                  tours.map((tour) => (
                    <TableRow key={tour.tour_id}>
                      <TableCell className="font-medium text-nowrap">{tour.client_name}</TableCell>
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
                            tour.client_name,
                            tour.client_contact,
                            tour.contact_type,
                            tour.tour_date,
                            tour.guide_name,
                            tour.total_value,
                            tour.guide_commission,
                            tour.commission_type,
                            tour.client_payment_status === 'paid' ? 'pending' : 'paid',
                            tour.guide_payment_status,
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
                            tour.client_name,
                            tour.client_contact,
                            tour.contact_type,
                            tour.tour_date,
                            tour.guide_name,
                            tour.total_value,
                            tour.guide_commission,
                            tour.commission_type,
                            tour.client_payment_status,
                            tour.guide_payment_status === 'paid' ? 'pending' : 'paid',
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
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Nenhum mergulho encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination Controls */}
          {renderPaginationControls()}
        </CardContent>
      </Card>
    </div>
  );
};