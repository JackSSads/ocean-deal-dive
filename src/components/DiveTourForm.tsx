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
    client_name: '',
    client_contact: '',
    contact_type: 'whatsapp' as 'whatsapp' | 'phone' | 'email',
    tour_date: '',
    guide_name: 'Girou',
    total_value: '180',
    guide_commission: '80',
    commission_type: 'fixed' as 'fixed' | 'percentage',
    client_payment_status: 'pending' as 'paid' | 'pending',
    guide_payment_status: 'pending' as 'paid' | 'pending',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await addTour({
        client_name: formData.client_name,
        client_contact: formData.client_contact,
        contact_type: formData.contact_type,
        tour_date: formData.tour_date,
        guide_name: formData.guide_name,
        total_value: parseFloat(formData.total_value),
        guide_commission: parseFloat(formData.guide_commission),
        commission_type: formData.commission_type,
        client_payment_status: formData.client_payment_status,
        guide_payment_status: formData.guide_payment_status,
      });

      toast({
        title: "Passeio cadastrado!",
        description: "O passeio foi adicionado com sucesso.",
      });

      // Reset form
      setFormData({
        client_name: '',
        client_contact: '',
        contact_type: 'whatsapp',
        tour_date: '',
        guide_name: 'Girou',
        total_value: '180',
        guide_commission: '80',
        commission_type: 'fixed',
        client_payment_status: 'pending',
        guide_payment_status: 'pending',
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
              <Label htmlFor="client_name">Nome do Cliente</Label>
              <Input
                id="client_name"
                value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_contact">Contato do Cliente</Label>
              <div className="flex space-x-2">
                <Select
                  value={formData.contact_type}
                  onValueChange={(value: 'whatsapp' | 'phone' | 'email') =>
                    setFormData({ ...formData, contact_type: value })
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
                  id="client_contact"
                  value={formData.client_contact}
                  onChange={(e) => setFormData({ ...formData, client_contact: e.target.value })}
                  placeholder={formData.contact_type === 'email' ? 'email@exemplo.com' : '(00) 99999-9999'}
                  required
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tour_date">Data do Passeio</Label>
              <Input
                id="tour_date"
                type="date"
                value={formData.tour_date}
                onChange={(e) => setFormData({ ...formData, tour_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guide_name">Nome do Guia</Label>
              <Input
                id="guide_name"
                value={formData.guide_name}
                defaultValue='Girou'
                onChange={(e) => setFormData({ ...formData, guide_name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_value">Valor Total (R$)</Label>
              <Input
                id="total_value"
                type="number"
                step="0.01"
                value={formData.total_value}
                defaultValue='180'
                onChange={(e) => setFormData({ ...formData, total_value: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guide_commission">Comissão do Guia</Label>
              <div className="flex space-x-2">
                <Input
                  id="guide_commission"
                  type="number"
                  step="0.01"
                  value={formData.guide_commission}
                  defaultValue='80'
                  onChange={(e) => setFormData({ ...formData, guide_commission: e.target.value })}
                  required
                  className="flex-1"
                />
                <Select
                  value={formData.commission_type}
                  defaultValue='fixed'
                  onValueChange={(value: 'fixed' | 'percentage') =>
                    setFormData({ ...formData, commission_type: value })
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
              <Label htmlFor="client_payment_status">Pagamento do Cliente</Label>
              <Select
                value={formData.client_payment_status}
                onValueChange={(value: 'paid' | 'pending') =>
                  setFormData({ ...formData, client_payment_status: value })
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
              <Label htmlFor="guide_payment_status">Pagamento do Guia</Label>
              <Select
                value={formData.guide_payment_status}
                onValueChange={(value: 'paid' | 'pending') =>
                  setFormData({ ...formData, guide_payment_status: value })
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