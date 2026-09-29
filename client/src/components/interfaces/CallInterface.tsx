import React, { useState } from 'react';
import { Phone, PhoneOff, Mic, Volume2, ShieldAlert, Radio } from 'lucide-react';
import { Scenario } from '../../types';

interface CallInterfaceProps {
  scenario: Scenario;
  onSelectAction: (actionId: string) => void;
}

export const CallInterface: React.FC<CallInterfaceProps> = ({ scenario, onSelectAction }) => {
  const { sender, content, availableActions } = scenario;
  const callDetails = content.callDetails;
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Play audio using browser Web Speech API simulation
  const handlePlayVoice = () => {
    if (!('speechSynthesis' in window)) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const textToSpeak = callDetails?.simulatedAudioText || content.text || '';
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'ru-RU';
    utterance.rate = 1.05;
    utterance.pitch = 0.95;

    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="w-full max-w-md mx-auto rounded-3xl overflow-hidden border border-slate-700 bg-slate-950 shadow-2xl flex flex-col font-sans">
      {/* Mobile Top Status Bar */}
      <div className="bg-slate-950 px-6 pt-3 pb-2 flex items-center justify-between text-[11px] font-mono text-slate-400 select-none">
        <span>14:32</span>
        <div className="w-20 h-4 bg-slate-900 rounded-full mx-auto" />
        <div className="flex items-center gap-1.5">
          <span>UZTELECOM</span>
          <span>5G</span>
          <span>87%</span>
        </div>
      </div>

      {/* Active Call Viewport */}
      <div className="px-6 py-6 flex flex-col items-center text-center space-y-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        {/* Caller Avatar */}
        <div className="w-20 h-20 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shadow-lg">
          <Phone className="w-8 h-8 text-cyan-400" />
        </div>

        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-rose-400 font-semibold flex items-center justify-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>Входящий звонок • 00:19</span>
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight mt-1">
            {callDetails?.callerName || sender.name}
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            {callDetails?.callerNumber || sender.handleOrPhone}
          </p>
        </div>

        {/* Real-time Call Screening / Transcript Panel */}
        <div className="w-full p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-left space-y-2.5 shadow-inner">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-slate-300 font-medium">
              <Mic className="w-3.5 h-3.5 text-cyan-400" />
              Транскрипция речи звонящего:
            </span>
            <button
              onClick={handlePlayVoice}
              className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-850 hover:bg-slate-800 border border-slate-700 text-cyan-400 text-[11px] font-mono transition-colors cursor-pointer"
            >
              <Volume2 className="w-3 h-3" />
              <span>{isPlayingAudio ? 'Пауза' : 'Озвучить'}</span>
            </button>
          </div>

          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
            «{callDetails?.simulatedAudioText || content.text}»
          </p>
        </div>

        {/* Smartphone Phone Action Pad (Realistic Mockup) */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-[280px] pt-1">
          <button
            onClick={handlePlayVoice}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-colors cursor-pointer ${
              isPlayingAudio ? 'bg-cyan-950 border-cyan-700 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Volume2 className="w-5 h-5 mb-1" />
            <span className="text-[10px]">Динамик</span>
          </button>
          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500">
            <Mic className="w-5 h-5 mb-1" />
            <span className="text-[10px]">Откл. звук</span>
          </div>
          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500">
            <Radio className="w-5 h-5 mb-1" />
            <span className="text-[10px]">Клавиши</span>
          </div>
        </div>
      </div>

      {/* Decision Actions Bar */}
      <div className="bg-slate-900 p-4 border-t border-slate-800 space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between font-mono">
          <span>Ваша реакция на вызов:</span>
          <span className="text-[11px] text-cyan-400 font-normal">Примите решение</span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {availableActions.map((action) => {
            const isHangup = action.id.toLowerCase().includes('reject') || action.id.toLowerCase().includes('block') || action.label.toLowerCase().includes('сброс') || action.label.toLowerCase().includes('заверш');
            return (
              <button
                key={action.id}
                onClick={() => {
                  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                  onSelectAction(action.id);
                }}
                className={`text-left px-3.5 py-3 rounded-xl border transition-all duration-150 flex items-center justify-between gap-2 text-xs font-medium cursor-pointer ${
                  isHangup
                    ? 'bg-rose-950/40 border-rose-900/80 hover:bg-rose-900/50 text-rose-200 hover:border-rose-700'
                    : 'bg-slate-950 border-slate-800 hover:border-cyan-500 hover:bg-slate-850 text-slate-200 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isHangup ? <PhoneOff className="w-4 h-4 text-rose-400 shrink-0" /> : <Phone className="w-4 h-4 text-cyan-400 shrink-0" />}
                  <span>{action.label}</span>
                </div>
                <span className="text-slate-500 font-mono">→</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
