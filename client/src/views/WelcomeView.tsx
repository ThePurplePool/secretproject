import React from 'react';
import { ArrowRight, ShieldCheck, BarChart3, Users, BookOpen } from 'lucide-react';
import { UserProfile } from '../types';

interface WelcomeViewProps {
  onStartFirstScenario: () => void;
  onExploreCatalog: () => void;
  onReport?: () => void;
  user: UserProfile | null;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({
  onStartFirstScenario,
  onExploreCatalog,
  onReport,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-12 space-y-8 sm:space-y-12 font-sans text-[#171918]">
      {/* Hero Section matching Reference */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
        {/* Left Column: Headline and Actions */}
        <div className="lg:col-span-6 space-y-4 sm:space-y-6">
          <div className="font-mono text-[11px] sm:text-xs uppercase tracking-widest text-[#626560] font-semibold">
            РЕАЛЬНЫЕ СИТУАЦИИ. РЕАЛЬНЫЕ ПОСЛЕДСТВИЯ.
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-[54px] font-bold text-[#171918] leading-[1.18] sm:leading-[1.08] tracking-tight">
            Мошенники <br className="hidden sm:inline" />
            используют <br className="hidden sm:inline" />
            реальные ситуации. <br className="hidden sm:inline" />
            <span className="text-[#19332F]">Будьте на шаг впереди.</span>
          </h1>

          <p className="text-[14px] sm:text-[16px] text-[#626560] leading-relaxed max-w-lg">
            Интерактивные сценарии, основанные на реальных методах мошенников. Развивайте цифровую грамотность и защищайте себя, свою семью и общество.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-1 sm:pt-2">
            <button
              onClick={onStartFirstScenario}
              className="w-full sm:w-auto px-6 py-3 sm:py-3.5 rounded-[6px] text-[14px] sm:text-[15px] font-semibold bg-[#19332F] hover:bg-[#122421] text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99]"
            >
              <span>Пройти симуляцию</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onExploreCatalog}
              className="w-full sm:w-auto px-6 py-3 sm:py-3.5 rounded-[6px] text-[14px] sm:text-[15px] font-semibold bg-[#FFFFFF] hover:bg-[#F6F3EC] text-[#171918] border border-[#D9D6CF] transition-colors flex items-center justify-center cursor-pointer shadow-xs"
            >
              <span>Проверить себя</span>
            </button>

            {onReport && (
              <button
                onClick={onReport}
                className="w-full sm:w-auto px-3 py-2 sm:py-3 text-[13px] sm:text-[14px] font-medium text-[#C83D2F] hover:underline underline-offset-4 transition-colors cursor-pointer text-center"
              >
                Сообщить о мошенничестве
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Editorial Visual (Samarkand Registan Scene matching reference) */}
        <div className="lg:col-span-6 relative">
          <div className="relative rounded-[8px] overflow-hidden border border-[#D9D6CF] bg-[#FFFFFF] shadow-sm aspect-[4/3] sm:aspect-[16/11]">
            {/* Architectural Landscape Visual */}
            <svg
              className="w-full h-full object-cover select-none"
              viewBox="0 0 600 420"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="xMidYMid slice"
            >
              {/* Sky background */}
              <rect width="600" height="420" fill="#E8F1F5" />
              <circle cx="480" cy="110" r="140" fill="#FDF8EC" opacity="0.6" />

              {/* Distant mountains/skyline */}
              <path d="M0 320L180 270L340 300L480 260L600 290V420H0V320Z" fill="#DCE6EB" />

              {/* Samarkand Turquoise Domes & Minarets */}
              {/* Large central madrasah dome */}
              <path d="M260 270C260 210 295 160 340 160C385 160 420 210 420 270H260Z" fill="#1B788F" />
              {/* Dome ribbing highlights */}
              <path d="M300 270C300 220 320 180 340 160C360 180 380 220 380 270" stroke="#3AB1CA" strokeWidth="4" fill="none" opacity="0.4" />
              <path d="M340 160V140" stroke="#C68A2E" strokeWidth="3" />
              <circle cx="340" cy="138" r="4" fill="#C68A2E" />

              {/* Drum beneath dome */}
              <rect x="270" y="270" width="140" height="40" fill="#C4B496" />
              <rect x="285" y="278" width="16" height="24" rx="8" fill="#1B788F" />
              <rect x="315" y="278" width="16" height="24" rx="8" fill="#1B788F" />
              <rect x="345" y="278" width="16" height="24" rx="8" fill="#1B788F" />
              <rect x="375" y="278" width="16" height="24" rx="8" fill="#1B788F" />

              {/* Right Tower / Minaret */}
              <path d="M460 380L470 120H500L510 380H460Z" fill="#BFA785" />
              <path d="M466 120C466 95 485 85 485 85C485 85 504 95 504 120H466Z" fill="#1B788F" />
              <rect x="462" y="120" width="46" height="12" fill="#886D49" />
              <rect x="465" y="170" width="40" height="8" fill="#886D49" />
              <rect x="468" y="230" width="34" height="8" fill="#886D49" />

              {/* Left Arch / Iwan façade */}
              <path d="M120 380V200H250V380H120Z" fill="#C9BA9C" />
              <path d="M145 380V270C145 240 185 220 185 220C185 220 225 240 225 270V380H145Z" fill="#19332F" />
              {/* Mosaic tile band */}
              <rect x="120" y="200" width="130" height="16" fill="#1B788F" />
              <rect x="120" y="204" width="130" height="4" fill="#C68A2E" />

              {/* Foreground Plaza / Walking pavement */}
              <path d="M0 340H600V420H0V340Z" fill="#E8DEC9" />
              <path d="M0 380H600V420H0V380Z" fill="#D9CCA8" />

              {/* Silhouettes of citizens walking */}
              {/* Person 1 */}
              <circle cx="210" cy="360" r="5" fill="#171918" />
              <path d="M206 366C206 366 210 366 214 366L216 388H204L206 366Z" fill="#171918" />
              {/* Person 2 */}
              <circle cx="225" cy="358" r="6" fill="#3D403D" />
              <path d="M220 365C220 365 225 365 230 365L232 390H218L220 365Z" fill="#3D403D" />
              {/* Person 3 */}
              <circle cx="260" cy="362" r="5" fill="#171918" />
              <path d="M256 368C256 368 260 368 264 368L266 389H254L256 368Z" fill="#171918" />
              {/* Person 4 */}
              <circle cx="280" cy="360" r="5.5" fill="#2E4A43" />
              <path d="M275 366L285 366L287 390H273L275 366Z" fill="#2E4A43" />
              {/* Person 5 */}
              <circle cx="330" cy="364" r="5" fill="#171918" />
              <path d="M326 370L334 370L336 391H324L326 370Z" fill="#171918" />
            </svg>

            {/* Top Text Overlay on Visual (matching reference) */}
            <div className="absolute top-2.5 sm:top-4 left-2.5 sm:left-4 max-w-[170px] sm:max-w-[200px] text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#171918] bg-[#F6F3EC]/95 backdrop-blur-xs p-2 sm:p-2.5 rounded-[4px] border border-[#D9D6CF] leading-tight">
              БЕЗОПАСНЫЙ УЗБЕКИСТАН НАЧИНАЕТСЯ С ОСВЕДОМЛЁННЫХ ЛЮДЕЙ.
            </div>

            {/* Docked Card (matching reference: Users metric) */}
            <div className="absolute bottom-2.5 sm:bottom-4 left-2.5 sm:left-4 bg-[#FFFFFF]/95 backdrop-blur-xs border border-[#D9D6CF] rounded-[6px] p-2.5 sm:p-3 shadow-xs flex items-center gap-2.5 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#19332F]/10 flex items-center justify-center text-[#19332F] shrink-0">
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="text-left">
                <div className="text-[11px] sm:text-[12px] font-bold text-[#171918]">Более 50 000</div>
                <div className="text-[10px] sm:text-[11px] text-[#626560]">пользователей уже обучаются</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Feature Columns (matching Reference: Bottom 4 blocks) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
        {/* Block 1: Реальные сценарии */}
        <div className="p-5 rounded-[6px] bg-[#FFFFFF] border border-[#D9D6CF] space-y-2">
          <div className="w-9 h-9 rounded-[4px] bg-[#F6F3EC] flex items-center justify-center text-[#19332F]">
            <ShieldCheck className="w-5 h-5 text-[#19332F]" />
          </div>
          <h3 className="font-bold text-[16px] text-[#171918]">
            Реальные сценарии
          </h3>
          <p className="text-[13px] text-[#626560] leading-relaxed">
            Основаны на актуальных случаях и методах социальной инженерии в Узбекистане.
          </p>
        </div>

        {/* Block 2: Практические навыки */}
        <div className="p-5 rounded-[6px] bg-[#FFFFFF] border border-[#D9D6CF] space-y-2">
          <div className="w-9 h-9 rounded-[4px] bg-[#F6F3EC] flex items-center justify-center text-[#19332F]">
            <BarChart3 className="w-5 h-5 text-[#19332F]" />
          </div>
          <h3 className="font-bold text-[16px] text-[#171918]">
            Практические навыки
          </h3>
          <p className="text-[13px] text-[#626560] leading-relaxed">
            Научитесь распознавать манипуляцию и принимать хладнокровные решения.
          </p>
        </div>

        {/* Block 3: Для всех */}
        <div className="p-5 rounded-[6px] bg-[#FFFFFF] border border-[#D9D6CF] space-y-2">
          <div className="w-9 h-9 rounded-[4px] bg-[#F6F3EC] flex items-center justify-center text-[#19332F]">
            <Users className="w-5 h-5 text-[#19332F]" />
          </div>
          <h3 className="font-bold text-[16px] text-[#171918]">
            Для всех
          </h3>
          <p className="text-[13px] text-[#626560] leading-relaxed">
            Студенты, сотрудники предприятий, семьи, пожилые люди и консультанты.
          </p>
        </div>

        {/* Block 4: Вклад в безопасность */}
        <div className="p-5 rounded-[6px] bg-[#FFFFFF] border border-[#D9D6CF] space-y-2">
          <div className="w-9 h-9 rounded-[4px] bg-[#F6F3EC] flex items-center justify-center text-[#19332F]">
            <BookOpen className="w-5 h-5 text-[#19332F]" />
          </div>
          <h3 className="font-bold text-[16px] text-[#171918]">
            Вклад в безопасность
          </h3>
          <p className="text-[13px] text-[#626560] leading-relaxed">
            Сообщайте о новых угрозах, защищайте окружение и укрепляйте кибериммунитет.
          </p>
        </div>
      </div>
    </div>
  );
};
