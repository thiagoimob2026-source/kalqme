import React from 'react';
import SummaryCard from './SummaryCard';

const SummaryCards = ({ summary, month, year }) => {
    if (!summary) return null;

    const monthName = new Date(year, month - 1).toLocaleString('pt-BR', { month: 'long' });
    const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

    // Calculate Monthly Result (Profit/Loss)
    const parseAmount = (str) => parseFloat(str.replace(/\./g, '').replace(',', '.')) || 0;
    const creditsVal = parseAmount(summary.CREDITS);
    const debitsVal = parseAmount(summary.DEBITS);
    const resultVal = creditsVal + debitsVal; // debits are already negative in the string if they come that way? 
    // Wait, let's check backend DEBITS.
    // Backend (transactions.js line 72): else debits += val; (val is negative)
    // So creditsVal is positive, debitsVal is negative. resultVal = creditsVal + debitsVal.
    
    const resultFormatted = Math.abs(resultVal).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    const isProfit = resultVal >= 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
            <SummaryCard 
                title="Saldo Inicial" 
                value={`R$ ${summary.INITIAL_BALANCE}`} 
                color="text-slate-700" 
                icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" /></svg>}
            />
            <SummaryCard 
                title={`Entradas / ${capitalizedMonth}`} 
                value={`R$ ${summary.CREDITS}`} 
                color="text-emerald-600" 
                icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m0 0l6.75-6.75M12 19.5l-6.75-6.75" /></svg>}
            />
            <SummaryCard 
                title={`Saídas / ${capitalizedMonth}`} 
                value={`R$ ${summary.DEBITS}`} 
                color="text-rose-600" 
                icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19.5v-15m0 0l-6.75 6.75M12 4.5l6.75 6.75" /></svg>}
            />
            <SummaryCard 
                title={`Resultado / ${capitalizedMonth}`} 
                value={`R$ ${resultFormatted}`} 
                color={isProfit ? "text-blue-600" : "text-amber-600"} 
                icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            />
            <SummaryCard 
                title="Saldo Final do Mês" 
                value={`R$ ${summary.FINAL_BALANCE}`} 
                color="text-indigo-600" 
                icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75m0 1.5v.75m0 1.5v.75m0 1.5V15m0 1.5V18m0 1.5v.75A1.5 1.5 0 005.25 21h13.5A1.5 1.5 0 0020.25 19.5V4.5a1.5 1.5 0 00-1.5-1.5H5.25A1.5 1.5 0 003.75 4.5zm0 0h6.75M4.5 9h6.75M4.5 13.5h6.75M4.5 18h6.75m11.25-13.5v15a1.5 1.5 0 01-1.5 1.5H16.5a1.5 1.5 0 01-1.5-1.5V4.5a1.5 1.5 0 011.5-1.5h2.25a1.5 1.5 0 011.5 1.5z" /></svg>}
            />
        </div>
    );
};

export default SummaryCards;
