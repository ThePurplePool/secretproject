import React from 'react';
import {
  FileText,
  MoreVertical,
  Phone,
  CheckCheck,
  Paperclip,
  Smile,
  Mic,
  ChevronLeft,
  Wifi,
  Signal,
  Battery,
  Shield,
  Download,
} from 'lucide-react';
import { Scenario } from '../../types';

interface TelegramInterfaceProps {
  scenario: Scenario;
  onSelectAction: (actionId: string) => void;
}

export const TelegramInterface: React.FC<TelegramInterfaceProps> = ({ scenario, onSelectAction }) => {
  const { sender, content, availableActions } = scenario;

  const handleAttachmentClick = () => {
    const openAction = availableActions.find(
      (a) => a.id === 'open_file' || a.id.includes('download') || a.id.includes('open')
    );
    if (openAction) {
      onSelectAction(openAction.id);
    }
  };

  // Helper to split text if needed or render realistic chat progression
  const isDefaultBankScenario = scenario.id === 'fake-bank-telegram-001' || sender.name.toLowerCase().includes('банк');

  return (
    <div className="w-full max-w-sm mx-auto bg-[#182533] rounded-[22px] sm:rounded-[28px] border-2 sm:border-4 border-[#2b394a] shadow-xl overflow-hidden flex flex-col font-sans select-none text-white">
      {/* 1. Smartphone Status Bar */}
      <div className="bg-[#17212b] px-5 pt-3 pb-2 flex items-center justify-between text-xs font-semibold text-white/90">
        <span className="font-mono text-[13px] tracking-tight">9:41</span>
        <div className="flex items-center gap-1.5 text-white/90">
          <Signal className="w-3.5 h-3.5 fill-current" />
          <Wifi className="w-3.5 h-3.5" />
          <Battery className="w-4 h-4 fill-current" />
        </div>
      </div>

      {/* 2. Messenger Header */}
      <div className="bg-[#17212b] px-3 py-2.5 flex items-center justify-between border-b border-[#0e1621]">
        <div className="flex items-center gap-2.5">
          <button className="text-[#64b5f6] hover:text-white transition-colors cursor-pointer p-0.5">
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-[#2481cc] flex items-center justify-center text-white font-bold text-sm shadow-inner">
              <Shield className="w-5 h-5" />
            </div>
            {sender.verified !== false && (
              <span className="absolute -bottom-0.5 -right-0.5 bg-[#2481cc] text-white rounded-full p-0.5 border border-[#17212b]">
                <CheckCheck className="w-2.5 h-2.5" />
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-1">
              <h3 className="font-semibold text-sm text-white leading-tight">
                {isDefaultBankScenario ? 'Bank Uzbekistan' : sender.name}
              </h3>
              <CheckCheck className="w-3.5 h-3.5 text-[#2481cc]" />
            </div>
            <p className="text-[11px] text-[#708499]">{sender.status || 'в сети'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[#708499]">
          <button className="p-1 hover:text-white transition-colors cursor-pointer">
            <Phone className="w-4 h-4" />
          </button>
          <button className="p-1 hover:text-white transition-colors cursor-pointer">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. Messages Stream Body */}
      <div className="p-3 sm:p-4 space-y-2.5 bg-[#0e1621] min-h-[280px] sm:min-h-[380px] flex flex-col justify-end">
        {/* Date separator */}
        <div className="text-center my-1">
          <span className="px-3 py-0.5 rounded-full bg-[#182533] text-[11px] text-[#708499] font-medium">
            Сегодня
          </span>
        </div>

        {isDefaultBankScenario ? (
          <>
            {/* Bubble 1 */}
            <div className="max-w-[88%] self-start bg-[#182533] border border-[#242f3d]/60 rounded-2xl rounded-tl-xs p-3 space-y-1 shadow-sm">
              <p className="text-[13px] text-[#e4ecf2] leading-snug">
                Здравствуйте! Ваша карта временно заблокирована из-за подозрительной активности.
              </p>
              <div className="flex justify-end text-[10px] text-[#708499]">
                <span>14:32</span>
              </div>
            </div>

            {/* Bubble 2 */}
            <div className="max-w-[88%] self-start bg-[#182533] border border-[#242f3d]/60 rounded-2xl rounded-tl-xs p-3 space-y-1 shadow-sm">
              <p className="text-[13px] text-[#e4ecf2] leading-snug">
                Для восстановления доступа необходимо открыть вложение и подтвердить данные.
              </p>
              <div className="flex justify-end text-[10px] text-[#708499]">
                <span>14:32</span>
              </div>
            </div>

            {/* Bubble 3: Attachment Card */}
            <div
              onClick={handleAttachmentClick}
              className="max-w-[88%] self-start bg-[#182533] border border-[#242f3d]/60 rounded-2xl rounded-tl-xs p-3 space-y-2 shadow-sm cursor-pointer hover:bg-[#202e3e] transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#C83D2F]/20 border border-[#C83D2F]/40 flex items-center justify-center text-[#C83D2F] shrink-0">
                  <FileText className="w-5 h-5 group-hover:scale-105 transition-transform" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-white truncate group-hover:text-[#64b5f6] transition-colors">
                    {content.attachment?.name || 'Bank_Update.pdf'}
                  </div>
                  <div className="text-[11px] text-[#708499]">
                    {content.attachment?.size || '1.2 MB'} • PDF
                  </div>
                </div>
                <Download className="w-4 h-4 text-[#708499] group-hover:text-white shrink-0" />
              </div>
              <div className="flex justify-end text-[10px] text-[#708499]">
                <span>14:32</span>
              </div>
            </div>

            {/* Bubble 4: Urgency pressure */}
            <div className="max-w-[88%] self-start bg-[#182533] border border-[#242f3d]/60 rounded-2xl rounded-tl-xs p-3 space-y-1 shadow-sm">
              <p className="text-[13px] text-[#e4ecf2] leading-snug">
                Это срочно. У вас есть всего 15 минут, иначе карта будет заблокирована навсегда.
              </p>
              <div className="flex justify-end text-[10px] text-[#708499]">
                <span>14:33</span>
              </div>
            </div>
          </>
        ) : (
          /* Generic scenario message flow */
          <div className="max-w-[88%] self-start bg-[#182533] border border-[#242f3d]/60 rounded-2xl rounded-tl-xs p-3 space-y-2 shadow-sm">
            <div className="text-xs font-semibold text-[#5288c1]">{sender.name}</div>
            <p className="text-[13px] text-[#e4ecf2] leading-relaxed whitespace-pre-line">
              {content.text}
            </p>

            {content.attachment && (
              <div
                onClick={handleAttachmentClick}
                className="rounded-xl p-2.5 bg-[#242f3d] hover:bg-[#2c3848] border border-[#313f50] flex items-center justify-between gap-3 cursor-pointer transition-colors group mt-2"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-[#C83D2F]/20 border border-[#C83D2F]/40 flex items-center justify-center text-[#C83D2F] shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white truncate">
                      {content.attachment.name}
                    </div>
                    <div className="text-[10px] text-[#708499]">
                      {content.attachment.size} • Документ
                    </div>
                  </div>
                </div>
                <Download className="w-4 h-4 text-[#708499]" />
              </div>
            )}

            <div className="flex justify-end text-[10px] text-[#708499]">
              <span>14:33</span>
            </div>
          </div>
        )}
      </div>

      {/* 4. Bottom Input Bar */}
      <div className="bg-[#17212b] px-3 py-2 border-t border-[#0e1621] flex items-center gap-2.5 text-[#708499]">
        <Paperclip className="w-4 h-4 cursor-pointer hover:text-white transition-colors" />
        <div className="flex-1 bg-[#242f3d] rounded-full px-3.5 py-1.5 text-xs text-[#708499]">
          Сообщение...
        </div>
        <Smile className="w-4 h-4 cursor-pointer hover:text-white transition-colors" />
        <Mic className="w-4 h-4 cursor-pointer hover:text-white transition-colors" />
      </div>
    </div>
  );
};
