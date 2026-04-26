import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { API_URL } from '../utils/api';

const Budget = () => {
    const [budgetData, setBudgetData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [avgRange, setAvgRange] = useState(3);
    const [nextMonthInfo, setNextMonthInfo] = useState({
        month: (new Date().getMonth() + 1) === 12 ? 1 : (new Date().getMonth() + 2),
        year: (new Date().getMonth() + 1) === 12 ? (new Date().getFullYear() + 1) : new Date().getFullYear()
    });
    const [newItemName, setNewItemName] = useState('');
    const [newItemAmount, setNewItemAmount] = useState('');
    const [newItemType, setNewItemType] = useState('Despesa');
    const [newItemSubType, setNewItemSubType] = useState('');

    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const fetchBudget = async () => {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/api/budget?month=${selectedMonth}&year=${selectedYear}&averageMonths=${avgRange}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setBudgetData(data.data || []);
                setNextMonthInfo({ month: data.nextMonth, year: data.nextYear });
            } else {
                setError(data.error || 'Erro ao carregar dados');
            }
        } catch (error) {
            console.error('Error fetching budget:', error);
            setError('Falha na comunicação com o servidor');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBudget();
    }, [selectedMonth, selectedYear, avgRange]);

    const handleUpdateManual = async (categoryName, amount, type, subType) => {
        const token = localStorage.getItem('token');
        // Validations
        const targetMonth = nextMonthInfo.month || (selectedMonth === 12 ? 1 : selectedMonth + 1);
        const targetYear = nextMonthInfo.year || (selectedMonth === 12 ? selectedYear + 1 : selectedYear);

        try {
            const response = await fetch(`${API_URL}/api/budget/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    categoryName,
                    month: targetMonth,
                    year: targetYear,
                    amount: parseFloat(amount) || 0,
                    type,
                    subType
                })
            });
            if (response.ok) {
                fetchBudget();
            } else {
                alert('Erro ao atualizar orçamento');
            }
        } catch (error) {
            console.error('Update manual budget error:', error);
            alert('Falha ao conectar ao servidor');
        }
    };

    const handleAddNewItem = async (e) => {
        e.preventDefault();
        if (!newItemName) return;
        await handleUpdateManual(newItemName, newItemAmount, newItemType, newItemSubType);
        setNewItemName('');
        setNewItemAmount('');
        setNewItemType('Despesa');
        setNewItemSubType('');
    };

    const getMonthName = (m) => {
        if (!m || m < 1) return '...';
        return new Date(0, m - 1).toLocaleString('pt-BR', { month: 'long' });
    };

    const generateBudgetPDF = () => {
        try {
            const doc = new jsPDF();
            const monthBase = (getMonthName(selectedMonth) || '').toUpperCase();
            const monthTarget = (getMonthName(nextMonthInfo.month) || '').toUpperCase();

            doc.setFontSize(18);
            doc.setTextColor(33, 150, 243);
            doc.text(`Kalq - Planejamento Médio e Orçamentário`, 14, 15);

            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Empresa/Doutor(a): ${(user && user.companyName) || 'N/A'} (${(user && user.name) || 'N/A'})`, 14, 22);
            doc.text(`Mês Base de Referência: ${monthBase} ${selectedYear}`, 14, 27);
            doc.text(`Projeção para o Período: ${monthTarget} ${nextMonthInfo.year}`, 14, 32);

            // Group data by type
            const categorizedData = {
                'Receita': [],
                'Despesa': [],
                'Investimento': []
            };

            budgetData.forEach(item => {
                const actual = parseFloat(item.actualCurrent) || 0;
                const forecast = parseFloat(item.forecastAverage) || 0;
                const manual = parseFloat(item.manualBudget) || 0;

                if (actual !== 0 || forecast !== 0 || manual !== 0) {
                    const type = item.type || 'Despesa';
                    if (categorizedData[type]) categorizedData[type].push({
                        ...item,
                        actualCurrent: actual,
                        forecastAverage: forecast,
                        manualBudget: manual
                    });
                }
            });

            let currentY = 40;

            Object.keys(categorizedData).forEach(type => {
                if (categorizedData[type].length === 0) return;

                doc.setFontSize(12);
                doc.setTextColor(0);
                doc.setFont(undefined, 'bold');
                doc.text(`${type}s`, 14, currentY);
                currentY += 5;

                const tableData = categorizedData[type].map(item => [
                    item.category + (item.subType ? ` (${item.subType})` : ''),
                    `R$ ${item.actualCurrent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                    `R$ ${item.forecastAverage.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                    `R$ ${item.manualBudget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                    `${(item.manualBudget - item.actualCurrent) >= 0 ? '+' : ''} R$ ${(item.manualBudget - item.actualCurrent).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                ]);

                autoTable(doc, {
                    startY: currentY,
                    head: [['Categoria/Conta', `Realizado (${monthBase})`, 'Média Histórica', `Orçado (${monthTarget})`, 'Diferença']],
                    body: tableData,
                    theme: 'striped',
                    headStyles: { fillColor: type === 'Receita' ? [46, 204, 113] : (type === 'Despesa' ? [231, 76, 60] : [52, 152, 219]) },
                    styles: { fontSize: 8 }
                });

                if (doc.lastAutoTable) {
                    currentY = doc.lastAutoTable.finalY + 10;
                } else {
                    currentY += (tableData.length * 10) + 15; // Fallback if lastAutoTable is not set
                }

                if (currentY > 260) {
                    doc.addPage();
                    currentY = 20;
                }
            });

            // Totals
            const totalBudgetIn = budgetData.filter(i => i.type === 'Receita').reduce((a, c) => a + (parseFloat(c.manualBudget) || 0), 0);
            const totalBudgetOut = budgetData.filter(i => i.type === 'Despesa').reduce((a, c) => a + (parseFloat(c.manualBudget) || 0), 0);

            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text(`Resumo Base de Fluxo (${monthTarget}):`, 14, currentY);
            currentY += 7;
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            doc.text(`Entradas Planejadas: R$ ${totalBudgetIn.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 14, currentY);
            currentY += 6;
            doc.text(`Saídas Planejadas: R$ ${totalBudgetOut.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 14, currentY);
            currentY += 6;

            const balance = totalBudgetIn - totalBudgetOut;
            doc.setFont(undefined, 'bold');
            if (balance >= 0) {
                doc.setTextColor(39, 174, 96);
            } else {
                doc.setTextColor(192, 57, 43);
            }
            doc.text(`Resultado Operacional Previsto: R$ ${balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 14, currentY);

            doc.save(`Analise_Planejamento_Kalq_${monthTarget}_${nextMonthInfo.year}.pdf`);
        } catch (err) {
            console.error('PDF Generation Error:', err);
            alert(`Erro na geração do relatório: ${err.message}. Tente atualizar a página.`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-sm">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Módulo Orçamento e Previsão</h1>
                        <p className="text-gray-600">Planejamento para {getMonthName(nextMonthInfo.month)}/ {nextMonthInfo.year}</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={generateBudgetPDF}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition-all"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                            Gerar Relatório Orçamentário
                        </button>
                        <button
                            onClick={() => navigate('/customers')}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition-all shadow-sm"
                        >
                            <span>👥 Clientes</span>
                        </button>
                        <button
                            onClick={() => navigate('/services')}
                            className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition-all shadow-sm"
                        >
                            <span>👑 Premium</span>
                        </button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-all"
                        >
                            Voltar ao Dashboard
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-4 rounded-lg shadow">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mês Base (Referência)</label>
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                            className="w-full p-2 border rounded"
                        >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                <option key={m} value={m}>{getMonthName(m)}</option>
                            ))}
                        </select>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="w-full p-2 border rounded"
                        >
                            {[selectedYear - 1, selectedYear, selectedYear + 1].map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Regra de Média</label>
                        <select
                            value={avgRange}
                            onChange={(e) => setAvgRange(Number(e.target.value))}
                            className="w-full p-2 border rounded"
                        >
                            <option value={1}>Média Último 1 mês</option>
                            <option value={3}>Média Últimos 3 meses</option>
                            <option value={6}>Média Últimos 6 meses</option>
                        </select>
                    </div>
                    <div className="bg-blue-600 p-4 rounded-lg shadow text-white">
                        <label className="block text-sm font-medium mb-1">Alvo do Orçamento</label>
                        <div className="text-xl font-bold">
                            {getMonthName(nextMonthInfo.month)} / {nextMonthInfo.year}
                        </div>
                    </div>
                </div>

                {/* Error Messaging */}
                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-8 pulse" role="alert">
                        <p className="font-bold">Atenção</p>
                        <p>{error}</p>
                    </div>
                )}

                {/* Manual Insert Form */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-100 mb-8">
                    <h3 className="text-purple-800 font-bold mb-4 flex items-center gap-2">
                        <span className="bg-purple-100 p-1 rounded">➕</span>
                        Planejamento de Nova Conta / Lançamento
                    </h3>
                    <form onSubmit={handleAddNewItem} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                        <div className="md:col-span-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome da Conta</label>
                            <input
                                type="text"
                                value={newItemName}
                                onChange={(e) => setNewItemName(e.target.value)}
                                placeholder="Ex: Reforma..."
                                className="w-full p-2 border border-purple-200 rounded focus:ring-2 focus:ring-purple-400 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo</label>
                            <select
                                value={newItemType}
                                onChange={(e) => setNewItemType(e.target.value)}
                                className="w-full p-2 border border-purple-200 rounded outline-none"
                            >
                                <option value="Receita">Receita</option>
                                <option value="Despesa">Despesa</option>
                                <option value="Investimento">Investimento</option>
                            </select>
                        </div>
                        {newItemType === 'Investimento' && (
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Operação</label>
                                <select
                                    value={newItemSubType}
                                    onChange={(e) => setNewItemSubType(e.target.value)}
                                    className="w-full p-2 border border-purple-200 rounded outline-none"
                                >
                                    <option value="">Selecione...</option>
                                    <option value="Aplicação">Aplicação</option>
                                    <option value="Resgate">Resgate</option>
                                </select>
                            </div>
                        )}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Valor Planejado</label>
                            <input
                                type="number"
                                value={newItemAmount}
                                onChange={(e) => setNewItemAmount(e.target.value)}
                                placeholder="0,00"
                                className="w-full p-2 border border-purple-200 rounded focus:ring-2 focus:ring-purple-400 outline-none"
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded transition-all"
                        >
                            Adicionar Meta
                        </button>
                    </form>
                </div>

                <div className="bg-white shadow-xl rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-4 text-gray-600 font-bold">Categoria / Conta</th>
                                <th className="p-4 text-gray-600 font-bold text-center">Tipo</th>
                                <th className="p-4 text-gray-600 font-bold">Realizado ({getMonthName(selectedMonth)})</th>
                                <th className="p-4 text-blue-600 font-bold">Média p/ {getMonthName(nextMonthInfo.month)}</th>
                                <th className="p-4 text-purple-600 font-bold">Meta para {getMonthName(nextMonthInfo.month)}</th>
                                <th className="p-4 text-gray-600 font-bold">Diferença</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {budgetData.map((item, idx) => (
                                <tr key={`${item.category}-${idx}`} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-medium text-gray-800">{item.category}</div>
                                        {item.subType && <div className="text-xs text-blue-500 font-bold uppercase">{item.subType}</div>}
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.type === 'Receita' ? 'bg-green-100 text-green-700' :
                                            item.type === 'Investimento' ? 'bg-blue-100 text-blue-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            {item.type || 'Despesa'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-700">R$ {item.actualCurrent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                    <td className="p-4 text-blue-700 font-semibold bg-blue-50/30">
                                        R$ {item.forecastAverage.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-400">R$</span>
                                            <input
                                                type="number"
                                                value={item.manualBudget === 0 ? '0' : (item.manualBudget || '')}
                                                onChange={(e) => {
                                                    const newVal = parseFloat(e.target.value);
                                                    const newData = [...budgetData];
                                                    newData[idx].manualBudget = isNaN(newVal) ? 0 : newVal;
                                                    setBudgetData(newData);
                                                }}
                                                onBlur={(e) => handleUpdateManual(item.category, e.target.value, item.type, item.subType)}
                                                className="w-32 p-1 border rounded focus:ring-2 focus:ring-purple-500 outline-none"
                                                placeholder="0,00"
                                            />
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`font-bold ${item.diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {item.diff >= 0 ? '+' : ''} R$ {item.diff.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {budgetData.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-500 italic">
                                        Nenhuma categoria encontrada. Classifique suas transações no Dashboard primeiro.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-8 bg-blue-50 p-6 rounded-xl border border-blue-100">
                    <h3 className="text-lg font-bold text-blue-800 mb-2">💡 Dica do Consultor Kalq:</h3>
                    <p className="text-blue-700">
                        Use a <strong>Média Retroativa</strong> para entender seu comportamento histórico. O <strong>Orçamento Manual</strong> é sua meta!
                        Se o seu orçamento for menor que a média histórica, identifique quais gastos você precisa cortar.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Budget;
