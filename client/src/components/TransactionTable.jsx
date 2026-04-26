import React from 'react';

const TransactionTable = ({ transactions, onClassify, onDelete }) => {
    return (
        <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
            <table className="w-full text-sm text-left text-gray-600">
                <thead className="text-xs text-gray-400 uppercase tracking-wider bg-gray-50/80 border-b border-gray-100">
                    <tr>
                        <th className="px-6 py-3">Data</th>
                        <th className="px-6 py-3">Descrição</th>
                        <th className="px-6 py-3">Documento</th>
                        <th className="px-6 py-3">Valor</th>
                        <th className="px-6 py-3">Classificação</th>
                        <th className="px-6 py-3">Ação</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((tx) => (
                        <tr key={tx.id} className="bg-white border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4 font-medium text-gray-700">{tx.RELEASE_DATE}</td>
                            <td className="px-6 py-4">{tx.TRANSACTION_TYPE}</td>
                            <td className="px-6 py-4 text-gray-400">{tx.REFERENCE_ID}</td>
                            <td className={`px-6 py-4 font-bold ${parseFloat(tx.TRANSACTION_NET_AMOUNT.replace(/\./g, '').replace(',', '.')) < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                {tx.TRANSACTION_NET_AMOUNT}
                            </td>
                            <td className="px-6 py-4">
                                {tx.classification ? (
                                    <div className="flex flex-col gap-1">
                                        <span className={`text-xs font-medium mr-2 px-2.5 py-0.5 rounded ${tx.classification.type === 'Investimento' ? 'bg-purple-100 text-purple-800' :
                                            tx.classification.type === 'Receita' ? 'bg-green-100 text-green-800' :
                                                tx.classification.type === 'Pessoal' ? 'bg-orange-100 text-orange-800' :
                                                    'bg-red-100 text-red-800'
                                            }`}>
                                            {tx.classification.type === 'Investimento'
                                                ? `Investimento - ${tx.classification.subCategory}`
                                                : tx.classification.type === 'Pessoal'
                                                    ? `Pessoal ${tx.classification.category ? `- ${tx.classification.category}` : ''}`
                                                    : `${tx.classification.category} - ${tx.classification.subCategory}`
                                            }
                                            {tx.classification.isDeductible && " (Dedutível)"}
                                        </span>
                                        {tx.Customer && (
                                            <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 rounded w-fit">
                                                👤 {tx.Customer.name}
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <span className="text-gray-400 italic">Pendente</span>
                                )}
                            </td>
                            <td className="px-6 py-4">
                                <button
                                    onClick={() => onClassify(tx)}
                                    className="font-bold text-[#D97757] hover:text-[#C56142] hover:underline mr-4 transition-colors"
                                >
                                    Classificar
                                </button>
                                <button
                                    onClick={() => onDelete(tx.id)}
                                    className="font-bold text-red-400 hover:text-red-600 hover:underline transition-colors"
                                >
                                    Excluir
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TransactionTable;
