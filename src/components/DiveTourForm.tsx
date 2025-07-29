import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DiveTour } from '@/types/dive';
import { useDiveTours } from '@/hooks/useDiveTours';
import { useToast } from '@/hooks/use-toast';

interface DiveTourFormProps {
  onSuccess?: () => void;
}

export const DiveTourForm = ({ onSuccess }: DiveTourFormProps) => {
  const { addTour } = useDiveTours();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    clientName: '',
    clientContact: '',
    contactType: 'whatsapp' as 'whatsapp' | 'phone' | 'email',
    tourDate: '',
    guideName: '',
    totalValue: '',
    guideCommission: '',
    commissionType: 'percentage' as 'percentage' | 'fixed',
    clientPaymentStatus: 'pending' as 'paid' | 'pending',
    guidePaymentStatus: 'pending' as 'paid' | 'pending',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await addTour({
        client_name: formData.clientName,
        client_contact: formData.clientContact,
        contact_type: formData.contactType,
        tour_date: formData.tourDate,
        guide_name: formData.guideName,
        total_value: parseFloat(formData.totalValue),
        guide_commission: parseFloat(formData.guideCommission),
        commission_type: formData.commissionType,
        client_payment_status: formData.clientPaymentStatus,
        guide_payment_status: formData.guidePaymentStatus,
      });

      toast({
        title: "Passeio cadastrado!",
        description: "O passeio foi adicionado com sucesso.",
      });

      // Reset form
      setFormData({
        clientName: '',
        clientContact: '',
        contactType: 'whatsapp',
        tourDate: '',
        guideName: '',
        totalValue: '',
        guideCommission: '',
        commissionType: 'percentage',
        clientPaymentStatus: 'pending',
        guidePaymentStatus: 'pending',
      });

      onSuccess?.();
    } catch (error) {
      toast({
        title: "Erro ao cadastrar",
        description: "Verifique se todos os campos estão preenchidos corretamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-ocean-blue">Reservar Mergulho</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Nome do Cliente</Label>
              <Input
                id="clientName"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientContact">Contato do Cliente</Label>
              <div className="flex space-x-2">
                <Select
                  value={formData.contactType}
                  onValueChange={(value: 'whatsapp' | 'phone' | 'email') =>
                    setFormData({ ...formData, contactType: value })
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="phone">Telefone</SelectItem>
                    <SelectItem value="email">E-mail</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  id="clientContact"
                  value={formData.clientContact}
                  onChange={(e) => setFormData({ ...formData, clientContact: e.target.value })}
                  placeholder={formData.contactType === 'email' ? 'email@exemplo.com' : '(11) 99999-9999'}
                  required
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Data do Passeio</Label>
              <Input
                id="date"
                type="date"
                value={formData.tourDate}
                onChange={(e) => setFormData({ ...formData, tourDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guideName">Nome do Guia</Label>
              <Input
                id="guideName"
                value={formData.guideName}
                onChange={(e) => setFormData({ ...formData, guideName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalValue">Valor Total (R$)</Label>
              <Input
                id="totalValue"
                type="number"
                step="0.01"
                value={formData.totalValue}
                onChange={(e) => setFormData({ ...formData, totalValue: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guideCommission">Comissão do Guia</Label>
              <div className="flex space-x-2">
                <Input
                  id="guideCommission"
                  type="number"
                  step="0.01"
                  value={formData.guideCommission}
                  onChange={(e) => setFormData({ ...formData, guideCommission: e.target.value })}
                  required
                  className="flex-1"
                />
                <Select
                  value={formData.commissionType}
                  defaultValue='fixed'
                  onValueChange={(value: 'fixed' | 'percentage') =>
                    setFormData({ ...formData, commissionType: value })
                  }
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">R$</SelectItem>
                    <SelectItem value="percentage">%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientPaymentStatus">Pagamento do Cliente</Label>
              <Select
                value={formData.clientPaymentStatus}
                onValueChange={(value: 'paid' | 'pending') =>
                  setFormData({ ...formData, clientPaymentStatus: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="guidePaymentStatus">Pagamento do Guia</Label>
              <Select
                value={formData.guidePaymentStatus}
                onValueChange={(value: 'paid' | 'pending') =>
                  setFormData({ ...formData, guidePaymentStatus: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full">
            Cadastrar Mergulho
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};