
import React, { useState, useEffect, useRef } from 'react';
import { GameState, getInitialState } from './types';
import { RatRace } from './components/RatRace';
import { FastTrack } from './components/FastTrack';
import { TrendingUpIcon, CalculatorIcon, XIcon, BriefcaseIcon, WalletIcon, PieChartIcon, HomeIcon, TrashIcon, DollarSignIcon, UserIcon } from './components/Icons';
import { Input } from './components/UI';

const formatNum = (val: number) => val.toLocaleString('ru-RU').replace(/\s/g, '\u00A0');

const hapticClick = () => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(15);
  }
};

interface SetupModalProps {
  state: GameState;
  updateState: (updates: Partial<GameState>) => void;
  onClose: () => void;
}

const SetupModal: React.FC<SetupModalProps> = ({ state, updateState, onClose }) => {
  const [step, setStep] = useState(1);

  const handleNumChange = (field: keyof GameState, value: string) => {
    updateState({ [field]: parseFloat(value) || 0 });
  };

  const renderStep1 = () => (
    <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
      <Input 
          label="Игрок" 
          placeholder="Введите ваше имя" 
          value={state.player} 
          onChange={val => updateState({ player: val })} 
      />
      <Input 
          label="Имя Аудитора" 
          placeholder="Игрок справа от вас" 
          value={state.auditor} 
          onChange={val => updateState({ auditor: val })} 
      />
      <Input 
          label="Профессия" 
          placeholder="Врач" 
          value={state.profession} 
          onChange={val => updateState({ profession: val })} 
      />
      <Input 
          label="Зарплата" 
          type="number" 
          currency 
          value={state.salary || ''} 
          onChange={val => handleNumChange('salary', val)} 
      />
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
      <h3 className="font-bold text-slate-800 border-b pb-1 flex items-center gap-2">
        <HomeIcon className="w-4 h-4" /> Пассивы (Долги)
      </h3>
      <Input label="Ипотека" type="number" currency value={state.homeMortgage || ''} onChange={val => handleNumChange('homeMortgage', val)} />
      <Input label="Кредит на образование" type="number" currency value={state.schoolLoans || ''} onChange={val => handleNumChange('schoolLoans', val)} />
      <Input label="Кредит на машину" type="number" currency value={state.carLoans || ''} onChange={val => handleNumChange('carLoans', val)} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Кредитные карты" type="number" currency value={state.creditCardDebt || ''} onChange={val => handleNumChange('creditCardDebt', val)} />
        <Input label="Мелкие кредиты" type="number" currency value={state.retailDebt || ''} onChange={val => handleNumChange('retailDebt', val)} />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4 animate-in slide-in-from-right-4 duration-300 overflow-y-auto max-h-[60vh] px-1">
      <h3 className="font-bold text-slate-800 border-b pb-1 flex items-center gap-2">
        <PieChartIcon className="w-4 h-4" /> Расходы (Выплаты)
      </h3>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        <Input label="Налоги" type="number" currency value={state.taxes || ''} onChange={val => handleNumChange('taxes', val)} />
        <Input label="Ипотека" type="number" currency value={state.homeMortgagePayment || ''} onChange={val => handleNumChange('homeMortgagePayment', val)} />
        <Input label="Образование" type="number" currency value={state.schoolLoanPayment || ''} onChange={val => handleNumChange('schoolLoanPayment', val)} />
        <Input label="Машина" type="number" currency value={state.carLoanPayment || ''} onChange={val => handleNumChange('carLoanPayment', val)} />
        <Input label="Кредитные карты" type="number" currency value={state.creditCardPayment || ''} onChange={val => handleNumChange('creditCardPayment', val)} />
        <Input label="Мелкие кредиты" type="number" currency value={state.retailPayment || ''} onChange={val => handleNumChange('retailPayment', val)} />
        <Input label="Прочие расходы" type="number" currency value={state.otherExpenses || ''} onChange={val => handleNumChange('otherExpenses', val)} />
        <Input label="На 1 ребенка" type="number" currency value={state.perChildExpense || ''} onChange={val => handleNumChange('perChildExpense', val)} />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900 bg-opacity-95 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100 border border-slate-200">
        <div className="bg-slate-900 px-8 py-6 text-white relative">
            <h2 className="font-heading font-bold text-2xl mb-1 flex items-center gap-3">
                <CalculatorIcon className="w-6 h-6 text-yellow-500" />
                Настройка игры
            </h2>
            <div className="flex items-center gap-2 mt-2">
                {[1, 2, 3].map(i => (
                    <div key={i} className={`h-1.5 flex-grow rounded-full transition-all ${step >= i ? 'bg-yellow-500' : 'bg-slate-700'}`} />
                ))}
            </div>
            <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold mt-2">
                Шаг {step} из 3: {step === 1 ? 'Личные данные' : step === 2 ? 'Пассивы' : 'Расходы'}
            </p>
        </div>
        
        <div className="p-8">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            
            <div className="pt-8 flex gap-3">
                {step > 1 && (
                    <button 
                        onClick={() => { hapticClick(); setStep(s => s - 1); }}
                        className="flex-1 border-2 border-slate-200 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-50 transition-all active:scale-95"
                    >
                        Назад
                    </button>
                )}
                {step < 3 ? (
                    <button 
                        onClick={() => { hapticClick(); setStep(s => s + 1); }}
                        disabled={step === 1 && (!state.player || !state.profession)}
                        className="flex-[2] bg-slate-900 border-slate-950 shadow-lg shadow-slate-900/40 text-white font-bold py-3 rounded-xl border-b-4 transition-all disabled:opacity-50 disabled:shadow-none hover:bg-slate-800 active:translate-y-1 active:scale-[0.98] active:shadow-none active:border-b-0"
                    >
                        Далее
                    </button>
                ) : (
                    <button 
                        onClick={() => { hapticClick(); onClose(); }}
                        className="flex-[2] bg-yellow-500 border-yellow-700 shadow-lg shadow-yellow-500/40 hover:bg-yellow-600 text-slate-900 font-bold py-3 rounded-xl border-b-4 transition-all text-lg active:translate-y-1 active:scale-[0.98] active:shadow-none active:border-b-0"
                    >
                        Начать игру
                    </button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

const FastTrackSuccessModal: React.FC<{ player: string; initialPassive: number; startPassive: number; onClose: () => void }> = ({ player, initialPassive, startPassive, onClose }) => {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900 bg-opacity-90 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-md overflow-hidden transform transition-all scale-100 border border-yellow-200 animate-in zoom-in-95 duration-300">
        <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-8 text-center text-white relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-yellow-300/30 rounded-full blur-3xl" />
            
            <div className="relative z-10">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                    <TrendingUpIcon className="w-10 h-10 text-yellow-600" />
                </div>
                <h2 className="font-heading font-black text-3xl mb-2 leading-tight">
                    {player}, поздравляем!
                </h2>
                <p className="text-yellow-100 font-bold uppercase tracking-widest text-xs">
                    Вы вырвались из "Крысиных бегов"
                </p>
            </div>
        </div>
        
        <div className="p-8 text-center space-y-6">
            <div>
                <span className="block text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Старый пассивный доход</span>
                <div className="inline-block px-6 py-2 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="text-2xl font-mono font-black text-slate-700 whitespace-nowrap">
                        ${formatNum(initialPassive)}
                    </span>
                </div>
                <p className="text-[9px] text-slate-400 font-bold uppercase mt-2">Пассивный доход, округленный до тысяч</p>
            </div>

            <div className="pt-4 border-t border-slate-100">
                <span className="block text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Начальный пассивный доход</span>
                <div className="inline-block px-8 py-3 bg-blue-50 border border-blue-100 rounded-2xl">
                    <span className="text-4xl font-mono font-black text-blue-600 whitespace-nowrap">
                        {formatNum(startPassive)}
                    </span>
                </div>
                <p className="text-[9px] text-blue-400 font-bold uppercase mt-2">Старый пассивный доход * 100</p>
            </div>
            
            <button 
                onClick={() => { hapticClick(); onClose(); }}
                className="w-full bg-slate-900 border-slate-950 shadow-lg shadow-slate-900/40 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl border-b-4 transition-all active:translate-y-1 active:scale-[0.98] active:shadow-none active:border-b-0 uppercase tracking-widest text-sm"
            >
                Ок
            </button>
        </div>
      </div>
    </div>
  );
};

const EditProfileModal: React.FC<{ state: GameState; updateState: (updates: Partial<GameState>) => void; onClose: () => void }> = ({ state, updateState, onClose }) => {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-md overflow-hidden transform transition-all border border-slate-200">
        <div className="bg-slate-900 px-6 py-4 text-white flex justify-between items-center">
            <h2 className="font-heading font-bold text-xl flex items-center gap-3">
                <UserIcon className="w-5 h-5 text-yellow-500" />
                Данные игрока
            </h2>
            <button onClick={() => { hapticClick(); onClose(); }} className="text-slate-400 hover:text-white transition-colors">
              <XIcon className="w-6 h-6" />
            </button>
        </div>
        <div className="p-6 space-y-4">
            <Input 
                label="Игрок" 
                placeholder="Введите ваше имя" 
                value={state.player} 
                onChange={val => updateState({ player: val })} 
            />
            <Input 
                label="Профессия" 
                placeholder="Врач" 
                value={state.profession} 
                onChange={val => updateState({ profession: val })} 
            />
            <Input 
                label="Имя Аудитора" 
                placeholder="Игрок справа от вас" 
                value={state.auditor} 
                onChange={val => updateState({ auditor: val })} 
            />
            <button 
                onClick={() => { hapticClick(); onClose(); }}
                className="w-full bg-yellow-500 border-yellow-700 shadow-lg shadow-yellow-500/40 hover:bg-yellow-600 text-slate-900 font-bold py-3 rounded-xl border-b-4 transition-all mt-4 active:translate-y-1 active:scale-[0.98] active:shadow-none active:border-b-0"
            >
                Сохранить
            </button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [state, setState] = useState<GameState>(getInitialState());
  const [loaded, setLoaded] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showPlayerInfo, setShowPlayerInfo] = useState(false);
  const [showFastTrackSuccess, setShowFastTrackSuccess] = useState(false);
  const [setupKey, setSetupKey] = useState(Date.now());
  const infoRef = useRef<HTMLDivElement>(null);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('cashflow_state_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState(parsed);
        if (!parsed.player || !parsed.profession) {
            setShowSetup(true);
        }
      } catch (e) {
        console.error("Failed to parse saved state", e);
        setShowSetup(true);
      }
    } else {
        setShowSetup(true);
    }
    setLoaded(true);
  }, []);

  // Save to local storage
  useEffect(() => {
    if (loaded) {
      localStorage.setItem('cashflow_state_v1', JSON.stringify(state));
    }
  }, [state, loaded]);

  // Handle click outside to close player info
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (infoRef.current && !infoRef.current.contains(event.target as Node)) {
        setShowPlayerInfo(false);
      }
    };
    if (showPlayerInfo) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPlayerInfo]);

  const updateState = (updates: Partial<GameState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const handleResetGame = () => {
    hapticClick();
    localStorage.removeItem('cashflow_state_v1');
    const freshState = getInitialState();
    setState(freshState);
    setSetupKey(Date.now());
    setShowResetConfirm(false);
    setShowSetup(true);
    setShowFastTrackSuccess(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExitToFastTrack = () => {
      hapticClick();
      // Расчет текущего пассивного дохода из Крысиных бегов
      const currentPassive = 
          state.realEstateAssets.reduce((sum, a) => sum + ((Number(a.cashflow) || 0) * (Number(a.count) || 1)), 0) + 
          state.businessAssets.reduce((sum, a) => sum + ((Number(a.cashflow) || 0) * (Number(a.count) || 1)), 0) + 
          state.stockAssets.reduce((sum, a) => sum + ((Number(a.cashflow) || 0) * (Number(a.count) || 1)), 0) +
          (Number(state.dividends) || 0);
      
      // ОКРУГЛЯЕМ ДО БЛИЖАЙШЕЙ ТЫСЯЧИ СОГЛАСНО ПРАВИЛАМ
      const startPassive = Math.round(currentPassive / 1000) * 1000;
      const dayIncome = startPassive * 100;

      // Закрываем все системные окна App (если открыты)
      setShowEditProfile(false);
      setShowResetConfirm(false);
      setShowPlayerInfo(false);

      updateState({
          isOnFastTrack: true,
          fastTrackStartPassiveIncome: startPassive,
          fastTrackCashflowDayIncome: dayIncome,
          fastTrackCash: dayIncome 
      });
      
      setShowFastTrackSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!loaded) return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {showSetup ? (
          <SetupModal 
            key={setupKey}
            state={state} 
            updateState={updateState} 
            onClose={() => setShowSetup(false)} 
          />
      ) : (
        <>
          {showEditProfile && (
            <EditProfileModal 
              state={state}
              updateState={updateState}
              onClose={() => setShowEditProfile(false)}
            />
          )}

          {showFastTrackSuccess && (
            <FastTrackSuccessModal 
                player={state.player}
                initialPassive={state.fastTrackStartPassiveIncome}
                startPassive={state.fastTrackCashflowDayIncome}
                onClose={() => setShowFastTrackSuccess(false)}
            />
          )}

          {showResetConfirm && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-2xl p-8 max-sm w-full text-center border border-red-100">
                 <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrashIcon className="w-8 h-8" />
                 </div>
                 <h3 className="text-xl font-bold text-slate-900 mb-2">Сбросить игру?</h3>
                 <p className="text-slate-500 mb-8">Все текущие данные будут удалены безвозвратно. Вы уверены?</p>
                 <div className="flex gap-3">
                    <button 
                      onClick={() => { hapticClick(); setShowResetConfirm(false); }}
                      className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors active:scale-95"
                    >
                      Отмена
                    </button>
                    <button 
                      onClick={handleResetGame}
                      className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg transition-colors active:scale-95"
                    >
                      Да, сбросить
                    </button>
                 </div>
              </div>
            </div>
          )}

          <nav className="bg-slate-900 text-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-500 p-1.5 rounded text-slate-900">
                    <CalculatorIcon className="w-6 h-6" />
                  </div>
                  <span className="font-heading font-bold text-xl tracking-wider uppercase">CASHFLOW</span>
                </div>
                
                <div className="relative" ref={infoRef}>
                    <button 
                        onClick={() => { hapticClick(); setShowPlayerInfo(!showPlayerInfo); }}
                        className="w-10 h-10 rounded-full bg-slate-800 border-2 border-yellow-500 flex items-center justify-center text-yellow-500 hover:bg-slate-700 transition-all focus:outline-none overflow-hidden shadow-inner active:scale-90"
                    >
                        <UserIcon className="w-6 h-6" />
                    </button>

                    {showPlayerInfo && (
                        <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 text-slate-900 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[100]">
                            <div className="bg-slate-50 p-4 border-b border-slate-100">
                                <h4 className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-1">Профиль игрока</h4>
                                <p className="text-lg font-bold text-slate-900 truncate">{state.player || 'Неизвестно'}</p>
                            </div>
                            <div className="p-4 space-y-4">
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 block mb-0.5">Профессия</label>
                                    <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        <BriefcaseIcon className="w-4 h-4 text-yellow-500" />
                                        {state.profession || '—'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 block mb-0.5">Аудитор</label>
                                    <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        <UserIcon className="w-4 h-4 text-blue-500" />
                                        {state.auditor || '—'}
                                    </p>
                                </div>
                            </div>
                            <div className="p-2 bg-slate-50 border-t border-slate-100">
                                 <button 
                                    onClick={() => { hapticClick(); setShowEditProfile(true); setShowPlayerInfo(false); }}
                                    className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-tight active:scale-95"
                                 >
                                    Изменить данные
                                 </button>
                            </div>
                        </div>
                    )}
                </div>
              </div>
            </div>
          </nav>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {!state.isOnFastTrack ? (
              <>
                <RatRace state={state} updateState={updateState} />
                <div className="mt-12 flex flex-col items-center gap-8">
                    <button 
                        onClick={handleExitToFastTrack}
                        className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 border-yellow-700 shadow-lg shadow-yellow-500/40 text-slate-900 font-bold px-8 py-4 rounded-full border-b-4 hover:shadow-xl hover:scale-105 transition-all transform active:translate-y-1 active:scale-[0.98] active:shadow-none active:border-b-0"
                    >
                        <TrendingUpIcon className="w-6 h-6" />
                        Выйти на Быстрый Путь
                    </button>
                    
                    <button 
                      onClick={() => { hapticClick(); setShowResetConfirm(true); }}
                      className="text-[10px] text-slate-400 hover:text-red-500 uppercase tracking-widest font-black px-4 py-2 transition-colors border border-slate-200 rounded-lg hover:border-red-100 hover:bg-red-50/50 active:scale-95"
                    >
                      Сбросить текущую игру
                    </button>
                </div>
              </>
            ) : (
              <div className="space-y-12">
                <FastTrack state={state} updateState={updateState} />
                <div className="flex flex-col items-center gap-4">
                    <button 
                      onClick={() => { hapticClick(); updateState({ isOnFastTrack: false }); }}
                      className="text-[10px] text-slate-400 hover:text-indigo-500 uppercase tracking-widest font-black px-4 py-2 transition-colors border border-slate-200 rounded-lg hover:border-indigo-100 hover:bg-indigo-50/50 active:scale-95"
                    >
                      Вернуться на Крысиные Бега
                    </button>
                    <button 
                      onClick={() => { hapticClick(); setShowResetConfirm(true); }}
                      className="text-[10px] text-slate-400 hover:text-red-500 uppercase tracking-widest font-black px-4 py-2 transition-colors border border-slate-200 rounded-lg hover:border-red-100 hover:border-red-100 hover:bg-red-50/50 active:scale-95"
                    >
                      Сбросить текущую игру
                    </button>
                </div>
              </div>
            )}
          </main>
        </>
      )}

      <footer className="max-w-7xl mx-auto px-4 py-6 text-center text-xs text-slate-400">
        CASHFLOW® is a registered trademark of Cashflow Technologies, Inc. <br/>
        This app is an unofficial tool to help calculate game states.
      </footer>
    </div>
  );
}
