import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { API_URL } from '../utils/api';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const fetchCustomers = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/api/customers`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setCustomers(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const generateAnnualReport = async (customer) => {
        const year = new Date().getFullYear() - 1; // Default to last year
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/api/customers/${customer.id}/annual-report?year=${year}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();

                const doc = new jsPDF();
                doc.setFontSize(18);
                doc.text('Informe de Rendimentos Pagos - Ano Calendário ' + year, 105, 20, { align: 'center' });

                doc.setFontSize(10);
                doc.text('FONTE PAGADORA (PACIENTE/CLIENTE):', 14, 40);
                doc.text(`Nome: ${customer.name}`, 14, 45);
                doc.text(`CPF: ${customer.cpf || 'Não informado'}`, 14, 50);

                doc.text('BENEFICIÁRIO DO PAGAMENTO (PROFISSIONAL):', 14, 65);
                doc.text(`Nome/Razão Social: ${user.companyName || user.name}`, 14, 70);

                doc.text('DETALHAMENTO DOS LANÇAMENTOS:', 14, 90);

                const tableData = data.transactions.map(t => [
                    t.releaseDate,
                    t.classificationType || 'Consulta/Serviço',
                    `R$ ${parseFloat(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                ]);

                autoTable(doc, {
                    startY: 95,
                    head: [['Data', 'Descrição', 'Valor']],
                    body: tableData,
                    foot: [['', 'TOTAL ACUMULADO NO ANO', `R$ ${parseFloat(data.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`]],
                    theme: 'grid',
                    headStyles: { fillColor: [33, 150, 243] },
                    footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' }
                });

                doc.setFontSize(8);
                doc.text('Documento gerado para fins de declaração de Imposto de Renda Pessoa Física.', 105, doc.lastAutoTable.finalY + 20, { align: 'center' });

                doc.save(`Informe_IR_${customer.name}_${year}.pdf`);
            }
        } catch (err) {
            console.error(err);
            alert('Erro ao gerar relatório');
        }
    };

    const [editingCustomer, setEditingCustomer] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', cpf: '', phone: '', email: '', birthDate: '' });

    const handleEditClick = (customer) => {
        setEditingCustomer(customer);
        setEditForm({
            name: customer.name || '',
            cpf: customer.cpf || '',
            phone: customer.phone || '',
            email: customer.email || '',
            birthDate: customer.birthDate || ''
        });
    };

    const handleUpdateCustomer = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/api/customers/${editingCustomer.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editForm)
            });
            if (response.ok) {
                setEditingCustomer(null);
                fetchCustomers();
            }
        } catch (err) {
            console.error(err);
            alert('Erro ao atualizar cliente');
        }
    };

    const getWhatsAppLink = (customer) => {
        if (!customer.phone) return null;
        const msg = encodeURIComponent(`Olá ${customer.name}, notamos que faz tempo que não nos vemos. Vamos agendar seu retorno?`);
        return `https://wa.me/${customer.phone.replace(/\D/g, '')}?text=${msg}`;
    };

    const getBirthdayWhatsAppLink = (customer) => {
        if (!customer.phone) return null;
        const msg = encodeURIComponent(`Olá ${customer.name}! 🎂 Passando para te desejar um feliz aniversário! Muita saúde, paz e realizações. Parabéns pelo seu dia!`);
        return `https://wa.me/${customer.phone.replace(/\D/g, '')}?text=${msg}`;
    };

    const isBirthdayToday = (dateStr) => {
        if (!dateStr) return false;
        const today = new Date();
        const [y, m, d] = dateStr.split('-').map(Number);
        return today.getDate() === d && (today.getMonth() + 1) === m;
    };

    const birthdayBoys = customers.filter(c => isBirthdayToday(c.birthDate));

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.cpf && c.cpf.includes(searchTerm))
    );

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Gestão de Clientes e Recorrência</h1>
                        <p className="text-gray-600 italic">"Atendimento especialista em MEI - Microempreendedor Individual."</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => navigate('/services')}
                            className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-6 rounded-lg transition-all shadow-lg shadow-amber-200 flex items-center gap-2"
                        >
                            <span>👑 Premium</span>
                        </button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-all shadow-lg shadow-blue-200"
                        >
                            Voltar ao Dashboard
                        </button>
                    </div>
                </header>

                {birthdayBoys.length > 0 && (
                    <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-4 rounded-xl shadow-lg mb-8 text-white flex items-center justify-between animate-bounce-slow">
                        <div className="flex items-center gap-4">
                            <span className="text-4xl">🎂</span>
                            <div>
                                <h3 className="font-bold text-lg">Temos aniversariantes hoje!</h3>
                                <p className="text-pink-100 text-sm">Que tal enviar uma mensagem especial para {birthdayBoys.length === 1 ? 'seu cliente' : 'seus clientes'}?</p>
                                <div className="flex gap-2 mt-2">
                                    {birthdayBoys.map(c => (
                                        <a key={c.id} href={getBirthdayWhatsAppLink(c)} target="_blank" rel="noreferrer" className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full text-xs font-bold transition-all">
                                            🎈 Parabenizar {c.name.split(' ')[0]}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
                    <div className="flex gap-4 mb-6">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="Buscar por nome ou CPF..."
                                className="w-full p-2 pl-10 border rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="p-4 font-bold text-gray-600">Cliente / Paciente</th>
                                    <th className="p-4 font-bold text-gray-600">Última Visita</th>
                                    <th className="p-4 font-bold text-gray-600">Status Recorrência</th>
                                    <th className="p-4 font-bold text-gray-600">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCustomers.map(customer => (
                                    <tr key={customer.id} className="border-b hover:bg-gray-50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-bold text-gray-800 flex items-center gap-2">
                                                {customer.name}
                                                {isBirthdayToday(customer.birthDate) && <span title="Aniversariante hoje!" className="animate-pulse">🎂</span>}
                                            </div>
                                            <div className="text-xs text-gray-500">{customer.cpf || 'Sem CPF'} | {customer.phone || 'Sem Telefone'}</div>
                                            {customer.birthDate && (
                                                <div className="text-[10px] text-gray-400">
                                                    Aniversário: {customer.birthDate.split('-').reverse().join('/')}
                                                </div>
                                            )}
                                            {customer.email && <div className="text-[10px] text-gray-400">{customer.email}</div>}
                                        </td>
                                        <td className="p-4">
                                            {customer.lastVisit || 'Nunca'}
                                        </td>
                                        <td className="p-4">
                                            {customer.isLost ? (
                                                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                                                    ⚠️ Sumido há {Math.floor(customer.daysSinceLast / 30)} meses
                                                </span>
                                            ) : (
                                                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                                                    ✅ Ativo
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 flex gap-2">
                                            <button
                                                onClick={() => handleEditClick(customer)}
                                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded text-xs font-bold transition-all"
                                                title="Completar Cadastro"
                                            >
                                                ✏️ Editar
                                            </button>

                                            {isBirthdayToday(customer.birthDate) && (
                                                <a
                                                    href={getBirthdayWhatsAppLink(customer)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="bg-pink-100 hover:bg-pink-200 text-pink-700 px-3 py-2 rounded text-xs font-bold transition-all flex items-center gap-1"
                                                >
                                                    🎉 Parabéns
                                                </a>
                                            )}

                                            <button
                                                onClick={() => generateAnnualReport(customer)}
                                                className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-2 rounded text-xs font-bold transition-all"
                                                title="Gerar Informe de Rendimentos IR"
                                            >
                                                📄 Informe IR
                                            </button>

                                            {customer.phone && (
                                                <a
                                                    href={getWhatsAppLink(customer)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-xs font-bold transition-all"
                                                >
                                                    💬 WhatsApp
                                                </a>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {filteredCustomers.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan="4" className="p-8 text-center text-gray-400 italic">
                                            Nenhum cliente encontrado. Identifique seus clientes nas transações do Dashboard.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-orange-50 p-6 rounded-xl border border-orange-100">
                        <h3 className="font-bold text-orange-800 mb-2">💡 Dica de Ouro: Informe de IR</h3>
                        <p className="text-sm text-orange-700">
                            No início do ano, envie o relatório consolidado para seus pacientes.
                            Isso evita que eles te liguem um por um pedindo recibos e aumenta a percepção de profissionalismo.
                        </p>
                    </div>
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                        <h3 className="font-bold text-blue-800 mb-2">🔄 Como funciona a Recorrência?</h3>
                        <p className="text-sm text-blue-700">
                            Sempre que você classificar uma <strong>Receita</strong> e vincular a um <strong>Cliente</strong>,
                            o sistema atualiza o tempo de retorno. Se passar de 4 meses, ele entra automaticamente em "Alerta de Sumido".
                        </p>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {editingCustomer && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="bg-blue-600 p-6 text-white">
                            <h2 className="text-xl font-bold">Completar Cadastro</h2>
                            <p className="text-blue-100 text-sm">Atualize os dados de {editingCustomer.name}</p>
                        </div>
                        <form onSubmit={handleUpdateCustomer} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome Completo</label>
                                <input
                                    type="text"
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                                    value={editForm.name}
                                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">CPF</label>
                                    <input
                                        type="text"
                                        placeholder="000.000.000-00"
                                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                                        value={editForm.cpf}
                                        onChange={e => setEditForm({ ...editForm, cpf: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data de Nasc.</label>
                                    <input
                                        type="date"
                                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                                        value={editForm.birthDate}
                                        onChange={e => setEditForm({ ...editForm, birthDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">WhatsApp</label>
                                    <input
                                        type="text"
                                        placeholder="11999999999"
                                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                                        value={editForm.phone}
                                        onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">E-mail</label>
                                    <input
                                        type="email"
                                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                                        value={editForm.email}
                                        onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setEditingCustomer(null)}
                                    className="flex-1 px-4 py-2 border rounded-lg font-bold text-gray-600 hover:bg-gray-50 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
                                >
                                    Salvar Alterações
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Customers;
