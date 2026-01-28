
import React, { useState, useEffect, useMemo } from 'react';
import { Quotation, QuotationItem, Client, ServiceItem, CompanyInfo } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { PlusIcon } from './icons/PlusIcon';
import AddServiceItemModal from './AddServiceItemModal';

interface QuotationFormProps {
  initialQuotation: Quotation | null;
  clients: Client[];
  services: ServiceItem[];
  onSave: (quotation: Quotation, isNewClient: boolean) => void;
  onCancel: () => void;
  quotationCount: number;
  companyInfo: CompanyInfo;
}

const getTodayDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
};

const generateQuotationNo = (count: number) => {
    const year = new Date().getFullYear();
    const runningNumber = String(count + 1).padStart(3, '0');
    return `QUO-RBE-${year}-${runningNumber}`;
}

const emptyClient: Client = { id: `new-${Date.now()}`, name: '', company: '', address: '', email: '', phone: '' };
const emptyItem: QuotationItem = { id: `item-${Date.now()}`, description: '', quantity: 1, unitPrice: 0, unit: 'L.S.' };

const QuotationForm: React.FC<QuotationFormProps> = ({ initialQuotation, clients, services, onSave, onCancel, quotationCount, companyInfo }) => {
  const [clientMode, setClientMode] = useState<'existing' | 'new'>(initialQuotation ? 'existing' : 'new');
  const [selectedClientId, setSelectedClientId] = useState<string>(initialQuotation ? initialQuotation.client.id : '');
  const [isServiceModalOpen, setServiceModalOpen] = useState(false);

  const [quotation, setQuotation] = useState<Quotation>(
    initialQuotation || {
      id: `new-${Date.now()}`,
      quotationNo: generateQuotationNo(quotationCount),
      client: emptyClient,
      date: getTodayDate(),
      items: [emptyItem],
      terms: companyInfo.defaultTerms,
      status: 'Draft',
    }
  );

  useEffect(() => {
    if (clientMode === 'existing' && selectedClientId) {
        const selectedClient = clients.find(c => c.id === selectedClientId);
        if(selectedClient) {
            setQuotation(prev => ({...prev, client: selectedClient}));
        }
    } else if (clientMode === 'new') {
        if(!initialQuotation) {
            setQuotation(prev => ({...prev, client: emptyClient}));
        }
    }
  }, [clientMode, selectedClientId, clients, initialQuotation]);
  

  const handleClientChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setQuotation(prev => ({ ...prev, client: { ...prev.client, [name]: value } }));
  };
  
  const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setQuotation(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index: number, field: keyof QuotationItem, value: string | number) => {
    const newItems = [...quotation.items];
    const item = { ...newItems[index] };

    if (field === 'description') {
        item.description = value as string;
    } else if (field === 'unit') {
        item.unit = value as string;
    } else if (field === 'quantity' || field === 'unitPrice') {
        const numValue = Number(value);
        if (!isNaN(numValue) && numValue >= 0) {
            item[field] = numValue;
        }
    }
    
    newItems[index] = item;
    setQuotation(prev => ({ ...prev, items: newItems }));
  };

  const handleTypeChange = (index: number, type: 'unit' | 'lump_sum') => {
      const newItems = [...quotation.items];
      const item = { ...newItems[index] };
      
      if (type === 'lump_sum') {
          item.unit = 'L.S.';
          item.quantity = 1;
      } else {
          item.unit = ''; // Reset unit for user input
          item.quantity = 1;
      }
      newItems[index] = item;
      setQuotation(prev => ({ ...prev, items: newItems }));
  };

  const addCustomItem = () => {
    setQuotation(prev => ({
      ...prev,
      items: [...prev.items, { ...emptyItem, id: `item-${Date.now()}` }],
    }));
  };
  
  const addServicesToQuote = (selectedServices: ServiceItem[]) => {
      const newItems: QuotationItem[] = selectedServices.map(service => ({
          id: `item-${Date.now()}-${service.id}`,
          description: service.description,
          unitPrice: service.unitPrice,
          quantity: 1,
          unit: 'unit', // Default
      }));

      const isInitialEmptyItem = quotation.items.length === 1 && quotation.items[0].description === '' && quotation.items[0].unitPrice === 0;
      
      if (isInitialEmptyItem) {
          setQuotation(prev => ({ ...prev, items: newItems }));
      } else {
          setQuotation(prev => ({...prev, items: [...prev.items, ...newItems]}));
      }
  };

  const removeItem = (index: number) => {
    if (quotation.items.length > 1) {
      const newItems = quotation.items.filter((_, i) => i !== index);
      setQuotation(prev => ({ ...prev, items: newItems }));
    }
  };

  const { subtotal, tax, grandTotal } = useMemo(() => {
    const sub = quotation.items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
    const taxRate = companyInfo.taxRate / 100;
    const taxAmount = sub * taxRate;
    const total = sub + taxAmount;
    return { subtotal: sub, tax: taxAmount, grandTotal: total };
  }, [quotation.items, companyInfo.taxRate]);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
  };

  const handleSave = () => {
    onSave(quotation, clientMode === 'new' && !initialQuotation);
  };
  
  return (
    <>
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-5xl mx-auto my-8">
          <h2 className="text-2xl font-bold text-brand-text mb-6">{initialQuotation ? 'Edit Quotation' : 'Create New Quotation'}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-brand-text border-b pb-2">Client Information</h3>
               {!initialQuotation && (
                  <div className="flex space-x-2 bg-gray-100 p-1 rounded-md">
                    <button 
                      onClick={() => setClientMode('new')}
                      className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${clientMode === 'new' ? 'bg-white shadow' : 'text-gray-600'}`}
                    >New Client</button>
                    <button 
                      onClick={() => setClientMode('existing')}
                      className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${clientMode === 'existing' ? 'bg-white shadow' : 'text-gray-600'}`}
                    >Existing Client</button>
                  </div>
                )}
                
                {clientMode === 'existing' ? (
                     <select
                        value={selectedClientId}
                        onChange={(e) => setSelectedClientId(e.target.value)}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-brand-gold focus:outline-none"
                        disabled={!!initialQuotation}
                     >
                        <option value="" disabled>-- Select a Client --</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.company || 'Personal'})</option>)}
                     </select>
                ) : null}

              <input type="text" name="name" placeholder="Client Name" value={quotation.client.name} onChange={handleClientChange} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-brand-gold focus:outline-none" disabled={clientMode === 'existing'}/>
              <input type="text" name="company" placeholder="Company / Organization" value={quotation.client.company} onChange={handleClientChange} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-brand-gold focus:outline-none" disabled={clientMode === 'existing'}/>
              <textarea name="address" placeholder="Address" value={quotation.client.address} onChange={handleClientChange} rows={3} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-brand-gold focus:outline-none" disabled={clientMode === 'existing'}/>
              <input type="email" name="email" placeholder="Email" value={quotation.client.email} onChange={handleClientChange} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-brand-gold focus:outline-none" disabled={clientMode === 'existing'}/>
              <input type="tel" name="phone" placeholder="Phone" value={quotation.client.phone} onChange={handleClientChange} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-brand-gold focus:outline-none" disabled={clientMode === 'existing'}/>
            </div>
            
            <div className="space-y-4">
               <h3 className="text-lg font-semibold text-brand-text border-b pb-2">Quotation Details</h3>
               <div>
                   <label className="block text-sm font-medium text-gray-500">Quotation No</label>
                   <input type="text" name="quotationNo" value={quotation.quotationNo} onChange={handleDetailsChange} className="w-full p-2 border rounded-md bg-gray-100" readOnly/>
               </div>
               <div>
                   <label className="block text-sm font-medium text-gray-500">Date</label>
                   <input type="text" name="date" value={quotation.date} onChange={handleDetailsChange} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-brand-gold focus:outline-none"/>
               </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-brand-text border-b pb-2 mb-4">Item List</h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase">
                    <th className="pb-2 pl-2">Type</th>
                    <th className="pb-2 w-[40%]">Description</th>
                    <th className="pb-2">Unit</th>
                    <th className="pb-2">Quantity</th>
                    <th className="pb-2">Unit Price (RM)</th>
                    <th className="pb-2 text-right">Total (RM)</th>
                    <th className="pb-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {quotation.items.map((item, index) => {
                      const isLumpSum = item.unit === 'L.S.';
                      return (
                        <tr key={item.id} className="border-b align-top bg-white hover:bg-gray-50">
                          <td className="py-2 px-2">
                              <select 
                                value={isLumpSum ? 'lump_sum' : 'unit'} 
                                onChange={(e) => handleTypeChange(index, e.target.value as 'unit' | 'lump_sum')}
                                className="p-2 border rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-brand-gold"
                              >
                                  <option value="unit">Per Unit</option>
                                  <option value="lump_sum">Lump Sum</option>
                              </select>
                          </td>
                          <td className="py-2 pr-2">
                            <textarea 
                              value={item.description} 
                              onChange={e => handleItemChange(index, 'description', e.target.value)} 
                              className="w-full p-2 border rounded-md text-sm min-h-[60px] focus:outline-none focus:ring-1 focus:ring-brand-gold"
                              placeholder="Item description..."
                            />
                          </td>
                          <td className="py-2 px-2">
                              <input 
                                type="text" 
                                value={item.unit || ''} 
                                onChange={e => handleItemChange(index, 'unit', e.target.value)} 
                                className={`w-20 p-2 border rounded-md text-center text-sm ${isLumpSum ? 'bg-gray-100 text-gray-500' : 'bg-white'}`}
                                placeholder="unit"
                                readOnly={isLumpSum}
                              />
                          </td>
                          <td className="py-2 px-2">
                              <input 
                                type="number" 
                                value={item.quantity} 
                                onChange={e => handleItemChange(index, 'quantity', e.target.value)} 
                                className={`w-20 p-2 border rounded-md text-center ${isLumpSum ? 'bg-gray-100 text-gray-500' : 'bg-white'}`}
                                readOnly={isLumpSum}
                              />
                          </td>
                          <td className="py-2 px-2">
                              <input 
                                type="number" 
                                value={item.unitPrice} 
                                onChange={e => handleItemChange(index, 'unitPrice', e.target.value)} 
                                className="w-28 p-2 border rounded-md text-right focus:outline-none focus:ring-1 focus:ring-brand-gold"
                              />
                          </td>
                          <td className="py-2 pl-2 text-right font-semibold pt-4 text-brand-black">{formatCurrency(item.quantity * item.unitPrice)}</td>
                          <td className="py-2 pl-2 pt-4"><button onClick={() => removeItem(index)} className="text-brand-red hover:text-red-700 disabled:opacity-50" disabled={quotation.items.length <= 1}><TrashIcon /></button></td>
                        </tr>
                      );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex space-x-2">
                <button onClick={() => setServiceModalOpen(true)} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm">
                    <PlusIcon className="w-4 h-4" />
                    <span>Add From Services List</span>
                </button>
                <button onClick={addCustomItem} className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-200 text-sm">
                    <span>Add Custom Item</span>
                </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div>
                <h3 className="text-lg font-semibold text-brand-text mb-2">Terms & Conditions</h3>
                <textarea name="terms" value={quotation.terms} onChange={handleDetailsChange} rows={5} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-brand-gold focus:outline-none"/>
             </div>
             <div className="space-y-2 flex flex-col items-end">
                <div className="flex justify-between w-full max-w-xs">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold">RM {formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between w-full max-w-xs">
                    <span className="text-gray-600">Tax ({companyInfo.taxRate}%):</span>
                    <span className="font-semibold">RM {formatCurrency(tax)}</span>
                </div>
                 <div className="flex justify-between w-full max-w-xs text-xl font-bold text-brand-text pt-2 border-t">
                    <span>Grand Total:</span>
                    <span>RM {formatCurrency(grandTotal)}</span>
                </div>
             </div>
          </div>
          
          <div className="mt-8 flex justify-end items-center space-x-4">
             <button onClick={onCancel} className="px-6 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors duration-200">Cancel</button>
             <button onClick={handleSave} className="px-8 py-2 rounded-md bg-brand-gold text-brand-black font-bold hover:opacity-90 transition-colors duration-200 shadow-lg">Save & Go to Dashboard</button>
          </div>
        </div>

        {isServiceModalOpen && (
            <AddServiceItemModal 
                services={services}
                onClose={() => setServiceModalOpen(false)}
                onAddServices={addServicesToQuote}
            />
        )}
    </>
  );
};

export default QuotationForm;
