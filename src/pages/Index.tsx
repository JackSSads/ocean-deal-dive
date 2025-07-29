import { useState } from 'react';
import { Header } from '@/components/Header';
import { DashboardStats } from '@/components/DashboardStats';
import { DiveTourForm } from '@/components/DiveTourForm';
import { DiveToursTable } from '@/components/DiveToursTable';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, List, BarChart3 } from 'lucide-react';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="add-tour" className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Novo Mergulho</span>
            </TabsTrigger>
            <TabsTrigger value="tours-list" className="flex items-center space-x-2">
              <List className="w-4 h-4" />
              <span>Lista de Mergulhos</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-8">
            <DashboardStats />
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-ocean-blue mb-6">Mergulhos Recentes</h2>
              <DiveToursTable />
            </div>
          </TabsContent>

          <TabsContent value="add-tour">
            <DiveTourForm onSuccess={() => setActiveTab('tours-list')} />
          </TabsContent>

          <TabsContent value="tours-list">
            <DiveToursTable />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
