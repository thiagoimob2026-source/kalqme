import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../utils/api';

const Admin = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchUsers = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/api/admin/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user.isAdmin) {
            navigate('/dashboard');
            return;
        }
        fetchUsers();
    }, []);

    const updatePlan = async (userId, newPlan) => {
        const token = localStorage.getItem('token');
        try {
            await fetch(`${API_URL}/api/admin/users/${userId}/update-plan`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ plan: newPlan })
            });
            fetchUsers(); // Refresh
        } catch (error) {
            alert('Erro ao atualizar plano');
        }
    };

    const togglePayment = async (userId) => {
        const token = localStorage.getItem('token');
        try {
            await fetch(`${API_URL}/api/admin/users/${userId}/toggle-payment`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchUsers(); // Refresh
        } catch (error) {
            alert('Erro ao atualizar pagamento');
        }
    };

    if (loading) return <div className="p-8 text-white">Carregando painel admin...</div>;

    return (
        <div className="min-h-screen bg-slate-900 p-8 text-white">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold font-outfit text-white">Painel Administrativo Kalq</h1>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded text-sm"
                    >
                        Voltar ao Dashboard
                    </button>
                </div>

                <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
                    <table className="w-full text-left">
                        <thead className="bg-slate-700/50 text-slate-400 text-sm uppercase">
                            <tr>
                                <th className="p-4">Nome / Empresa</th>
                                <th className="p-4">E-mail</th>
                                <th className="p-4">Vigência</th>
                                <th className="p-4">Plano</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {users.map(u => (
                                <tr key={u.id} className="hover:bg-slate-700/30 transition-colors">
                                    <td className="p-4">
                                        <div className="font-semibold">{u.name}</div>
                                        <div className="text-xs text-slate-500">{u.companyName}</div>
                                    </td>
                                    <td className="p-4 text-slate-300">{u.email}</td>
                                    <td className="p-4 text-slate-300 text-sm">
                                        {u.paidUntil ? new Date(u.paidUntil).toLocaleDateString('pt-BR') : '-'}
                                    </td>
                                    <td className="p-4">
                                        <select
                                            value={u.subscriptionPlan || 'FREE'}
                                            onChange={(e) => updatePlan(u.id, e.target.value)}
                                            className="bg-slate-700 text-white text-xs p-1 rounded border border-slate-600 outline-none"
                                        >
                                            <option value="FREE">Gratuito</option>
                                            <option value="AUTO">Kalq Auto</option>
                                            <option value="PRO">Kalq Pro</option>
                                        </select>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${u.isPaid ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                            {u.isPaid ? 'ATIVO' : 'BLOQUEADO'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => togglePayment(u.id)}
                                            className={`text-xs font-bold px-3 py-1 rounded ${u.isPaid ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                                        >
                                            {u.isPaid ? 'Revogar Acesso' : 'Liberar Acesso'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Admin;
