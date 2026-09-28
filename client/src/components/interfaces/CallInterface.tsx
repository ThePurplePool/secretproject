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
    <div className="w-full max-w-2xl mx-auto rounded-3xl overflow-hidden border-2 border-slate-700 bg-slate-950 shadow-2xl flex flex-col font-sans">
      {/* Active Call Screen */}
      <div className="p-8 bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col items-center text-center space-y-5">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/70 border border-rose-800 text-rose-300 text-xs font-semibold animate-pulse">
          <Radio className="w-3.5 h-3.5" />
          <span>Входящий срочный вызов</span>
        </div>

        {/* Pulsing avatar */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-rose-500/80 flex items-center justify-center text-rose-400 shadow-2xl shadow-rose-900/30">
            <Phone className="w-10 h-10 animate-bounce" />
          </div>
          <div className="absolute inset-0 rounded-full border-2 border-rose-500/30 animate-ping" />
        </div>

        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            {callDetails?.callerName || sender.name}
          </h3>
          <p className="text-sm text-slate-400 font-mono mt-1">
            {callDetails?.callerNumber || sender.handleOrPhone}
          </p>
          {callDetails?.callerMood && (
            <p className="text-xs text-rose-400 mt-1 italic">
              Тон звонящего: {callDetails.callerMood}
            </p>
          )}
        </div>

        {/* Live speech / transcript box */}
        <div className="w-full p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-left space-y-3 shadow-inner">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-semibold text-slate-300">
              <Mic className="w-3.5 h-3.5 text-cyan-400" />
              Расшифровка речи в реальном времени:
            </span>
            <button
              onClick={handlePlayVoice}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs transition-colors"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{isPlayingAudio ? 'Остановить' : 'Озвучить (AI Voice)'}</span>
            </button>
          </div>

          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic">
            "{callDetails?.simulatedAudioText || content.text}"
          </p>
        </div>
      </div>

      {/* Decision Actions Bar */}
      <div className="bg-slate-900 p-4 border-t border-slate-800 space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Ваш ответ в трубку:</span>
          <span className="text-[11px] text-amber-400">Не поддавайтесь панике</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {availableActions.map((action) => (
            <button
              key={action.id}
              onClick={() => {
                if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                onSelectAction(action.id);
              }}
              className="text-left px-3.5 py-3 rounded-xl border transition-all duration-150 flex items-center justify-between gap-2 text-xs font-medium bg-slate-950 border-slate-700/80 hover:border-cyan-500 hover:bg-slate-800 text-slate-200 hover:text-white group"
            >
              <span>{action.label}</span>
              <span className="text-slate-500 group-hover:text-cyan-400 transition-colors">→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
