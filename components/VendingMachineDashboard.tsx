
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface VendingSlot {
  id: string;
  name: string;
  stock: number;
  maxStock: number;
  price: number;
}

const mockInventory: VendingSlot[] = [
  { id: 'SLOT01', name: 'Milo Tin', stock: 12, maxStock: 20, price: 2.50 },
  { id: 'SLOT02', name: '100 Plus', stock: 3, maxStock: 20, price: 2.20 },
  { id: 'SLOT03', name: 'Coca Cola', stock: 18, maxStock: 20, price: 2.20 },
  { id: 'SLOT04', name: 'Mineral Water', stock: 5, maxStock: 25, price: 1.00 },
];

const VendingMachineDashboard = () => {
  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900">RBSS VMMS Dashboard</h1>
          <p className="text-slate-500">Monitor-Only: Data Jualan & Inventori Berdasarkan iPay88</p>
        </header>

        {/* Top Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Jualan Hari Ini</h3>
            <p className="text-2xl font-bold text-green-600">RM 145.50</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Transaksi Berjaya</h3>
            <p className="text-2xl font-bold text-blue-600">58</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Item Perlu Refill</h3>
            <p className="text-2xl font-bold text-red-600">2 Slot</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Inventory Health */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold mb-4 text-slate-800">Status Inventori Semasa</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockInventory}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="id" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="stock" radius={[4, 4, 0, 0]}>
                    {mockInventory.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.stock < 5 ? '#ef4444' : '#3b82f6'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick List Status */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold mb-4 text-slate-800">Perincian Slot</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="py-3 text-slate-500 text-xs uppercase font-bold">Slot</th>
                    <th className="py-3 text-slate-500 text-xs uppercase font-bold">Item</th>
                    <th className="py-3 text-slate-500 text-xs uppercase font-bold text-center">Baki</th>
                    <th className="py-3 text-slate-500 text-xs uppercase font-bold text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mockInventory.map((slot) => (
                    <tr key={slot.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="py-4 font-bold text-slate-700">{slot.id}</td>
                      <td className="py-4 text-slate-600">{slot.name}</td>
                      <td className="py-4 text-center font-mono">{slot.stock}/{slot.maxStock}</td>
                      <td className="py-4 text-right">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          slot.stock < 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {slot.stock < 5 ? 'Low' : 'Healthy'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendingMachineDashboard;
