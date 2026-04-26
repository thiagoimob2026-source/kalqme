import React from 'react';

const SummaryCard = ({ title, value, color, icon }) => {
    return (
        <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm flex flex-col h-full transform transition-all hover:-translate-y-1 hover:shadow-md group">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 group-hover:text-gray-500 transition-colors">{title}</h3>
                {icon && (
                    <div className={`p-2 rounded-lg bg-gray-50 group-hover:bg-opacity-80 transition-all ${color.replace('text-', 'bg-').replace('600', '100').replace('700', '100')}`}>
                        {icon}
                    </div>
                )}
            </div>
            <p className={`text-3xl font-black tracking-tight ${color}`}>{value}</p>
        </div>
    );
};

export default SummaryCard;
