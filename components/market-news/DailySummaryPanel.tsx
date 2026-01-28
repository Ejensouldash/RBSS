import React, { useState } from 'react';
import { DailySummary } from '../../types';

interface DailySummaryPanelProps {
    summaries: DailySummary[];
}

const DailySummaryPanel: React.FC<DailySummaryPanelProps> = ({ summaries }) => {
    const [selectedDate, setSelectedDate] = useState(summaries[0]?.date || '');

    const selectedSummary = summaries.find(s => s.date === selectedDate);
    
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-brand-text">AI Daily Market Summary</h3>
                <select 
                    value={selectedDate} 
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="text-sm p-1 border-none rounded bg-gray-100 focus:ring-1 focus:ring-brand-gold"
                >
                    {summaries.map(summary => (
                        <option key={summary.date} value={summary.date}>
                            {formatDate(summary.date)}
                        </option>
                    ))}
                </select>
            </div>
            {selectedSummary ? (
                <ul className="space-y-2">
                    {selectedSummary.summaryPoints.map((point, index) => (
                        <li key={index} className="flex items-start">
                            <span className="text-brand-red mr-2 mt-1">&#9656;</span>
                            <span className="text-sm text-gray-700">{point}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-gray-500">No summary available for the selected date.</p>
            )}
        </div>
    );
};

export default DailySummaryPanel;