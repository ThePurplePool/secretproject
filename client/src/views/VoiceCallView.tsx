import React, { useState } from 'react';
import { Phone, PhoneOff, Mic, Volume2, ShieldAlert, Radio, AlertOctagon, CheckCircle2, RotateCw } from 'lucide-react';
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
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* View Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950 border border-indigo-800 text-indigo-300 text-xs font-bold uppercase tracking-wider">
          <Phone className="w-3.5 h-3.5" />
          <span>AI Voice Simulator (Provider-Agnostic)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Интерактивный симулятор голосовых атак
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Телефонные мошенники используют психологический напор, дефицит времени и шок. Тренируйте хладнокровие при подозрительных звонках.
        </p>
      </div>

      {!activeCall ? (
        /* Scenario selector before call starts */
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Выберите сценарий симуляции звонка:
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setSelectedScenario('fake-police-call-004')}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                selectedScenario === 'fake-police-call-004'
                  ? 'bg-indigo-950/60 border-indigo-500 shadow-md shadow-indigo-950/40 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="font-bold text-sm text-white mb-1">
                🚨 Звонок «Следователя МВД»
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Шантаж с ложным ДТП близкого человека. Агрессивное требование срочного выкупа за 5 минут.
              </p>
            </div>

            <div
              onClick={() => setSelectedScenario('fake-bank-sms-002')}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                selectedScenario === 'fake-bank-sms-002'
                  ? 'bg-indigo-950/60 border-indigo-500 shadow-md shadow-indigo-950/40 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="font-bold text-sm text-white mb-1">
                🏦 Звонок «Службы безопасности банка»
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Якобы несанкционированное списание. Психологическая манипуляция с целью выманить код из SMS.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={startCall}
              disabled={loading}
              className="w-full py-4 rounded-2xl font-black text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-xl shadow-emerald-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Phone className="w-5 h-5" />
              <span>{loading ? 'Подключение линии...' : 'ПРИНЯТЬ ВХОДЯЩИЙ ЗВОНОК'}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Active Call Screen */
        <div className="rounded-3xl border-2 border-slate-700 bg-slate-950 overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950 border border-rose-800 text-rose-300 text-xs font-semibold animate-pulse">
              <Radio className="w-3.5 h-3.5" />
              <span>ИДЁТ СИМУЛЯЦИЯ ЗВОНКА</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => speakText(activeCall.currentAudioScript)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 text-cyan-400 text-xs hover:bg-slate-700"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{isSpeaking ? 'Звучит голос' : 'Озвучить'}</span>
              </button>
            </div>
          </div>

          {/* Caller Profile */}
          <div className="text-center space-y-2 py-4">
            <div className="relative inline-block">
              <div className="w-20 h-20 rounded-full bg-slate-900 border-2 border-rose-500 flex items-center justify-center text-rose-400 shadow-xl mx-auto">
                <Phone className="w-8 h-8" />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-rose-500/40 animate-ping pointer-events-none" />
            </div>

            <h3 className="text-xl font-extrabold text-white tracking-tight">
              {activeCall.callerName}
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              {activeCall.callerNumber}
            </p>
          </div>

          {/* Spoken Transcript Bubble */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-left">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <Mic className="w-3.5 h-3.5 text-cyan-400" />
              <span>Голос звонящего:</span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed italic">
              "{activeCall.currentAudioScript}"
            </p>
          </div>

          {/* User Response Options */}
          {!callEnded ? (
            <div className="space-y-3 pt-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Как вы ответите на эту реплику?
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {activeCall.availableUserReplies.map((reply) => (
                  <button
                    key={reply.id}
                    onClick={() => handleReply(reply.id)}
                    className="text-left px-4 py-3 rounded-xl border transition-all text-xs font-medium bg-slate-900 border-slate-800 hover:border-cyan-500 hover:bg-slate-850 text-slate-200 hover:text-white flex items-center justify-between gap-3 group cursor-pointer"
                  >
                    <span>{reply.text}</span>
                    <span className="text-slate-500 group-hover:text-cyan-400">→</span>
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <button
                  onClick={endCallManual}
                  className="w-full py-3 rounded-xl bg-rose-950/80 border border-rose-800 hover:bg-rose-900 text-rose-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>Сбросить звонок без разговоров</span>
                </button>
              </div>
            </div>
          ) : (
            /* Call Summary */
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4 animate-fadeIn">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="text-base font-bold text-white">Сеанс звонка завершён</h4>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                Вы отработали навык поведения при агрессивном телефонном давлении. Помните: ни один реальный сотрудник правоохранительных органов или банка не решает вопросы по телефону через перевод денег на карты физлиц.
              </p>

              <button
                onClick={() => setActiveCall(null)}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Выбрать другой сценарий звонка</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
