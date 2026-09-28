import React, { useState } from 'react';
import { AlertTriangle, Send, CheckCircle, ShieldCheck, Link2, Phone, MessageSquare, CreditCard, Image as ImageIcon } from 'lucide-react';
import { api } from '../services/api';
import { FraudReport, ScamCluster } from '../types';

export const FraudReportView: React.FC = () => {
  const [category, setCategory] = useState('phishing');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [telegramHandle, setTelegramHandle] = useState('');
  const [whatsappHandle, setWhatsappHandle] = useState('');
  const [url, setUrl] = useState('');
  const [paymentRequisites, setPaymentRequisites] = useState('');
  const [description, setDescription] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    report: FraudReport;
    cluster?: ScamCluster;
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Пожалуйста, опишите произошедшее');
      return;
    }

    setLoading(true);
    try {
      const res = await api.submitReport({
        category,
        phoneNumber: phoneNumber || undefined,
        telegramHandle: telegramHandle || undefined,
        whatsappHandle: whatsappHandle || undefined,
        url: url || undefined,
        paymentRequisites: paymentRequisites || undefined,
        description,
        screenshotUrl: screenshotUrl || undefined,
      });

      setSubmittedData(res);
      setLoading(false);
    } catch (err: any) {
      alert('Ошибка при отправке: ' + err.message);
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPhoneNumber('');
    setTelegramHandle('');
    setWhatsappHandle('');
    setUrl('');
    setPaymentRequisites('');
    setDescription('');
    setScreenshotUrl('');
    setSubmittedData(null);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950 border border-rose-800 text-rose-300 text-xs font-bold uppercase tracking-wider">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Система сбора инцидентов и разведки угроз</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Сообщить о мошенничестве
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Столкнулись с подозрительным звонком, ботом, сайтом или номером карты? Передайте данные для корреляции и выявления связанных мошеннических сетей (Scam Clusters).
        </p>
      </div>

      {!submittedData ? (
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
          {/* Category */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Тип мошеннической схемы
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-cyan-500 focus:outline-none"
            >
              <option value="phishing">Фишинг (поддельный сайт / личный кабинет)</option>
              <option value="fake_bank">Звонок / сообщение от имени банка</option>
              <option value="malware">Вредоносный файл / приложение (.apk)</option>
              <option value="fake_police">Звонок от имени МВД / силовых структур</option>
              <option value="investment_scam">Фейковые инвестиции / псевдоброкер</option>
              <option value="delivery_scam">Поддельная доставка / посылка</option>
              <option value="hacked_account">Взлом аккаунта знакомого / просьба займа</option>
              <option value="job_scam">Фейковое трудоустройство / залог за работу</option>
            </select>
          </div>

          {/* Indicators grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-cyan-400" />
                <span>Номер телефона мошенника</span>
              </label>
              <input
                type="text"
                placeholder="+998 90 123-45-67"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                <span>Telegram username или бот</span>
              </label>
              <input
                type="text"
                placeholder="@scam_bot_official"
                value={telegramHandle}
                onChange={(e) => setTelegramHandle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Ссылка или адрес сайта (URL)</span>
              </label>
              <input
                type="text"
                placeholder="https://fake-bank-pay.xyz"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                <span>Номер карты или кошелька для перевода</span>
              </label>
              <input
                type="text"
                placeholder="8600 •••• •••• 9912"
                value={paymentRequisites}
                onChange={(e) => setPaymentRequisites(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 block">
              Подробное описание инцидента или звонка *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Опишите, кем представился злоумышленник, что требовал, какие угрозы или обещания использовал..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-cyan-500 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Screenshot link */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
              <span>Ссылка на скриншот (необязательно)</span>
            </label>
            <input
              type="text"
              placeholder="https://... или имя прикреплённого файла"
              value={screenshotUrl}
              onChange={(e) => setScreenshotUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-sm bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-lg shadow-rose-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Отправка отчёта...' : 'ОТПРАВИТЬ СООБЩЕНИЕ О МОШЕННИЧЕСТВЕ'}</span>
            </button>
          </div>
        </form>
      ) : (
        /* Confirmation screen per Section 15 */
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 text-center animate-fadeIn shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white tracking-tight">
              {submittedData.message}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Номер вашего обращения: <span className="font-mono text-cyan-400">{submittedData.report.reportId}</span>
            </p>
          </div>

          {/* Intelligence Cluster preview if correlated */}
          {submittedData.cluster && (
            <div className="p-4 rounded-2xl bg-indigo-950/50 border border-indigo-800 text-left space-y-2 max-w-lg mx-auto">
              <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>Автоматическая корреляция (Scam Cluster)</span>
              </div>
              <p className="text-xs text-slate-200">
                Индикаторы совпали с кластером: <strong className="text-cyan-300">{submittedData.cluster.clusterCode}</strong> ({submittedData.cluster.title}).
              </p>
              <p className="text-[11px] text-slate-400">
                Сводка кластера: {submittedData.cluster.indicatorsSummary}
              </p>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={handleReset}
              className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
            >
              Отправить ещё одно сообщение
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
