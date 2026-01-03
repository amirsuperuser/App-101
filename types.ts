
export interface Asset {
  id: string;
  name: string;
  cost: number;
  downPayment: number;
  cashflow: number; // Income generated
  count: number; // For stocks mainly
  isShort?: boolean; // For short selling stocks
}

export interface Liability {
  id: string;
  name: string;
  amount: number;
  payment: number; // Monthly expense
}

export interface GameState {
  // Personal Info
  profession: string;
  player: string;
  auditor: string;
  goal: string; // "Dream"

  // Rat Race Income
  salary: number;
  dividends: number;

  // Assets (Generate Income)
  realEstateAssets: Asset[];
  businessAssets: Asset[];
  stockAssets: Asset[];

  // Liabilities (Generate Expenses)
  homeMortgage: number;
  schoolLoans: number;
  carLoans: number;
  creditCardDebt: number;
  retailDebt: number;
  bankLoan: number; // Principal bank loan amount
  otherLiabilities: number; 
  
  // Expenses (Monthly outflows)
  taxes: number;
  homeMortgagePayment: number;
  schoolLoanPayment: number;
  carLoanPayment: number;
  creditCardPayment: number;
  retailPayment: number;
  otherExpenses: number;
  bankLoanPayment: number;

  // Children
  childCount: number;
  perChildExpense: number;

  // Fast Track
  isOnFastTrack: boolean;
  fastTrackStartPassiveIncome: number;
  fastTrackCashflowDayIncome: number;
  fastTrackCash: number; // Balance on Fast Track
  fastTrackBusinessInvestments: Asset[];
  winningPassiveIncomeGoal: number;
  fastTrackSumBusinessIncome: boolean;
}

export const getInitialState = (): GameState => ({
  profession: '',
  player: '',
  auditor: '',
  goal: '',
  
  salary: 0,
  dividends: 0,
  
  realEstateAssets: [],
  businessAssets: [],
  stockAssets: [],
  
  homeMortgage: 0,
  schoolLoans: 0,
  carLoans: 0,
  creditCardDebt: 0,
  retailDebt: 0,
  bankLoan: 0,
  otherLiabilities: 0,
  
  taxes: 0,
  homeMortgagePayment: 0,
  schoolLoanPayment: 0,
  carLoanPayment: 0,
  creditCardPayment: 0,
  retailPayment: 0,
  otherExpenses: 0,
  bankLoanPayment: 0,
  
  childCount: 0,
  perChildExpense: 0,

  isOnFastTrack: false,
  fastTrackStartPassiveIncome: 0,
  fastTrackCashflowDayIncome: 0,
  fastTrackCash: 0,
  fastTrackBusinessInvestments: [],
  winningPassiveIncomeGoal: 50000,
  fastTrackSumBusinessIncome: false,
});
