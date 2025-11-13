'use client';

import { useEffect, useState } from 'react';
import { createTradingEngine } from '@/lib/trading-engine-factory';

export default function TestTradingPage() {
  const [status, setStatus] = useState('Initializing...');
  const [instruments, setInstruments] = useState<any[]>([]);

  useEffect(() => {
    const testTradingEngine = () => {
      try {
        setStatus('Creating trading engine...');
        
        // Create new trading engine
        const engine = createTradingEngine();
        
        setStatus('Creating demo instruments...');
        
        // Create demo companies
        const demoCompanies = [
          { name: 'TechCorp Solutions', type: 'equity' as const },
          { name: 'Green Energy Inc', type: 'equity' as const },
          { name: 'FinTech Innovations', type: 'equity' as const }
        ];

        demoCompanies.forEach(company => {
          const mockWorkflow = {
            id: `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            companyName: company.name,
            instrumentType: company.type,
            targetAmount: Math.floor(Math.random() * 50000000) + 10000000,
            sharesOffered: Math.floor(Math.random() * 5000000) + 1000000,
            pricePerShare: Math.floor(Math.random() * 50) + 10,
          };

          engine.createInstrumentFromWorkflow(mockWorkflow);
        });
        
        setStatus('Loading instruments...');
        
        // Get all instruments
        const allInstruments = engine.getAllInstruments();
        setInstruments(allInstruments);
        
        setStatus(`Success! Created ${allInstruments.length} instruments`);
        
      } catch (error) {
        setStatus(`Error: ${error}`);
        console.error('Trading engine test failed:', error);
      }
    };

    testTradingEngine();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Trading Engine Test</h1>
      <p className="mb-4">Status: {status}</p>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Instruments ({instruments.length})</h2>
        {instruments.map((instrument) => (
          <div key={instrument.id} className="p-4 border rounded">
            <h3 className="font-semibold">{instrument.symbol} - {instrument.companyName}</h3>
            <p>Type: {instrument.instrumentType}</p>
            <p>Price: ${instrument.currentPrice}</p>
            <p>Status: {instrument.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}