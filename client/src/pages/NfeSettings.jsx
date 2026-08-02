import React, { useState } from 'react';

const NfeSettings = () => {
  const [formData, setFormData] = useState({
    razaoSocial: '',
    cnpj: '',
    ie: '',
    crt: '1', // 1 - Simples Nacional por padrão
    password: '',
    endereco: { logradouro: '', numero: '', bairro: '', municipio: '', uf: '', cep: '' }
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('endereco.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({ ...prev, endereco: { ...prev.endereco, [field]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const submitData = new FormData();
    submitData.append('razaoSocial', formData.razaoSocial);
    submitData.append('cnpj', formData.cnpj);
    submitData.append('ie', formData.ie);
    submitData.append('crt', formData.crt);
    submitData.append('password', formData.password);
    submitData.append('endereco', JSON.stringify(formData.endereco));
    
    if (file) {
      submitData.append('certificate', file);
    }

    try {
      const token = localStorage.getItem('token');
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3005';
      const response = await fetch(`${apiBaseUrl}/api/nfe/config`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Configurações fiscais salvas com sucesso!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao salvar.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro de conexão com o servidor.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Configurações Fiscais (NF-e/NFC-e)</h1>
      
      {message.text && (
        <div className={`p-4 mb-6 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Razão Social</label>
              <input type="text" name="razaoSocial" required value={formData.razaoSocial} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
              <input type="text" name="cnpj" required value={formData.cnpj} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Inscrição Estadual (IE)</label>
              <input type="text" name="ie" value={formData.ie} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Regime Tributário (CRT)</label>
              <select name="crt" value={formData.crt} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                <option value="1">1 - Simples Nacional</option>
                <option value="2">2 - Simples Nacional (Excesso de Sublimite)</option>
                <option value="3">3 - Regime Normal (Lucro Presumido/Real)</option>
              </select>
            </div>
          </div>

          <hr className="my-6" />
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Endereço da Empresa</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Logradouro</label>
              <input type="text" name="endereco.logradouro" value={formData.endereco.logradouro} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
              <input type="text" name="endereco.numero" value={formData.endereco.numero} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
              <input type="text" name="endereco.bairro" value={formData.endereco.bairro} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
              <input type="text" name="endereco.cep" value={formData.endereco.cep} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Município</label>
                <input type="text" name="endereco.municipio" value={formData.endereco.municipio} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">UF</label>
                <input type="text" name="endereco.uf" maxLength="2" value={formData.endereco.uf} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
              </div>
            </div>
          </div>

          <hr className="my-6" />
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Certificado Digital A1 (.pfx)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Arquivo do Certificado (.pfx)</label>
              <input type="file" accept=".pfx,.p12" onChange={handleFileChange} className="w-full p-2 border border-gray-300 rounded-md focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha do Certificado</label>
              <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button type="submit" disabled={loading} className={`px-6 py-3 rounded-md text-white font-medium ${loading ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors`}>
              {loading ? 'Salvando...' : 'Salvar Configurações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NfeSettings;
