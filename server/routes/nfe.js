const express = require('express');
const router = express.Router();
const multer = require('multer');
const { NfCompany, NfCertificate, Invoice } = require('../models');
const NfeEngine = require('../services/nfeEngine');
const authMiddleware = require('../middleware/auth'); // Supondo que existe

// Configuração do multer para o upload do certificado A1 (.pfx) em memória
const upload = multer({ storage: multer.memoryStorage() });

/**
 * 1. Configurar Empresa e Certificado
 * Rota para salvar os dados fiscais da empresa e armazenar o certificado A1
 */
router.post('/config', authMiddleware, upload.single('certificate'), async (req, res) => {
    try {
        const { razaoSocial, cnpj, ie, crt, password, endereco } = req.body;
        const userId = req.user.id;

        // Tenta encontrar uma configuração existente ou cria uma nova
        let company = await NfCompany.findOne({ where: { userId } });
        
        if (!company) {
            company = await NfCompany.create({
                userId,
                razaoSocial,
                cnpj,
                ie,
                crt,
                endereco
            });
        } else {
            await company.update({ razaoSocial, cnpj, ie, crt, endereco });
        }

        // Se enviou um novo arquivo de certificado
        if (req.file) {
            let cert = await NfCertificate.findOne({ where: { companyId: company.id } });
            
            if (!cert) {
                await NfCertificate.create({
                    companyId: company.id,
                    password: password,
                    pfxBuffer: req.file.buffer, // Buffer do .pfx
                    expirationDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)) // Fake exp date for now
                });
            } else {
                await cert.update({
                    password: password || cert.password,
                    pfxBuffer: req.file.buffer
                });
            }
        }

        res.json({ message: 'Configurações fiscais atualizadas com sucesso.', companyId: company.id });

    } catch (error) {
        console.error('Erro na config da NFe:', error);
        res.status(500).json({ error: 'Erro ao salvar configurações fiscais.' });
    }
});

/**
 * 2. Rota de Emissão de Nota (NFC-e ou NF-e)
 * Disparada pelo front-end quando uma venda é finalizada
 */
router.post('/emit', authMiddleware, async (req, res) => {
    try {
        const { saleData, transactionId } = req.body;
        const userId = req.user.id;

        // 1. Carregar Empresa e Certificado
        const company = await NfCompany.findOne({ where: { userId } });
        if (!company) {
            return res.status(400).json({ error: 'Empresa não configurada para emissão de nota.' });
        }

        const certificate = await NfCertificate.findOne({ where: { companyId: company.id } });
        if (!certificate) {
            return res.status(400).json({ error: 'Certificado digital não encontrado.' });
        }

        // 2. Inicializar o Motor
        const engine = new NfeEngine(company, certificate);
        await engine.init();

        // 3. Emitir a Nota (NFCe por padrão no nosso exemplo)
        const result = await engine.emitirNFCe(saleData);

        // 4. Salvar histórico da Invoice no Banco
        const invoice = await Invoice.create({
            userId,
            companyId: company.id,
            transactionId: transactionId || null,
            amount: saleData.totalValue,
            model: 65, // NFC-e
            status: result.success ? 'autorizada' : 'rejeitada',
            accessKey: result.accessKey,
            receipt: result.receipt,
            xml: result.xml,
            message: result.message
        });

        if (result.success) {
            res.json({ message: 'Nota emitida com sucesso!', invoice });
        } else {
            res.status(400).json({ error: 'Rejeição da SEFAZ', details: result.message, invoice });
        }

    } catch (error) {
        console.error('Erro geral ao emitir NFe:', error);
        res.status(500).json({ error: 'Erro interno ao processar a emissão.' });
    }
});

/**
 * 3. Listar Notas Emitidas
 */
router.get('/list', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const invoices = await Invoice.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']]
        });
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar notas.' });
    }
});

module.exports = router;
