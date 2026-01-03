
import React, { useState, useEffect } from 'react';
import { GameState, Asset } from '../types';
import { Card, Input } from './UI';
import { TrashIcon, PlusIcon, ShoppingCartIcon, XIcon, HomeIcon, BriefcaseIcon, WalletIcon, TrendingUpIcon, PieChartIcon, ChevronDownIcon, ChevronUpIcon, DollarSignIcon, CalculatorIcon } from './Icons';
import { v4 as uuidv4 } from 'uuid';

// Helper for formatting
const formatNum = (val: number) => val.toLocaleString('ru-RU').replace(/\s/g, '\u00A0');

interface BankTransaction {
  type: 'take' | 'repay' | 'close_passive';
  amount: number;
  newBalance?: number;
  newPayment?: number;
  passiveName?: string;
}

interface CreditModalProps {
  state: GameState;
  monthlyCashflow: number;
  onClose: () => void;
  updateState: (updates: Partial<GameState>) => void;
  onSuccess: (tx: BankTransaction) => void;
}

const CreditModal: React.FC<CreditModalProps> = ({ state, monthlyCashflow, onClose, updateState, onSuccess }) => {
  const [activeTab, setActiveTab] = useState<'credit' | 'close_passive'>('credit');
  const [creditMode, setCreditMode] = useState<'take' | 'repay'>('take');
  const [amount, setAmount] = useState<string>('');
  
  const [selectedPassive, setSelectedPassive] = useState<{key: keyof GameState, pKey: keyof GameState, label: string} | null>(null);
  const [repayAmountInput, setRepayAmountInput] = useState<string>('');

  const rawMaxLoan = Math.max(0, monthlyCashflow * 10);
  const maxLoan = Math.floor(rawMaxLoan / 1000) * 1000;
  
  const isValidAmount = (val: number) => val > 0 && val % 1000 === 0;

  const handleBankLoanOp = () => {
    const num = parseFloat(amount) || 0;
    if (creditMode === 'take') {
      if (!isValidAmount(num) || num > maxLoan) return;
      const newPrincipal = (state.bankLoan || 0) + num;
      const newPayment = Math.round(newPrincipal * 0.1);
      updateState({ bankLoan: newPrincipal, bankLoanPayment: newPayment });
      onSuccess({ type: 'take', amount: num, newBalance: newPrincipal, newPayment: newPayment });
    } else {
      if (!isValidAmount(num) || num > (state.bankLoan || 0)) return;
      const newPrincipal = (state.bankLoan || 0) - num;
      const newPayment = Math.round(newPrincipal * 0.1);
      updateState({ bankLoan: newPrincipal, bankLoanPayment: newPayment });
      onSuccess({ type: 'repay', amount: num, newBalance: newPrincipal, newPayment: newPayment });
    }
    onClose();
  };

  const handleClosePassive = () => {
    if (!selectedPassive) return;
    const debtAmount = (state[selectedPassive.key] as number) || 0;
    
    updateState({
      [selectedPassive.key]: 0,
      [selectedPassive.pKey]: 0
    });
    
    onSuccess({
      type: 'close_passive',
      amount: debtAmount,
      passiveName: selectedPassive.label
    });
    
    onClose();
  };

  const passivesList = [
    { label: 'Ипотека', key: 'homeMortgage' as keyof GameState, pKey: 'homeMortgagePayment' as keyof GameState },
    { label: 'Кредит на образование', key: 'schoolLoans' as keyof GameState, pKey: 'schoolLoanPayment' as keyof GameState },
    { label: 'Кредит на машину', key: 'carLoans' as keyof GameState, pKey: 'carLoanPayment' as keyof GameState },
    { label: 'Кредитные карточки', key: 'creditCardDebt' as keyof GameState, pKey: 'creditCardPayment' as keyof GameState },
    { label: 'Мелкие кредиты', key: 'retailDebt' as keyof GameState, pKey: 'retailPayment' as keyof GameState },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
        <div className="bg-indigo-700 px-6 py-4 flex justify-between items-center text-white">
            <h2 className="font-heading font-bold text-xl flex items-center gap-2">
                <CalculatorIcon className="w-5 h-5" />
                Банк
            </h2>
            <button onClick={onClose} className="text-indigo-100 hover:text-white transition-colors">
                <XIcon className="w-6 h-6" />
            </button>
        </div>
        
        <div className="p-6">
            <div className="flex border-b border-gray-200 mb-6">
                <button 
                  onClick={() => setActiveTab('credit')} 
                  className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'credit' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Кредит
                </button>
                <button 
                  onClick={() => setActiveTab('close_passive')} 
                  className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'close_passive' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Закрыть пассив
                </button>
            </div>

            {activeTab === 'credit' ? (
              <div className="space-y-4 animate-in slide-in-from-left-4 duration-300">
                <div className="flex flex-col gap-2 mb-4">
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                    <input 
                      type="radio" 
                      name="creditMode" 
                      checked={creditMode === 'take'} 
                      onChange={() => setCreditMode('take')} 
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-bold text-slate-700">Взять кредит</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                    <input 
                      type="radio" 
                      name="creditMode" 
                      checked={creditMode === 'repay'} 
                      onChange={() => setCreditMode('repay')} 
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-bold text-slate-700">Погасить кредит</span>
                  </label>
                </div>

                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-indigo-700 font-medium">{creditMode === 'take' ? 'Доступный лимит:' : 'Текущий долг:'}</span>
                    <span className="font-bold text-indigo-900 whitespace-nowrap">
                      ${formatNum(creditMode === 'take' ? maxLoan : (state.bankLoan || 0))}
                    </span>
                  </div>
                  {creditMode === 'take' && <div className="text-[10px] text-indigo-500 uppercase font-bold text-left">Кратно $1&nbsp;000 (округлено вниз)</div>}
                </div>

                <Input 
                  label={creditMode === 'take' ? "Сумма кредита" : "Сумма погашения"}
                  type="number" 
                  currency 
                  placeholder="3000" 
                  value={amount} 
                  onChange={val => setAmount(val)}
                  autoFocus
                />

                <div className="text-xs text-gray-500 italic">
                  {creditMode === 'take' ? 'Платеж составит 10% от суммы' : 'Погашение уменьшает ежемесячный платеж'}
                </div>

                <button 
                  onClick={handleBankLoanOp}
                  disabled={!isValidAmount(parseFloat(amount)) || parseFloat(amount) > (creditMode === 'take' ? maxLoan : (state.bankLoan || 0))}
                  className={`w-full ${creditMode === 'take' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white font-bold py-3 rounded-xl shadow-lg transition-all disabled:opacity-50`}
                >
                  {creditMode === 'take' ? 'Оформить кредит' : 'Внести платеж'}
                </button>
              </div>
            ) : (
              <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                {!selectedPassive ? (
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 text-center">Выберите пассив для погашения</div>
                    <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
                      {passivesList.map(p => {
                        const debt = (state[p.key] as number) || 0;
                        if (debt <= 0) return null;
                        return (
                          <button 
                            key={p.key}
                            onClick={() => { setSelectedPassive(p); setRepayAmountInput(''); }}
                            className="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 transition-all group"
                          >
                            <div className="text-left">
                              <div className="text-xs font-bold text-slate-800">{p.label}</div>
                              <div className="text-[10px] text-slate-400 uppercase font-bold">Долг: <span className="text-red-500 font-mono whitespace-nowrap">${formatNum(debt)}</span></div>
                            </div>
                          </button>
                        );
                      })}
                      {passivesList.every(p => ((state[p.key] as number) || 0) <= 0) && (
                        <div className="text-center py-10 text-gray-400 italic text-sm">Все фиксированные пассивы закрыты</div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 animate-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-start bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                      <div className="flex-grow">
                        <div className="text-[10px] text-indigo-400 uppercase font-black">Выбранный пассив</div>
                        <div className="flex justify-between items-center mt-0.5">
                           <span className="font-bold text-indigo-900">{selectedPassive.label}</span>
                           <span className="font-mono font-black text-red-600 ml-2 whitespace-nowrap">
                             ${formatNum(((state[selectedPassive.key] as number) || 0))}
                           </span>
                        </div>
                      </div>
                      <button onClick={() => setSelectedPassive(null)} className="text-indigo-400 hover:text-indigo-600 p-1 ml-2">
                        <XIcon className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                       <Input 
                          label="Введите сумму полного погашения"
                          type="number"
                          currency
                          placeholder="0"
                          value={repayAmountInput}
                          onChange={val => setRepayAmountInput(val)}
                          autoFocus
                       />
                       <p className="text-[10px] text-slate-400 italic mt-2 text-center">Долг должен быть погашен полностью</p>
                    </div>

                    <button 
                      onClick={handleClosePassive}
                      disabled={(parseFloat(repayAmountInput) || 0) !== ((state[selectedPassive.key] as number) || 0)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all disabled:opacity-50 uppercase tracking-widest text-sm"
                    >
                      Полное погашение
                    </button>
                    
                    <button onClick={() => setSelectedPassive(null)} className="w-full text-gray-400 hover:text-gray-600 text-xs font-bold uppercase py-1">Назад к списку</button>
                  </div>
                )}
              </div>
            )}
            
            <button onClick={onClose} className="w-full mt-6 text-gray-400 hover:text-gray-600 font-bold text-sm transition-colors uppercase tracking-wider">
                Отмена
            </button>
        </div>
      </div>
    </div>
  );
};

interface BankToastProps {
    transaction: BankTransaction;
    onClose: () => void;
}

const BankToast: React.FC<BankToastProps> = ({ transaction, onClose }) => {
    let title = "";
    let statusColor = "";
    let amountLabel = "";
    let balanceLabel = "Остаток долга";
    let paymentLabel = "Платеж по кредиту";
    
    if (transaction.type === 'take') {
      title = "Кредит оформлен";
      statusColor = "bg-indigo-600";
      amountLabel = "Сумма кредита";
    } else if (transaction.type === 'repay') {
      title = "Платеж внесен";
      statusColor = "bg-emerald-600";
      amountLabel = "Сумма платежа";
    } else {
      title = "Пассив закрыт";
      statusColor = "bg-blue-600";
      amountLabel = "Сумма погашения";
    }
    
    return (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-sm-xs overflow-hidden transform transition-all scale-100 border border-slate-200 animate-in zoom-in-95 duration-200">
                <div className={`${statusColor} px-6 py-4 flex justify-between items-center text-white`}>
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
                            <CalculatorIcon className="w-5 h-5" />
                        </div>
                        <h2 className="font-heading font-bold text-xl tracking-tight">{title}</h2>
                    </div>
                    <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 space-y-6">
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
                        {transaction.type === 'close_passive' && (
                          <div className="text-center pb-2 border-b border-slate-200 mb-2">
                             <div className="text-[10px] text-slate-400 uppercase font-bold">Пассив</div>
                             <div className="text-lg font-bold text-slate-800">{transaction.passiveName}</div>
                          </div>
                        )}
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 font-medium">{amountLabel}:</span>
                            <span className="font-mono font-bold text-slate-800 whitespace-nowrap">${formatNum(transaction.amount)}</span>
                        </div>
                        {transaction.type !== 'close_passive' && (
                          <>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 font-medium">{balanceLabel}:</span>
                                <span className="font-mono font-bold text-red-600 whitespace-nowrap">${formatNum(transaction.newBalance || 0)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 font-medium">{paymentLabel}:</span>
                                <span className="font-mono font-bold text-indigo-600 whitespace-nowrap">${formatNum(transaction.newPayment || 0)}</span>
                            </div>
                          </>
                        )}
                        {transaction.type === 'close_passive' && (
                          <div className="text-center pt-2 italic text-emerald-600 font-bold text-xs">
                             Пассив полностью погашен! Ежемесячный расход удален.
                          </div>
                        )}
                    </div>
                    <button onClick={onClose} className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 ${statusColor} hover:brightness-110 uppercase tracking-widest`}>Ок</button>
                </div>
            </div>
        </div>
    );
};

interface TransactionToastProps {
  transaction: {
    type: 'buy' | 'sell';
    assetName: string;
    price: number;
    count: number;
    total: number;
    isShort?: boolean;
    isStock?: boolean;
    assetType?: 'realEstateAssets' | 'businessAssets' | 'stockAssets';
    mortgage?: number;
    cashflow?: number;
  };
  onClose: () => void;
}

const TransactionToast: React.FC<TransactionToastProps> = ({ transaction, onClose }) => {
  const { type, assetName, price, count, total, isShort, isStock, assetType, mortgage, cashflow } = transaction;
  const isBuy = type === 'buy';
  const statusColor = isBuy ? 'bg-blue-600' : 'bg-emerald-600';
  
  let title = "Приказ исполнен";
  if (assetType === 'realEstateAssets') {
    title = isBuy ? "Недвижимость куплена" : "Недвижимость продана";
  } else if (assetType === 'businessAssets') {
    title = isBuy ? "Бизнес куплен" : "Бизнес продан";
  }

  const statusText = isBuy ? (isShort ? 'Короткая продажа' : 'Покупка') : (isShort ? 'Покрытие шорта' : 'Продажа');
  let totalLabel = isBuy ? (isStock ? "Сумма покупки" : "Первоначальный взнос") : ((isStock && !isShort) ? "Сумма продажи" : "Прибыль");
  const debtLabel = assetType === 'businessAssets' ? 'Пассив' : 'Ипотека';
  const displayCashflow = (isStock && cashflow !== undefined) ? cashflow * count : cashflow;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-sm-xs overflow-hidden transform transition-all scale-100 border border-slate-200 animate-in zoom-in-95 duration-200">
        <div className={`${statusColor} px-6 py-4 flex justify-between items-center text-white`}>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
              {isBuy ? <ShoppingCartIcon className="w-5 h-5" /> : <DollarSignIcon className="w-5 h-5" />}
            </div>
            <h2 className="font-heading font-bold text-xl tracking-tight">{title}</h2>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="text-center">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">{statusText}</div>
            <div className="text-2xl font-black text-slate-900 leading-tight">{assetName}</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 font-medium">Цена:</span>
              <span className="font-mono font-bold text-slate-800 whitespace-nowrap">${formatNum(price)}</span>
            </div>
            {(assetType === 'realEstateAssets' || assetType === 'businessAssets') && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">{debtLabel}:</span>
                <span className="font-mono font-bold text-red-600 whitespace-nowrap">${formatNum(mortgage || 0)}</span>
              </div>
            )}
            {isStock && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Количество:</span>
                <span className="font-mono font-bold text-slate-800">{count} шт.</span>
              </div>
            )}
            {displayCashflow !== undefined && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Денежный поток:</span>
                <span className={`font-mono font-bold whitespace-nowrap ${displayCashflow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {displayCashflow >= 0 ? '+' : ''}${formatNum(displayCashflow)}
                </span>
              </div>
            )}
            <div className="pt-3 border-t border-slate-200 flex justify-between items-end">
              <span className="text-[10px] text-slate-400 font-bold uppercase">{totalLabel}</span>
              <span className={`text-2xl font-mono font-black whitespace-nowrap ${!isBuy && total < 0 ? 'text-red-600' : (isBuy ? 'text-blue-600' : 'text-emerald-600')}`}>
                {total < 0 ? '-' : ''}${formatNum(Math.abs(total))}
              </span>
            </div>
          </div>
          <button onClick={onClose} className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 ${statusColor} hover:brightness-110 uppercase tracking-widest`}>Ок</button>
        </div>
      </div>
    </div>
  );
};

interface SellAssetModalProps {
  state: GameState;
  onClose: () => void;
  onConfirmSale: (type: 'realEstateAssets' | 'businessAssets' | 'stockAssets', id: string, sellCount: number, salePrice: number) => void;
}

const SellAssetModal: React.FC<SellAssetModalProps> = ({ state, onClose, onConfirmSale }) => {
  const [activeTab, setActiveTab] = useState<'realEstateAssets' | 'businessAssets' | 'stockAssets'>('realEstateAssets');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [salePrice, setSalePrice] = useState<string>('');
  const [sellCount, setSellCount] = useState<string>('');

  const assets = state[activeTab];

  const handleAssetSelect = (asset: Asset) => {
    setSelectedAsset(asset);
    setSalePrice('');
    setSellCount(''); 
  };

  const handleConfirmSale = () => {
    if (selectedAsset) {
      const count = activeTab === 'stockAssets' ? (parseFloat(sellCount) || 0) : 1;
      const price = parseFloat(salePrice) || 0;
      if (count <= 0 && activeTab === 'stockAssets') return;
      onConfirmSale(activeTab, selectedAsset.id, count, price);
      setSelectedAsset(null);
    }
  };

  const calculateDisplayValue = () => {
    if (!selectedAsset) return 0;
    const priceNum = parseFloat(salePrice) || 0;
    const countNum = activeTab === 'stockAssets' ? (parseFloat(sellCount) || 0) : 1;

    if (activeTab === 'stockAssets') {
      if (selectedAsset.isShort) return (selectedAsset.cost - priceNum) * countNum;
      return priceNum * countNum;
    } else {
      const mortgageNum = Math.max(0, (selectedAsset.cost || 0) - (selectedAsset.downPayment || 0));
      return priceNum - mortgageNum;
    }
  };

  const displayValue = calculateDisplayValue();
  const isNegative = displayValue < 0;
  const debtLabelText = activeTab === 'businessAssets' ? 'Пассив' : 'Ипотека';
  const leftColLabelText = (activeTab === 'realEstateAssets' || activeTab === 'businessAssets') ? "Взнос" : "Цена покупки";
  const rightColLabelText = (activeTab === 'realEstateAssets' || activeTab === 'businessAssets') ? "Цена" : "Сумма покупки";
  const highlightLabelText = (activeTab === 'stockAssets' && selectedAsset?.isShort) || (activeTab !== 'stockAssets') ? 'Прибыль' : 'Сумма продажи';
  const formulaLabelText = activeTab === 'stockAssets' ? (selectedAsset?.isShort ? '(Цена покупки - Цена продажи) * Количество' : 'Цена продажи * Количество') : `Цена продажи - ${debtLabelText}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all scale-100">
        <div className="bg-green-700 px-6 py-4 flex justify-between items-center text-white">
            <h2 className="font-heading font-bold text-xl flex items-center gap-2">
                <DollarSignIcon className="w-5 h-5" />
                {selectedAsset ? 'Оформление продажи' : 'Выберите актив для продажи'}
            </h2>
            <button onClick={onClose} className="text-green-100 hover:text-white transition-colors">
                <XIcon className="w-6 h-6" />
            </button>
        </div>
        <div className="p-6">
            {!selectedAsset ? (
              <>
                <div className="flex border-b border-gray-200 mb-6">
                    <button onClick={() => setActiveTab('realEstateAssets')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'realEstateAssets' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-400 hover:text-gray-600'}`}>Недвижимость</button>
                    <button onClick={() => setActiveTab('businessAssets')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'businessAssets' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-400 hover:text-gray-600'}`}>Бизнес</button>
                    <button onClick={() => setActiveTab('stockAssets')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'stockAssets' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-400 hover:text-gray-600'}`}>Ценные бумаги</button>
                </div>
                <div className="max-h-[50vh] overflow-y-auto space-y-3 pr-2">
                    {assets.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 italic">У вас пока нет активов в этой категории</div>
                    ) : (
                        assets.map(asset => {
                            const currentMortgage = Math.max(0, asset.cost - asset.downPayment);
                            return (
                                <button key={asset.id} onClick={() => handleAssetSelect(asset)} className="w-full text-left flex items-center justify-between p-5 bg-gray-50 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50/30 transition-all group">
                                    <div className="flex-grow">
                                        <div className="font-black text-slate-800 text-lg flex items-center gap-2 mb-1">
                                            {asset.name}
                                            {asset.isShort && <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded uppercase font-bold whitespace-nowrap">Короткая сделка</span>}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm font-bold uppercase tracking-tight text-gray-500">
                                            {activeTab === 'stockAssets' ? (
                                                <div className="flex gap-4">
                                                    <span>{asset.isShort ? 'Шорт' : 'Цена'}: <span className="text-slate-900 whitespace-nowrap">${formatNum(asset.cost)}</span></span>
                                                    <span>Количество: <span className="text-slate-900">{asset.count}</span></span>
                                                </div>
                                            ) : (
                                                <div className="flex gap-6 items-baseline">
                                                    <span>Поток: <span className="text-green-600 text-lg font-mono whitespace-nowrap">${formatNum(asset.cashflow)}</span></span>
                                                    <span>{debtLabelText}: <span className="text-red-600 text-lg font-mono whitespace-nowrap">${formatNum(currentMortgage)}</span></span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
              </>
            ) : (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="text-xs text-gray-500 uppercase font-bold mb-1 text-center sm:text-left">Продаваемый актив</div>
                      <div className="text-xl font-bold text-slate-900 flex items-center justify-center sm:justify-start gap-2">
                        {selectedAsset?.name || ''}
                        {selectedAsset?.isShort && <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded uppercase font-bold whitespace-nowrap">Короткая сделка</span>}
                      </div>
                      <div className={`grid grid-cols-3 gap-x-1 sm:gap-4 mt-4 pt-4 border-t border-slate-200 items-baseline`}>
                          <div className="flex flex-col overflow-hidden">
                              <div className="text-[7.5px] sm:text-[9px] text-gray-400 uppercase font-black truncate mb-0.5">{leftColLabelText}</div>
                              <div className="font-mono font-bold text-lg sm:text-2xl leading-none text-slate-800 whitespace-nowrap">${formatNum(activeTab === 'stockAssets' ? (selectedAsset?.cost || 0) : (selectedAsset?.downPayment || 0))}</div>
                          </div>
                          <div className="flex flex-col overflow-hidden px-0.5">
                              {activeTab === 'stockAssets' ? (
                                <>
                                  <div className="text-[7.5px] sm:text-[9px] text-gray-400 uppercase font-black truncate mb-0.5 text-center sm:text-left">Количество</div>
                                  <div className="font-mono font-bold text-lg sm:text-2xl leading-none text-slate-800 truncate text-center sm:text-left">{selectedAsset?.count || 0}</div>
                                </>
                              ) : (
                                <>
                                  <div className="text-[7.5px] sm:text-[9px] text-gray-400 uppercase font-black truncate mb-0.5">{debtLabelText}</div>
                                  <div className="font-mono font-bold text-lg sm:text-2xl leading-none text-red-600 truncate whitespace-nowrap">-${formatNum((selectedAsset?.cost || 0) - (selectedAsset?.downPayment || 0))}</div>
                                </>
                              )}
                          </div>
                          <div className="flex flex-col overflow-hidden text-right">
                              <div className="text-[7.5px] sm:text-[9px] text-gray-400 uppercase font-black truncate mb-0.5">{rightColLabelText}</div>
                              <div className="font-mono font-bold text-lg sm:text-2xl leading-none text-blue-600 truncate whitespace-nowrap">
                                {activeTab === 'stockAssets' ? `$${formatNum((selectedAsset?.cost || 0) * (selectedAsset?.count || 0))}` : `$${formatNum(selectedAsset?.cost || 0)}`}
                              </div>
                          </div>
                      </div>
                  </div>
                  <div className="space-y-4">
                      <div className={`p-4 rounded-lg border flex justify-between items-center transition-colors ${isNegative ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                          <div className="flex-1 pr-2">
                              <div className={`text-xs font-bold uppercase ${isNegative ? 'text-red-700' : 'text-green-700'}`}>{highlightLabelText}</div>
                              <div className={`text-[10px] italic leading-tight ${isNegative ? 'text-red-600' : 'text-green-600'}`}>{formulaLabelText}</div>
                          </div>
                          <div className={`text-2xl sm:text-3xl font-mono font-bold flex-shrink-0 whitespace-nowrap ${isNegative ? 'text-red-700' : 'text-green-700'}`}>{displayValue >= 0 ? '$' : '-$'}{formatNum(Math.abs(displayValue))}</div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label={activeTab === 'stockAssets' && selectedAsset?.isShort ? "Цена обратной покупки" : "Цена продажи (по сделке)"} type="number" currency placeholder="0" value={salePrice} onChange={val => setSalePrice(val)} autoFocus />
                        {activeTab === 'stockAssets' && (
                          <Input label="Количество" type="number" placeholder="0" max={selectedAsset?.count || 0} value={sellCount} onChange={val => setSellCount(Math.min(parseFloat(val) || 0, selectedAsset?.count || 0).toString())} />
                        )}
                      </div>
                  </div>
                  <div className="flex gap-3">
                      <button onClick={() => setSelectedAsset(null)} className="flex-1 px-4 sm:px-6 py-3 border-2 border-gray-200 text-gray-500 font-bold rounded-xl hover:bg-gray-50 transition-colors text-sm sm:text-base">Назад</button>
                      <button onClick={handleConfirmSale} disabled={activeTab === 'stockAssets' && (!sellCount || parseFloat(sellCount) <= 0)} className="flex-[2] px-4 sm:px-6 py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm sm:text-base"> {activeTab === 'stockAssets' ? 'Выставить приказ' : 'Подтвердить'}</button>
                  </div>
              </div>
            )}
            <div className="mt-8 flex justify-center"><button onClick={onClose} className="px-8 py-2 text-gray-500 font-bold hover:text-gray-700 transition-colors uppercase tracking-wider">Закрыть</button></div>
        </div>
      </div>
    </div>
  );
};

interface BuyAssetModalProps {
  onClose: () => void;
  onSave: (asset: Asset, type: 'realEstateAssets' | 'businessAssets' | 'stockAssets') => void;
}

const BuyAssetModal: React.FC<BuyAssetModalProps> = ({ onClose, onSave }) => {
  const [type, setType] = useState<'realEstateAssets' | 'businessAssets' | 'stockAssets'>('realEstateAssets');
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [downPayment, setDownPayment] = useState('');
  const [count, setCount] = useState(''); 
  const [mortgage, setMortgage] = useState('');
  const [cashflow, setCashflow] = useState('');
  const [isShort, setIsShort] = useState(false);

  useEffect(() => {
    if (type === 'stockAssets') {
      setMortgage('');
      return;
    }
    const p = parseFloat(cost) || 0;
    const dp = parseFloat(downPayment) || 0;
    const m = Math.max(0, p - dp);
    if (cost !== '' || downPayment !== '') {
      setMortgage(m > 0 ? m.toString() : '0');
    }
  }, [cost, downPayment, type]);

  const handleSave = () => {
    const costNum = parseFloat(cost) || 0;
    const downPaymentNum = parseFloat(downPayment) || 0;
    const cashflowNum = parseFloat(cashflow) || 0;
    const countNum = count === '' ? (type === 'stockAssets' ? 0 : 1) : (parseFloat(count) || 0);

    const newAsset: Asset = {
      id: uuidv4(),
      name: name || (type === 'realEstateAssets' ? 'Дом' : type === 'businessAssets' ? 'Предприятие' : 'Акции'),
      cost: costNum,
      downPayment: type === 'stockAssets' ? costNum * countNum : downPaymentNum,
      cashflow: cashflowNum,
      count: countNum,
      isShort: type === 'stockAssets' ? isShort : false
    };

    onSave(newAsset, type);
    onClose();
  };
  
  const getPlaceholder = () => {
    if (type === 'realEstateAssets') return 'Дом';
    if (type === 'businessAssets') return 'Предприятие';
    return 'Акции';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden transform transition-all scale-100">
        <div className="bg-slate-900 px-6 py-4 flex justify-between items-center text-white">
            <h2 className="font-heading font-bold text-xl flex items-center gap-2">
                <ShoppingCartIcon className="w-5 h-5" />
                Купить
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                <XIcon className="w-6 h-6" />
            </button>
        </div>
        <div className="p-6 space-y-6">
            <div className="flex justify-center">
              <div className="grid grid-cols-3 gap-1 p-1 bg-gray-100 rounded-lg w-full max-w-md">
                  <button onClick={() => setType('realEstateAssets')} className={`flex flex-col items-center justify-center py-2 rounded-md text-[10px] font-bold transition-all ${type === 'realEstateAssets' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}><HomeIcon className="w-4 h-4 mb-1" /> Недвижимость</button>
                  <button onClick={() => setType('businessAssets')} className={`flex flex-col items-center justify-center py-2 rounded-md text-[10px] font-bold transition-all ${type === 'businessAssets' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}><BriefcaseIcon className="w-4 h-4 mb-1" /> Бизнес</button>
                  <button onClick={() => setType('stockAssets')} className={`flex flex-col items-center justify-center py-2 rounded-md text-[10px] font-bold transition-all ${type === 'stockAssets' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}><TrendingUpIcon className="w-4 h-4 mb-1" /> Ценные бумаги</button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div className="flex flex-col gap-2">
                  <Input label="Название" placeholder={getPlaceholder()} value={name} onChange={val => setName(val)} autoFocus />
                  {type === 'stockAssets' && (
                    <label className="flex items-center gap-2 cursor-pointer mt-1">
                      <input type="checkbox" checked={isShort} onChange={e => setIsShort(e.target.checked)} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"/>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Короткая сделка</span>
                    </label>
                  )}
                </div>
                {type === 'stockAssets' ? (
                  <>
                    <Input label={isShort ? "Цена продажи" : "Цена покупки"} type="number" currency placeholder="0" value={cost} onChange={val => setCost(val)} />
                    <Input label="Количество" type="number" placeholder="0" value={count} onChange={val => setCount(val)} />
                    <Input label="Денежный поток" type="number" currency placeholder="0" value={cashflow} onChange={val => setCashflow(val)} />
                    <div className="hidden md:block"></div>
                  </>
                ) : (
                  <>
                    <Input label="Первоначальный взнос" type="number" currency placeholder="0" value={downPayment} onChange={val => setDownPayment(val)} />
                    <Input label="Цена покупки" type="number" currency placeholder="0" value={cost} onChange={val => setCost(val)} />
                    <Input label={type === 'businessAssets' ? 'Пассив' : 'Ипотека'} type="number" currency placeholder="0" value={mortgage} readOnly className="opacity-80"/>
                    <Input label="Денежный поток" type="number" currency placeholder="0" value={cashflow} onChange={val => setCashflow(val)} />
                  </>
                )}
            </div>
            <div className="flex justify-center">
              <button onClick={handleSave} className="w-full max-w-xs bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 mt-4 uppercase tracking-widest">
                  {type === 'stockAssets' ? 'Выставить приказ' : 'Купить'}
              </button>
            </div>
        </div>
      </div>
    </div>
  );
};

const DashboardStat: React.FC<{ title: string; value: number; icon: React.ReactNode; color: 'green' | 'red' | 'blue' | 'yellow'; subtext?: string; progress?: number; }> = ({ title, value, icon, color, subtext, progress }) => {
    const colors = { green: 'bg-green-100 text-green-700', red: 'bg-red-100 text-red-700', blue: 'bg-blue-100 text-blue-700', yellow: 'bg-yellow-100 text-yellow-700' };
    const textColors = { green: 'text-green-800', red: 'text-red-800', blue: 'text-blue-800', yellow: 'text-yellow-800' };
    
    return (
        <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100 shadow-sm flex flex-col justify-between h-full relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-1 sm:mb-2">
                <span className="text-[10px] sm:text-xs text-gray-500 font-semibold uppercase tracking-wider leading-tight pr-1 whitespace-normal break-words">{title}</span>
                <div className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${colors[color]}`}>{React.cloneElement(icon as React.ReactElement<any>, { className: 'w-4 h-4 sm:w-5 h-5' })}</div>
            </div>
            <div>
                {progress !== undefined && (
                    <div className="w-full bg-gray-100 h-1 sm:h-1.5 mb-2 sm:mb-3 rounded-full overflow-hidden">
                        <div className="bg-green-500 h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, progress)}%` }}></div>
                    </div>
                )}
                <div className={`text-lg sm:text-2xl font-bold font-mono whitespace-nowrap ${textColors[color]}`}>${formatNum(value)}</div>
                {subtext && <div className="hidden sm:block text-[10px] sm:text-xs text-gray-500 mt-1 font-medium">{subtext}</div>}
            </div>
        </div>
    );
};

// Added missing RatRaceProps interface definition.
interface RatRaceProps {
  state: GameState;
  updateState: (updates: Partial<GameState>) => void;
}

export const RatRace: React.FC<RatRaceProps> = ({ state, updateState }) => {
  const [isBuyModalOpen, setBuyModalOpen] = useState(false);
  const [isSellModalOpen, setSellModalOpen] = useState(false);
  const [isCreditModalOpen, setCreditModalOpen] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<TransactionToastProps['transaction'] | null>(null);
  const [lastBankTransaction, setLastBankTransaction] = useState<BankTransaction | null>(null);
  
  const [incomeCollapsed, setIncomeCollapsed] = useState(false);
  const [expensesCollapsed, setExpensesCollapsed] = useState(false);
  const [assetsCollapsed, setAssetsCollapsed] = useState(false);
  const [liabilitiesCollapsed, setLiabilitiesCollapsed] = useState(false);

  const handleNumChange = (field: keyof GameState, value: string) => {
    const num = parseFloat(value) || 0;
    const updates: Partial<GameState> = { [field]: num };
    if (num === 0) {
        if (field === 'homeMortgage') updates.homeMortgagePayment = 0;
        if (field === 'schoolLoans') updates.schoolLoanPayment = 0;
        if (field === 'carLoans') updates.carLoanPayment = 0;
        if (field === 'creditCardDebt') updates.creditCardPayment = 0;
        if (field === 'retailDebt') updates.retailPayment = 0;
        if (field === 'bankLoan') updates.bankLoanPayment = 0;
    }
    updateState(updates);
  };

  const updateAsset = (type: 'realEstateAssets' | 'businessAssets' | 'stockAssets', id: string, field: keyof Asset, value: string | number) => {
    const updated = state[type].map(a => a.id === id ? { ...a, [field]: value } : a);
    updateState({ [type]: updated });
  };

  const handleSellConfirm = (type: 'realEstateAssets' | 'businessAssets' | 'stockAssets', id: string, sellCount: number, salePrice: number) => {
    const asset = state[type].find(a => a.id === id);
    if (!asset) return;
    const isStock = type === 'stockAssets';
    let totalValue = isStock ? (asset.isShort ? (asset.cost - salePrice) * sellCount : salePrice * sellCount) : (salePrice - Math.max(0, asset.cost - asset.downPayment));
    setLastTransaction({ type: 'sell', assetName: asset.name, price: salePrice, count: isStock ? sellCount : 1, total: totalValue, isShort: asset.isShort, isStock, assetType: type, mortgage: Math.max(0, asset.cost - asset.downPayment), cashflow: asset.cashflow });
    if (isStock) {
        if (asset.count > sellCount) updateState({ stockAssets: state.stockAssets.map(a => a.id === id ? { ...a, count: a.count - sellCount } : a) });
        else updateState({ stockAssets: state.stockAssets.filter(a => a.id !== id) });
    } else updateState({ [type]: state[type].filter(a => a.id !== id) });
  };

  const removeAsset = (type: 'realEstateAssets' | 'businessAssets' | 'stockAssets', id: string) => updateState({ [type]: state[type].filter(a => a.id !== id) });

  const handleBuy = (asset: Asset, type: 'realEstateAssets' | 'businessAssets' | 'stockAssets') => {
      const isStock = type === 'stockAssets';
      setLastTransaction({ type: 'buy', assetName: asset.name, price: asset.cost, count: asset.count, total: isStock ? asset.cost * asset.count : asset.downPayment, isShort: asset.isShort, isStock, assetType: type, mortgage: Math.max(0, asset.cost - asset.downPayment), cashflow: asset.cashflow });
      updateState({ [type]: [...state[type], asset] });
  };

  const totalPassiveIncome = 
    state.realEstateAssets.reduce((sum, a) => sum + ((Number(a.cashflow) || 0) * (Number(a.count) || 1)), 0) + 
    state.businessAssets.reduce((sum, a) => sum + ((Number(a.cashflow) || 0) * (Number(a.count) || 1)), 0) + 
    state.stockAssets.reduce((sum, a) => sum + ((Number(a.cashflow) || 0) * (Number(a.count) || 1)), 0) +
    (Number(state.dividends) || 0);

  const totalIncome = (state.salary || 0) + totalPassiveIncome;
  const totalExpenses = (state.taxes || 0) + (state.homeMortgagePayment || 0) + (state.schoolLoanPayment || 0) + (state.carLoanPayment || 0) + (state.creditCardPayment || 0) + (state.retailPayment || 0) + (state.otherExpenses || 0) + (state.bankLoanPayment || 0) + ((state.childCount || 0) * (state.perChildExpense || 0));
  const monthlyCashflow = totalIncome - totalExpenses;
  const progressToFreedom = totalExpenses > 0 ? (totalPassiveIncome / totalExpenses) * 100 : 0;
  const longStocks = state.stockAssets.filter(a => !a.isShort);
  const shortStocks = state.stockAssets.filter(a => a.isShort);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-24">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          <DashboardStat title="Ежемесячный денежный поток" value={monthlyCashflow} color="yellow" icon={<WalletIcon className="w-5 h-5"/>} subtext="День выплат (Payday)"/>
          <DashboardStat title="Пассивный Доход" value={totalPassiveIncome} color="green" icon={<TrendingUpIcon className="w-5 h-5"/>} subtext={`Цель: > $${formatNum(totalExpenses)}`} progress={progressToFreedom}/>
          <DashboardStat title="Общий Расход" value={totalExpenses} color="red" icon={<PieChartIcon className="w-5 h-5"/>} />
          <DashboardStat title="Общий Доход" value={totalIncome} color="blue" icon={<PlusIcon className="w-5 h-5"/>} subtext="Зарплата + Пассивный"/>
      </div>
      
      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-6 pt-3 flex gap-2 sm:gap-4 justify-center pointer-events-none animate-in slide-in-from-bottom-full duration-500">
          <button 
            onClick={() => setSellModalOpen(true)} 
            className="flex-1 max-w-[200px] flex flex-col items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white py-3 px-2 rounded-2xl shadow-lg transition-all pointer-events-auto"
          >
            <DollarSignIcon className="w-5 h-5" />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Продать</span>
          </button>
          
          <button 
            onClick={() => setBuyModalOpen(true)} 
            className="flex-1 max-w-[200px] flex flex-col items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white py-3 px-2 rounded-2xl shadow-lg transition-all pointer-events-auto"
          >
            <ShoppingCartIcon className="w-5 h-5" />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Купить</span>
          </button>
          
          <button 
            onClick={() => setCreditModalOpen(true)} 
            className="flex-1 max-w-[200px] flex flex-col items-center justify-center gap-1 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white py-3 px-2 rounded-2xl shadow-lg transition-all pointer-events-auto"
          >
            <CalculatorIcon className="w-5 h-5" />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Банк</span>
          </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card title="Ведомость">
            <div className="mb-4">
              <button onClick={() => setIncomeCollapsed(!incomeCollapsed)} className="w-full flex justify-between items-center border-b-2 border-slate-800 mb-2 pb-1 hover:bg-slate-50 transition-colors group"><h3 className="text-lg font-bold text-slate-900">Доходы</h3>{incomeCollapsed ? <ChevronDownIcon className="w-5 h-5 text-slate-400 group-hover:text-slate-600" /> : <ChevronUpIcon className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />}</button>
              {!incomeCollapsed && (
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                  <div className="flex justify-between items-center min-h-[44px]"><span className="font-medium text-gray-700">Зарплата:</span><Input type="number" currency className="w-32 flex-shrink-0" value={state.salary || ''} onChange={val => handleNumChange('salary', val)} placeholder="0" /></div>
                  <div className="mt-2 pt-2 border-t border-dashed border-gray-300 space-y-4">
                    <div className="flex justify-between items-center min-h-[44px] pl-2 mb-1"><span className="text-sm font-bold text-gray-500 uppercase tracking-widest truncate pr-2">Дивиденды:</span><Input type="number" currency className="w-32 flex-shrink-0" value={state.dividends || ''} onChange={val => handleNumChange('dividends', val)} placeholder="0" /></div>
                    <div><div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Недвижимость:</div>{state.realEstateAssets.length === 0 && <div className="text-[10px] text-gray-400 italic pl-2">Нет активов</div>}{state.realEstateAssets.map(asset => (<div key={asset.id} className="flex justify-between items-center min-h-[44px] pl-2 mb-1"><span className="text-sm text-gray-700 truncate pr-2" title={asset.name}>{asset.name}:</span><Input type="number" currency className="w-32 flex-shrink-0" value={asset.cashflow || ''} onChange={val => updateAsset('realEstateAssets', asset.id, 'cashflow', parseFloat(val) || 0)} placeholder="0" /></div>))}</div>
                    <div><div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Бизнес:</div>{state.businessAssets.length === 0 && <div className="text-[10px] text-gray-400 italic pl-2">Нет активов</div>}{state.businessAssets.map(asset => (<div key={asset.id} className="flex justify-between items-center min-h-[44px] pl-2 mb-1"><span className="text-sm text-gray-700 truncate pr-2" title={asset.name}>{asset.name}:</span><Input type="number" currency className="w-32 flex-shrink-0" value={asset.cashflow || ''} onChange={val => updateAsset('businessAssets', asset.id, 'cashflow', parseFloat(val) || 0)} placeholder="0" /></div>))}</div>
                    <div><div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Ценные бумаги:</div>{state.stockAssets.filter(a => (a.cashflow || 0) !== 0).length === 0 && <div className="text-[10px] text-gray-400 italic pl-2">Нет доходных бумаг</div>}{state.stockAssets.filter(a => (a.cashflow || 0) !== 0).map(asset => (<div key={asset.id} className="flex justify-between items-center min-h-[44px] pl-2 mb-1"><div className="flex items-center gap-2 pr-2 truncate"><span className="text-sm text-gray-700 truncate" title={asset.name}>{asset.name}</span>{asset.isShort && <span className="text-[9px] font-bold bg-orange-100 text-orange-600 px-1 rounded border border-orange-200 flex-shrink-0 whitespace-nowrap">Короткая сделка</span>}</div><div className="flex items-center gap-1">{asset.count > 1 && <span className="text-[10px] text-gray-400 font-mono">x{asset.count}</span>}<Input type="number" currency className="w-32 flex-shrink-0" value={asset.cashflow || ''} onChange={val => updateAsset('stockAssets', asset.id, 'cashflow', parseFloat(val) || 0)} placeholder="0" /></div></div>))}</div>
                  </div>
                  <div className="flex justify-between items-center bg-green-50 p-3 rounded border border-green-100 mt-4"><span className="font-bold text-green-900">Общий Доход:</span><span className="font-bold text-green-700 text-lg whitespace-nowrap">${formatNum(totalIncome)}</span></div>
                </div>
              )}
            </div>
            <div>
              <button onClick={() => setExpensesCollapsed(!expensesCollapsed)} className="w-full flex justify-between items-center border-b-2 border-slate-800 mb-2 pb-1 hover:bg-slate-50 transition-colors group"><h3 className="text-lg font-bold text-slate-900">Расходы</h3>{expensesCollapsed ? <ChevronDownIcon className="w-5 h-5 text-slate-400 group-hover:text-slate-600" /> : <ChevronUpIcon className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />}</button>
              {!expensesCollapsed && (
                <div className="space-y-2 text-sm animate-in slide-in-from-top-2 duration-200">
                  {[{ l: 'Налоги', k: 'taxes' }, { l: 'Платеж по ипотеке', k: 'homeMortgagePayment' }, { l: 'Выплата по кредиту на образование', k: 'schoolLoanPayment' }, { l: 'Выплата по кредиту на машину', k: 'carLoanPayment' }, { l: 'Выплата по кредитным карточкам', k: 'creditCardPayment' }, { l: 'Выплата по мелким кредитам', k: 'retailPayment' }, { l: 'Прочие расходы', k: 'otherExpenses' }, { l: 'Кредит банка', k: 'bankLoanPayment' }].map((item) => (
                    <div key={item.k} className="flex justify-between items-center min-h-[44px]"><span className="text-gray-700 pr-2">{item.l}:</span><Input type="number" currency className="w-32 flex-shrink-0" value={state[item.k as keyof GameState] as number || ''} onChange={val => handleNumChange(item.k as keyof GameState, val)} placeholder="0" /></div>
                  ))}
                  <div className="p-3 bg-blue-50 rounded border border-blue-100 space-y-2 mt-4"><div className="flex justify-between items-center"><span className="font-bold text-blue-900">Количество детей:</span><div className="flex items-center gap-2"><button onClick={() => updateState({ childCount: Math.max(0, (state.childCount || 0) - 1) })} className="w-8 h-8 bg-white rounded border border-blue-300 text-blue-600 flex items-center justify-center font-bold hover:bg-blue-50">-</button><span className="w-8 text-center font-bold">{state.childCount || 0}</span><button onClick={() => updateState({ childCount: (state.childCount || 0) + 1 })} className="w-8 h-8 bg-white rounded border border-blue-300 text-blue-600 flex items-center justify-center font-bold hover:bg-blue-50">+</button></div></div><div className="flex justify-between items-center min-h-[44px]"><span className="text-blue-800 font-medium">Расходы на ребенка:</span><Input type="number" currency className="w-32 flex-shrink-0" value={state.perChildExpense || ''} onChange={val => handleNumChange('perChildExpense', val)} placeholder="0" /></div><div className="flex justify-between border-t border-blue-200 pt-1"><span className="text-blue-900 font-medium">Итого на детей:</span><span className="font-bold whitespace-nowrap">${formatNum((state.childCount || 0) * (state.perChildExpense || 0))}</span></div></div>
                  <div className="flex justify-between items-center bg-red-50 p-2 rounded border border-red-100 mt-2"><span className="font-bold text-red-900">Общий Расход:</span><span className="font-bold text-red-700 text-lg whitespace-nowrap">${formatNum(totalExpenses)}</span></div>
                </div>
              )}
            </div>
          </Card>
        </div>
        <div className="space-y-6">
          <Card title="Балансовый отчет" color="bg-slate-800">
            <div><div className="w-full flex justify-between items-center border-b-2 border-slate-700 mb-2 pb-1 text-slate-700 group"><button onClick={() => setAssetsCollapsed(!assetsCollapsed)} className="flex-grow text-left flex justify-between items-center"><h3 className="text-lg font-bold">Активы</h3>{assetsCollapsed ? <ChevronDownIcon className="w-5 h-5 text-slate-400 group-hover:text-slate-600" /> : <ChevronUpIcon className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />}</button></div>
              {!assetsCollapsed && (
                <div className="animate-in slide-in-from-top-2 duration-200">
                  <div className="mb-6"><div className="flex justify-between items-center mb-3"><span className="font-bold text-sm text-gray-700 uppercase tracking-widest border-l-4 border-blue-500 pl-2">Ценные бумаги</span></div><div className="mb-4 pl-1"><div className="flex justify-between items-center mb-2 px-1"><span className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">Акции</span></div>{longStocks.length > 0 && (<div className="grid grid-cols-12 gap-2 text-[10px] uppercase font-bold text-gray-400 mb-1 px-2"><div className="col-span-5">Название</div><div className="col-span-3">Цена</div><div className="col-span-3">Количество</div></div>)}{longStocks.map((asset) => (<div key={asset.id} className="grid grid-cols-12 gap-2 mb-2 items-center bg-gray-50 p-2 rounded relative"><div className="col-span-5"><Input placeholder="Символ" value={asset.name} onChange={val => updateAsset('stockAssets', asset.id, 'name', val)} className="text-xs" /></div><div className="col-span-3"><Input type="number" placeholder="Цена" value={asset.cost} onChange={val => updateAsset('stockAssets', asset.id, 'cost', parseFloat(val))} className="text-xs" /></div><div className="col-span-3"><Input type="number" placeholder="Кол-во" value={asset.count} onChange={val => updateAsset('stockAssets', asset.id, 'count', parseFloat(val))} className="text-xs" /></div><div className="col-span-1 flex justify-end"><button onClick={() => removeAsset('stockAssets', asset.id)} className="text-red-400 hover:text-red-600"><TrashIcon className="w-4 h-4" /></button></div></div>))}{longStocks.length === 0 && <div className="text-[10px] text-gray-400 italic mb-2 px-2">Нет акций</div>}</div><div className="mt-4 pl-1 border-t border-gray-100 pt-3"><div className="flex justify-between items-center mb-2 px-1"><span className="text-[11px] font-bold text-orange-600 uppercase tracking-tight">Короткие сделки</span></div>{shortStocks.length > 0 && (<div className="grid grid-cols-12 gap-2 text-[10px] uppercase font-bold text-gray-400 mb-1 px-2"><div className="col-span-5">Название</div><div className="col-span-3">Цена</div><div className="col-span-3">Количество</div></div>)}{shortStocks.map((asset) => (<div key={asset.id} className="grid grid-cols-12 gap-2 mb-2 items-center bg-orange-50/30 p-2 rounded border border-orange-50 relative"><div className="col-span-5"><Input placeholder="Символ" value={asset.name} onChange={val => updateAsset('stockAssets', asset.id, 'name', val)} className="text-xs bg-white/50" /></div><div className="col-span-3"><Input type="number" placeholder="Цена" value={asset.cost} onChange={val => updateAsset('stockAssets', asset.id, 'cost', parseFloat(val))} className="text-xs bg-white/50" /></div><div className="col-span-3"><Input type="number" placeholder="Кол-во" value={asset.count} onChange={val => updateAsset('stockAssets', asset.id, 'count', parseFloat(val))} className="text-xs bg-white/50" /></div><div className="col-span-1 flex justify-end"><button onClick={() => removeAsset('stockAssets', asset.id)} className="text-red-400 hover:text-red-600"><TrashIcon className="w-4 h-4" /></button></div></div>))}{shortStocks.length === 0 && <div className="text-[10px] text-gray-400 italic px-2">Нет коротких сделок</div>}</div></div>
                  <div className="mb-4 border-t border-gray-200 pt-2"><div className="flex justify-between items-center mb-2"><span className="font-semibold text-sm text-gray-600 uppercase tracking-tighter">Недвижимость</span></div>{state.realEstateAssets.length > 0 && (<div className="grid grid-cols-12 gap-2 text-[10px] uppercase font-bold text-gray-400 mb-1 px-2"><div className="col-span-4">Название</div><div className="col-span-3">Взнос</div><div className="col-span-3">Цена</div></div>)}{state.realEstateAssets.map((asset) => (<div key={asset.id} className="grid grid-cols-12 gap-2 mb-2 items-center bg-gray-50 p-2 rounded relative group hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-200"><div className="col-span-4"><Input value={asset.name} onChange={val => updateAsset('realEstateAssets', asset.id, 'name', val)} className="text-xs" /></div><div className="col-span-3"><Input type="number" value={asset.downPayment} onChange={val => updateAsset('realEstateAssets', asset.id, 'downPayment', parseFloat(val))} className="text-xs" /></div><div className="col-span-3"><Input type="number" value={asset.cost} onChange={val => updateAsset('realEstateAssets', asset.id, 'cost', parseFloat(val))} className="text-xs" /></div><div className="col-span-2 flex items-center justify-between"><div className={`text-xs font-bold pl-1 truncate whitespace-nowrap ${asset.cashflow >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatNum(asset.cashflow)}</div><button onClick={() => removeAsset('realEstateAssets', asset.id)} className="text-red-400 hover:text-red-600 ml-1"><TrashIcon className="w-3 h-3" /></button></div></div>))}</div>
                  <div className="mb-4 border-t border-gray-200 pt-2"><div className="flex justify-between items-center mb-2"><span className="font-semibold text-sm text-gray-600 uppercase tracking-tighter">Бизнес</span></div>{state.businessAssets.length > 0 && (<div className="grid grid-cols-12 gap-2 text-[10px] uppercase font-bold text-gray-400 mb-1 px-2"><div className="col-span-4">Название</div><div className="col-span-3">Взнос</div><div className="col-span-3">Цена</div></div>)}{state.businessAssets.map((asset) => (<div key={asset.id} className="grid grid-cols-12 gap-2 mb-2 items-center bg-gray-50 p-2 rounded relative group hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-200"><div className="col-span-4"><Input value={asset.name} onChange={val => updateAsset('businessAssets', asset.id, 'name', val)} className="text-xs" placeholder="Название" /></div><div className="col-span-3"><Input type="number" value={asset.downPayment} onChange={val => updateAsset('businessAssets', asset.id, 'downPayment', parseFloat(val))} className="text-xs" placeholder="Взнос" /></div><div className="col-span-3"><Input type="number" value={asset.cost} onChange={val => updateAsset('businessAssets', asset.id, 'cost', parseFloat(val))} className="text-xs" placeholder="Стоим." /></div><div className="col-span-2 flex items-center justify-between"><div className="text-xs font-bold text-green-600 pl-1 truncate whitespace-nowrap">{formatNum(asset.cashflow)}</div><button onClick={() => removeAsset('businessAssets', asset.id)} className="text-red-400 hover:text-red-600 ml-1"><TrashIcon className="w-3 h-3" /></button></div></div>))}</div>
                </div>
              )}
            </div>
            <div className="mt-8"><button onClick={() => setLiabilitiesCollapsed(!liabilitiesCollapsed)} className="w-full flex justify-between items-center border-b-2 border-slate-700 mb-2 pb-1 text-slate-700 hover:bg-slate-50 transition-colors group"><h3 className="text-lg font-bold">Пассивы</h3>{liabilitiesCollapsed ? <ChevronDownIcon className="w-5 h-5 text-slate-400 group-hover:text-slate-600" /> : <ChevronUpIcon className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />}</button>
              {!liabilitiesCollapsed && (
                <div className="space-y-2 text-sm animate-in slide-in-from-top-2 duration-200">
                  {[{ l: 'Ипотека', k: 'homeMortgage' }, { l: 'Кредит на образование', k: 'schoolLoans' }, { l: 'Кредит на машину', k: 'carLoans' }, { l: 'Кредитные карточки', k: 'creditCardDebt' }, { l: 'Мелкие кредиты', k: 'retailDebt' }].map((item) => (
                    <div key={item.k} className="flex justify-between items-center min-h-[44px]"><span className="text-gray-700 pr-2">{item.l}:</span><Input type="number" currency className="w-32 flex-shrink-0" value={state[item.k as keyof GameState] as number || ''} onChange={val => handleNumChange(item.k as keyof GameState, val)} placeholder="0" /></div>
                  ))}
                  {(state.bankLoan || 0) > 0 && (
                    <div className="flex justify-between items-center min-h-[44px] border-t border-indigo-100 pt-1">
                      <span className="text-indigo-700 font-bold pr-2">Кредит банка:</span>
                      <Input 
                        type="number" 
                        currency 
                        className="w-32 flex-shrink-0 bg-indigo-50/50" 
                        value={state.bankLoan || ''} 
                        onChange={val => handleNumChange('bankLoan', val)} 
                        placeholder="0" 
                      />
                    </div>
                  )}
                  {state.realEstateAssets.length > 0 && (<div className="pt-2 border-t border-dashed border-gray-300"><span className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Ипотека на Недвижимость:</span>{state.realEstateAssets.map(asset => { const debt = Math.max(0, asset.cost - asset.downPayment); if (debt <= 0) return null; return (<div key={asset.id} className="flex justify-between items-center text-xs text-gray-600 pl-2 mb-1"><span>{asset.name}</span><span className="font-mono text-red-600 whitespace-nowrap">${formatNum(debt)}</span></div>); })}</div>)}
                  {state.businessAssets.length > 0 && (<div className="pt-2 border-t border-dashed border-gray-300"><span className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Пассив на бизнес:</span>{state.businessAssets.map(asset => { const debt = Math.max(0, asset.cost - asset.downPayment); if (debt <= 0) return null; return (<div key={asset.id} className="flex justify-between items-center text-xs text-gray-600 pl-2 mb-1"><span>{asset.name}</span><span className="font-mono text-red-600 whitespace-nowrap">${formatNum(debt)}</span></div>); })}</div>)}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
      {isBuyModalOpen && (<BuyAssetModal onClose={() => setBuyModalOpen(false)} onSave={handleBuy} />)}
      {isSellModalOpen && (<SellAssetModal state={state} onClose={() => setSellModalOpen(false)} onConfirmSale={handleSellConfirm} />)}
      {isCreditModalOpen && (
        <CreditModal 
          state={state} 
          monthlyCashflow={monthlyCashflow} 
          onClose={() => setCreditModalOpen(false)} 
          updateState={updateState} 
          onSuccess={(tx) => setLastBankTransaction(tx)}
        />
      )}
      {lastTransaction && (<TransactionToast transaction={lastTransaction} onClose={() => setLastTransaction(null)} />)}
      {lastBankTransaction && (<BankToast transaction={lastBankTransaction} onClose={() => setLastBankTransaction(null)} />)}
    </div>
  );
};
