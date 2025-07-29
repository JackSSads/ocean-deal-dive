import { Waves } from 'lucide-react';

export const Header = () => {
  return (
    <header className="bg-ocean-blue text-white shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center space-x-3">
          <Waves className="h-8 w-8" />
          <div>
            <h1 className="text-2xl font-bold">AquaDive Manager</h1>
            <p className="text-ocean-light text-sm">Sistema de Gerenciamento de Mergulho com Cilindro</p>
          </div>
        </div>
      </div>
    </header>
  );
};