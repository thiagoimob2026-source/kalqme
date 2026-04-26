import React, { useState, useEffect } from 'react';
import { API_URL } from '../utils/api';

const ClassificationDialog = ({ isOpen, onClose, onSave, transaction, userTaxType, categories = [], onCategoryCreated }) => {
    const [type, setType] = useState('Despesa');
    const [category, setCategory] = useState('');
    const [subCategory, setSubCategory] = useState('');
    const [isDeductible, setIsDeductible] = useState(false);
    const [customerId, setCustomerId] = useState('');

    // New Category State
    const [isCreating, setIsCreating] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    // New Customer State
    const [customers, setCustomers] = useState([]);
    const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
    const [newCustomerName, setNewCustomerName] = useState('');
    const [newCustomerPhone, setNewCustomerPhone] = useState('');

    const fetchCustomers = async () => {
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
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchCustomers();
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && transaction) {
            // Reset or pre-fill if editing
            const isRevenue = parseFloat(transaction.TRANSACTION_NET_AMOUNT.replace(/\./g, '').replace(',', '.')) > 0;
            setType(isRevenue ? 'Receita' : 'Despesa');
            setCategory('');
            setSubCategory('');
            setIsDeductible(false);
            setIsCreating(false);
            setNewCategoryName('');
            setCustomerId('');
            setIsCreatingCustomer(false);
            setNewCustomerName('');
            setNewCustomerPhone('');
        }
    }, [isOpen, transaction]);

    if (!isOpen) return null;

    const isMEI = userTaxType === 'MEI';

    const handleSaveNewCustomer = async () => {
        if (!newCustomerName.trim()) {
            alert("O nome do cliente é obrigatório.");
            return;
        }
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/api/customers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: newCustomerName,
                    phone: newCustomerPhone
                })
            });
            if (response.ok) {
                const newCust = await response.json();
                setCustomers([...customers, newCust]);
                setCustomerId(newCust.id);
                setIsCreatingCustomer(false);
                setNewCustomerName('');
                setNewCustomerPhone('');
            } else {
                const errorData = await response.json();
                alert(`Erro ao salvar o cliente: ${errorData.error || 'Erro desconhecido'}`);
            }
        } catch (err) {
            console.error(err);
            alert("Erro de conexão ao salvar cliente.");
        }
    };

    const handleSaveNewCategory = async () => {
        if (!newCategoryName.trim()) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/categories`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: newCategoryName,
                    type: type,
                    isDeductible: isMEI ? false : isDeductible // Use current checkbox state as default for new cat
                })
            });

            if (response.ok) {
                const newCat = await response.json();
                await onCategoryCreated(); // Refresh parent list
                setCategory(newCat.name); // Select it
                setIsCreating(false);
            } else {
                alert('Erro ao criar categoria.');
            }
        } catch (error) {
            console.error(error);
            alert('Erro ao criar categoria.');
        }
    };

    const handleSave = () => {
        if (isCreating || isCreatingCustomer) {
            alert("Salve a nova categoria/cliente antes de confirmar a classificação.");
            return;
        }
        onSave({
            ...transaction,
            classification: {
                type,
                category,
                subCategory,
                isDeductible: isMEI ? false : isDeductible,
                customerId: customerId || null
            }
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
            <div className="bg-white p-5 rounded-lg shadow-xl w-96">
                <h3 className="text-lg font-bold mb-4">Classificar Transação</h3>

                <p className="mb-2 text-sm text-gray-600">
                    <strong>Descrição:</strong> {transaction.TRANSACTION_TYPE} <br />
                    <strong>Valor:</strong> {transaction.TRANSACTION_NET_AMOUNT}
                </p>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Tipo</label>
                    <div className="flex gap-4">
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                className="form-radio"
                                name="type"
                                value="Receita"
                                checked={type === 'Receita'}
                                onChange={() => setType('Receita')}
                            />
                            <span className="ml-2">Receita</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                className="form-radio"
                                name="type"
                                value="Despesa"
                                checked={type === 'Despesa'}
                                onChange={() => setType('Despesa')}
                            />
                            <span className="ml-2">Despesa</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                className="form-radio"
                                name="type"
                                value="Investimento"
                                checked={type === 'Investimento'}
                                onChange={() => setType('Investimento')}
                            />
                            <span className="ml-2">Investimento</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                className="form-radio"
                                name="type"
                                value="Pessoal"
                                checked={type === 'Pessoal'}
                                onChange={() => setType('Pessoal')}
                            />
                            <span className="ml-2 text-orange-600 font-bold">Pessoal</span>
                        </label>
                    </div>
                </div>

                {(type === 'Investimento') ? (
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Operação</label>
                        <div className="flex gap-4">
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    className="form-radio"
                                    name="subCategory"
                                    value="Aplicação"
                                    checked={subCategory === 'Aplicação'}
                                    onChange={() => setSubCategory('Aplicação')}
                                />
                                <span className="ml-2">Aplicação (Saída)</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    className="form-radio"
                                    name="subCategory"
                                    value="Resgate"
                                    checked={subCategory === 'Resgate'}
                                    onChange={() => setSubCategory('Resgate')}
                                />
                                <span className="ml-2">Resgate (Entrada)</span>
                            </label>
                        </div>
                    </div>
                ) : (
                    <>
                        {type === 'Pessoal' && (
                            <div className="mb-4 p-3 bg-orange-50 border-l-4 border-orange-500 text-orange-700 text-xs">
                                <strong>⚠️ Alerta de Mistura Patrimonial:</strong> Gastos pessoais lançados na conta do negócio prejudicam a análise de lucro e podem gerar riscos fiscais. Recomendamos não utilizar a conta da empresa para finalidades pessoais.
                            </div>
                        )}
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Categoria</label>

                            {!isCreating ? (
                                <div className="flex gap-2">
                                    <select
                                        className="w-full border rounded p-2"
                                        value={category}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === 'NEW') {
                                                setIsCreating(true);
                                                setCategory('');
                                            } else {
                                                setCategory(val);
                                                // Auto-set deductible status
                                                if (type === 'Despesa' && !isMEI) {
                                                    const catObj = categories.find(c => c.name === val);
                                                    if (catObj) setIsDeductible(catObj.isDeductible);
                                                }
                                            }
                                        }}
                                    >
                                        <option value="">Selecione...</option>
                                        {categories
                                            .filter(c => c.type === type)
                                            .map(c => (
                                                <option key={c.id} value={c.name}>{c.name}</option>
                                            ))
                                        }
                                        <option value="NEW" className="font-bold text-blue-600">+ Nova Categoria...</option>
                                    </select>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        className="w-full border rounded p-2"
                                        placeholder="Nome da categoria..."
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        autoFocus
                                    />
                                    <button
                                        onClick={handleSaveNewCategory}
                                        className="bg-green-500 text-white px-3 rounded hover:bg-green-600"
                                        title="Salvar Categoria"
                                    >
                                        ✓
                                    </button>
                                    <button
                                        onClick={() => setIsCreating(false)}
                                        className="bg-gray-300 text-gray-700 px-3 rounded hover:bg-gray-400"
                                        title="Cancelar"
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Sub-categoria / Detalhe</label>
                            <input
                                type="text"
                                className="w-full border rounded p-2"
                                value={subCategory}
                                onChange={(e) => setSubCategory(e.target.value)}
                                placeholder=" Cliente X, Fornecedor Y..."
                            />
                        </div>
                    </>
                )}

                {/* Show Deductible option ONLY for Autonomo when Type is Despesa */}
                {type === 'Despesa' && !isMEI && (
                    <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                className="form-checkbox h-4 w-4 text-green-600"
                                checked={isDeductible}
                                onChange={(e) => setIsDeductible(e.target.checked)}
                            />
                            <span className="ml-2 text-sm text-gray-700">Dedutível do Carnê Leão?</span>
                        </label>
                        {isCreating && <p className="text-xs text-blue-600 mt-1">* A configuração acima será o padrão para esta nova categoria.</p>}

                        {!isCreating && (
                            <div className="mt-1 text-xs text-gray-500">
                                <a href="https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda/pagamento/carne-leao/deducoes" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline ml-1">
                                    Ver regras de dedução (Gov.br)
                                </a>
                            </div>
                        )}
                    </div>
                )}

                {/* MEI Indication */}
                {type === 'Despesa' && isMEI && (
                    <p className="text-xs text-gray-500 italic mb-4">
                        Nota: MEI não deduz despesas no relatório anual (DASN).
                    </p>
                )}

                {type === 'Receita' && (
                    <div className="mb-4 mt-4 border-t pt-4">
                        <label className="block text-blue-700 text-sm font-bold mb-2 flex items-center gap-2">
                            👤 Cliente / Paciente
                        </label>

                        {!isCreatingCustomer ? (
                            <select
                                className="w-full border rounded p-2 text-sm bg-blue-50 focus:ring-2 focus:ring-blue-400 outline-none"
                                value={customerId}
                                onChange={(e) => {
                                    if (e.target.value === 'NEW_CUSTOMER') setIsCreatingCustomer(true);
                                    else setCustomerId(e.target.value);
                                }}
                            >
                                <option value="">Venda não identificada</option>
                                {customers.map(c => (
                                    <option key={c.id} value={c.id}>{c.name} {c.phone ? ` - ${c.phone}` : ''}</option>
                                ))}
                                <option value="NEW_CUSTOMER" className="font-bold text-blue-600">+ Cadastrar Novo Cliente...</option>
                            </select>
                        ) : (
                            <div className="space-y-2 bg-blue-50 p-2 rounded border border-blue-200">
                                <input
                                    type="text"
                                    className="w-full border rounded p-2 text-sm"
                                    placeholder="Nome completo..."
                                    value={newCustomerName}
                                    onChange={(e) => setNewCustomerName(e.target.value)}
                                    autoFocus
                                />
                                <input
                                    type="text"
                                    className="w-full border rounded p-2 text-sm"
                                    placeholder="WhatsApp (ex: 11999999999)"
                                    value={newCustomerPhone}
                                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSaveNewCustomer}
                                        className="flex-1 bg-blue-500 text-white py-1 rounded hover:bg-blue-600 text-sm font-bold"
                                    >
                                        ✓ Salvar e Selecionar
                                    </button>
                                    <button
                                        onClick={() => setIsCreatingCustomer(false)}
                                        className="px-3 bg-gray-300 text-gray-700 py-1 rounded hover:bg-gray-400 text-sm font-bold"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        )}
                        <p className="text-[10px] text-gray-400 mt-1 italic">* Use para gerar Informe de Rendimentos e alertas de retorno.</p>
                    </div>
                )}

                <div className="flex justify-end gap-2 mt-6">
                    <button
                        onClick={onClose}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isCreating || isCreatingCustomer}
                        className={`font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-all ${(isCreating || isCreatingCustomer)
                            ? 'bg-blue-300 cursor-not-allowed text-white opacity-60'
                            : 'bg-blue-500 hover:bg-blue-700 text-white shadow-md'
                            }`}
                    >
                        {(isCreating || isCreatingCustomer) ? 'Salve primeiro...' : 'Confirmar Tudo'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClassificationDialog;
