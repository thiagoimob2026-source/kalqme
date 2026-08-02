const { NFe } = require('@brasil-fiscal/nfe');
const { Certificado } = require('@brasil-fiscal/core');

class NfeEngine {
    constructor(company, certificate) {
        this.company = company;
        this.certificate = certificate;
        this.nfeClient = null;
    }

    /**
     * Inicializa o cliente NFe com o certificado A1 da empresa
     */
    async init() {
        try {
            // Inicializa o certificado usando a biblioteca @brasil-fiscal/core
            // O pfxBuffer pode vir do banco de dados (BLOB)
            const cert = new Certificado({
                pfx: this.certificate.pfxBuffer,
                password: this.certificate.password
            });

            // Inicializa o cliente da SEFAZ
            this.nfeClient = new NFe({
                certificado: cert,
                ambiente: 2, // 1 - Produção, 2 - Homologação
                uf: this.company.endereco ? JSON.parse(this.company.endereco).uf : 'SP' // UF Padrão
            });

            return true;
        } catch (error) {
            console.error('Erro ao inicializar o motor NFe:', error);
            throw new Error('Falha ao carregar o certificado digital.');
        }
    }

    /**
     * Gera o XML, assina e envia para a SEFAZ
     * @param {Object} saleData - Dados da venda
     */
    async emitirNFCe(saleData) {
        if (!this.nfeClient) {
            await this.init();
        }

        try {
            // Monta o objeto (layout) da NFe/NFCe de acordo com a biblioteca
            const nfeLayout = this._buildNfceLayout(saleData);

            // Envia o lote para a SEFAZ
            const result = await this.nfeClient.emitir(nfeLayout);

            return {
                success: result.sucesso,
                accessKey: result.chaveAcesso,
                receipt: result.recibo,
                xml: result.xml,
                message: result.mensagem
            };

        } catch (error) {
            console.error('Erro ao emitir NFCe:', error);
            return {
                success: false,
                message: error.message || 'Erro de comunicação com a SEFAZ.'
            };
        }
    }

    /**
     * Constrói o layout interno esperado pela biblioteca
     * @param {Object} data - Dados formatados
     */
    _buildNfceLayout(data) {
        // Exemplo simplificado do schema de emissão
        return {
            ide: {
                cUF: 35, // SP (Exemplo)
                natOp: 'Venda de mercadoria',
                mod: '65', // 65 para NFC-e, 55 para NF-e
                serie: '1',
                nNF: '1',
                dhEmi: new Date().toISOString(),
                tpNF: '1', // Saída
                idDest: '1', // Operação interna
                cMunFG: '3550308', // SP
                tpImp: '4', // DANFE NFC-e
                tpEmis: '1', // Normal
                tpAmb: '2', // Homologação
                finNFe: '1', // Normal
                indFinal: '1', // Consumidor final
                indPres: '1', // Operação presencial
            },
            emit: {
                CNPJ: this.company.cnpj.replace(/\D/g, ''),
                xNome: this.company.razaoSocial,
                enderEmit: { /* ... */ },
                IE: this.company.ie,
                CRT: this.company.crt.toString()
            },
            dest: data.customerCpf ? {
                CPF: data.customerCpf.replace(/\D/g, ''),
                xNome: data.customerName
            } : null, // NFCe permite destinatário anônimo
            det: data.items.map((item, index) => ({
                nItem: (index + 1).toString(),
                prod: {
                    cProd: item.id.toString(),
                    cEAN: 'SEM GTIN',
                    xProd: item.name,
                    NCM: item.ncm || '00000000', // Código NCM obrigatório
                    CFOP: '5102',
                    uCom: 'UN',
                    qCom: item.quantity.toString(),
                    vUnCom: item.price.toString(),
                    vProd: (item.price * item.quantity).toString(),
                    cEANTrib: 'SEM GTIN',
                    uTrib: 'UN',
                    qTrib: item.quantity.toString(),
                    vUnTrib: item.price.toString(),
                    indTot: '1'
                },
                imposto: {
                    // Estrutura de imposto depende do CRT e NCM
                    // Exemplo Simples Nacional (CSOSN 102)
                    ICMS: {
                        ICMSSN102: {
                            orig: '0',
                            CSOSN: '102'
                        }
                    }
                }
            })),
            total: {
                ICMSTot: {
                    vBC: '0.00',
                    vICMS: '0.00',
                    vICMSDeson: '0.00',
                    vFCP: '0.00',
                    vBCST: '0.00',
                    vST: '0.00',
                    vFCPST: '0.00',
                    vFCPSTRet: '0.00',
                    vProd: data.totalValue.toString(),
                    vFrete: '0.00',
                    vSeg: '0.00',
                    vDesc: '0.00',
                    vII: '0.00',
                    vIPI: '0.00',
                    vIPIDevol: '0.00',
                    vPIS: '0.00',
                    vCOFINS: '0.00',
                    vOutro: '0.00',
                    vNF: data.totalValue.toString()
                }
            },
            pag: {
                detPag: [{
                    tPag: '01', // Dinheiro
                    vPag: data.totalValue.toString()
                }]
            }
        };
    }
}

module.exports = NfeEngine;
