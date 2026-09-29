import React, { useState } from 'react';
import { Phone, PhoneOff, Mic, Volume2, AlertOctagon, CheckCircle2, RotateCw } from 'lucide-react';
import { api } from '../services/api';
import { VoiceCallState } from '../types';

export const VoiceCallView: React.FC = () => {
  const [activeCall, setActiveCall] = useState<VoiceCallState | null>(null);
  const [selectedScenario, setSelectedScenario] = useState('fake-police-call-004');
  const [callEnded, setCallEnded] = useState(false);
  const [finalStatus, setFinalStatus] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);

  const startCall = async () => {
    setLoading(true);
    setCallEnded(false);
    setFinalStatus(null);
    try {
      const state = await api.startVoiceCall(selectedScenario);
      setActiveCall(state);
      setLoading(false);
      speakText(state.currentAudioScript);
    } catch (err: any) {
      alert('Ошибка соединения с голосовым модулем: ' + err.message);
      setLoading(false);
    }
  };

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ru-RU';
    utterance.rate = 1.05;
    utterance.pitch = 0.92;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleReply = async (replyId: string) => {
    if (!activeCall) return;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();

    try {
      const result = await api.replyVoiceCall(activeCall.callId, replyId);
      if (result.nextScript) {
        speakText(result.nextScript);
        setActiveCall({
          ...activeCall,
          currentAudioScript: result.nextScript,
          urgencyLevel: result.urgencyLevel,
        });
      }

      if (result.isCallEnded) {
        setCallEnded(true);
        setFinalStatus(result.consequenceId || 'call_finished');
      }
    } catch (err: any) {
      alert('Ошибка обработки ответа: ' + err.message);
    }
  };

  const endCallManual = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setCallEnded(true);
    setFinalStatus('hangup_manual');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 font-sans text-[#191A1C]">
      {/* View Header */}
      <div className="border-b border-[#D8D2C5] pb-6 space-y-2">
        <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-[#7A1F2B] font-semibold">
          <Phone className="w-3.5 h-3.5" />
          <span>Голосовая ситуация • Противодействие вишингу</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#191A1C] tracking-tight">
          Интерактивная отработка телефонной атаки
        </h1>
        <p className="text-xs sm:text-sm text-[#5C5854] max-w-xl leading-relaxed">
          Телефонные мошенники используют психологический напор, дефицит времени и страх. Тренируйте хладнокровие и способность распознать манипуляцию в живом разговоре.
        </p>
      </div>

      {!activeCall ? (
        /* Scenario selector before call starts */
        <div className="p-6 sm:p-8 rounded-lg bg-[#FAF8F5] border border-[#D8D2C5] space-y-6 shadow-sm">
          <label className="text-xs font-mono font-bold text-[#191A1C] uppercase tracking-wider block">
            Выберите сценарий входящего вызова:
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setSelectedScenario('fake-police-call-004')}
              className={`p-5 rounded-md border cursor-pointer transition-all ${
                selectedScenario === 'fake-police-call-004'
                  ? 'bg-[#E7E1D6] border-[#191A1C] text-[#191A1C]'
                  : 'bg-white border-[#D8D2C5] text-[#5C5854] hover:border-[#8A8580]'
              }`}
            >
              <div className="font-bold text-sm text-[#191A1C] mb-1 font-mono">
                Звонок «Следователя МВД»
              </div>
              <p className="text-xs leading-relaxed">
                Шантаж с ложным ДТП близкого человека. Агрессивное требование срочной передачи денег за 5 минут.
              </p>
            </div>

            <div
              onClick={() => setSelectedScenario('fake-bank-sms-002')}
              className={`p-5 rounded-md border cursor-pointer transition-all ${
                selectedScenario === 'fake-bank-sms-002'
                  ? 'bg-[#E7E1D6] border-[#191A1C] text-[#191A1C]'
                  : 'bg-white border-[#D8D2C5] text-[#5C5854] hover:border-[#8A8580]'
              }`}
            >
              <div className="font-bold text-sm text-[#191A1C] mb-1 font-mono">
                Звонок «Службы безопасности банка»
              </div>
              <p className="text-xs leading-relaxed">
                Якобы несанкционированное списание. Психологическая манипуляция с целью выманить 6-значный код из SMS.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={startCall}
              disabled={loading}
              className="w-full py-3.5 rounded font-mono font-bold text-xs uppercase tracking-wider bg-[#191A1C] hover:bg-[#7A1F2B] text-white shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              <span>{loading ? 'Установка соединения...' : 'ПРИНЯТЬ ВХОДЯЩИЙ ЗВОНОК'}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Active Call Screen (Smartphone interface) */
        <div className="max-w-md mx-auto rounded-xl border border-[#D8D2C5] bg-[#FAF8F5] overflow-hidden shadow-lg p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#D8D2C5] pb-3 text-xs font-mono">
            <div className="flex items-center gap-2 text-[#7A1F2B] font-bold uppercase">
              <span className="w-2 h-2 rounded-full bg-[#7A1F2B] animate-pulse" />
              <span>ИДЁТ РАЗГОВОР</span>
            </div>

            <button
              onClick={() => speakText(activeCall.currentAudioScript)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#E7E1D6] text-[#191A1C] text-xs hover:bg-[#D8D2C5] transition-colors cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{isSpeaking ? 'Звучит голос' : 'Озвучить'}</span>
            </button>
          </div>

          {/* Caller Identity */}
          <div className="text-center space-y-2 py-2">
            <div className="w-16 h-16 rounded-full bg-[#E7E1D6] border border-[#D8D2C5] flex items-center justify-center text-[#191A1C] mx-auto">
              <Phone className="w-7 h-7 text-[#7A1F2B]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#191A1C]">
                {selectedScenario.includes('police') ? 'Следователь следственного отдела' : 'Служба безопасности банка'}
              </h3>
              <p className="text-xs text-[#6B6661] font-mono mt-0.5">
                +998 71 200-XX-XX • Входящий
              </p>
            </div>
          </div>

          {/* Attacker Speech Transcript */}
          <div className="p-4 rounded bg-[#E7E1D6] border border-[#D8D2C5] text-left space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase text-[#6B6661]">
              <Mic className="w-3.5 h-3.5 text-[#7A1F2B]" />
              <span>Речь звонящего:</span>
            </div>
            <p className="text-xs sm:text-sm text-[#191A1C] leading-relaxed italic">
              «{activeCall.currentAudioScript}»
            </p>
          </div>

          {/* Action response options or Call result */}
          {!callEnded ? (
            <div className="space-y-3 pt-2">
              <label className="text-xs font-mono font-bold text-[#191A1C] uppercase tracking-wider block">
                Ваш ответ в трубку:
              </label>

              <div className="space-y-2">
                {activeCall.availableUserReplies.map((reply) => (
                  <button
                    key={reply.id}
                    onClick={() => handleReply(reply.id)}
                    className="w-full text-left px-3.5 py-2.5 rounded bg-white hover:bg-[#E7E1D6] border border-[#D8D2C5] hover:border-[#191A1C] text-xs font-medium text-[#191A1C] transition-colors cursor-pointer flex items-center justify-between gap-2"
                  >
                    <span>{reply.text}</span>
                    <span className="text-[#8A8580] font-mono">→</span>
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <button
                  onClick={endCallManual}
                  className="w-full py-2.5 rounded bg-[#7A1F2B] hover:bg-[#621822] text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>Сбросить трубку</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded bg-[#FAF8F5] border border-[#D8D2C5] text-center space-y-4 animate-fadeIn">
              <div className="w-12 h-12 rounded-full bg-[#E7E1D6] text-[#191A1C] flex items-center justify-center mx-auto">
                {finalStatus === 'hangup_manual' || finalStatus === 'safe_hangup' ? (
                  <CheckCircle2 className="w-6 h-6 text-[#465447]" />
                ) : (
                  <AlertOctagon className="w-6 h-6 text-[#7A1F2B]" />
                )}
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-sm text-[#191A1C]">
                  {finalStatus === 'hangup_manual' || finalStatus === 'safe_hangup'
                    ? 'Вызов завершён: Вы проявили бдительность'
                    : 'Вызов завершён: Ловушка сработала'}
                </h4>
                <p className="text-xs text-[#5C5854] leading-relaxed">
                  {finalStatus === 'hangup_manual' || finalStatus === 'safe_hangup'
                    ? 'Сброс звонка и перепроверка по официальному номеру организации — единственно верный алгоритм при звонках с признаками давления.'
                    : 'Передача кодов подтверждения или соглашение на перевод средств привели бы к компрометации счетов.'}
                </p>
              </div>

              <button
                onClick={() => {
                  setActiveCall(null);
                  setCallEnded(false);
                }}
                className="px-5 py-2 rounded font-mono text-xs font-bold uppercase tracking-wider bg-[#191A1C] text-white hover:bg-[#7A1F2B] transition-colors cursor-pointer"
              >
                Пройти заново
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
