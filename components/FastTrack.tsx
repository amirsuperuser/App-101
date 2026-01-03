
import React, { useState, useRef, useEffect } from 'react';
import { GameState, Asset } from '../types';
import { Card, Input } from './UI';
import { PlusIcon, TrashIcon, WalletIcon, TrendingUpIcon, DollarSignIcon, CalculatorIcon, ShoppingCartIcon, XIcon, HomeIcon, BriefcaseIcon, PieChartIcon } from './Icons';
import { v4 as uuidv4 } from 'uuid';

interface FastTrackProps {
  state: GameState;
  updateState: (updates: Partial<GameState>) => void;
}

const formatNum = (val: number) => val.toLocaleString('ru-RU').replace(/\s/g, '\u00A0');

const FastTrackStat: React.FC<{ 
  title: string; 
  value?: number; 
  icon: React.ReactNode; 
  color: 'green' | 'red' | 'blue' | 'yellow' | 'indigo'; 
  subtext?: string;
  children?: React.ReactNode;
  prefix?: string;
  progress?: number;
}> = ({ title, value, icon, color, subtext, children, prefix = '$', progress }) => {
    const colors = { 
        green: 'bg-green-100 text-green-700', 
        red: 'bg-red-100 text-red-700', 
        blue: 'bg-blue-100 text-blue-700', 
        yellow: 'bg-yellow-100 text-yellow-700',
        indigo: 'bg-indigo-100 text-indigo-700'
    };
    const textColors = { 
        green: 'text-green-800', 
        red: 'text-red-800', 
        blue: 'text-blue-800', 
        yellow: 'text-yellow-800',
        indigo: 'text-indigo-800'
    };
    
    return (
        <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100 shadow-sm flex flex-col justify-between h-full relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-1 sm:mb-2">
                <span className="text-[10px] sm:text-xs text-gray-500 font-semibold uppercase tracking-wider leading-tight pr-1 whitespace-normal break-words">
                    {title}
                </span>
                <div className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${colors[color]}`}>
                    {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-4 h-4 sm:w-5 h-5' })}
                </div>
            </div>
            <div>
                {progress !== undefined && (
                  <div className="w-full bg-gray-100 h-1 rounded-full mb-2 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${progress >= 100 ? 'bg-green-500' : 'bg-indigo-500'}`} 
                      style={{ width: `${Math.min(100, progress)}%` }}
                    />
                  </div>
                )}
                {children ? children : (
                  <div className={`text-lg sm:text-2xl font-bold font-mono whitespace-nowrap ${textColors[color]}`}>
                      {prefix}{formatNum(value || 0)}
                  </div>
                )}
                {subtext && <div className="text-[10px] sm:text-xs text-gray-500 mt-1 font-medium">{subtext}</div>}
            </div>
        </div>
    );
};

const HoldPaydayButton: React.FC<{ 
    onPayday: () => void;
}> = ({ onPayday }) => {
    const [progress, setProgress] = useState(0);
    const holdDuration = 1500;
    const timerRef = useRef<number | null>(null);
    const startTimeRef = useRef<number>(0);

    const startHold = () => {
        startTimeRef.current = Date.now();
        timerRef.current = window.setInterval(() => {
            const elapsed = Date.now() - startTimeRef.current;
            const newProgress = Math.min(100, (elapsed / holdDuration) * 100);
            setProgress(newProgress);
            
            if (elapsed >= holdDuration) {
                stopHold(true);
            }
        }, 16);
    };

    const stopHold = (complete: boolean = false) => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        if (complete) {
            onPayday();
        }
        setProgress(0);
    };

    return (
        <button 
            onMouseDown={startHold}
            onMouseUp={() => stopHold()}
            onMouseLeave={() => stopHold()}
            onTouchStart={startHold}
            onTouchEnd={() => stopHold()}
            className="flex-1 max-w-[200px] relative overflow-hidden flex flex-col items-center justify-center gap-1 bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-600 text-slate-900 py-3 px-2 rounded-2xl transition-all active:translate-y-[1px] pointer-events-auto select-none touch-none shadow-none"
        >
            <div 
                className="absolute inset-0 bg-white/40 pointer-events-none transition-all duration-75 origin-left" 
                style={{ transform: `scaleX(${progress / 100})` }}
            />
            
            <DollarSignIcon className="w-5 h-5 relative z-10" />
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest relative z-10">CASHFLOW</span>
            
            {progress > 0 && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
                    <div className="h-full bg-white transition-all duration-75" style={{ width: `${progress}%` }} />
                </div>
            )}
        </button>
    );
};

interface FastTrackExpensesModalProps {
    state: GameState;
    updateState: (updates: Partial<GameState>) => void;
    onClose: () => void;
}

const FastTrackExpensesModal: React.FC<FastTrackExpensesModalProps> = ({ state, updateState, onClose }) => {
    const [selectedEvent, setSelectedEvent] = useState<'audit' | 'divorce' | 'lawsuit' | null>(null);

    const handleApply = () => {
        let newCash = state.fastTrackCash;
        if (selectedEvent === 'audit') newCash = Math.floor(newCash / 2);
        else if (selectedEvent === 'divorce') newCash = 0;
        else if (selectedEvent === 'lawsuit') newCash = Math.floor(newCash / 2);
        
        updateState({ fastTrackCash: newCash });
        onClose();
    };

    const events = [
        { id: 'audit', label: 'Налоговая проверка', sub: 'Потеря 1/2 всех наличных' },
        { id: 'divorce', label: 'Развод', sub: 'Потеря всех наличных' },
        { id: 'lawsuit', label: 'Судебный иск', sub: 'Потеря 1/2 всех наличных' }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-md overflow-hidden transform transition-all border border-slate-200">
                <div className="bg-red-600 px-6 py-4 text-white flex justify-between items-center">
                    <h2 className="font-heading font-bold text-xl flex items-center gap-3">
                        <TrashIcon className="w-5 h-5 text-white" />
                        События
                    </h2>
                    <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="p-6 space-y-4">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2 text-center">Выберите событие:</p>
                    <div className="space-y-3">
                        {events.map(event => (
                            <div 
                                key={event.id}
                                onClick={() => setSelectedEvent(event.id as any)}
                                className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer ${selectedEvent === event.id ? 'bg-red-50 border-red-500 shadow-sm' : 'bg-slate-50 border-slate-100 hover:border-slate-200'}`}
                            >
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedEvent === event.id ? 'bg-red-500 border-red-500' : 'bg-white border-slate-300'}`}>
                                    {selectedEvent === event.id && <div className="w-2.5 h-2.5 bg-white rounded-full shadow-inner" />}
                                </div>
                                <div className="flex flex-col">
                                    <span className={`font-bold transition-colors ${selectedEvent === event.id ? 'text-red-700' : 'text-slate-700'}`}>{event.label}</span>
                                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-tight">{event.sub}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button 
                        onClick={handleApply}
                        disabled={!selectedEvent}
                        className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-md transition-all mt-6 uppercase tracking-widest text-sm active:scale-[0.98]"
                    >
                        Оплатить
                    </button>
                </div>
            </div>
        </div>
    );
};

interface FastTrackBuyModalProps {
    state: GameState;
    updateState: (updates: Partial<GameState>) => void;
    onClose: () => void;
}

const FastTrackBuyModal: React.FC<FastTrackBuyModalProps> = ({ state, updateState, onClose }) => {
    const [type, setType] = useState<'business' | 'dream' | 'opportunity'>('business');
    
    const [price, setPrice] = useState('');
    const [income, setIncome] = useState('');
    const [name, setName] = useState('');
    
    const [oppType, setOppType] = useState<'cash' | 'business'>('cash');
    const [isPaid, setIsPaid] = useState(false);
    const [isSuccessful, setIsSuccessful] = useState<boolean | null>(null);
    const [winAmount, setWinAmount] = useState('');

    const resetForm = () => {
        setPrice('');
        setIncome('');
        setName('');
        setWinAmount('');
        setIsPaid(false);
        setIsSuccessful(null);
    };

    const handleBuyBusiness = () => {
        const p = parseFloat(price) || 0;
        const i = parseFloat(income) || 0;
        if (state.fastTrackCash < p) return alert("Недостаточно наличных!");

        const newAsset: Asset = {
            id: uuidv4(),
            name: name || 'Бизнес (Фаст-Трек)',
            cost: p,
            downPayment: p,
            cashflow: i,
            count: 1
        };

        updateState({
            fastTrackCash: state.fastTrackCash - p,
            fastTrackBusinessInvestments: [...state.fastTrackBusinessInvestments, newAsset]
        });
        onClose();
    };

    const handleBuyDream = () => {
        const p = parseFloat(price) || 0;
        if (state.fastTrackCash < p) return alert("Недостаточно наличных!");

        updateState({
            fastTrackCash: state.fastTrackCash - p
        });
        onClose();
    };

    const handlePayOpportunity = () => {
        const p = parseFloat(price) || 0;
        if (state.fastTrackCash < p) return alert("Недостаточно наличных!");
        
        updateState({
            fastTrackCash: state.fastTrackCash - p
        });
        setIsPaid(true);
    };

    const handleOpportunityFinish = () => {
        if (oppType === 'cash') {
            const win = parseFloat(winAmount) || 0;
            updateState({
                fastTrackCash: state.fastTrackCash + win
            });
        } else {
            const p = parseFloat(price) || 0;
            const inc = parseFloat(income) || 0;
            const newAsset: Asset = {
                id: uuidv4(),
                name: name || 'Бизнес (Возможность)',
                cost: p,
                downPayment: p,
                cashflow: inc,
                count: 1
            };
            updateState({
                fastTrackBusinessInvestments: [...state.fastTrackBusinessInvestments, newAsset]
            });
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-sm xs overflow-hidden transform transition-all border border-slate-200">
                <div className="bg-slate-900 px-6 py-4 text-white flex justify-between items-center">
                    <h2 className="font-heading font-bold text-xl flex items-center gap-3">
                        <ShoppingCartIcon className="w-5 h-5 text-yellow-500" />
                        Купить
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="p-6">
                    <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
                        <button 
                            onClick={() => { setType('business'); resetForm(); }}
                            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${type === 'business' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Бизнес
                        </button>
                        <button 
                            onClick={() => { setType('dream'); resetForm(); }}
                            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${type === 'dream' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Мечта
                        </button>
                        <button 
                            onClick={() => { setType('opportunity'); resetForm(); }}
                            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${type === 'opportunity' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Возможность
                        </button>
                    </div>

                    <div className="space-y-4">
                        {type === 'business' && (
                            <div className="animate-in slide-in-from-right-4 duration-300 space-y-4">
                                <Input label="Название" placeholder="Сеть ресторанов" value={name} onChange={setName} />
                                <Input label="Цена" type="number" currency value={price} onChange={setPrice} />
                                <Input label="Доход" type="number" currency value={income} onChange={setIncome} />
                                <button 
                                    onClick={handleBuyBusiness}
                                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg transition-all mt-4 uppercase tracking-widest text-sm"
                                >
                                    Купить
                                </button>
                            </div>
                        )}

                        {type === 'dream' && (
                            <div className="animate-in slide-in-from-right-4 duration-300 space-y-4">
                                <Input label="Цена мечты" type="number" currency value={price} onChange={setPrice} />
                                <button 
                                    onClick={handleBuyDream}
                                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold py-4 rounded-xl shadow-lg transition-all mt-4 uppercase tracking-widest text-sm"
                                >
                                    Купить
                                </button>
                            </div>
                        )}

                        {type === 'opportunity' && (
                            <div className="animate-in slide-in-from-right-4 duration-300 space-y-4">
                                {!isPaid ? (
                                    <>
                                        <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                                            <button 
                                                onClick={() => setOppType('cash')}
                                                className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-md transition-all ${oppType === 'cash' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
                                            >
                                                Наличные
                                            </button>
                                            <button 
                                                onClick={() => setOppType('business')}
                                                className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-md transition-all ${oppType === 'business' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
                                            >
                                                Бизнес
                                            </button>
                                        </div>
                                        <Input label="Цена входа" type="number" currency value={price} onChange={setPrice} />
                                        <button 
                                            onClick={handlePayOpportunity}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all mt-4 uppercase tracking-widest text-sm"
                                        >
                                            Оплатить
                                        </button>
                                    </>
                                ) : isSuccessful === null ? (
                                    <div className="text-center py-8 space-y-6">
                                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-blue-600">
                                            <TrendingUpIcon className="w-8 h-8" />
                                        </div>
                                        <p className="font-bold text-slate-700">Сделка была успешной?</p>
                                        <div className="flex gap-4">
                                            <button 
                                                onClick={onClose}
                                                className="flex-1 py-3 bg-red-100 text-red-600 font-bold rounded-xl hover:bg-red-200 transition-colors"
                                            >
                                                Нет
                                            </button>
                                            <button 
                                                onClick={() => setIsSuccessful(true)}
                                                className="flex-1 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 shadow-md transition-colors"
                                            >
                                                Да
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="animate-in zoom-in-95 duration-200 space-y-4">
                                        {oppType === 'cash' ? (
                                            <Input label="Сумма к зачислению" type="number" currency value={winAmount} onChange={setWinAmount} autoFocus />
                                        ) : (
                                            <>
                                                <Input label="Название бизнеса" placeholder="Новый актив" value={name} onChange={setName} autoFocus />
                                                <Input label="Доход" type="number" currency value={income} onChange={setIncome} />
                                            </>
                                        )}
                                        <button 
                                            onClick={handleOpportunityFinish}
                                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all mt-4 uppercase tracking-widest text-sm"
                                        >
                                            {oppType === 'cash' ? 'Зачислить' : 'Добавить'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const FastTrack: React.FC<FastTrackProps> = ({ state, updateState }) => {
  const [isBuyModalOpen, setBuyModalOpen] = useState(false);
  const [isExpensesModalOpen, setExpensesModalOpen] = useState(false);

  const handleNumChange = (field: keyof GameState, value: string) => {
    const num = parseFloat(value) || 0;
    updateState({ [field]: num });
  };

  const addInvestment = () => {
    const newAsset: Asset = {
      id: uuidv4(),
      name: 'Бизнес инвестиция',
      cost: 0,
      downPayment: 0,
      cashflow: 0,
      count: 1
    };
    updateState({ fastTrackBusinessInvestments: [...state.fastTrackBusinessInvestments, newAsset] });
  };

  const updateInvestment = (id: string, field: keyof Asset, value: string | number) => {
    const updated = state.fastTrackBusinessInvestments.map(a => a.id === id ? { ...a, [field]: value } : a);
    updateState({ fastTrackBusinessInvestments: updated });
  };

  const removeInvestment = (id: string) => {
    updateState({ fastTrackBusinessInvestments: state.fastTrackBusinessInvestments.filter(a => a.id !== id) });
  };

  const handlePayday = () => {
    const paydayAmount = state.fastTrackSumBusinessIncome 
        ? (state.fastTrackCashflowDayIncome + investmentIncome)
        : state.fastTrackCashflowDayIncome;
    updateState({ fastTrackCash: (state.fastTrackCash || 0) + paydayAmount });
  };

  const investmentIncome = state.fastTrackBusinessInvestments.reduce((sum, a) => sum + (Number(a.cashflow) || 0), 0);
  
  const businessGoalPlan = 50000;
  const businessGoalProgress = (investmentIncome / businessGoalPlan) * 100;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24">
      
      {/* Stats Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
          <FastTrackStat 
            title="Цель (бизнес-доход)" 
            value={investmentIncome}
            color="indigo" 
            icon={<TrendingUpIcon />}
            subtext={`из $${formatNum(businessGoalPlan)}`}
            progress={businessGoalProgress}
          />

          <FastTrackStat 
            title="Наличные" 
            value={state.fastTrackCash}
            color="yellow" 
            icon={<WalletIcon />}
          />

          <FastTrackStat 
            title="CASHFLOW" 
            value={state.fastTrackCashflowDayIncome} 
            color="green" 
            icon={<DollarSignIcon />} 
            prefix="$"
          />
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-6 pt-3 flex gap-2 sm:gap-3 justify-center pointer-events-none animate-in slide-in-from-bottom-full duration-500">
          <button 
            onClick={() => setExpensesModalOpen(true)} 
            className="flex-1 max-w-[200px] flex flex-col items-center justify-center gap-1 bg-red-600 hover:bg-red-700 active:scale-95 text-white py-3 px-2 rounded-2xl transition-all pointer-events-auto shadow-none"
          >
            <TrashIcon className="w-5 h-5" />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Расходы</span>
          </button>

          <button 
            onClick={() => setBuyModalOpen(true)} 
            className="flex-1 max-w-[200px] flex flex-col items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white py-3 px-2 rounded-2xl transition-all pointer-events-auto shadow-none"
          >
            <ShoppingCartIcon className="w-5 h-5" />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Купить</span>
          </button>

          <HoldPaydayButton onPayday={handlePayday} />
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card title="Управление доходами" color="bg-slate-800">
           <div className="space-y-6">
               <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 shadow-inner">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">Стартовый CASHFLOW</h3>
                    </div>
                    <Input 
                        type="number" 
                        currency 
                        label="Доходность дня CASHFLOW"
                        value={state.fastTrackCashflowDayIncome || ''} 
                        onChange={val => handleNumChange('fastTrackCashflowDayIncome', val)} 
                    />
               </div>

               <div className="space-y-4">
                   <div className="flex justify-between items-center px-1">
                       <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">Новые Бизнесы</h3>
                       <button onClick={addInvestment} className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-md active:scale-90 transition-all">
                           <PlusIcon className="w-5 h-5"/>
                       </button>
                   </div>
                   
                   <div className="space-y-3">
                       {state.fastTrackBusinessInvestments.map(inv => (
                           <div key={inv.id} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative group">
                               <div className="grid grid-cols-12 gap-3 items-end">
                                   <div className="col-span-7">
                                       <Input label="Название бизнеса" value={inv.name} onChange={val => updateInvestment(inv.id, 'name', val)} />
                                   </div>
                                   <div className="col-span-4">
                                       <Input label="Пассивный доход" type="number" currency value={inv.cashflow} onChange={val => updateInvestment(inv.id, 'cashflow', parseFloat(val) || 0)} />
                                   </div>
                                   <div className="col-span-1 flex justify-center pb-2">
                                       <button onClick={() => removeInvestment(inv.id)} className="text-red-300 hover:text-red-600 transition-colors">
                                           <TrashIcon className="w-5 h-5" />
                                       </button>
                                   </div>
                               </div>
                           </div>
                       ))}
                       
                       {state.fastTrackBusinessInvestments.length === 0 && (
                           <div className="text-sm text-gray-400 italic text-center py-10 border-2 border-dashed border-gray-200 rounded-3xl">
                               Покупайте бизнесы на Быстром Пути,<br/> чтобы увеличить свой доход
                           </div>
                       )}
                   </div>

                   <div className="mt-4 pt-4 border-t border-slate-100">
                        <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-all group">
                            <input 
                                type="checkbox" 
                                checked={state.fastTrackSumBusinessIncome} 
                                onChange={e => updateState({ fastTrackSumBusinessIncome: e.target.checked })} 
                                className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">Суммировать доход от бизнеса</span>
                                <span className="text-[10px] text-slate-400 font-medium">Прибавлять доход от новых бизнесов к CASHFLOW</span>
                            </div>
                        </label>
                   </div>
               </div>

               <div className="pt-4 border-t border-slate-100 flex justify-between items-center px-2">
                   <span className="text-xs font-bold text-slate-400 uppercase">Доход от инвестиций:</span>
                   <span className="font-mono font-bold text-lg text-blue-600 whitespace-nowrap">+${formatNum(investmentIncome)}</span>
               </div>
           </div>
        </Card>
      </div>

      {isBuyModalOpen && (
          <FastTrackBuyModal 
            state={state} 
            updateState={updateState} 
            onClose={() => setBuyModalOpen(false)} 
          />
      )}

      {isExpensesModalOpen && (
          <FastTrackExpensesModal 
            state={state} 
            updateState={updateState} 
            onClose={() => setExpensesModalOpen(false)} 
          />
      )}
    </div>
  );
};
