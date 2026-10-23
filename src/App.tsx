import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  PieChart,
  Home,
  Settings,
  Plus,
  X,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  DollarSign,
  Users,
  Check,
  RefreshCw,
  Calculator,
  Landmark,
  CreditCard,
  Building,
  Sparkles,
  Share2,
  Download,
} from 'lucide-react';

// --- Firebase SDK 임포트 및 초기화 ---
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCsH1TacFaRYFpaQ_WdPjFUPGFxJHurp_I',
  authDomain: 'account-book-3147f.firebaseapp.com',
  projectId: 'account-book-3147f',
  storageBucket: 'account-book-3147f.firebasestorage.app',
  messagingSenderId: '89055387989',
  appId: '1:89055387989:web:caf2e258c97b170dc70fdc',
  measurementId: 'G-LG88WK67DQ',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 한국 공휴일 (2026년 10월 예시)
const HOLIDAYS = {
  '2026-10-03': '개천절',
  '2026-10-05': '대체공휴일',
  '2026-10-09': '한글날',
};

export default function App() {
  const [activeTab, setActiveTab] = useState('calendar');
  const [ownerFilter, setOwnerFilter] = useState('전체');
  const [roomCode, setRoomCode] = useState(
    () => localStorage.getItem('roomCode') || 'sweet-home-2026'
  );
  const [tempRoomCode, setTempRoomCode] = useState(roomCode);
  const [syncStatus, setSyncStatus] = useState('실시간 연동중');

  // 실시간 Gemini AI 분석 호출 로직
  const [aiReport, setAiReport] = useState(() => localStorage.getItem('lastAiReport') || '');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const fetchAiReport = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      alert('Vercel 환경 변수에 VITE_GEMINI_API_KEY가 설정되지 않았습니다.');
      return;
    }
    setIsAiLoading(true);
    try {
// 1. 지출 상위 3개 항목
const topCats = categoryBreakdown.slice(0, 3).map(c => `${c.cat}: ${c.amt.toLocaleString()}원(${c.pct}%)`).join(', ');

// 2. 총자산 및 비중 계산
const totalGrossAsset = totalCash + totalRealEstate + totalStockEval;
const cashRatio = totalGrossAsset > 0 ? ((totalCash / totalGrossAsset) * 100).toFixed(1) : '0';
const stockRatio = totalGrossAsset > 0 ? ((totalStockEval / totalGrossAsset) * 100).toFixed(1) : '0';
const reRatio = totalGrossAsset > 0 ? ((totalRealEstate / totalGrossAsset) * 100).toFixed(1) : '0';
const debtRatio = netWorth > 0 ? ((totalLoanAmt / netWorth) * 100).toFixed(1) : '0';

// 3. 보유 주식/ETF 종목 정리
const stockListStr = filteredStocks.map(s => `${s.name}(보유 ${s.shares}주, 현재가 ${s.currentPrice.toLocaleString()}원)`).join(', ');

// 4. 자산관리 전문 PB 프롬프트
const prompt = `당신은 10년 차 공인 자산관리 전문가(PB)이자 현실적인 부부 재무 어드바이저입니다.
두루뭉술한 조언은 배제하고, 반드시 아래 제공된 [실제 부부 자산 및 가계 데이터 수치]를 직접 인용하며 명쾌하고 날카로운 종합 재무 진단 리포트를 작성해 주세요.

[실제 부부 자산 및 가계 데이터]
■ 순자산 포트폴리오 현황 (${ownerFilter} 기준)
- 총 순자산: ${netWorth.toLocaleString()}원 (목표: ${(targetAsset / 100000000).toFixed(1)}억원 중 ${targetAchievementRate.toFixed(1)}% 달성)
- 총 대출(부채): ${totalLoanAmt.toLocaleString()}원 (순자산 대비 부채 비율: ${debtRatio}%)
- 자산군별 비중:
* 예·적금/현금: ${totalCash.toLocaleString()}원 (${cashRatio}%)
* 주식/ETF 투자자산: ${totalStockEval.toLocaleString()}원 (${stockRatio}%) [투자 손익: ${totalStockProfit >= 0 ? '+' : ''}${totalStockProfit.toLocaleString()}원, 수익률: ${totalStockRate.toFixed(2)}%]
* 부동산/보증금: ${totalRealEstate.toLocaleString()}원 (${reRatio}%)
- 보유 주요 종목: ${stockListStr || '보유 종목 없음'}
- 목표 도달 전망: 월 저축 페이스(${monthlySavingEst.toLocaleString()}원) 유지 시 목표 달성까지 약 ${monthsToTarget}개월 소요 예상

■ 이번 달 소비 현금흐름 (${currentYear}년 ${currentMonth}월)
- 총 수입: ${reportIncome.toLocaleString()}원 / 총 지출: ${reportExpense.toLocaleString()}원 (월 예산: ${monthlyBudget.toLocaleString()}원)
- 잉여 자금(순저축): ${(reportIncome - reportExpense).toLocaleString()}원 (이번 달 저축률: ${savingsRate.toFixed(1)}%)
- 주요 지출 Top: ${topCats || '내역 없음'}

[리포트 작성 양식 - 가독성 높은 마크다운 소제목 활용]
1. ⚖️ 포트폴리오 비중 & 부채 리스크 진단 (대출 비율, 현금 vs 투자 비중의 적정성 및 투자 성과 평가)
2. 🎯 순자산 ${(targetAsset / 100000000).toFixed(1)}억 달성 로드맵 (현재 예상 소요 기간 ${monthsToTarget}개월을 단축하기 위한 자산 배분/투자 조언)
3. 🧭 이번 달 현금흐름 & 자금 배분 전략 (단순 생활비 아끼기가 아닌, 부부의 이번 달 잉여 저축금을 어디로 먼저 보낼지 우선순위 제시)`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || `HTTP ${res.status}`);
      }
      const reportText = data.candidates?.[0]?.content?.parts?.[0]?.text || '리포트를 생성하지 못했습니다.';
      setAiReport(reportText);
      localStorage.setItem('lastAiReport', reportText);
    } catch (e: any) {
      console.error('Gemini API Error:', e);
      alert(`[AI 오류 상세] ${e.message || e}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  // --- 기본 데이터 상태 ---
  const [transactions, setTransactions] = useState([
    {
      id: 1,
      date: '2026-10-01',
      type: '지출',
      category: '식비',
      amount: 99452,
      owner: '공동',
      memo: '이마트 트레이더스 장보기',
      isSpecial: false,
    },
    {
      id: 2,
      date: '2026-10-01',
      type: '수입',
      category: '부수입',
      amount: 75000,
      owner: '아내',
      memo: '당근마켓 판매',
      isSpecial: false,
    },
    {
      id: 3,
      date: '2026-10-02',
      type: '수입',
      category: '급여',
      amount: 4200000,
      owner: '남편',
      memo: '10월 급여',
      isSpecial: false,
    },
    {
      id: 4,
      date: '2026-10-03',
      type: '수입',
      category: '급여',
      amount: 3600000,
      owner: '아내',
      memo: '10월 급여',
      isSpecial: false,
    },
    {
      id: 5,
      date: '2026-10-05',
      type: '지출',
      category: '주거/통신',
      amount: 285000,
      owner: '공동',
      memo: '아파트 관리비 및 도시가스',
      isSpecial: false,
    },
    {
      id: 6,
      date: '2026-10-08',
      type: '지출',
      category: '외식/카페',
      amount: 68000,
      owner: '공동',
      memo: '주말 외식 (삼겹살)',
      isSpecial: false,
    },
    {
      id: 7,
      date: '2026-10-12',
      type: '지출',
      category: '용돈/기타',
      amount: 150000,
      owner: '남편',
      memo: '남편 개인 용돈 지출',
      isSpecial: true,
    },
    {
      id: 8,
      date: '2026-10-15',
      type: '지출',
      category: '쇼핑/생활',
      amount: 124000,
      owner: '아내',
      memo: '가을 침구류 및 생필품 구매',
      isSpecial: false,
    },
    {
      id: 9,
      date: '2026-10-18',
      type: '지출',
      category: '문화/여가',
      amount: 45000,
      owner: '공동',
      memo: '영화 관람 및 팝콘',
      isSpecial: false,
    },
  ]);

  const [accounts, setAccounts] = useState([
    {
      id: 1,
      owner: '남편',
      bank: '신한은행',
      name: '남편 급여/용돈 통장',
      balance: 4850000,
      rate: 0.1,
    },
    {
      id: 2,
      owner: '아내',
      bank: '토스뱅크',
      name: '아내 파킹/용돈 통장',
      balance: 6200000,
      rate: 2.0,
    },
    {
      id: 3,
      owner: '공동',
      bank: 'KB국민은행',
      name: '우리부부 생활비 통장',
      balance: 2450000,
      rate: 0.1,
    },
    {
      id: 4,
      owner: '공동',
      bank: '주택청약',
      name: '부부 청약저축 합산',
      balance: 18500000,
      rate: 2.8,
    },
  ]);

  const [realEstates, setRealEstates] = useState([
    { id: 1, owner: '공동', name: '송도 아파트 전세보증금', amount: 450000000 },
  ]);

  const [loans, setLoans] = useState([
    {
      id: 1,
      name: '전세자금대출 (버팀목/시중은행)',
      amount: 220000000,
      rate: 3.4,
      owner: '공동',
    },
    {
      id: 2,
      name: '마이너스 통장 (비상금)',
      amount: 15000000,
      rate: 4.5,
      owner: '남편',
    },
  ]);

  const [stocks, setStocks] = useState([
    {
      id: 1,
      name: '삼성전자',
      code: '005930',
      shares: 120,
      avgPrice: 74000,
      currentPrice: 210000,
      owner: '남편',
    },
    {
      id: 2,
      name: 'TIGER 미국S&P500',
      code: '360750',
      shares: 400,
      avgPrice: 16500,
      currentPrice: 24850,
      owner: '공동',
    },
    {
      id: 3,
      name: 'KODEX 미국나스닥100TR',
      code: '379800',
      shares: 250,
      avgPrice: 15200,
      currentPrice: 23400,
      owner: '아내',
    },
  ]);

  const [targetAsset, setTargetAsset] = useState(500000000);
  const [monthlyBudget, setMonthlyBudget] = useState(2500000);
  const [includeSpecial, setIncludeSpecial] = useState(true);

  // --- 날짜 상태 ---
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(10);
  const [selectedDate, setSelectedDate] = useState('2026-10-15');

  // --- 모달 상태 (영수증, 통장, 대출, 부동산, 주식, 일괄시세, 평단계산기) ---
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [txForm, setTxForm] = useState({
    date: '2026-10-15',
    type: '지출',
    category: '식비',
    amount: '',
    owner: '공동',
    memo: '',
    isSpecial: false,
  });

  const [accountModal, setAccountModal] = useState({ open: false, item: null });
  const [loanModal, setLoanModal] = useState({ open: false, item: null });
  const [reModal, setReModal] = useState({ open: false, item: null });
  const [stockModal, setStockModal] = useState({ open: false, item: null });
  const [bulkPriceModal, setBulkPriceModal] = useState(false);

  // 평단가 물타기/불타기 계산기 상태
  const [calcStockId, setCalcStockId] = useState(1);
  const [addShares, setAddShares] = useState('50');
  const [addPrice, setAddPrice] = useState('205000');

  // --- Firebase 실시간 동기화 ---
  useEffect(() => {
    localStorage.setItem('roomCode', roomCode);
    const docRef = doc(db, 'budgets', roomCode);
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.transactions) setTransactions(data.transactions);
          if (data.accounts) setAccounts(data.accounts);
          if (data.realEstates) setRealEstates(data.realEstates);
          if (data.loans) setLoans(data.loans);
          if (data.stocks) setStocks(data.stocks);
          if (data.targetAsset) setTargetAsset(data.targetAsset);
          if (data.monthlyBudget) setMonthlyBudget(data.monthlyBudget);
          setSyncStatus(`실시간 연동중 (${roomCode})`);
        } else {
          setDoc(docRef, {
            transactions,
            accounts,
            realEstates,
            loans,
            stocks,
            targetAsset,
            monthlyBudget,
          });
          setSyncStatus(`새 공유방 생성됨 (${roomCode})`);
        }
      },
      (error) => {
        console.error(error);
        setSyncStatus('오프라인 저장 모드');
      }
    );

    return () => unsubscribe();
  }, [roomCode]);

  const syncToCloud = async (overrides = {}) => {
    const payload = {
      transactions: overrides.transactions ?? transactions,
      accounts: overrides.accounts ?? accounts,
      realEstates: overrides.realEstates ?? realEstates,
      loans: overrides.loans ?? loans,
      stocks: overrides.stocks ?? stocks,
      targetAsset: overrides.targetAsset ?? targetAsset,
      monthlyBudget: overrides.monthlyBudget ?? monthlyBudget,
    };
    try {
      await setDoc(doc(db, 'budgets', roomCode), payload);
    } catch (e) {
      console.error('Cloud sync error:', e);
    }
  };

  // --- 명의 필터링 헬퍼 ---
  const matchOwner = (itemOwner) => {
    if (ownerFilter === '전체') return true;
    return itemOwner === ownerFilter;
  };

  const monthPrefix = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
  const monthlyTxs = useMemo(() => {
    return transactions.filter(
      (t) => t.date.startsWith(monthPrefix) && matchOwner(t.owner)
    );
  }, [transactions, monthPrefix, ownerFilter]);

  // --- 캘린더 계산 ---
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayOfWeek =
    (new Date(currentYear, currentMonth - 1, 1).getDay() + 6) % 7; // 월요일=0 기준

  const totalMonthIncome = monthlyTxs
    .filter((t) => t.type === '수입')
    .reduce((a, b) => a + b.amount, 0);
  const totalMonthExpense = monthlyTxs
    .filter((t) => t.type === '지출')
    .reduce((a, b) => a + b.amount, 0);
  const avgDailyExpense = Math.round(totalMonthExpense / daysInMonth);

  const maxExpenseDayInfo = useMemo(() => {
    const map = {};
    monthlyTxs
      .filter((t) => t.type === '지출')
      .forEach((t) => {
        map[t.date] = (map[t.date] || 0) + t.amount;
      });
    let maxDate = '-';
    let maxAmt = 0;
    Object.entries(map).forEach(([d, amt]) => {
      if (amt > maxAmt) {
        maxAmt = amt;
        maxDate = `${Number(d.split('-')[2])}일`;
      }
    });
    return { maxDate, maxAmt };
  }, [monthlyTxs]);

  // --- 리포트 계산 ---
  const reportTxs = useMemo(() => {
    return monthlyTxs.filter((t) => (includeSpecial ? true : !t.isSpecial));
  }, [monthlyTxs, includeSpecial]);

  const reportIncome = reportTxs
    .filter((t) => t.type === '수입')
    .reduce((a, b) => a + b.amount, 0);
  const reportExpense = reportTxs
    .filter((t) => t.type === '지출')
    .reduce((a, b) => a + b.amount, 0);
  const savingsRate =
    reportIncome > 0
      ? Math.max(0, ((reportIncome - reportExpense) / reportIncome) * 100)
      : 0;
  const remainingBudget = monthlyBudget - reportExpense;
  const budgetProgress = Math.min(
    100,
    Math.round((reportExpense / monthlyBudget) * 100)
  );

  // 카테고리별 분석
  const categoryBreakdown = useMemo(() => {
    const map = {};
    reportTxs
      .filter((t) => t.type === '지출')
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });
    return Object.entries(map)
      .map(([cat, amt]) => ({
        cat,
        amt,
        pct: reportExpense > 0 ? Math.round((amt / reportExpense) * 100) : 0,
      }))
      .sort((a, b) => b.amt - a.amt);
  }, [reportTxs, reportExpense]);

  // --- 순자산 및 투자 계산 ---
  const filteredAccounts = accounts.filter((a) => matchOwner(a.owner));
  const filteredRealEstates = realEstates.filter((r) => matchOwner(r.owner));
  const filteredLoans = loans.filter((l) => matchOwner(l.owner));
  const filteredStocks = stocks.filter((s) => matchOwner(s.owner));

  const totalCash = filteredAccounts.reduce((a, b) => a + b.balance, 0);
  const totalRealEstate = filteredRealEstates.reduce((a, b) => a + b.amount, 0);
  const totalLoanAmt = filteredLoans.reduce((a, b) => a + b.amount, 0);
  const totalStockEval = filteredStocks.reduce(
    (a, b) => a + b.shares * b.currentPrice,
    0
  );
  const totalStockCost = filteredStocks.reduce(
    (a, b) => a + b.shares * b.avgPrice,
    0
  );
  const totalStockProfit = totalStockEval - totalStockCost;
  const totalStockRate =
    totalStockCost > 0 ? (totalStockProfit / totalStockCost) * 100 : 0;

  const netWorth = totalCash + totalRealEstate + totalStockEval - totalLoanAmt;
  const targetAchievementRate = Math.min(
    100,
    Math.max(0, (netWorth / targetAsset) * 100)
  );
  const monthlySavingEst = Math.max(500000, reportIncome - reportExpense);
  const monthsToTarget =
    netWorth >= targetAsset
      ? 0
      : Math.ceil((targetAsset - netWorth) / monthlySavingEst);

  // --- 영수증 추가/수정/삭제 핸들러 ---
  const openAddTxModal = (dateStr) => {
    setEditingTx(null);
    setTxForm({
      date: dateStr || selectedDate,
      type: '지출',
      category: '식비',
      amount: '',
      owner: ownerFilter === '전체' ? '공동' : ownerFilter,
      memo: '',
      isSpecial: false,
    });
    setIsTxModalOpen(true);
  };

  const openEditTxModal = (tx) => {
    setEditingTx(tx);
    setTxForm({ ...tx, amount: String(tx.amount) });
    setIsTxModalOpen(true);
  };

  const handleSaveTx = (e) => {
    e.preventDefault();
    if (!txForm.amount) return;
    let updated;
    if (editingTx) {
      updated = transactions.map((t) =>
        t.id === editingTx.id
          ? { ...txForm, id: editingTx.id, amount: Number(txForm.amount) }
          : t
      );
    } else {
      updated = [
        { ...txForm, id: Date.now(), amount: Number(txForm.amount) },
        ...transactions,
      ];
    }
    setTransactions(updated);
    syncToCloud({ transactions: updated });
    setIsTxModalOpen(false);
  };

  const handleDeleteTx = (id) => {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    syncToCloud({ transactions: updated });
  };

  // --- 자산 항목 저장/삭제 핸들러 ---
  const saveAccount = (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const item = {
      id: accountModal.item?.id || Date.now(),
      owner: form.get('owner'),
      bank: form.get('bank'),
      name: form.get('name'),
      balance: Number(form.get('balance')),
      rate: Number(form.get('rate') || 0),
    };
    const updated = accountModal.item
      ? accounts.map((a) => (a.id === item.id ? item : a))
      : [...accounts, item];
    setAccounts(updated);
    syncToCloud({ accounts: updated });
    setAccountModal({ open: false, item: null });
  };

  const deleteAccount = (id) => {
    const updated = accounts.filter((a) => a.id !== id);
    setAccounts(updated);
    syncToCloud({ accounts: updated });
  };

  const saveLoan = (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const item = {
      id: loanModal.item?.id || Date.now(),
      owner: form.get('owner'),
      name: form.get('name'),
      amount: Number(form.get('amount')),
      rate: Number(form.get('rate') || 0),
    };
    const updated = loanModal.item
      ? loans.map((l) => (l.id === item.id ? item : l))
      : [...loans, item];
    setLoans(updated);
    syncToCloud({ loans: updated });
    setLoanModal({ open: false, item: null });
  };

  const deleteLoan = (id) => {
    const updated = loans.filter((l) => l.id !== id);
    setLoans(updated);
    syncToCloud({ loans: updated });
  };

  const saveRealEstate = (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const item = {
      id: reModal.item?.id || Date.now(),
      owner: form.get('owner'),
      name: form.get('name'),
      amount: Number(form.get('amount')),
    };
    const updated = reModal.item
      ? realEstates.map((r) => (r.id === item.id ? item : r))
      : [...realEstates, item];
    setRealEstates(updated);
    syncToCloud({ realEstates: updated });
    setReModal({ open: false, item: null });
  };

  const deleteRealEstate = (id) => {
    const updated = realEstates.filter((r) => r.id !== id);
    setRealEstates(updated);
    syncToCloud({ realEstates: updated });
  };

  const saveStock = (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const item = {
      id: stockModal.item?.id || Date.now(),
      owner: form.get('owner'),
      name: form.get('name'),
      code: form.get('code') || '-',
      shares: Number(form.get('shares')),
      avgPrice: Number(form.get('avgPrice')),
      currentPrice: Number(form.get('currentPrice')),
    };
    const updated = stockModal.item
      ? stocks.map((s) => (s.id === item.id ? item : s))
      : [...stocks, item];
    setStocks(updated);
    syncToCloud({ stocks: updated });
    setStockModal({ open: false, item: null });
  };

  const deleteStock = (id) => {
    const updated = stocks.filter((s) => s.id !== id);
    setStocks(updated);
    syncToCloud({ stocks: updated });
  };

  // 평단가 계산기 대상 종목
  const targetCalcStock =
    stocks.find((s) => s.id === Number(calcStockId)) || stocks[0];
  const newTotalShares = targetCalcStock
    ? targetCalcStock.shares + Number(addShares || 0)
    : 0;
  const newAvgPrice =
    targetCalcStock && newTotalShares > 0
      ? Math.round(
          (targetCalcStock.shares * targetCalcStock.avgPrice +
            Number(addShares || 0) * Number(addPrice || 0)) /
            newTotalShares
        )
      : 0;

  return (
    <div className="min-h-screen bg-[#f4f9f7] text-gray-800 pb-24 font-sans">
      {/* 1. 상단 공통 헤더 & 부부 명의 필터 */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3 flex flex-col gap-2.5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#166553] text-white flex items-center justify-center font-black text-sm">
                집
              </div>
              <h1 className="text-base font-extrabold text-gray-900 tracking-tight">
                우리 집 자산관리·가계부
              </h1>
            </div>
            <button
              onClick={() => setActiveTab('settings')}
              className="text-[11px] px-2.5 py-1 bg-[#ebf5f2] text-[#166553] font-bold rounded-full flex items-center gap-1.5 hover:bg-[#d8ece6] transition"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {syncStatus}
            </button>
          </div>

          <div className="grid grid-cols-4 bg-[#ebf5f2] p-1 rounded-xl text-xs font-bold">
            {['전체', '남편', '아내', '공동'].map((owner) => (
              <button
                key={owner}
                onClick={() => setOwnerFilter(owner)}
                className={`py-1.5 rounded-lg transition-all ${
                  ownerFilter === owner
                    ? 'bg-[#166553] text-white shadow-sm'
                    : 'text-[#166553]/70 hover:text-[#166553]'
                }`}
              >
                {owner}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* 메인 컨테이너 */}
      <main className="max-w-lg mx-auto p-4 flex flex-col gap-4">
        {/* ==================== 2. 캘린더 탭 (첫 화면) ==================== */}
        {activeTab === 'calendar' && (
          <div className="flex flex-col gap-4">
            {/* 상단 타이틀 및 월 이동 바 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-[11px] font-bold text-[#166553] block">
                    월간 흐름
                  </span>
                  <h2 className="text-xl font-black text-gray-900">캘린더</h2>
                </div>
                <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full text-xs font-extrabold text-gray-700">
                  <button
                    onClick={() => setCurrentMonth((m) => (m > 1 ? m - 1 : 12))}
                    className="hover:text-[#166553]"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span>
                    {currentYear}년 {currentMonth}월
                  </span>
                  <button
                    onClick={() => setCurrentMonth((m) => (m < 12 ? m + 1 : 1))}
                    className="hover:text-[#166553]"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* 요일 헤더 (월~일) */}
              <div className="grid grid-cols-7 text-center text-[11px] font-bold text-gray-400 pt-2 border-t border-gray-100">
                {['월', '화', '수', '목', '금', '토', '일'].map((d, idx) => (
                  <div
                    key={d}
                    className={
                      idx === 5
                        ? 'text-blue-500'
                        : idx === 6
                        ? 'text-red-500'
                        : ''
                    }
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* 날짜 그리드 */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-16" />
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const dateStr = `${currentYear}-${String(
                    currentMonth
                  ).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const isSelected = selectedDate === dateStr;
                  const holidayName = HOLIDAYS[dateStr];
                  const dayOfWeek = (firstDayOfWeek + i) % 7;
                  const isSundayOrHoliday =
                    dayOfWeek === 6 || Boolean(holidayName);

                  const dayTxs = monthlyTxs.filter((t) => t.date === dateStr);
                  const dayInc = dayTxs
                    .filter((t) => t.type === '수입')
                    .reduce((a, b) => a + b.amount, 0);
                  const dayExp = dayTxs
                    .filter((t) => t.type === '지출')
                    .reduce((a, b) => a + b.amount, 0);
                  const hasRecord = dayInc > 0 || dayExp > 0;

                  return (
                    <div
                      key={day}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`h-16 p-1 rounded-xl flex flex-col justify-between items-center cursor-pointer transition-all border ${
                        isSelected
                          ? 'bg-[#ebf5f2] border-[#166553] ring-1 ring-[#166553]'
                          : hasRecord
                          ? 'bg-[#ebf5f2]/60 border-transparent'
                          : 'bg-white border-gray-50 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <span
                          className={`text-xs font-extrabold w-6 h-6 flex items-center justify-center rounded-full ${
                            isSelected
                              ? 'bg-[#166553] text-white'
                              : isSundayOrHoliday
                              ? 'text-red-500'
                              : dayOfWeek === 5
                              ? 'text-blue-500'
                              : 'text-gray-700'
                          }`}
                        >
                          {day}
                        </span>
                      </div>
                      <div className="w-full flex flex-col items-center leading-tight">
                        {dayInc > 0 && (
                          <span className="text-[9px] font-extrabold text-emerald-600 truncate max-w-full">
                            +{dayInc.toLocaleString()}
                          </span>
                        )}
                        {dayExp > 0 && (
                          <span className="text-[9px] font-extrabold text-red-500 truncate max-w-full">
                            -{dayExp.toLocaleString()}
                          </span>
                        )}
                        {!hasRecord && holidayName && (
                          <span className="text-[8px] text-red-400 font-bold truncate max-w-full">
                            {holidayName}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 달력 바로 아래 2x2 요약 카드 */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-gray-100">
                <span className="text-[11px] text-gray-400 font-bold block">
                  이번 달 총수입
                </span>
                <span className="text-base font-black text-emerald-600">
                  +{totalMonthIncome.toLocaleString()}원
                </span>
              </div>
              <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-gray-100">
                <span className="text-[11px] text-gray-400 font-bold block">
                  이번 달 총지출
                </span>
                <span className="text-base font-black text-red-500">
                  -{totalMonthExpense.toLocaleString()}원
                </span>
              </div>
              <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-gray-100">
                <span className="text-[11px] text-gray-400 font-bold block">
                  하루 평균 지출
                </span>
                <span className="text-base font-black text-gray-800">
                  {avgDailyExpense.toLocaleString()}원
                </span>
              </div>
              <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-gray-100">
                <span className="text-[11px] text-gray-400 font-bold block">
                  가장 많이 쓴 날 ({maxExpenseDayInfo.maxDate})
                </span>
                <span className="text-base font-black text-gray-800">
                  {maxExpenseDayInfo.maxAmt.toLocaleString()}원
                </span>
              </div>
            </div>

            {/* 선택 날짜 상세 영수증 내역 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3">
              <div className="flex justify-between items-center border-b border-gray-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-gray-900">
                    🧾 {selectedDate} 영수증 내역
                  </span>
                  {HOLIDAYS[selectedDate] && (
                    <span className="text-[10px] bg-red-50 text-red-500 font-bold px-2 py-0.5 rounded-full">
                      {HOLIDAYS[selectedDate]}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => openAddTxModal(selectedDate)}
                  className="text-xs bg-[#166553] text-white px-3 py-1.5 rounded-xl font-bold hover:opacity-90 transition"
                >
                  + 내역 입력
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {monthlyTxs.filter((t) => t.date === selectedDate).length ===
                0 ? (
                  <div className="text-center py-6 text-xs text-gray-400 font-medium">
                    이 날짜에 기록된 영수증이 없습니다.
                  </div>
                ) : (
                  monthlyTxs
                    .filter((t) => t.date === selectedDate)
                    .map((t) => (
                      <div
                        key={t.id}
                        className="flex justify-between items-center p-3 bg-[#f8fbfa] rounded-xl border border-gray-100"
                      >
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-[#ebf5f2] text-[#166553]">
                              {t.owner}
                            </span>
                            <span className="text-xs font-extrabold text-gray-900">
                              {t.memo || t.category}
                            </span>
                            {t.isSpecial && (
                              <span className="text-[9px] bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded">
                                용돈/특별
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-gray-400 font-medium">
                            {t.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-black ${
                              t.type === '수입'
                                ? 'text-emerald-600'
                                : 'text-red-500'
                            }`}
                          >
                            {t.type === '수입' ? '+' : '-'}
                            {t.amount.toLocaleString()}원
                          </span>
                          <button
                            onClick={() => openEditTxModal(t)}
                            className="text-gray-400 hover:text-[#166553] p-1"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteTx(t.id)}
                            className="text-gray-400 hover:text-red-500 p-1"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================== 3. 월간 리포트 탭 ==================== */}
        {activeTab === 'report' && (
          <div className="flex flex-col gap-4">
            {/* 상단 헤더 & 용돈·특별지출 토글 & 이미지 출력 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex justify-between items-center">
              <div>
                <span className="text-[11px] font-bold text-[#166553] block">
                  {currentYear}년 {currentMonth}월
                </span>
                <h2 className="text-lg font-black text-gray-900">
                  월간 소비 리포트
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-gray-600">
                  <span>용돈·특별지출 포함</span>
                  <input
                    type="checkbox"
                    checked={includeSpecial}
                    onChange={(e) => setIncludeSpecial(e.target.checked)}
                    className="accent-[#166553] w-4 h-4"
                  />
                </label>
                <button
                  onClick={() => window.print()}
                  className="text-xs bg-[#ebf5f2] text-[#166553] px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1 hover:bg-[#d8ece6]"
                >
                  <Download size={13} /> 출력
                </button>
              </div>
            </div>

            {/* 2x2 요약 카드 */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-gray-100">
                <span className="text-[11px] text-gray-400 font-bold block">
                  이번 달 수입
                </span>
                <span className="text-base font-black text-emerald-600">
                  +{reportIncome.toLocaleString()}원
                </span>
              </div>
              <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-gray-100">
                <span className="text-[11px] text-gray-400 font-bold block">
                  이번 달 지출 (전월비 -8.2%)
                </span>
                <span className="text-base font-black text-red-500">
                  -{reportExpense.toLocaleString()}원
                </span>
              </div>
              <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-gray-100">
                <span className="text-[11px] text-gray-400 font-bold block">
                  저축률 (%)
                </span>
                <span className="text-base font-black text-[#166553]">
                  {savingsRate.toFixed(1)}%
                </span>
              </div>
              <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-gray-100">
                <span className="text-[11px] text-gray-400 font-bold block">
                  수입 - 지출 (순저축)
                </span>
                <span className="text-base font-black text-gray-900">
                  {(reportIncome - reportExpense).toLocaleString()}원
                </span>
              </div>
            </div>

            {/* 생활 지출 목표 프로그레스 바 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-extrabold text-gray-800">
                  생활 지출 목표 ({monthlyBudget.toLocaleString()}원)
                </span>
                <span className="text-xs font-black text-[#166553]">
                  남은 예산: {Math.max(0, remainingBudget).toLocaleString()}원
                </span>
              </div>
              <div className="w-full h-3.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#166553] rounded-full transition-all"
                  style={{ width: `${budgetProgress}%` }}
                />
              </div>
              <div className="bg-[#ebf5f2] text-[#166553] px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between">
                <span>
                  🎯 목표 페이스보다{' '}
                  <b>{Math.abs(remainingBudget).toLocaleString()}원</b>{' '}
                  {remainingBudget >= 0 ? '적게 사용 중!' : '초과 사용 중!'}
                </span>
                <span>{budgetProgress}%</span>
              </div>
            </div>

            {/* 1일부터 누적 지출 흐름 그래프 (SVG) 및 AI 소비 분석 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-extrabold text-gray-800">
                  📈 1일~말일 누적 지출 흐름 (목표 점선 vs 실제 실선)
                </span>
                <span className="text-[11px] font-bold text-gray-500">
                  예상 월말 지출:{' '}
                  {(avgDailyExpense * daysInMonth).toLocaleString()}원
                </span>
              </div>
              <div className="h-36 w-full bg-[#f8fbfa] rounded-xl p-3 flex items-end relative border border-gray-100">
                <svg
                  viewBox="0 0 300 100"
                  className="w-full h-full overflow-visible"
                >
                  {/* 목표 점선 */}
                  <line
                    x1="0"
                    y1="95"
                    x2="300"
                    y2="15"
                    stroke="#9ca3af"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  {/* 실제 누적 실선 */}
                  <polyline
                    fill="none"
                    stroke="#166553"
                    strokeWidth="3"
                    points={`0,95 60,80 120,68 180,${Math.max(
                      15,
                      95 - budgetProgress * 0.7
                    )} 240,${Math.max(
                      10,
                      95 - budgetProgress * 0.8
                    )} 300,${Math.max(5, 95 - budgetProgress * 0.85)}`}
                  />
                </svg>
              </div>

              {/* 카테고리별 지출 비중 */}
              <div className="flex flex-col gap-2 pt-2">
                <span className="text-xs font-extrabold text-gray-800">
                  카테고리별 지출 Top 항목
                </span>
                {categoryBreakdown.map((item) => (
                  <div
                    key={item.cat}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="font-bold text-gray-700 w-24">
                      {item.cat}
                    </span>
                    <div className="flex-1 mx-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#166553]"
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                    <span className="font-extrabold text-gray-900 w-28 text-right">
                      {item.amt.toLocaleString()}원 ({item.pct}%)
                    </span>
                  </div>
                ))}
              </div>

              {/* AI 소비 분석 코멘트 (Gemini 실시간 연동) */}
              <div className="bg-[#ebf5f2] p-3.5 rounded-xl border border-[#166553]/20 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-[#166553] flex items-center gap-1">
                    <Sparkles size={14} /> AI 부부 소비 심층 분석 코멘트
                  </span>
                  <button
                    onClick={fetchAiReport}
                    disabled={isAiLoading}
                    className="px-2.5 py-1 bg-[#166553] text-white rounded-lg text-[11px] font-bold hover:bg-[#124d3f] transition disabled:opacity-50"
                  >
                    {isAiLoading ? '분석 중...' : '실시간 AI 분석'}
                  </button>
                </div>
                {aiReport ? (
                  <div className="text-xs text-gray-800 leading-relaxed font-medium whitespace-pre-line bg-white/80 p-3 rounded-lg border border-[#166553]/10">
                    {aiReport}
                  </div>
                ) : (
                  <p className="text-xs text-gray-700 leading-relaxed font-medium">
                    현재 <b>{categoryBreakdown[0]?.cat || '식비'}</b> 비중이 전체
                    지출의 <b>{categoryBreakdown[0]?.pct || 0}%</b>로 가장
                    높습니다. 위 <b>[실시간 AI 분석]</b> 버튼을 누르면 Gemini가
                    가계부 데이터를 바탕으로 맞춤 분석 리포트를 작성합니다.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================== 4. 홈 탭 (우리 집 순자산 & 투자) ==================== */}
        {activeTab === 'home' && (
          <div className="flex flex-col gap-4">
            {/* 총 순자산 & 목표 달성 계산기 */}
            <div className="bg-gradient-to-br from-[#166553] to-[#0f463a] text-white rounded-2xl p-5 shadow-md flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-emerald-100">
                  우리 집 총 순자산 ({ownerFilter} 기준)
                </span>
                <span className="text-[11px] bg-white/15 px-2.5 py-0.5 rounded-full font-bold">
                  목표 {(targetAsset / 100000000).toFixed(1)}억 달성률{' '}
                  {targetAchievementRate.toFixed(1)}%
                </span>
              </div>
              <div className="text-2xl font-black tracking-tight">
                {netWorth.toLocaleString()}원
              </div>

              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-300 rounded-full"
                  style={{ width: `${targetAchievementRate}%` }}
                />
              </div>
              <div className="text-[11px] text-emerald-100 font-medium flex justify-between">
                <span>
                  월 저축 {monthlySavingEst.toLocaleString()}원 유지 시
                </span>
                <span className="font-extrabold text-white">
                  예상 도달: 약 {monthsToTarget}개월 후
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/15 text-xs">
                <div>
                  <span className="text-emerald-200 text-[10px] block">
                    금융(예적금+주식)
                  </span>
                  <span className="font-extrabold">
                    {(totalCash + totalStockEval).toLocaleString()}원
                  </span>
                </div>
                <div>
                  <span className="text-emerald-200 text-[10px] block">
                    부동산/보증금
                  </span>
                  <span className="font-extrabold">
                    {totalRealEstate.toLocaleString()}원
                  </span>
                </div>
                <div>
                  <span className="text-red-200 text-[10px] block">
                    대출 총액
                  </span>
                  <span className="font-extrabold text-red-200">
                    -{totalLoanAmt.toLocaleString()}원
                  </span>
                </div>
              </div>
            </div>

            {/* 부부 통장 쪼개기 잔액 현황 (직접 수정/추가 가능) */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-black text-gray-900">
                  💳 부부 통장 쪼개기 잔액 현황
                </span>
                <button
                  onClick={() => setAccountModal({ open: true, item: null })}
                  className="text-xs bg-[#ebf5f2] text-[#166553] px-2.5 py-1 rounded-lg font-bold"
                >
                  + 통장 추가
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {filteredAccounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="flex justify-between items-center p-3 bg-[#f8fbfa] rounded-xl border border-gray-100"
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-[#ebf5f2] text-[#166553]">
                          [{acc.owner}] {acc.bank}
                        </span>
                        <span className="text-xs font-extrabold text-gray-800">
                          {acc.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 mt-0.5">
                        이율 연 {acc.rate}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-gray-900">
                        {acc.balance.toLocaleString()}원
                      </span>
                      <button
                        onClick={() =>
                          setAccountModal({ open: true, item: acc })
                        }
                        className="text-gray-400 hover:text-[#166553]"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => deleteAccount(acc.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 부동산/보증금 & 대출 내역 (직접 수정 가능) */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-black text-gray-900">
                  🏢 부동산·보증금 및 대출 관리
                </span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setReModal({ open: true, item: null })}
                    className="text-[11px] bg-gray-100 text-gray-700 px-2 py-1 rounded-lg font-bold"
                  >
                    + 보증금
                  </button>
                  <button
                    onClick={() => setLoanModal({ open: true, item: null })}
                    className="text-[11px] bg-red-50 text-red-600 px-2 py-1 rounded-lg font-bold"
                  >
                    + 대출
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {filteredRealEstates.map((re) => (
                  <div
                    key={re.id}
                    className="flex justify-between items-center p-3 bg-emerald-50/40 rounded-xl border border-emerald-100"
                  >
                    <span className="text-xs font-bold text-gray-800">
                      [{re.owner}] {re.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-[#166553]">
                        {re.amount.toLocaleString()}원
                      </span>
                      <button
                        onClick={() => setReModal({ open: true, item: re })}
                        className="text-gray-400 hover:text-[#166553]"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => deleteRealEstate(re.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                {filteredLoans.map((ln) => (
                  <div
                    key={ln.id}
                    className="flex justify-between items-center p-3 bg-red-50/40 rounded-xl border border-red-100"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-800">
                        [{ln.owner}] {ln.name}
                      </span>
                      <span className="text-[10px] text-red-400 font-semibold">
                        금리 연 {ln.rate}% (월 이자 약{' '}
                        {Math.round(
                          (ln.amount * (ln.rate / 100)) / 12
                        ).toLocaleString()}
                        원)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-red-600">
                        -{ln.amount.toLocaleString()}원
                      </span>
                      <button
                        onClick={() => setLoanModal({ open: true, item: ln })}
                        className="text-gray-400 hover:text-gray-700"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => deleteLoan(ln.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 주식·ETF 포트폴리오 & 평단가 자동 계산기 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm font-black text-gray-900 block">
                    📈 주식·ETF 포트폴리오
                  </span>
                  <span
                    className={`text-xs font-extrabold ${
                      totalStockProfit >= 0 ? 'text-red-500' : 'text-blue-500'
                    }`}
                  >
                    총 평가손익: {totalStockProfit >= 0 ? '+' : ''}
                    {totalStockProfit.toLocaleString()}원 (
                    {totalStockRate >= 0 ? '+' : ''}
                    {totalStockRate.toFixed(2)}%)
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setBulkPriceModal(true)}
                    className="text-[11px] bg-gray-100 text-gray-700 px-2.5 py-1.5 rounded-lg font-bold"
                  >
                    시세 일괄수정
                  </button>
                  <button
                    onClick={() => setStockModal({ open: true, item: null })}
                    className="text-[11px] bg-[#166553] text-white px-2.5 py-1.5 rounded-lg font-bold"
                  >
                    + 종목추가
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {filteredStocks.map((st) => {
                  const evalAmt = st.shares * st.currentPrice;
                  const costAmt = st.shares * st.avgPrice;
                  const profit = evalAmt - costAmt;
                  const rate = costAmt > 0 ? (profit / costAmt) * 100 : 0;
                  return (
                    <div
                      key={st.id}
                      className="p-3 bg-[#f8fbfa] rounded-xl border border-gray-100 flex justify-between items-center"
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#ebf5f2] text-[#166553]">
                            {st.owner}
                          </span>
                          <span className="text-xs font-extrabold text-gray-900">
                            {st.name}
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-500 mt-0.5">
                          보유 {st.shares}주 · 평단{' '}
                          {st.avgPrice.toLocaleString()}원 · 현재가{' '}
                          <b className="text-gray-800">
                            {st.currentPrice.toLocaleString()}원
                          </b>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <span className="text-xs font-black text-gray-900 block">
                            {evalAmt.toLocaleString()}원
                          </span>
                          <span
                            className={`text-[11px] font-extrabold ${
                              profit >= 0 ? 'text-red-500' : 'text-blue-500'
                            }`}
                          >
                            {profit >= 0 ? '+' : ''}
                            {profit.toLocaleString()}원 ({rate >= 0 ? '+' : ''}
                            {rate.toFixed(2)}%)
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            setStockModal({ open: true, item: st })
                          }
                          className="text-gray-400 hover:text-[#166553]"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => deleteStock(st.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 추가 매수 평단가 자동 계산기 */}
              {stocks.length > 0 && (
                <div className="mt-2 p-3.5 bg-[#ebf5f2] rounded-xl flex flex-col gap-2.5">
                  <span className="text-xs font-black text-[#166553] flex items-center gap-1">
                    <Calculator size={14} /> 주식·ETF 추가 매수(물타기/불타기)
                    평단가 계산기
                  </span>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <select
                      value={calcStockId}
                      onChange={(e) => setCalcStockId(e.target.value)}
                      className="bg-white rounded-lg px-2 py-1.5 font-bold border border-gray-200"
                    >
                      {stocks.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={addShares}
                      onChange={(e) => setAddShares(e.target.value)}
                      placeholder="추가 수량"
                      className="bg-white rounded-lg px-2 py-1.5 font-bold border border-gray-200"
                    />
                    <input
                      type="number"
                      value={addPrice}
                      onChange={(e) => setAddPrice(e.target.value)}
                      placeholder="매수 단가"
                      className="bg-white rounded-lg px-2 py-1.5 font-bold border border-gray-200"
                    />
                  </div>
                  {targetCalcStock && (
                    <div className="text-xs text-gray-700 font-medium flex justify-between bg-white/80 px-3 py-2 rounded-lg">
                      <span>
                        기존 평단:{' '}
                        <b>{targetCalcStock.avgPrice.toLocaleString()}원</b> (
                        {targetCalcStock.shares}주)
                      </span>
                      <span className="text-[#166553] font-black">
                        ➔ 예상 평단: {newAvgPrice.toLocaleString()}원 (총{' '}
                        {newTotalShares}주)
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== 5. 설정 탭 ==================== */}
        {activeTab === 'settings' && (
          <div className="flex flex-col gap-4">
            {/* 부부 실시간 공유방 코드 설정 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3">
              <span className="text-sm font-black text-gray-900">
                🔗 부부 실시간 클라우드 공유 코드
              </span>
              <p className="text-xs text-gray-500">
                남편과 아내가 동일한 방 코드를 입력하면 모든 가계부·통장·주식
                내역이 1초 만에 실시간 연동됩니다.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tempRoomCode}
                  onChange={(e) => setTempRoomCode(e.target.value)}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm font-extrabold text-[#166553] bg-[#f8fbfa]"
                />
                <button
                  onClick={() => {
                    setRoomCode(tempRoomCode);
                    alert(`공유 코드가 [${tempRoomCode}]로 변경되었습니다!`);
                  }}
                  className="bg-[#166553] text-white px-4 py-2 rounded-xl text-xs font-bold"
                >
                  코드 변경
                </button>
              </div>
            </div>

            {/* 목표 금액 및 월 생활비 예산 설정 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3">
              <span className="text-sm font-black text-gray-900">
                🎯 목표 순자산 및 월 예산 설정
              </span>
              <div className="flex flex-col gap-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-600">
                    목표 순자산 (원)
                  </span>
                  <input
                    type="number"
                    value={targetAsset}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setTargetAsset(v);
                      syncToCloud({ targetAsset: v });
                    }}
                    className="border rounded-lg px-3 py-1.5 font-extrabold text-right w-44"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-600">
                    월 생활비 목표 예산 (원)
                  </span>
                  <input
                    type="number"
                    value={monthlyBudget}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setMonthlyBudget(v);
                      syncToCloud({ monthlyBudget: v });
                    }}
                    className="border rounded-lg px-3 py-1.5 font-extrabold text-right w-44"
                  />
                </div>
              </div>
            </div>

            {/* 설정 탭에서도 통장/대출/주식 한눈에 수정하기 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-black text-gray-900">
                  🛠️ 등록된 통장·계좌 리스트 관리
                </span>
                <button
                  onClick={() => setAccountModal({ open: true, item: null })}
                  className="text-xs bg-[#166553] text-white px-2.5 py-1 rounded-lg font-bold"
                >
                  + 추가
                </button>
              </div>
              {accounts.map((acc) => (
                <div
                  key={acc.id}
                  className="flex justify-between items-center text-xs py-2 border-b last:border-b-0"
                >
                  <span className="font-bold text-gray-800">
                    [{acc.owner}] {acc.bank} - {acc.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold">
                      {acc.balance.toLocaleString()}원
                    </span>
                    <button
                      onClick={() => setAccountModal({ open: true, item: acc })}
                      className="text-[#166553] font-bold"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => deleteAccount(acc.id)}
                      className="text-red-500 font-bold"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ==================== 하단 5개 탭 네비게이션 ==================== */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="max-w-lg mx-auto h-16 grid grid-cols-5 items-center px-2">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 ${
              activeTab === 'home' ? 'text-[#166553]' : 'text-gray-400'
            }`}
          >
            <Home size={20} />
            <span className="text-[10px] font-extrabold">홈(자산)</span>
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex flex-col items-center gap-1 ${
              activeTab === 'calendar' ? 'text-[#166553]' : 'text-gray-400'
            }`}
          >
            <CalendarIcon size={20} />
            <span className="text-[10px] font-extrabold">캘린더</span>
          </button>

          <div className="flex justify-center">
            <button
              onClick={() => openAddTxModal(selectedDate)}
              className="w-13 h-13 -mt-6 bg-[#166553] text-white rounded-full p-3.5 shadow-lg hover:scale-105 transition-transform flex items-center justify-center border-4 border-white"
            >
              <Plus size={24} />
            </button>
          </div>

          <button
            onClick={() => setActiveTab('report')}
            className={`flex flex-col items-center gap-1 ${
              activeTab === 'report' ? 'text-[#166553]' : 'text-gray-400'
            }`}
          >
            <PieChart size={20} />
            <span className="text-[10px] font-extrabold">월간리포트</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center gap-1 ${
              activeTab === 'settings' ? 'text-[#166553]' : 'text-gray-400'
            }`}
          >
            <Settings size={20} />
            <span className="text-[10px] font-extrabold">설정</span>
          </button>
        </div>
      </nav>

      {/* ==================== 모달창 영역 ==================== */}
      {/* 1) 영수증 입력/수정 모달 */}
      {isTxModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveTx}
            className="bg-white rounded-2xl p-5 w-full max-w-sm flex flex-col gap-3 shadow-xl"
          >
            <div className="flex justify-between items-center">
              <span className="font-black text-gray-900">
                {editingTx ? '내역 수정' : '새 가계부 내역 입력'}
              </span>
              <button type="button" onClick={() => setIsTxModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {['지출', '수입'].map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setTxForm({ ...txForm, type: t })}
                  className={`py-2 rounded-xl text-xs font-extrabold ${
                    txForm.type === t
                      ? t === '지출'
                        ? 'bg-red-500 text-white'
                        : 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <input
              type="date"
              value={txForm.date}
              onChange={(e) => setTxForm({ ...txForm, date: e.target.value })}
              className="border rounded-xl px-3 py-2 text-xs font-bold"
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={txForm.owner}
                onChange={(e) =>
                  setTxForm({ ...txForm, owner: e.target.value })
                }
                className="border rounded-xl px-3 py-2 text-xs font-bold"
              >
                <option value="공동">공동</option>
                <option value="남편">남편</option>
                <option value="아내">아내</option>
              </select>
              <select
                value={txForm.category}
                onChange={(e) =>
                  setTxForm({ ...txForm, category: e.target.value })
                }
                className="border rounded-xl px-3 py-2 text-xs font-bold"
              >
                {[
                  '식비',
                  '외식/카페',
                  '주거/통신',
                  '쇼핑/생활',
                  '문화/여가',
                  '의료/건강',
                  '용돈/기타',
                  '급여',
                  '부수입',
                ].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <input
              type="number"
              placeholder="금액 (원)"
              value={txForm.amount}
              onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })}
              className="border rounded-xl px-3 py-2 text-xs font-extrabold"
              required
            />
            <input
              type="text"
              placeholder="메모 (예: 마트 장보기)"
              value={txForm.memo}
              onChange={(e) => setTxForm({ ...txForm, memo: e.target.value })}
              className="border rounded-xl px-3 py-2 text-xs font-bold"
            />
            <label className="flex items-center gap-2 text-xs font-bold text-gray-600">
              <input
                type="checkbox"
                checked={txForm.isSpecial}
                onChange={(e) =>
                  setTxForm({ ...txForm, isSpecial: e.target.checked })
                }
                className="accent-[#166553]"
              />
              개인 용돈 또는 특별 지출로 분류
            </label>
            <button
              type="submit"
              className="bg-[#166553] text-white py-2.5 rounded-xl text-xs font-extrabold"
            >
              저장하기
            </button>
          </form>
        </div>
      )}

      {/* 2) 통장 수정/추가 모달 */}
      {accountModal.open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={saveAccount}
            className="bg-white rounded-2xl p-5 w-full max-w-sm flex flex-col gap-3 shadow-xl text-xs"
          >
            <div className="flex justify-between items-center">
              <span className="font-black text-sm">
                통장·계좌 {accountModal.item ? '수정' : '추가'}
              </span>
              <button
                type="button"
                onClick={() => setAccountModal({ open: false, item: null })}
              >
                <X size={18} />
              </button>
            </div>
            <select
              name="owner"
              defaultValue={accountModal.item?.owner || '공동'}
              className="border rounded-xl px-3 py-2 font-bold"
            >
              <option value="남편">남편</option>
              <option value="아내">아내</option>
              <option value="공동">공동</option>
            </select>
            <input
              name="bank"
              defaultValue={accountModal.item?.bank || ''}
              placeholder="은행명 (예: 신한은행, 토스뱅크)"
              className="border rounded-xl px-3 py-2 font-bold"
              required
            />
            <input
              name="name"
              defaultValue={accountModal.item?.name || ''}
              placeholder="통장 별칭 (예: 부부 생활비 통장)"
              className="border rounded-xl px-3 py-2 font-bold"
              required
            />
            <input
              name="balance"
              type="number"
              defaultValue={accountModal.item?.balance || ''}
              placeholder="현재 잔액 (원)"
              className="border rounded-xl px-3 py-2 font-bold"
              required
            />
            <input
              name="rate"
              type="number"
              step="0.1"
              defaultValue={accountModal.item?.rate || 0.1}
              placeholder="연 이율 (%)"
              className="border rounded-xl px-3 py-2 font-bold"
            />
            <button
              type="submit"
              className="bg-[#166553] text-white py-2.5 rounded-xl font-extrabold"
            >
              저장
            </button>
          </form>
        </div>
      )}

      {/* 3) 대출 수정/추가 모달 */}
      {loanModal.open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={saveLoan}
            className="bg-white rounded-2xl p-5 w-full max-w-sm flex flex-col gap-3 shadow-xl text-xs"
          >
            <div className="flex justify-between items-center">
              <span className="font-black text-sm">
                대출 항목 {loanModal.item ? '수정' : '추가'}
              </span>
              <button
                type="button"
                onClick={() => setLoanModal({ open: false, item: null })}
              >
                <X size={18} />
              </button>
            </div>
            <select
              name="owner"
              defaultValue={loanModal.item?.owner || '공동'}
              className="border rounded-xl px-3 py-2 font-bold"
            >
              <option value="공동">공동</option>
              <option value="남편">남편</option>
              <option value="아내">아내</option>
            </select>
            <input
              name="name"
              defaultValue={loanModal.item?.name || ''}
              placeholder="대출명 (예: 전세자금대출)"
              className="border rounded-xl px-3 py-2 font-bold"
              required
            />
            <input
              name="amount"
              type="number"
              defaultValue={loanModal.item?.amount || ''}
              placeholder="대출 잔액 (원)"
              className="border rounded-xl px-3 py-2 font-bold"
              required
            />
            <input
              name="rate"
              type="number"
              step="0.01"
              defaultValue={loanModal.item?.rate || 3.5}
              placeholder="대출 금리 (%)"
              className="border rounded-xl px-3 py-2 font-bold"
              required
            />
            <button
              type="submit"
              className="bg-[#166553] text-white py-2.5 rounded-xl font-extrabold"
            >
              저장
            </button>
          </form>
        </div>
      )}

      {/* 4) 부동산/보증금 모달 */}
      {reModal.open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={saveRealEstate}
            className="bg-white rounded-2xl p-5 w-full max-w-sm flex flex-col gap-3 shadow-xl text-xs"
          >
            <div className="flex justify-between items-center">
              <span className="font-black text-sm">
                부동산·보증금 {reModal.item ? '수정' : '추가'}
              </span>
              <button
                type="button"
                onClick={() => setReModal({ open: false, item: null })}
              >
                <X size={18} />
              </button>
            </div>
            <select
              name="owner"
              defaultValue={reModal.item?.owner || '공동'}
              className="border rounded-xl px-3 py-2 font-bold"
            >
              <option value="공동">공동</option>
              <option value="남편">남편</option>
              <option value="아내">아내</option>
            </select>
            <input
              name="name"
              defaultValue={reModal.item?.name || ''}
              placeholder="자산명 (예: 송도 아파트 전세보증금)"
              className="border rounded-xl px-3 py-2 font-bold"
              required
            />
            <input
              name="amount"
              type="number"
              defaultValue={reModal.item?.amount || ''}
              placeholder="금액 (원)"
              className="border rounded-xl px-3 py-2 font-bold"
              required
            />
            <button
              type="submit"
              className="bg-[#166553] text-white py-2.5 rounded-xl font-extrabold"
            >
              저장
            </button>
          </form>
        </div>
      )}

      {/* 5) 주식/ETF 개별 수정/추가 모달 */}
      {stockModal.open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={saveStock}
            className="bg-white rounded-2xl p-5 w-full max-w-sm flex flex-col gap-3 shadow-xl text-xs"
          >
            <div className="flex justify-between items-center">
              <span className="font-black text-sm">
                주식·ETF 종목 {stockModal.item ? '수정' : '추가'}
              </span>
              <button
                type="button"
                onClick={() => setStockModal({ open: false, item: null })}
              >
                <X size={18} />
              </button>
            </div>
            <select
              name="owner"
              defaultValue={stockModal.item?.owner || '공동'}
              className="border rounded-xl px-3 py-2 font-bold"
            >
              <option value="남편">남편</option>
              <option value="아내">아내</option>
              <option value="공동">공동</option>
            </select>
            <input
              name="name"
              defaultValue={stockModal.item?.name || ''}
              placeholder="종목명 (예: 삼성전자)"
              className="border rounded-xl px-3 py-2 font-bold"
              required
            />
            <input
              name="shares"
              type="number"
              defaultValue={stockModal.item?.shares || ''}
              placeholder="보유 수량 (주)"
              className="border rounded-xl px-3 py-2 font-bold"
              required
            />
            <input
              name="avgPrice"
              type="number"
              defaultValue={stockModal.item?.avgPrice || ''}
              placeholder="매수 평단가 (원)"
              className="border rounded-xl px-3 py-2 font-bold"
              required
            />
            <input
              name="currentPrice"
              type="number"
              defaultValue={stockModal.item?.currentPrice || ''}
              placeholder="현재가 (원)"
              className="border rounded-xl px-3 py-2 font-bold"
              required
            />
            <button
              type="submit"
              className="bg-[#166553] text-white py-2.5 rounded-xl font-extrabold"
            >
              저장
            </button>
          </form>
        </div>
      )}

      {/* 6) 주식 현재가 일괄 수정 모달 */}
      {bulkPriceModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm flex flex-col gap-3 shadow-xl text-xs">
            <div className="flex justify-between items-center">
              <span className="font-black text-sm">
                ⚡ 보유 종목 현재가 일괄 업데이트
              </span>
              <button onClick={() => setBulkPriceModal(false)}>
                <X size={18} />
              </button>
            </div>
            {stocks.map((st) => (
              <div
                key={st.id}
                className="flex justify-between items-center gap-2"
              >
                <span className="font-bold text-gray-800">{st.name}</span>
                <input
                  type="number"
                  value={st.currentPrice}
                  onChange={(e) => {
                    const updated = stocks.map((s) =>
                      s.id === st.id
                        ? { ...s, currentPrice: Number(e.target.value) }
                        : s
                    );
                    setStocks(updated);
                    syncToCloud({ stocks: updated });
                  }}
                  className="border rounded-lg px-2.5 py-1.5 w-32 font-extrabold text-right"
                />
              </div>
            ))}
            <button
              onClick={() => setBulkPriceModal(false)}
              className="bg-[#166553] text-white py-2.5 rounded-xl font-extrabold mt-1"
            >
              완료
            </button>
          </div>
        </div>
      )}
    </div>
  );
}