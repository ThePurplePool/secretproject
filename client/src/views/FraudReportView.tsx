import React, { useState } from 'react';
import { AlertTriangle, Send, CheckCircle, ShieldCheck, Phone, MessageSquare, Link2, CreditCard, Image as ImageIcon } from 'lucide-react';
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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 font-sans text-[#191A1C]">
      {/* Header */}
      <div className="border-b border-[#D8D2C5] pb-6 space-y-2">
        <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-[#7A1F2B] font-semibold">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Служба сбора инцидентов и разведки угроз</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#191A1C] tracking-tight">
          Сообщить о мошенничестве
        </h1>
        <p className="text-xs sm:text-sm text-[#5C5854] max-w-xl leading-relaxed">
          Столкнулись с подозрительным звонком, ботом, сайтом или номером карты? Передайте данные для корреляции и выявления связанных мошеннических сетей (Scam Clusters).
        </p>
      </div>

      {!submittedData ? (
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-lg bg-[#FAF8F5] border border-[#D8D2C5] space-y-6 shadow-sm">
          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-[#191A1C] uppercase tracking-wider block">
              Тип мошеннической схемы
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded bg-white border border-[#D8D2C5] text-[#191A1C] text-xs focus:border-[#7A1F2B] focus:outline-none"
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
              <label className="text-xs font-medium text-[#5C5854] flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#191A1C]" />
                <span>Номер телефона мошенника</span>
              </label>
              <input
                type="text"
                placeholder="+998 90 123-45-67"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3.5 py-2 rounded bg-white border border-[#D8D2C5] text-[#191A1C] text-xs font-mono focus:border-[#7A1F2B] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#5C5854] flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#191A1C]" />
                <span>Telegram username или бот</span>
              </label>
              <input
                type="text"
                placeholder="@scam_bot_official"
                value={telegramHandle}
                onChange={(e) => setTelegramHandle(e.target.value)}
                className="w-full px-3.5 py-2 rounded bg-white border border-[#D8D2C5] text-[#191A1C] text-xs font-mono focus:border-[#7A1F2B] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#5C5854] flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-[#191A1C]" />
                <span>Ссылка или адрес сайта (URL)</span>
              </label>
              <input
                type="text"
                placeholder="https://fake-bank-pay.xyz"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3.5 py-2 rounded bg-white border border-[#D8D2C5] text-[#191A1C] text-xs font-mono focus:border-[#7A1F2B] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#5C5854] flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-[#191A1C]" />
                <span>Номер карты или кошелька для перевода</span>
              </label>
              <input
                type="text"
                placeholder="8600 •••• •••• 9912"
                value={paymentRequisites}
                onChange={(e) => setPaymentRequisites(e.target.value)}
                className="w-full px-3.5 py-2 rounded bg-white border border-[#D8D2C5] text-[#191A1C] text-xs font-mono focus:border-[#7A1F2B] focus:outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#5C5854] block">
              Подробное описание инцидента или звонка *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Опишите, кем представился злоумышленник, что требовал, какие угрозы или обещания использовал..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded bg-white border border-[#D8D2C5] text-[#191A1C] text-xs focus:border-[#7A1F2B] focus:outline-none leading-relaxed"
            />
          </div>

          {/* Screenshot link */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#5C5854] flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-[#8A8580]" />
              <span>Ссылка на скриншот (необязательно)</span>
            </label>
            <input
              type="text"
              placeholder="https://... или имя прикреплённого файла"
              value={screenshotUrl}
              onChange={(e) => setScreenshotUrl(e.target.value)}
              className="w-full px-3.5 py-2 rounded bg-white border border-[#D8D2C5] text-[#191A1C] text-xs focus:border-[#7A1F2B] focus:outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded font-mono font-bold text-xs uppercase tracking-wider bg-[#7A1F2B] hover:bg-[#621822] text-white shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Отправка отчёта...' : 'ОТПРАВИТЬ СООБЩЕНИЕ В СЛУЖБУ РАЗВЕДКИ'}</span>
            </button>
          </div>
        </form>
      ) : (
        /* Confirmation screen per Section 15 */
        <div className="p-8 rounded-lg bg-[#FAF8F5] border border-[#D8D2C5] space-y-6 text-center shadow-sm">
          <div className="w-14 h-14 rounded-full bg-[#E7E1D6] text-[#465447] flex items-center justify-center mx-auto">
            <CheckCircle className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-[#191A1C] tracking-tight">
              {submittedData.message}
            </h3>
            <p className="text-xs text-[#5C5854] max-w-md mx-auto">
              Номер вашего обращения: <span className="font-mono text-[#7A1F2B] font-bold">{submittedData.report.reportId}</span>
            </p>
          </div>

          {/* Intelligence Cluster preview if correlated */}
          {submittedData.cluster && (
            <div className="p-4 rounded bg-[#E7E1D6] border border-[#D8D2C5] text-left space-y-2 max-w-lg mx-auto font-mono text-xs">
              <div className="flex items-center gap-2 text-[#7A1F2B] font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-[#7A1F2B]" />
                <span>Автоматическая корреляция (Scam Cluster)</span>
              </div>
              <p className="text-[#191A1C]">
                Индикаторы совпали с известной группой: <strong>{submittedData.cluster.clusterCode}</strong> ({submittedData.cluster.title}).
              </p>
              <p className="text-[#5C5854] text-[11px]">
                Сводка кластера: {submittedData.cluster.indicatorsSummary}
              </p>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={handleReset}
              className="px-6 py-2.5 rounded font-mono text-xs font-semibold bg-[#191A1C] hover:bg-[#7A1F2B] text-white transition-colors cursor-pointer"
            >
              Отправить ещё одно сообщение
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
