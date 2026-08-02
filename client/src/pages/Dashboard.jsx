import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import SummaryCards from '../components/SummaryCards';
import ConsultantCard from '../components/ConsultantCard';
import { analyzeFinancialHealth } from '../utils/aiConsultant';
import TransactionTable from '../components/TransactionTable';
import ClassificationDialog from '../components/ClassificationDialog';
import Paywall from '../components/Paywall';
import { API_URL } from '../utils/api';

const Dashboard = () => {
    const [summary, setSummary] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentTransaction, setCurrentTransaction] = useState(null);
    const [loading, setLoading] = useState(false);

    // Date Filtering State
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [categories, setCategories] = useState([]);

    // AI Consultant State
    const [analysis, setAnalysis] = useState(null);

    // Account State
    const [uploadAccountName, setUploadAccountName] = useState('');
    const [viewAccountFilter, setViewAccountFilter] = useState('ALL');

    const handleServiceSelect = (serviceTitle) => {
        const message = `Olá! Sou ${user.name} (${user.email}).\nTenho interesse no serviço: *${serviceTitle}*.`;
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/5581991040983?text=${encodedMessage}`, '_blank');
    };

    const services = [
        {
            title: 'Abertura de MEI',
            description: 'Abra sua empresa com segurança e sem burocracia.',
            icon: '🏢',
            color: 'bg-blue-50 text-blue-600 border border-blue-100'
        },
        {
            title: 'Declaração Anual (DASN)',
            description: 'Envio garantido da sua declaração obrigatória de faturamento.',
            icon: '📄',
            color: 'bg-purple-50 text-purple-600 border border-purple-100'
        },
        {
            title: 'Imposto de Renda (IRPF)',
            description: 'Faça seu imposto de pessoa física cruzando dados do seu MEI.',
            icon: '🦁',
            color: 'bg-amber-50 text-amber-600 border border-amber-100'
        },
        {
            title: 'Malha Fiscal',
            description: 'Resolvemos pendências com a Receita Federal.',
            icon: '🛡️',
            color: 'bg-red-50 text-red-600 border border-red-100'
        },
        {
            title: 'eSocial (1 Empregado)',
            description: 'Gestão mensal da folha de pagamento do seu funcionário.',
            icon: '👥',
            color: 'bg-emerald-50 text-emerald-600 border border-emerald-100'
        },
        {
            title: 'Benefícios INSS',
            description: 'Auxílio Doença, Salário Maternidade e aposentadoria.',
            icon: '🏥',
            color: 'bg-teal-50 text-teal-600 border border-teal-100'
        }
    ];

    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const fetchData = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await fetch(`${API_URL}/api/transactions?month=${selectedMonth}&year=${selectedYear}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setSummary(data.summary);
                setTransactions(data.transactions);
                const aiAnalysis = analyzeFinancialHealth(data.transactions, user.taxType, data.summary);
                setAnalysis(aiAnalysis);
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
        }
    };

    const fetchCategories = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/api/categories`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setCategories(data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    useEffect(() => {
        fetchData();
        fetchCategories();
    }, [selectedMonth, selectedYear]);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!uploadAccountName) {
            alert('Por favor, digite o nome da Conta/Banco antes de enviar o arquivo.');
            event.target.value = '';
            return;
        }

        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('file', file);
        formData.append('accountName', uploadAccountName);

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/transactions/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                alert(result.message);
                fetchData();
                setUploadAccountName('');
            } else {
                alert(`Erro: ${result.error || 'Falha no processamento'}`);
            }
        } catch (error) {
            console.error("Upload error:", error);
            alert('Erro no upload.');
        } finally {
            setLoading(false);
            event.target.value = '';
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Deseja excluir esta transação?')) return;
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/api/transactions/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                fetchData();
            } else {
                alert('Erro ao excluir transação.');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Erro na exclusão.');
        }
    };

    const openClassificationDialog = (transaction) => {
        setCurrentTransaction(transaction);
        setIsDialogOpen(true);
    };

    const handleClassification = async (classificationData) => {
        const token = localStorage.getItem('token');
        try {
            // The classificationData contains the transaction + classification object
            const response = await fetch(`${API_URL}/api/transactions/${currentTransaction.id}/classify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ classification: classificationData.classification })
            });

            if (response.ok) {
                setIsDialogOpen(false);
                fetchData();
            } else {
                alert('Erro ao salvar classificação.');
            }
        } catch (error) {
            console.error('Classification error:', error);
            alert('Erro na classificação.');
        }
    };

    const generatePDF = () => {
        try {
            const doc = new jsPDF();
            const monthName = new Date(0, selectedMonth - 1).toLocaleString('pt-BR', { month: 'long' }).toUpperCase();

            // --- HEADER ---
            doc.setFontSize(20);
            doc.setTextColor(33, 150, 243); // Blue
            doc.text('Kalq - Relatório de Fluxo de Caixa', 14, 20);

            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Empresa/Doutor(a): ${(user && user.companyName) || 'N/A'} (${(user && user.name) || 'N/A'})`, 14, 28);
            doc.text(`Período: ${monthName} / ${selectedYear}`, 14, 33);
            doc.text(`Data de Emissão: ${new Date().toLocaleString('pt-BR')}`, 14, 38);

            // --- SECTION 1: SINTÉTICO (SUMMARY) ---
            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.setFont(undefined, 'bold');
            doc.text('1. Resumo Sintético', 14, 50);

            const summaryData = [
                ['Descrição', 'Valor'],
                ['(+) Saldo Inicial', `R$ ${summary.INITIAL_BALANCE}`],
                ['(+) Total de Entradas (Créditos)', `R$ ${summary.CREDITS}`],
                ['(-) Total de Saídas (Débitos)', `R$ ${summary.DEBITS}`],
                ['(=) Saldo Final do Período', `R$ ${summary.FINAL_BALANCE}`]
            ];

            autoTable(doc, {
                startY: 55,
                head: [summaryData[0]],
                body: summaryData.slice(1),
                theme: 'grid',
                headStyles: { fillColor: [33, 150, 243] },
                columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
                styles: { fontSize: 10 }
            });

            // --- AI INSIGHTS ---
            let currentY = doc.lastAutoTable.finalY + 12;
            if (analysis) {
                doc.setFontSize(12);
                doc.setFont(undefined, 'bold');
                doc.text('Análise Técnica do Consultor:', 14, currentY);
                doc.setFontSize(9);
                doc.setFont(undefined, 'italic');
                doc.setTextColor(60);
                const splitText = doc.splitTextToSize(analysis.message, 180);
                doc.text(splitText, 14, currentY + 7);
                doc.setFont(undefined, 'normal');
                doc.setTextColor(0);
                currentY += 15 + (splitText.length * 5);
            }

            // --- SECTION 2: ANALÍTICO (DETAILS) ---
            doc.addPage();
            doc.setFontSize(16);
            doc.setTextColor(33, 150, 243);
            doc.text('2. Relatório Analítico de Lançamentos', 14, 20);

            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Detalhamento das movimentações de ${monthName}/${selectedYear}`, 14, 27);

            // Group transactions by type
            const grouped = {
                'Receita': [],
                'Despesa': [],
                'Investimento': [],
                'Pessoal': [],
                'Pendente / Outros': []
            };

            filteredTransactions.forEach(t => {
                const type = t.classification?.type || 'Pendente / Outros';
                if (grouped[type]) grouped[type].push(t);
                else grouped['Pendente / Outros'].push(t);
            });

            let currentYAnalytic = 35;

            // Warning for Personal Expenses in PDF
            if (grouped['Pessoal'].length > 0) {
                doc.setFontSize(10);
                doc.setTextColor(211, 84, 0); // Orange
                doc.setFont(undefined, 'bold');
                doc.text('AVISO: FORAM IDENTIFICADAS DESPESAS PESSOAIS NESTE PERÍODO.', 14, currentYAnalytic);
                doc.setFontSize(8);
                doc.setFont(undefined, 'normal');
                doc.text('A mistura de contas pessoais com as do negócio prejudica a análise de lucratividade e saúde financeira.', 14, currentYAnalytic + 4);
                currentYAnalytic += 15;
            }

            const renderGroupTable = (title, items, color) => {
                if (items.length === 0) return;

                if (currentYAnalytic > 250) {
                    doc.addPage();
                    currentYAnalytic = 20;
                }

                doc.setFontSize(12);
                doc.setTextColor(color[0], color[1], color[2]);
                doc.setFont(undefined, 'bold');
                const displayTitle = title === 'Receita' ? 'ENTRADAS / RECEITAS' : (title === 'Despesa' ? 'SAÍDAS / DESPESAS' : title.toUpperCase());
                doc.text(displayTitle, 14, currentYAnalytic);
                currentYAnalytic += 5;

                const tableData = items.map(t => [
                    t.RELEASE_DATE,
                    t.accountName || '-',
                    t.classification?.category || (title === 'Pendente / Outros' ? 'Não Classificado' : '-'),
                    t.classification?.subCategory || '-',
                    t.TRANSACTION_NET_AMOUNT
                ]);

                autoTable(doc, {
                    startY: currentYAnalytic,
                    head: [['Data', 'Conta/Banco', 'Categoria', 'Detalhe', 'Valor (R$)']],
                    body: tableData,
                    theme: 'striped',
                    headStyles: { fillColor: color },
                    styles: { fontSize: 7 },
                    columnStyles: { 4: { halign: 'right', fontStyle: 'bold' } }
                });

                const groupTotal = items.reduce((acc, curr) => {
                    const val = parseFloat(curr.TRANSACTION_NET_AMOUNT.replace(/\./g, '').replace(',', '.')) || 0;
                    return acc + val;
                }, 0);

                currentYAnalytic = doc.lastAutoTable.finalY + 8;
                doc.setFontSize(9);
                doc.setTextColor(0);
                doc.text(`Subtotal ${title}: R$ ${groupTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 196, currentYAnalytic, { align: 'right' });
                currentYAnalytic += 12;
            };

            renderGroupTable('Receita', grouped['Receita'], [46, 204, 113]);
            renderGroupTable('Despesa', grouped['Despesa'], [231, 76, 60]);
            renderGroupTable('Investimento', grouped['Investimento'], [52, 152, 219]);
            renderGroupTable('Pessoal', grouped['Pessoal'], [211, 84, 0]);
            renderGroupTable('Pendente / Outros', grouped['Pendente / Outros'], [149, 165, 166]);

            // --- SECTION 3: RELATÓRIO DE RECEITAS SEPARADAS ---
            if (grouped['Receita'].length > 0) {
                doc.addPage();
                doc.setFontSize(16);
                doc.setTextColor(33, 150, 243);
                doc.text('3. Relatório de Receitas Separadas', 14, 20);

                doc.setFontSize(10);
                doc.setTextColor(100);
                doc.text(`Detalhamento exclusivo de receitas de ${monthName}/${selectedYear} agrupado por categorias`, 14, 27);

                let currentYReceitas = 35;

                // Group revenues by Category
                const receitasByCategory = {};
                grouped['Receita'].forEach(t => {
                    const cat = t.classification?.category || 'Outras Receitas';
                    if (!receitasByCategory[cat]) receitasByCategory[cat] = [];
                    receitasByCategory[cat].push(t);
                });

                Object.keys(receitasByCategory).forEach(category => {
                    const items = receitasByCategory[category];

                    if (currentYReceitas > 250) {
                        doc.addPage();
                        currentYReceitas = 20;
                    }

                    doc.setFontSize(12);
                    doc.setTextColor(46, 204, 113); // Green for revenues
                    doc.setFont(undefined, 'bold');
                    doc.text(`CATEGORIA: ${category.toUpperCase()}`, 14, currentYReceitas);
                    currentYReceitas += 5;

                    const tableData = items.map(t => [
                        t.RELEASE_DATE,
                        t.accountName || '-',
                        t.classification?.subCategory || '-',
                        t.TRANSACTION_NET_AMOUNT
                    ]);

                    autoTable(doc, {
                        startY: currentYReceitas,
                        head: [['Data', 'Conta/Banco', 'Detalhe', 'Valor (R$)']],
                        body: tableData,
                        theme: 'striped',
                        headStyles: { fillColor: [46, 204, 113] },
                        styles: { fontSize: 7 },
                        columnStyles: { 3: { halign: 'right', fontStyle: 'bold' } }
                    });

                    const groupTotal = items.reduce((acc, curr) => {
                        const val = parseFloat(curr.TRANSACTION_NET_AMOUNT.replace(/\./g, '').replace(',', '.')) || 0;
                        return acc + val;
                    }, 0);

                    currentYReceitas = doc.lastAutoTable.finalY + 8;
                    doc.setFontSize(9);
                    doc.setTextColor(0);
                    doc.text(`Total ${category}: R$ ${groupTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 196, currentYReceitas, { align: 'right' });
                    currentYReceitas += 12;
                });

                // Total Geral de Receitas
                const totalGeralReceitas = grouped['Receita'].reduce((acc, curr) => {
                    const val = parseFloat(curr.TRANSACTION_NET_AMOUNT.replace(/\./g, '').replace(',', '.')) || 0;
                    return acc + val;
                }, 0);

                if (currentYReceitas > 270) {
                    doc.addPage();
                    currentYReceitas = 20;
                }

                doc.setFontSize(11);
                doc.setTextColor(0);
                doc.setFont(undefined, 'bold');
                doc.text(`TOTAL GERAL DE RECEITAS: R$ ${totalGeralReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 196, currentYReceitas, { align: 'right' });
            }

            doc.save(`Relatorio_Fluxo_Caixa_Analitico_${selectedMonth}_${selectedYear}.pdf`);
        } catch (err) {
            console.error('PDF Error:', err);
            alert(`Erro ao gerar PDF: ${err.message}`);
        }
    };

    const filteredTransactions = transactions.filter(t =>
        viewAccountFilter === 'ALL' || t.accountName === viewAccountFilter
    );

    const uniqueAccounts = [...new Set(transactions.map(t => t.accountName || 'Conta Padrão'))];

    return (
        <div className="min-h-screen p-8" style={{ backgroundColor: '#FDFCF8', color: '#2C2C2C' }}>
            <div className="max-w-7xl mx-auto">
                {/* Premium Header */}
                <header className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-200" style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)' }}>
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                        {/* Brand Section */}
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="relative w-12 h-12 flex items-center justify-center rounded-xl shadow-sm border border-gray-100" style={{ background: 'linear-gradient(135deg, rgba(217, 119, 87, 0.1) 0%, rgba(217, 119, 87, 0.02) 100%)' }}>
                                    <span className="text-2xl font-black tracking-tight" style={{ color: '#D97757' }}>K</span>
                                </div>
                            </div>
                            <div>
                                <h1 className="text-3xl font-black tracking-tight text-gray-800">
                                    Kalq
                                </h1>
                                <div className="flex items-center gap-3 mt-1">
                                    <p className="text-sm font-semibold tracking-wide" style={{ color: '#D97757' }}>CENTRAL DO MEI</p>
                                </div>
                                <div className="flex items-center gap-3 mt-2">
                                    <p className="text-gray-500 font-medium text-sm">{user.companyName}</p>
                                    {user.paidUntil && (
                                        <span className="text-xs px-3 py-1 rounded-full font-semibold" style={{ background: 'rgba(217, 119, 87, 0.1)', color: '#D97757', border: '1px solid rgba(217, 119, 87, 0.2)' }}>
                                            Premium até {new Date(user.paidUntil).toLocaleDateString('pt-BR')}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex flex-wrap gap-3">
                            {user.isAdmin && (
                                <button
                                    onClick={() => navigate('/admin')}
                                    className="bg-white hover:bg-gray-50 text-gray-700 font-bold py-2.5 px-5 rounded-xl shadow-sm transition-all duration-300 flex items-center gap-2 border border-gray-200"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span>Admin</span>
                                </button>
                            )}

                            <button
                                onClick={() => navigate('/ai-analysis')}
                                className="bg-white hover:bg-indigo-50 text-indigo-700 font-bold py-2.5 px-5 rounded-xl shadow-sm transition-all duration-300 flex items-center gap-2 border border-indigo-200"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                                </svg>
                                <span>Análise IA</span>
                            </button>

                            <button
                                onClick={() => navigate('/customers')}
                                className="bg-white hover:bg-gray-50 text-gray-700 font-bold py-2.5 px-5 rounded-xl shadow-sm transition-all duration-300 flex items-center gap-2 border border-gray-200"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                                </svg>
                                <span>Clientes</span>
                            </button>

                            <button
                                onClick={() => navigate('/budget')}
                                className="bg-white hover:bg-gray-50 text-gray-700 font-bold py-2.5 px-5 rounded-xl shadow-sm transition-all duration-300 flex items-center gap-2 border border-gray-200"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Gerar Orçamento</span>
                            </button>

                            <button
                                onClick={handleLogout}
                                className="bg-white hover:bg-red-50 text-red-600 font-bold py-2.5 px-5 rounded-xl shadow-sm transition-all duration-300 flex items-center gap-2 border border-red-200"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                                </svg>
                                <span>Sair</span>
                            </button>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">Filtros de Visualização</h3>
                        <div className="flex gap-4">
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                className="p-2.5 border border-gray-200 rounded-xl w-full bg-gray-50 focus:ring-2 focus:ring-[#D97757] focus:border-transparent outline-none transition-all text-gray-700 font-medium"
                            >
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                    <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('pt-BR', { month: 'long' })}</option>
                                ))}
                            </select>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                                className="p-2.5 border border-gray-200 rounded-xl w-full bg-gray-50 focus:ring-2 focus:ring-[#D97757] focus:border-transparent outline-none transition-all text-gray-700 font-medium"
                            >
                                {[currentYear - 1, currentYear, currentYear + 1].map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">Importar Planilha Bancária</h3>
                        <div className="flex flex-col gap-3">
                            <input
                                type="text"
                                placeholder="Nome da Conta/Banco (Ex: Conta Integrada)"
                                value={uploadAccountName}
                                onChange={(e) => setUploadAccountName(e.target.value)}
                                className="p-2.5 border border-gray-200 rounded-xl w-full bg-gray-50 focus:ring-2 focus:ring-[#D97757] focus:border-transparent outline-none transition-all text-gray-700 font-medium"
                            />
                            <div className="relative">
                                <input
                                    className="block w-full text-sm text-gray-600 border border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 focus:outline-none p-2.5 transition-colors"
                                    id="file_input"
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileUpload}
                                    disabled={loading}
                                />
                                {loading && <span className="absolute right-2 top-2 text-blue-600 font-bold text-xs">Enviando...</span>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-12">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-black text-gray-800 tracking-tight">Serviços Contábeis Premium</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map((svc, idx) => (
                            <div key={idx} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all border border-gray-100 p-6 flex flex-col h-full group">
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl mb-6 ${svc.color} shadow-sm`}>
                                    {svc.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">{svc.title}</h3>
                                <p className="text-gray-500 mb-6 flex-grow">{svc.description}</p>
                                
                                <div className="mt-auto pt-4 border-t border-gray-50 flex items-end justify-end">
                                    <button 
                                        onClick={() => handleServiceSelect(svc.title)}
                                        className="bg-gray-50 text-gray-600 hover:bg-[#D97757] hover:text-white border border-gray-200 hover:border-[#D97757] text-sm font-bold py-2.5 px-5 rounded-xl transition-all shadow-sm"
                                    >
                                        Solicitar Serviço
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>


                </div>

                {summary && (
                    <div className="mb-8">
                        <div className="mb-6 flex gap-3 overflow-x-auto pb-2">
                            <button
                                onClick={() => setViewAccountFilter('ALL')}
                                className={`px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm ${viewAccountFilter === 'ALL' ? 'bg-[#D97757] text-white border border-[#D97757]' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                            >
                                Todas as Contas
                            </button>
                            {uniqueAccounts.map(acc => (
                                <button
                                    key={acc}
                                    onClick={() => setViewAccountFilter(acc)}
                                    className={`px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm ${viewAccountFilter === acc ? 'bg-[#D97757] text-white border border-[#D97757]' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                                >
                                    {acc}
                                </button>
                            ))}
                        </div>

                        <ConsultantCard analysis={analysis} />

                        <SummaryCards 
                            summary={summary} 
                            month={selectedMonth} 
                            year={selectedYear} 
                        />

                        {filteredTransactions.some(t => t.classification?.type === 'Pessoal') && (
                            <div className="mt-6 p-4 bg-orange-50 border-l-4 border-orange-500 rounded shadow-sm animate-pulse">
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl flex-shrink-0">⚠️</span>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-orange-800 mb-2">Alerta de Saúde Financeira: Mistura Patrimonial Detectada</h4>
                                        <p className="text-orange-700 text-sm leading-relaxed">
                                            Identificamos gastos <strong>Pessoais</strong> sendo pagos com a conta da empresa.
                                            Essa prática dificulta a visão real do seu lucro e pode trazer problemas com o Fisco.
                                            <strong> Recomendação:</strong> Utilize apenas o "Pró-Labore" ou "Distribuição de Lucros" para seus gastos pessoais.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={generatePDF}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                </svg>
                                Gerar PDF / Relatório
                            </button>
                        </div>
                    </div>
                )}

                <div className="bg-white shadow-sm rounded-2xl p-8 border border-gray-100 mt-8 mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-800">
                            Extrato Detalhado {viewAccountFilter !== 'ALL' && <span className="text-[#D97757]">- {viewAccountFilter}</span>}
                        </h2>
                        <span className="text-sm font-semibold bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                            {filteredTransactions.length} registros
                        </span>
                    </div>

                    {filteredTransactions.length > 0 ? (
                        <TransactionTable
                            transactions={filteredTransactions}
                            onClassify={openClassificationDialog}
                            onDelete={handleDelete}
                        />
                    ) : (
                        <p className="text-gray-500 italic text-center py-8">
                            Nenhuma transação encontrada para este filtro. Importe um arquivo CSV.
                        </p>
                    )}
                </div>

                {isDialogOpen && (
                    <ClassificationDialog
                        isOpen={isDialogOpen}
                        onClose={() => setIsDialogOpen(false)}
                        onSave={handleClassification}
                        transaction={currentTransaction}
                        userTaxType={user.taxType}
                        categories={categories}
                        onCategoryCreated={fetchCategories}
                    />
                )}
            </div>
        </div>
    );
};

export default Dashboard;
