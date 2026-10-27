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
  MessageSquarePlus,
  BarChart2,
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

// 한국 공휴일 예시
const HOLIDAYS = {
  '2026-01-01': '신정',
  '2026-03-01': '삼일절',
  '2026-05-05': '어린이날',
  '2026-06-06': '현충일',
  '2026-08-15': '광복절',
  '2026-10-03': '개천절',
  '2026-10-05': '대체공휴일',
  '2026-10-09': '한글날',
  '2026-12-25': '성탄절',
};

// 카테고리별 색상 팔레트 (원형 도넛 그래프 및 범례용)
const CATEGORY_COLORS = {
  '식비': '#166553',
  '외식/카페': '#10b981',
  '교통/차량': '#3b82f6',
  '주거/통신': '#6366f1',
  '쇼핑/생활': '#f59e0b',
  '문화/여가': '#ec4899',
  '의료/건강': '#14b8a6',
  '경조사/선물': '#8b5cf6',
  '용돈/기타': '#64748b',
  '급여': '#059669',
  '부수입': '#34d399',
  '이체/카드대금': '#6366f1',
};

const EXPENSE_CATEGORIES = [
  '식비',
  '외식/카페',
  '교통/차량',
  '주거/통신',
  '쇼핑/생활',
  '문화/여가',
  '의료/건강',
  '경조사/선물',
  '용돈/기타',
];

const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, '급여', '부수입', '이체/카드대금'];

// 한국 가맹점명 스마트 카테고리 분류기 (AI 백업 및 즉시 분류용)
function classifyKoreanMerchant(storeName) {
  const s = (storeName || '').toLowerCase().replace(/\s+/g, '');

  // 0) 카드대금 / 이체 자동 감지 (지출 합계 및 도넛 차트에서 완전 제외)
  if (
    /카드대금|카드결제대금|신한카드출금|국민카드출금|삼성카드출금|현대카드출금|롯데카드출금|우리카드출금|하나카드출금|비씨카드출금|bc카드출금|카드값|결제대금|타행이체|계좌이체/.test(
      s
    )
  ) {
    return '이체/카드대금';
  }

  // 1) 주거/통신/공과금
  if (
    /lgu|유플러스|skt|에스케이텔레콤|kt|케이티|알뜰폰|통신|인터넷|관리비|아파트아이|도시가스|삼천리|서울가스|한국전력|한전|수도|보험|화재|생명|해상/.test(
      s
    )
  ) {
    return '주거/통신';
  }

  // 2) 교통/차량/주유
  if (
    /주유|칼텍스|sk에너지|에쓰오일|s-oil|오일뱅크|충전소|택시|카카오t|kakaot|우티|티머니|코레일|철도|srt|고속버스|시외버스|하이패스|도로공사|주차|파킹|쏘카|그린카|카센터|정비|오토큐|블루핸즈|세차/.test(
      s
    )
  ) {
    return '교통/차량';
  }

  // 3) 의료/건강
  if (
    /약국|병원|의원|치과|한의원|내과|외과|소아과|이비인후과|피부과|안과|정형외과|산부인과|비뇨기과|마취|통증|클리닉|메디컬|건강검진|헬스|피트니스|필라테스|요가/.test(
      s
    )
  ) {
    return '의료/건강';
  }

  // 4) 식비 (마트/장보기/편의점/정육/청과)
  if (
    /이마트|트레이더스|홈플러스|롯데마트|하나로마트|농협|식자재|마트|슈퍼|익스프레스|노브랜드|코스트코|컬리|마켓컬리|오아시스|편의점|gs25|지에스25|cu|씨유|세븐일레븐|이마트24|정육|식육|축산|수산|청과|과일|야채|채소|반찬|떡집|방앗간|쌀/.test(
      s
    )
  ) {
    return '식비';
  }

  // 5) 외식/카페 (식당/음식점/배달/카페/베이커리 업종 단어 대폭 포함)
  if (
    /스타벅스|투썸|메가커피|메가엠지씨|컴포즈|빽다방|이디야|폴바셋|할리스|파스쿠찌|블루보틀|커피|카페|cafe|라떼|티하우스|공차|쥬시|베이커리|파리바게뜨|뚜레쥬르|성심당|제과|빵|도넛|던킨|배달의민족|배민|우아한형제들|요기요|쿠팡이츠|식당|음식|한식|중식|일식|양식|분식|회관|식탁|밥상|키친|다이닝|비스트로|갈비|삼겹|구이|정식|백반|국밥|순대|설렁탕|곰탕|해장국|감자탕|부대찌개|김치찌개|된장|청국장|불고기|보쌈|족발|곱창|막창|양꼬치|마라|훠궈|샤브|초밥|스시|오마카세|회센타|횟집|참치|일식|돈까스|돈카츠|우동|소바|라멘|짜장|짬뽕|탕수육|반점|중화|치킨|통닭|교촌|bhc|bbq|굽네|푸라닭|피자|도미노|버거|맥도날드|버거킹|롯데리아|맘스터치|노브랜드버거|써브웨이|샌드위치|샐러드|김밥|떡볶이|엽기떡볶이|신전|청년다방|칼국수|수제비|냉면|막국수|콩나물|아구찜|해물|조개|장어|오리|닭갈비|찜닭|술집|포차|호프|맥주|비어|이자카야|바\(bar\)|펍/.test(
      s
    )
  ) {
    return '외식/카페';
  }

  // 6) 쇼핑/생활
  if (
    /쿠팡|coupang|네이버페이|네이버파이낸셜|카카오페이|11번가|지마켓|옥션|ssg|무신사|29cm|에이블리|지그재그|올리브영|다이소|모던하우스|이케아|오늘의집|백화점|아울렛|현대백화점|신세계|롯데백화점|유니클로|자라|h&m|탑텐|나이키|아디다스|뉴발란스|세탁|크린토피아|미용실|헤어|네일|바버샵|문구|알파|교보문고|영풍문고|예스24|알라딘/.test(
      s
    )
  ) {
    return '쇼핑/생활';
  }

  // 7) 문화/여가
  if (
    /cgv|메가박스|롯데시네마|영화|넷플릭스|유튜브|티빙|웨이브|디즈니|쿠팡플레이|멜론|스포티파이|넥슨|엔씨|넷마블|스팀|steam|닌텐도|플레이스테이션|게임|pc방|노래방|볼링|당구|골프|스크린|야구|축구|티켓|인터파크|여행|야놀자|여기어때|아고다|에어비앤비|호텔|리조트|펜션|항공|대한항공|아시아나|진에어|제주항공|티웨이/.test(
      s
    )
  ) {
    return '문화/여가';
  }

  // 8) 경조사/선물
  if (/꽃집|플라워|화원|선물|축의|부의|경조사|카카오선물/.test(s)) {
    return '경조사/선물';
  }

  return '용돈/기타';
}

export default function App() {
  // --- 오늘 날짜 자동 계산 헬퍼 ---
  const todayInfo = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(
      day
    ).padStart(2, '0')}`;
    return { year, month, dateStr };
  }, []);

  // --- 1) 새로고침해도 유지되는 탭 상태 (localStorage 연동) ---
  const [activeTab, setActiveTab] = useState(
    () => localStorage.getItem('activeTab') || 'calendar'
  );
  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  const [ownerFilter, setOwnerFilter] = useState('전체');
  const [roomCode, setRoomCode] = useState(
    () => localStorage.getItem('roomCode') || 'sweet-home-2026'
  );
  const [tempRoomCode, setTempRoomCode] = useState(roomCode);
  const [syncStatus, setSyncStatus] = useState('실시간 연동중');

  // --- 날짜 상태 (항상 오늘 날짜로 초기화되어 10/15 고정 문제 해결) ---
  const [currentYear, setCurrentYear] = useState(todayInfo.year);
  const [currentMonth, setCurrentMonth] = useState(todayInfo.month);
  const [selectedDate, setSelectedDate] = useState(todayInfo.dateStr);

  // 이전 달 / 다음 달 이동 핸들러 (연도 자동 변경 포함)
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear((y) => y - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear((y) => y + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth((m) => m + 1);
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
      code: '379810',
      shares: 250,
      avgPrice: 15200,
      currentPrice: 23400,
      owner: '아내',
    },
  ]);

  const [targetAsset, setTargetAsset] = useState(500000000);
  const [monthlyBudget, setMonthlyBudget] = useState(2500000);
  const [includeSpecial, setIncludeSpecial] = useState(true);

  // --- 모달 상태 ---
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [txForm, setTxForm] = useState({
    date: todayInfo.dateStr,
    type: '지출',
    category: '식비',
    amount: '',
    owner: '공동',
    memo: '',
    isSpecial: false,
  });

  // 카드 결제 문자/카톡 스마트 분석 상태
  const [smsText, setSmsText] = useState('');
  const [isSmsParsing, setIsSmsParsing] = useState(false);
  const [isBulkSmsModalOpen, setIsBulkSmsModalOpen] = useState(false);
  const [bulkSmsText, setBulkSmsText] = useState('');
  const [parsedBulkItems, setParsedBulkItems] = useState([]);
  const [isBulkSmsLoading, setIsBulkSmsLoading] = useState(false);

  const [accountModal, setAccountModal] = useState({ open: false, item: null });
  const [loanModal, setLoanModal] = useState({ open: false, item: null });
  const [reModal, setReModal] = useState({ open: false, item: null });
  const [stockModal, setStockModal] = useState({ open: false, item: null });
  const [bulkPriceModal, setBulkPriceModal] = useState(false);

  // 주식 실시간 시세 연동 상태
  const [isStockSyncing, setIsStockSyncing] = useState(false);
  const [lastStockSyncTime, setLastStockSyncTime] = useState('');

  // 평단가 물타기/불타기 계산기 상태
  const [calcStockId, setCalcStockId] = useState(1);
  const [addShares, setAddShares] = useState('50');
  const [addPrice, setAddPrice] = useState('205000');

  // 리포트 탭: 순자산 추이 툴팁 및 금융자산 전월비 상세 토글
  const [selectedTrendIndex, setSelectedTrendIndex] = useState(5);
  const [isStockDetailOpen, setIsStockDetailOpen] = useState(false);

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

  // --- Gemini API 공통 호출 헬퍼 (모델 자동 폴백 지원) ---
  const callGeminiText = async (promptText, useSearch = false) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('VITE_GEMINI_API_KEY 미설정');
    }
    const models = ['gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-2.5-flash'];
    let lastErr = null;
    for (const modelName of models) {
      try {
        const bodyObj = {
          contents: [{ parts: [{ text: promptText }] }],
        };
        if (useSearch) {
          bodyObj.tools = [{ google_search: {} }];
        }
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyObj),
          }
        );
        const data = await res.json();
        if (res.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
          return data.candidates[0].content.parts[0].text;
        }
        lastErr = new Error(data.error?.message || `HTTP ${res.status}`);
      } catch (err) {
        lastErr = err;
      }
    }
    throw lastErr || new Error('Gemini 응답 실패');
  };

  // --- 실시간 Gemini AI 분석 리포트 호출 ---
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
      const catSummary = categoryBreakdown
        .map((c) => `${c.cat}: ${c.amt.toLocaleString()}원(${c.pct}%)`)
        .join(', ');
      const prompt = `우리 부부의 ${currentYear}년 ${currentMonth}월 가계부 현황을 진단해 주세요.
- 이번 달 총수입: ${reportIncome.toLocaleString()}원
- 이번 달 총지출: ${reportExpense.toLocaleString()}원 (목표 예산: ${monthlyBudget.toLocaleString()}원)
- 저축률: ${savingsRate.toFixed(1)}%
- 카테고리별 지출: ${catSummary || '내역 없음'}

전문적이고 위트 있는 부부 자산관리 전문가로서 현실적이고 명쾌한 재무 리포트를 작성해 주세요:
1. 이번 달 부부 소비 및 식비/고정비 지출 밸런스 평가
2. 맞벌이/부부 저축률 극대화 및 순자산 달성을 위한 핵심 조언
3. 다음 달 즉시 실천 가능한 생활비 절약 팁 2가지`;

      const text = await callGeminiText(prompt, false);
      setAiReport(text);
      localStorage.setItem('lastAiReport', text);
    } catch (e) {
      console.error('Gemini API Error:', e);
      alert(`[AI 오류 상세] ${e.message || e}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  // --- 2) 주식·ETF 실시간 시세 연동 로직 (자체 서버 API 0.2초 직결 + 네이버 실시간 폴링) ---
  const KNOWN_STOCK_CODES = {
    '삼성전자': '005930',
    '삼전': '005930',
    '삼성전자우': '005935',
    'sk하이닉스': '000660',
    '하이닉스': '000660',
    '현대차': '005380',
    '현대자동차': '005380',
    '기아': '000270',
    'naver': '035420',
    '네이버': '035420',
    '카카오': '035720',
    'lg에너지솔루션': '373220',
    '삼성바이오로직스': '207940',
    '셀트리온': '068270',
    '포스코홀딩스': '005490',
    'kb금융': '105560',
    '신한지주': '055550',
    '하나금융지주': '086790',
    '한화에어로스페이스': '012450',
    '두산에너빌리티': '034020',
    'tiger미국s&p500': '360750',
    '타이거미국s&p500': '360750',
    'kodex미국s&p500tr': '379800',
    'kodex미국s&p500': '379800',
    '코덱스미국s&p500': '379800',
    'kodex미국나스닥100tr': '379810',
    'kodex미국나스닥100': '379810',
    '코덱스미국나스닥100': '379810',
    'tiger미국나스닥100': '133690',
    '타이거미국나스닥100': '133690',
    'ace미국s&p500': '360200',
    'ace미국나스닥100': '367380',
    'tiger미국배당다우존스': '458730',
    '타이거미국배당다우존스': '458730',
    'sol미국배당다우존스': '446720',
    'kodex미국배당다우존스': '489250',
    'tiger미국필라델피아반도체나스닥': '381180',
    'tiger미국테크top10indxx': '381170',
    'kodex200': '069500',
    'tiger200': '102110',
  };

  const normalizeStockName = (s) =>
    String(s || '')
      .toLowerCase()
      .replace(/[\s_\-.,()]/g, '');

  const fetchJsonWithProxy = async (targetUrl) => {
    const bustUrl =
      targetUrl + (targetUrl.includes('?') ? '&' : '?') + '_t=' + Date.now();
    const proxies = [
      (u) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
      (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
    ];
    for (const makeUrl of proxies) {
      try {
        const res = await fetch(makeUrl(bustUrl), { cache: 'no-store' });
        if (res.ok) {
          const text = await res.text();
          return JSON.parse(text);
        }
      } catch (e) {
        // 다음 프록시로 재시도
      }
    }
    throw new Error('프록시 응답 실패');
  };

  const fetchSingleStockPriceFallback = async (stock) => {
    const normName = normalizeStockName(stock.name);
    let code = KNOWN_STOCK_CODES[normName] || '';

    if (!code && stock.name) {
      try {
        const q = stock.name.replace(/TR$/i, '').trim();
        const searchUrl = `https://ac.stock.naver.com/ac?q=${encodeURIComponent(
          q
        )}&target=stock,etf,index`;
        const searchData = await fetchJsonWithProxy(searchUrl);
        const firstItem = searchData?.items?.[0];
        if (firstItem?.code) {
          code = firstItem.code;
        }
      } catch (e) {
        console.warn('종목코드 자동검색 실패:', stock.name);
      }
    }

    if (
      !code &&
      stock.code &&
      /^[0-9A-Z]{6}$/i.test(String(stock.code).trim())
    ) {
      code = String(stock.code).trim().toUpperCase();
    }

    if (code) {
      try {
        const basicUrl = `https://m.stock.naver.com/api/stock/${code}/basic`;
        const basicData = await fetchJsonWithProxy(basicUrl);
        const rawPrice =
          basicData?.overMarketPriceInfo?.overMarketStatus === 'OPEN' &&
          basicData?.overMarketPriceInfo?.overPrice
            ? basicData.overMarketPriceInfo.overPrice
            : basicData?.closePrice || basicData?.nowVal;
        if (rawPrice) {
          const parsed = Number(String(rawPrice).replace(/,/g, ''));
          if (!isNaN(parsed) && parsed > 0) {
            return { price: parsed, code };
          }
        }
      } catch (e) {
        console.warn('네이버 실시간 현재가 조회 실패:', code);
      }
    }
    return null;
  };

  const syncRealTimeStockPrices = async (silent = false, customStocks = null) => {
    const targetList = customStocks || stocks;
    if (!targetList || targetList.length === 0) return;
    setIsStockSyncing(true);
    try {
      let updatedCount = 0;
      let serverResults = null;

      // 1순위: 자체 Vercel 서버 API (/api/stock)로 0.2초 만에 전 종목 실시간 조회
      try {
        const res = await fetch('/api/stock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stocks: targetList.map((s) => ({
              id: s.id,
              name: s.name,
              code: s.code,
            })),
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.ok && data?.results) {
            serverResults = data.results;
          }
        }
      } catch (e) {
        console.warn('서버 API 호출 실패, 브라우저 직접 조회로 전환:', e);
      }

      const failedNames = [];
      const updatedStocks = await Promise.all(
        targetList.map(async (st) => {
          const fromServer = serverResults?.[st.id];
          if (fromServer && fromServer.price > 0) {
            updatedCount++;
            return {
              ...st,
              currentPrice: fromServer.price,
              code: fromServer.code || st.code || '-',
            };
          }

          const fallback = await fetchSingleStockPriceFallback(st);
          if (fallback && fallback.price > 0) {
            updatedCount++;
            return {
              ...st,
              currentPrice: fallback.price,
              code: fallback.code || st.code || '-',
            };
          }

          failedNames.push(st.name);
          return st;
        })
      );

      setStocks(updatedStocks);
      syncToCloud({ stocks: updatedStocks });
      const now = new Date();
      setLastStockSyncTime(
        `${String(now.getHours()).padStart(2, '0')}:${String(
          now.getMinutes()
        ).padStart(2, '0')} 실시간`
      );
      if (!silent) {
        if (updatedCount === targetList.length) {
          alert(
            `전 종목(${updatedCount}개) 네이버 실시간 현재가가 즉시 반영되었습니다!`
          );
        } else if (updatedCount > 0) {
          alert(
            `${updatedCount}개 종목 반영 완료!\n(미반영 종목: ${failedNames.join(
              ', '
            )} - 종목명이나 6자리 종목코드를 확인해주세요)`
          );
        } else {
          alert(
            '시세를 불러오지 못했습니다. 종목명이나 6자리 종목코드(예: 000660)를 확인해 주세요.'
          );
        }
      }
    } catch (e) {
      console.error('실시간 시세 연동 오류:', e);
      if (!silent) alert('실시간 시세 연동 중 오류가 발생했습니다.');
    } finally {
      setIsStockSyncing(false);
    }
  };
  // --- 4) 카드 결제 문자/카톡 스마트 파싱 (규칙 파서 + Gemini AI 업종 추론 결합) ---
  const parseRawSmsBlocks = (rawText) => {
    const blocks = rawText
      .split(/\n\s*\n/)
      .map((b) => b.trim())
      .filter(Boolean);

    return blocks.map((block) => {
      // 1) 금액 추출 ("누적" 금액은 제외하고 결제 승인금액 우선 추출)
      const lines = block
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);
      let amount = 0;
      for (const line of lines) {
        if (line.includes('누적') || line.includes('잔액')) continue;
        const m = line.match(/([\d,]+)\s*원/);
        if (m) {
          const val = parseInt(m[1].replace(/,/g, ''), 10);
          if (val > 0) {
            amount = val;
            break;
          }
        }
      }
      if (amount === 0) {
        const fallbackMatch = block.match(/([\d,]+)\s*원/);
        if (fallbackMatch) {
          amount = parseInt(fallbackMatch[1].replace(/,/g, ''), 10);
        }
      }

      // 2) 날짜 추출 (MM/DD 또는 YYYY-MM-DD 또는 MM월 DD일)
      let parsedDate = selectedDate || todayInfo.dateStr;
      const ymdMatch = block.match(/(20\d{2})[-./](\d{1,2})[-./](\d{1,2})/);
      const mdMatch = block.match(/(\d{1,2})[/.](\d{1,2})/);
      const krMdMatch = block.match(/(\d{1,2})월\s*(\d{1,2})일/);
      if (ymdMatch) {
        parsedDate = `${ymdMatch[1]}-${String(ymdMatch[2]).padStart(
          2,
          '0'
        )}-${String(ymdMatch[3]).padStart(2, '0')}`;
      } else if (mdMatch) {
        const m = Number(mdMatch[1]);
        const d = Number(mdMatch[2]);
        if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
          parsedDate = `${currentYear}-${String(m).padStart(2, '0')}-${String(
            d
          ).padStart(2, '0')}`;
        }
      } else if (krMdMatch) {
        const m = Number(krMdMatch[1]);
        const d = Number(krMdMatch[2]);
        if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
          parsedDate = `${currentYear}-${String(m).padStart(2, '0')}-${String(
            d
          ).padStart(2, '0')}`;
        }
      }

      // 3) 사용처(가맹점명) 추출
      let store = '';
      const labeledMatch = block.match(
        /(?:가맹점명|사용처|이용가맹점|가맹점)\s*[:：]\s*([^\n]+)/
      );
      if (labeledMatch) {
        store = labeledMatch[1].trim();
      } else {
        for (const line of lines) {
          if (
            line.includes('Web발신') ||
            line.includes('누적') ||
            line.includes('승인금액') ||
            line.includes('승인일시') ||
            /^\[.*카드.*\]$/.test(line)
          ) {
            continue;
          }
          // 날짜+시간 뒤에 가맹점이 같이 적힌 줄 (예: "10/22 10:58 (주)넥슨코리아" 또는 "10/22 19:52 송도갈비")
          const dateTimeLineMatch = line.match(
            /\d{1,2}[/.]\d{1,2}\s+\d{1,2}:\d{2}\s+(.+)/
          );
          if (dateTimeLineMatch) {
            store = dateTimeLineMatch[1].trim();
            break;
          }
        }
        // 여전히 못 찾았으면 금액/카드사/날짜 줄이 아닌 마지막 의미있는 줄 선택
        if (!store) {
          const candidateLines = lines.filter(
            (l) =>
              !l.includes('Web발신') &&
              !l.includes('누적') &&
              !l.includes('일시불') &&
              !l.includes('할부') &&
              !l.includes('승인') &&
              !/^[\d,]+원/.test(l)
          );
          if (candidateLines.length > 0) {
            store = candidateLines[candidateLines.length - 1]
              .replace(/^[-*•]\s*/, '')
              .trim();
          }
        }
      }

      // 만약 한 줄짜리 간편 입력 (예: "LGU+ 25000원 결제" 또는 "할머니순대국 18000원")인 경우
      if (!store || store === block) {
        store = block
          .replace(/\[Web발신\]/gi, '')
          .replace(/[\d,]+원/g, '')
          .replace(/\d{1,2}[/.]\d{1,2}(\s+\d{1,2}:\d{2})?/g, '')
          .replace(/(일시불|할부|승인|결제|결재)/g, '')
          .trim();
      }

      const category = classifyKoreanMerchant(store || block);
      return {
        date: parsedDate,
        type: '지출',
        category,
        amount: amount || '',
        owner: ownerFilter === '전체' ? '공동' : ownerFilter,
        memo: store || '카드 결제',
      };
    });
  };

  // 단건 문자 붙여넣기 분석 (내역 입력 모달 내)
  const handleAnalyzeSingleSms = async () => {
    if (!smsText.trim()) return;
    setIsSmsParsing(true);
    try {
      // 1차: 내장 스마트 파서로 즉시 추출
      const [firstParsed] = parseRawSmsBlocks(smsText);
      let finalData = { ...firstParsed };

      // 2차: Gemini API 키가 있으면 애매한 식당/상점 이름까지 AI가 정확히 카테고리 분류
      if (import.meta.env.VITE_GEMINI_API_KEY) {
        try {
          const prompt = `다음 한국 카드 결제 문자(또는 지출 메모)를 분석해서 JSON 객체로만 답해줘.
허용 카테고리 목록: ${EXPENSE_CATEGORIES.join(', ')}
- 식당, 밥집, 고깃집, 분식, 치킨, 배달, 카페, 빵집 등은 반드시 "외식/카페"로 분류할 것.
- 마트, 편의점, 식자재, 정육점, 반찬가게 등은 "식비"로 분류할 것.
- 통신사(LGU+, KT, SKT), 관리비, 가스, 전기, 보험은 "주거/통신"으로 분류할 것.
- 주유소, 택시, 기차, 버스, 주차, 하이패스는 "교통/차량"으로 분류할 것.
- 약국, 병원, 의원, 치과, 한의원은 "의료/건강"으로 분류할 것.

입력 문자:
"""
${smsText.trim()}
"""

출력 형식 (순수 JSON만 출력):
{"date": "YYYY-MM-DD (연도가 없으면 ${currentYear}년 기준, 날짜가 아예 없으면 ${
            selectedDate || todayInfo.dateStr
          })", "amount": 숫자만, "memo": "가맹점명/사용처 깔끔하게", "category": "위 허용 카테고리 중 정확히 하나"}`;

          const aiResText = await callGeminiText(prompt, false);
          const jsonMatch = aiResText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const aiParsed = JSON.parse(jsonMatch[0]);
            if (aiParsed.amount) finalData.amount = Number(aiParsed.amount);
            if (aiParsed.memo) finalData.memo = aiParsed.memo;
            if (
              aiParsed.category &&
              EXPENSE_CATEGORIES.includes(aiParsed.category)
            ) {
              finalData.category = aiParsed.category;
            }
            if (
              aiParsed.date &&
              /^\d{4}-\d{2}-\d{2}$/.test(String(aiParsed.date))
            ) {
              finalData.date = aiParsed.date;
            }
          }
        } catch (e) {
          console.warn('AI 문자 상세 분류 폴백(내장 사전 사용):', e);
        }
      }

      setTxForm((prev) => ({
        ...prev,
        date: finalData.date || prev.date,
        type: '지출',
        category: finalData.category || '식비',
        amount: finalData.amount ? String(finalData.amount) : prev.amount,
        memo: finalData.memo || prev.memo,
      }));
    } finally {
      setIsSmsParsing(false);
    }
  };

  // 여러 건의 카드 문자 일괄 분석 핸들러
  const handleAnalyzeBulkSms = async () => {
    if (!bulkSmsText.trim()) return;
    setIsBulkSmsLoading(true);
    try {
      let items = parseRawSmsBlocks(bulkSmsText);

      // Gemini API가 설정되어 있으면 전체 가맹점 카테고리를 한 번에 정밀 보정
      if (import.meta.env.VITE_GEMINI_API_KEY && items.length > 0) {
        try {
          const prompt = `다음 카드 결제 문자 내역들을 분석해서 JSON 배열로만 답해줘.
허용 카테고리: ${EXPENSE_CATEGORIES.join(', ')}
- 동네 식당, 음식점, 술집, 카페, 치킨, 배달 등은 모두 "외식/카페"로 분류해.
- LGU+, SKT, KT, 관리비, 도시가스, 보험 등은 "주거/통신"으로 분류해.
- 마트, 편의점, 식자재는 "식비"로 분류해.
- 주유, 택시, 대중교통, 주차는 "교통/차량"으로 분류해.

입력 텍스트:
"""
${bulkSmsText.trim()}
"""

출력 JSON 배열 형식:
[{"date": "YYYY-MM-DD (연도 없으면 ${currentYear}년)", "amount": 숫자, "memo": "가맹점명", "category": "허용 카테고리 중 하나"}]`;

          const aiText = await callGeminiText(prompt, false);
          const arrMatch = aiText.match(/\[[\s\S]*\]/);
          if (arrMatch) {
            const aiArr = JSON.parse(arrMatch[0]);
            if (Array.isArray(aiArr) && aiArr.length > 0) {
              items = aiArr.map((it) => ({
                date:
                  it.date && /^\d{4}-\d{2}-\d{2}$/.test(it.date)
                    ? it.date
                    : selectedDate || todayInfo.dateStr,
                type: '지출',
                category: EXPENSE_CATEGORIES.includes(it.category)
                  ? it.category
                  : classifyKoreanMerchant(it.memo),
                amount: Number(String(it.amount || 0).replace(/,/g, '')),
                owner: ownerFilter === '전체' ? '공동' : ownerFilter,
                memo: it.memo || '카드 결제',
                isSpecial: false,
              }));
            }
          }
        } catch (e) {
          console.warn('일괄 문자 AI 보정 실패, 내장 파서 결과 사용:', e);
        }
      }

      setParsedBulkItems(items.filter((i) => Number(i.amount) > 0));
    } finally {
      setIsBulkSmsLoading(false);
    }
  };

  const handleSaveBulkSmsItems = () => {
    if (parsedBulkItems.length === 0) return;
    const now = Date.now();
    const newTxs = parsedBulkItems.map((item, idx) => ({
      id: now + idx,
      date: item.date,
      type: '지출',
      category: item.category,
      amount: Number(item.amount),
      owner: item.owner || '공동',
      memo: item.memo,
      isSpecial: false,
    }));
    const updated = [...newTxs, ...transactions];
    setTransactions(updated);
    syncToCloud({ transactions: updated });
    setIsBulkSmsModalOpen(false);
    setBulkSmsText('');
    setParsedBulkItems([]);
    alert(`총 ${newTxs.length}건의 카드 결제 내역이 가계부에 등록되었습니다!`);
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
  // 카드대금 납부 건은 순수 생활 지출 및 도넛 차트에서 완전 제외 (이중 지출 방지)
  const reportExpense = reportTxs
    .filter((t) => t.type === '지출' && t.category !== '이체/카드대금')
    .reduce((a, b) => a + b.amount, 0);
  const totalTransfer = reportTxs
    .filter((t) => t.type === '이체/카드대금' || t.category === '이체/카드대금')
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

  // --- 추천 1) 실제 전월 대비 증감률 계산 & 최근 6개월 월별 소비 추이 데이터 ---
  const sixMonthTrend = useMemo(() => {
    const result = [];
    for (let offset = 5; offset >= 0; offset--) {
      const d = new Date(currentYear, currentMonth - 1 - offset, 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const prefix = `${y}-${String(m).padStart(2, '0')}`;
      const txs = transactions.filter(
        (t) =>
          t.date.startsWith(prefix) &&
          matchOwner(t.owner) &&
          (includeSpecial ? true : !t.isSpecial)
      );
      const inc = txs
        .filter((t) => t.type === '수입')
        .reduce((a, b) => a + b.amount, 0);
      const exp = txs
        .filter((t) => t.type === '지출' && t.category !== '이체/카드대금')
        .reduce((a, b) => a + b.amount, 0);
      result.push({
        year: y,
        month: m,
        label: `${m}월`,
        income: inc,
        expense: exp,
        surplus: inc - exp,
        isCurrent: offset === 0,
      });
    }
    return result;
  }, [transactions, currentYear, currentMonth, ownerFilter, includeSpecial]);

  const prevMonthExpense =
    sixMonthTrend.length >= 2
      ? sixMonthTrend[sixMonthTrend.length - 2].expense
      : 0;
  const momChangePct =
    prevMonthExpense > 0
      ? ((reportExpense - prevMonthExpense) / prevMonthExpense) * 100
      : null;

  // 금융자산(주식·ETF) 전월 대비 증감 및 등락률 계산
  const stockMonthDiff = useMemo(() => {
    return stocks.reduce((acc, st) => {
      const prevPrice = st.prevMonthPrice || st.avgPrice || st.currentPrice;
      const diff = (st.currentPrice - prevPrice) * (st.shares || 0);
      return acc + diff;
    }, 0);
  }, [stocks]);

  const stockMonthDiffRate = useMemo(() => {
    const totalPrevEval = stocks.reduce((acc, st) => {
      const prevPrice = st.prevMonthPrice || st.avgPrice || st.currentPrice;
      return acc + prevPrice * (st.shares || 0);
    }, 0);
    return totalPrevEval > 0 ? (stockMonthDiff / totalPrevEval) * 100 : 0;
  }, [stocks, stockMonthDiff]);

  // 최근 6개월 순자산 변동 추이 (자동 연산)
  const netWorthTrend = useMemo(() => {
    const len = sixMonthTrend.length;
    const history = new Array(len);
    history[len - 1] = netWorth;
    for (let i = len - 2; i >= 0; i--) {
      const nextSurplus = sixMonthTrend[i + 1].surplus;
      history[i] = history[i + 1] - (nextSurplus > 0 ? nextSurplus : 0);
    }
    return sixMonthTrend.map((item, idx) => ({
      ...item,
      netWorth: history[idx] || 0,
    }));
  }, [sixMonthTrend, netWorth]);

  const latestNetDiff = netWorthTrend.length >= 2
    ? netWorthTrend[netWorthTrend.length - 1].netWorth - netWorthTrend[netWorthTrend.length - 2].netWorth
    : 0;

  // 카테고리별 분석 (원형 도넛 그래프용 strokeDasharray 계산 포함 - 카드대금 제외)
  const categoryBreakdown = useMemo(() => {
    const map = {};
    reportTxs
      .filter((t) => t.type === '지출' && t.category !== '이체/카드대금')
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });
    const sorted = Object.entries(map)
      .map(([cat, amt]) => ({
        cat,
        amt,
        exactPct: reportExpense > 0 ? (amt / reportExpense) * 100 : 0,
        pct: reportExpense > 0 ? Math.round((amt / reportExpense) * 100) : 0,
        color: CATEGORY_COLORS[cat] || '#64748b',
      }))
      .sort((a, b) => b.amt - a.amt);

    let cumulativePct = 0;
    return sorted.map((item) => {
      const startPct = cumulativePct;
      cumulativePct += item.exactPct;
      return { ...item, startPct };
    });
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
    setSmsText('');
    setTxForm({
      date: dateStr || selectedDate || todayInfo.dateStr,
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
    setSmsText('');
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
    const nameStr = String(form.get('name') || '').trim();
    const inputCode = String(form.get('code') || '').trim();
    const normName = normalizeStockName(nameStr);
    const nameChanged =
      stockModal.item &&
      normalizeStockName(stockModal.item.name) !== normName;
    const codeUnchangedFromOld =
      stockModal.item && inputCode === String(stockModal.item.code || '');

    const autoCode =
      KNOWN_STOCK_CODES[normName] ||
      (!nameChanged || !codeUnchangedFromOld ? inputCode : '') ||
      '-';

    const item = {
      id: stockModal.item?.id || Date.now(),
      owner: form.get('owner'),
      name: nameStr,
      code: autoCode,
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
    setTimeout(() => syncRealTimeStockPrices(true, updated), 100);
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
        {/* ==================== 2. 캘린더 탭 ==================== */}
        {activeTab === 'calendar' && (
          <div className="flex flex-col gap-4">
            {/* 상단 타이틀 및 월 이동 바 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-[11px] font-bold text-[#166553] block">
                    월간 흐름
                  </span>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-gray-900">캘린더</h2>
                    <button
                      onClick={() => {
                        setCurrentYear(todayInfo.year);
                        setCurrentMonth(todayInfo.month);
                        setSelectedDate(todayInfo.dateStr);
                      }}
                      className="text-[10px] bg-[#ebf5f2] text-[#166553] px-2 py-0.5 rounded-full font-bold hover:bg-[#d8ece6]"
                    >
                      오늘로 이동
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full text-xs font-extrabold text-gray-700">
                  <button
                    onClick={handlePrevMonth}
                    className="hover:text-[#166553]"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span>
                    {currentYear}년 {currentMonth}월
                  </span>
                  <button
                    onClick={handleNextMonth}
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
                  const isToday = todayInfo.dateStr === dateStr;
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
                              : isToday
                              ? 'bg-emerald-100 text-[#166553] ring-1 ring-[#166553]'
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
                    🧾 {selectedDate} 내역
                  </span>
                  {HOLIDAYS[selectedDate] && (
                    <span className="text-[10px] bg-red-50 text-red-500 font-bold px-2 py-0.5 rounded-full">
                      {HOLIDAYS[selectedDate]}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setBulkSmsText('');
                      setParsedBulkItems([]);
                      setIsBulkSmsModalOpen(true);
                    }}
                    className="text-[11px] bg-[#ebf5f2] text-[#166553] px-2.5 py-1.5 rounded-xl font-bold hover:bg-[#d8ece6] transition flex items-center gap-1"
                  >
                    <MessageSquarePlus size={13} /> 문자 일괄입력
                  </button>
                  <button
                    onClick={() => openAddTxModal(selectedDate)}
                    className="text-xs bg-[#166553] text-white px-3 py-1.5 rounded-xl font-bold hover:opacity-90 transition"
                  >
                    + 내역 입력
                  </button>
                </div>
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
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handlePrevMonth}
                    className="text-gray-400 hover:text-[#166553]"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span className="text-[11px] font-bold text-[#166553]">
                    {currentYear}년 {currentMonth}월
                  </span>
                  <button
                    onClick={handleNextMonth}
                    className="text-gray-400 hover:text-[#166553]"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
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

            {/* 2x2 요약 카드 (실제 전월 대비 증감률 반영) */}
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
                  이번 달 지출{' '}
                  {momChangePct !== null
                    ? `(전월비 ${momChangePct >= 0 ? '+' : ''}${momChangePct.toFixed(
                        1
                      )}%)`
                    : '(전월 내역 없음)'}
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

            {/* ★ [요청 기능] 월간 리포트 상단: 금융자산(주식·ETF) 전월 대비 손익 요약 카드 & 종목별 아코디언 */}
            <div className="bg-gradient-to-r from-[#115e59] via-[#166553] to-[#047857] text-white rounded-2xl p-4 shadow-sm border border-emerald-600/40 flex flex-col gap-2.5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <TrendingUp size={16} className="text-emerald-300" />
                  <span className="text-xs font-black text-white">📈 금융자산(주식·ETF) 전월 대비 변동</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsStockDetailOpen(!isStockDetailOpen)}
                  className="text-[11px] bg-white/20 hover:bg-white/30 text-white font-black px-2.5 py-1 rounded-lg transition flex items-center gap-1"
                >
                  {isStockDetailOpen ? '종목별 닫기 ▲' : '종목별 상세 보기 ▼'}
                </button>
              </div>

              <div className="flex justify-between items-end pt-0.5">
                <div>
                  <span className="text-[10px] text-emerald-200 block font-medium">지난달 대비 평가손익</span>
                  <span className={`text-lg font-black tracking-tight ${stockMonthDiff >= 0 ? 'text-emerald-300' : 'text-blue-300'}`}>
                    {stockMonthDiff >= 0 ? '+' : ''}{(stockMonthDiff / 10000).toFixed(1)}만원 ({stockMonthDiffRate >= 0 ? '+' : ''}{stockMonthDiffRate.toFixed(1)}%)
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-200 block font-medium">주식 총 평가금액</span>
                  <span className="text-sm font-extrabold text-white">
                    {Math.round(stocks.reduce((acc, s) => acc + (s.shares || 0) * (s.currentPrice || s.avgPrice || 0), 0) / 10000).toLocaleString()}만원
                  </span>
                </div>
              </div>

              {/* 보유 종목별 아코디언 테이블 */}
              {isStockDetailOpen && (
                <div className="mt-2 pt-2.5 border-t border-white/20 flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-[10px] text-emerald-200 font-bold px-1">
                    <span>보유 종목명 (수량)</span>
                    <span>전월가 대비 등락 (손익)</span>
                  </div>
                  {stocks.map((st) => {
                    const prevPrice = st.prevMonthPrice || st.avgPrice || st.currentPrice;
                    const diff = (st.currentPrice - prevPrice) * (st.shares || 0);
                    const rate = prevPrice > 0 ? ((st.currentPrice - prevPrice) / prevPrice) * 100 : 0;
                    return (
                      <div key={st.id} className="flex justify-between items-center text-xs bg-black/25 px-2.5 py-2 rounded-xl border border-white/10">
                        <div>
                          <span className="font-bold text-white block">{st.name}</span>
                          <span className="text-[10px] text-emerald-200 font-medium">{st.shares}주 보유</span>
                        </div>
                        <div className="text-right">
                          <span className={`font-black text-xs block ${diff >= 0 ? 'text-emerald-300' : 'text-blue-300'}`}>
                            {diff >= 0 ? '+' : ''}{(diff / 10000).toFixed(1)}만원 ({rate >= 0 ? '+' : ''}{rate.toFixed(1)}%)
                          </span>
                          <span className="text-[9px] text-white/60">
                            현재 {st.currentPrice?.toLocaleString()}원
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3) 카테고리별 소비 비중 원형(도넛) 그래프 카드 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-extrabold text-gray-800 flex items-center gap-1.5">
                  <PieChart size={15} className="text-[#166553]" />
                  카테고리별 소비 비율 (원형 그래프)
                </span>
                <span className="text-[11px] font-bold text-gray-400">
                  총 {categoryBreakdown.length}개 영역
                </span>
              </div>

              {categoryBreakdown.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400 font-medium">
                  이번 달 지출 내역이 아직 없습니다.
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-5 py-1">
                  {/* 도넛형 SVG 차트 */}
                  <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
                    <svg
                      viewBox="0 0 42 42"
                      className="w-full h-full -rotate-90"
                    >
                      <circle
                        cx="21"
                        cy="21"
                        r="15.9155"
                        fill="transparent"
                        stroke="#f1f5f9"
                        strokeWidth="6"
                      />
                      {categoryBreakdown.map((item) => (
                        <circle
                          key={item.cat}
                          cx="21"
                          cy="21"
                          r="15.9155"
                          fill="transparent"
                          stroke={item.color}
                          strokeWidth="6"
                          strokeDasharray={`${item.exactPct} ${
                            100 - item.exactPct
                          }`}
                          strokeDashoffset={-item.startPct}
                        />
                      ))}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
                      <span className="text-[10px] text-gray-400 font-bold">
                        총지출
                      </span>
                      <span className="text-xs font-black text-gray-900">
                        {(reportExpense / 10000).toFixed(0)}만원
                      </span>
                      {categoryBreakdown[0] && (
                        <span className="text-[9px] font-extrabold text-[#166553] mt-0.5">
                          1위 {categoryBreakdown[0].cat} (
                          {categoryBreakdown[0].pct}%)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 오른쪽 카테고리 범례 및 비율 리스트 */}
                  <div className="flex-1 w-full flex flex-col gap-2">
                    {categoryBreakdown.map((item) => (
                      <div
                        key={item.cat}
                        className="flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="font-bold text-gray-700">
                            {item.cat}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 font-semibold text-[11px]">
                            {item.amt.toLocaleString()}원
                          </span>
                          <span className="font-black text-gray-900 w-10 text-right">
                            {item.pct}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 추천 1) 최근 6개월 월별 수입·지출 비교 막대그래프 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-extrabold text-gray-800 flex items-center gap-1.5">
                  <BarChart2 size={15} className="text-[#166553]" />
                  최근 6개월 월별 소비·수입 비교
                </span>
                <div className="flex items-center gap-3 text-[10px] font-bold">
                  <span className="flex items-center gap-1 text-emerald-600">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    수입
                  </span>
                  <span className="flex items-center gap-1 text-red-500">
                    <span className="w-2 h-2 rounded-full bg-red-400"></span>
                    지출
                  </span>
                </div>
              </div>

              {(() => {
                const maxVal = Math.max(
                  100000,
                  ...sixMonthTrend.map((m) => Math.max(m.income, m.expense))
                );
                return (
                  <div className="grid grid-cols-6 gap-2 pt-4 pb-1 px-2 bg-[#f8fbfa] rounded-xl border border-gray-100">
                    {sixMonthTrend.map((item) => {
                      const incHeight = Math.round(
                        (item.income / maxVal) * 80
                      );
                      const expHeight = Math.round(
                        (item.expense / maxVal) * 80
                      );
                      return (
                        <div
                          key={`${item.year}-${item.month}`}
                          onClick={() => {
                            setCurrentYear(item.year);
                            setCurrentMonth(item.month);
                          }}
                          className={`flex flex-col items-center cursor-pointer rounded-lg p-1 transition ${
                            item.isCurrent
                              ? 'bg-[#ebf5f2] ring-1 ring-[#166553]/30'
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          <div className="h-24 flex items-end gap-1">
                            <div
                              title={`수입: ${item.income.toLocaleString()}원`}
                              className="w-2.5 bg-emerald-500 rounded-t transition-all"
                              style={{ height: `${Math.max(4, incHeight)}px` }}
                            />
                            <div
                              title={`지출: ${item.expense.toLocaleString()}원`}
                              className="w-2.5 bg-red-400 rounded-t transition-all"
                              style={{ height: `${Math.max(4, expHeight)}px` }}
                            />
                          </div>
                          <span
                            className={`text-[10px] mt-1.5 font-extrabold ${
                              item.isCurrent
                                ? 'text-[#166553]'
                                : 'text-gray-500'
                            }`}
                          >
                            {item.label}
                          </span>
                          <span className="text-[9px] text-gray-400 font-bold">
                            {item.expense > 0
                              ? `${Math.round(item.expense / 10000)}만`
                              : '0'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
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
                  🎯 목표 예산보다{' '}
                  <b>{Math.abs(remainingBudget).toLocaleString()}원</b>{' '}
                  {remainingBudget >= 0 ? '여유 있습니다!' : '초과 사용 중!'}
                </span>
                <span>{budgetProgress}%</span>
              </div>
            </div>

            {/* ★ [요청 위치] 최근 6개월 순자산 변동 추이 차트 (AI 코멘트 바로 위 위치) */}
            <div className="bg-gradient-to-br from-[#166553] via-[#0f4d3f] to-[#0a352b] text-white rounded-2xl p-4 shadow-md flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-emerald-200 font-extrabold block">
                    Asset Growth Trend
                  </span>
                  <h3 className="text-sm font-black text-white flex items-center gap-1.5 mt-0.5">
                    📈 순자산 성장 흐름 & 자산 변동
                  </h3>
                </div>
                <div className="bg-white/15 px-2.5 py-0.5 rounded-full text-[11px] font-black text-emerald-100">
                  총 순자산 {Math.round(netWorth / 10000).toLocaleString()}만원
                </div>
              </div>

              {/* 전월비 순자산 및 주식 손익 요약 */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 flex flex-col justify-between border border-white/10">
                  <span className="text-[10px] text-emerald-200 font-bold">전월비 순자산 변화</span>
                  <span className="font-black text-white text-sm mt-1">
                    {latestNetDiff >= 0 ? `+${(latestNetDiff / 10000).toFixed(0)}만원 🚀` : `-${Math.abs(latestNetDiff / 10000).toFixed(0)}만원`}
                  </span>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 flex flex-col justify-between border border-white/10">
                  <span className="text-[10px] text-emerald-200 font-bold">주식자산 전월비 변동</span>
                  <span className={`font-black text-sm mt-1 ${stockMonthDiff >= 0 ? 'text-emerald-300' : 'text-blue-300'}`}>
                    {stockMonthDiff >= 0 ? '+' : ''}{(stockMonthDiff / 10000).toFixed(1)}만원 ({stockMonthDiffRate >= 0 ? '+' : ''}{stockMonthDiffRate.toFixed(1)}%)
                  </span>
                </div>
              </div>

              {/* 토스/뱅크샐러드 스타일 곡선(Bezier) + 에메랄드 그라데이션 차트 + 인터랙티브 툴팁 */}
              {(() => {
                const minNet = Math.min(...netWorthTrend.map((n) => n.netWorth));
                const maxNet = Math.max(...netWorthTrend.map((n) => n.netWorth));
                const range = Math.max(100000, maxNet - minNet);

                // 6개 포인트 (x, y) 좌표 계산 (viewBox: 0 0 320 120)
                const pts = netWorthTrend.map((item, i) => {
                  const x = 25 + i * 54;
                  const ratio = range > 0 ? (item.netWorth - minNet) / range : 0.5;
                  const y = 90 - ratio * 60; // y 범위: 30 ~ 90
                  return { ...item, x, y, idx: i };
                });

                // 부드러운 Cubic Bezier 곡선 경로 생성
                const pathD = pts.reduce((acc, p, i, a) => {
                  if (i === 0) return `M ${p.x} ${p.y}`;
                  const prev = a[i - 1];
                  const cx1 = prev.x + (p.x - prev.x) / 2;
                  const cy1 = prev.y;
                  const cx2 = prev.x + (p.x - prev.x) / 2;
                  const cy2 = p.y;
                  return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p.x} ${p.y}`;
                }, '');

                const areaD = `${pathD} L ${pts[pts.length - 1].x} 110 L ${pts[0].x} 110 Z`;
                const curSel = pts[selectedTrendIndex] || pts[pts.length - 1];

                return (
                  <div className="bg-black/20 rounded-xl p-3 flex flex-col gap-1 border border-white/10">
                    {/* 터치/클릭 시 반응하는 상세 정보 말풍선(툴팁 바) */}
                    <div className="bg-emerald-950/60 border border-emerald-400/30 rounded-lg px-3 py-1.5 flex justify-between items-center text-xs">
                      <span className="font-extrabold text-emerald-300">
                        📌 {curSel.label} 순자산:
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-white text-sm">
                          {curSel.netWorth.toLocaleString()}원
                        </span>
                        <span className="text-[10px] text-emerald-200/90 font-medium">
                          (잉여금 {curSel.surplus >= 0 ? '+' : ''}{(curSel.surplus / 10000).toFixed(0)}만)
                        </span>
                      </div>
                    </div>

                    {/* 곡선 SVG 그래픽 영역 */}
                    <div className="relative w-full h-32 pt-2">
                      <svg viewBox="0 0 320 120" className="w-full h-full overflow-visible">
                        <defs>
                          <linearGradient id="emeraldAreaGradMain" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#34d399" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#34d399" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        {/* 가로 보조선 */}
                        <line x1="15" y1="30" x2="305" y2="30" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
                        <line x1="15" y1="60" x2="305" y2="60" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
                        <line x1="15" y1="90" x2="305" y2="90" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />

                        {/* 부드러운 그라데이션 영역 */}
                        <path d={areaD} fill="url(#emeraldAreaGradMain)" />

                        {/* 메인 에메랄드 곡선 라인 */}
                        <path d={pathD} fill="none" stroke="#34d399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                        {/* 각 월별 포인트 (터치/클릭 지원) */}
                        {pts.map((p) => {
                          const isSelected = selectedTrendIndex === p.idx;
                          return (
                            <g
                              key={p.idx}
                              className="cursor-pointer"
                              onClick={() => setSelectedTrendIndex(p.idx)}
                            >
                              <circle cx={p.x} cy={p.y} r="14" fill="transparent" />
                              {isSelected && (
                                <circle cx={p.x} cy={p.y} r="8" fill="rgba(52, 211, 153, 0.3)" />
                              )}
                              <circle
                                cx={p.x}
                                cy={p.y}
                                r={isSelected ? '5' : '3.5'}
                                fill={isSelected ? '#ffffff' : '#34d399'}
                                stroke={isSelected ? '#10b981' : '#ffffff'}
                                strokeWidth="2"
                              />
                            </g>
                          );
                        })}
                      </svg>
                    </div>

                    {/* 월별 라벨 (독립된 그리드 영역으로 글자 포개짐/겹침 원천 차단!) */}
                    <div className="grid grid-cols-6 text-center pt-1 pb-1">
                      {pts.map((p) => (
                        <button
                          key={p.idx}
                          type="button"
                          onClick={() => setSelectedTrendIndex(p.idx)}
                          className={`text-[11px] font-black transition-all ${
                            selectedTrendIndex === p.idx
                              ? 'text-emerald-300 scale-110 font-black'
                              : 'text-white/60 hover:text-white'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>

                    {/* 하단 안내 설명문 (충분한 상단 여백 및 구분선으로 분리 배치) */}
                    <div className="flex justify-between items-center text-[10px] text-emerald-200/80 pt-2 mt-1 border-t border-white/10 font-medium">
                      <span>* 터치 시 해당 월 세부 지표 확인</span>
                      <span>순잉여금 + 금융평가액 - 대출 반영</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* AI 소비 분석 코멘트 (Gemini 실시간 연동) */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3">
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

            {/* 부부 통장 쪼개기 잔액 현황 */}
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

            {/* 부동산/보증금 & 대출 내역 */}
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

            {/* 주식·ETF 포트폴리오 (실시간 시세 API 연동 버튼 포함) */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-gray-900">
                      📈 주식·ETF 포트폴리오
                    </span>
                    {lastStockSyncTime && (
                      <span className="text-[10px] bg-emerald-50 text-[#166553] px-1.5 py-0.5 rounded font-bold">
                        {lastStockSyncTime}
                      </span>
                    )}
                  </div>
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
                <div className="flex flex-wrap justify-end gap-1.5">
                  <button
                    onClick={() => syncRealTimeStockPrices(false)}
                    disabled={isStockSyncing}
                    className="text-[11px] bg-[#ebf5f2] text-[#166553] px-2.5 py-1.5 rounded-lg font-extrabold flex items-center gap-1 hover:bg-[#d8ece6] transition disabled:opacity-50"
                  >
                    <RefreshCw
                      size={12}
                      className={isStockSyncing ? 'animate-spin' : ''}
                    />
                    {isStockSyncing ? '시세 연동중...' : '실시간 시세 연동'}
                  </button>
                  <button
                    onClick={() => setBulkPriceModal(true)}
                    className="text-[11px] bg-gray-100 text-gray-700 px-2 py-1.5 rounded-lg font-bold"
                  >
                    수동수정
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
                          {st.code && st.code !== '-' && (
                            <span className="text-[10px] text-gray-400 font-semibold">
                              ({st.code})
                            </span>
                          )}
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
      {/* 1) 영수증 입력/수정 모달 (카드 결제 문자 자동분석 포함) */}
      {isTxModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveTx}
            className="bg-white rounded-2xl p-5 w-full max-w-sm flex flex-col gap-3 shadow-xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center">
              <span className="font-black text-gray-900">
                {editingTx ? '내역 수정' : '새 가계부 내역 입력'}
              </span>
              <button type="button" onClick={() => setIsTxModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {/* 추천 4) 카드 결제 문자/카톡 붙여넣기 자동 완성 박스 */}
            {!editingTx && (
              <div className="bg-[#f4f9f7] border border-[#166553]/20 rounded-xl p-3 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-extrabold text-[#166553] flex items-center gap-1">
                    📱 카드 결제 문자·카톡 자동 입력
                  </span>
                  <button
                    type="button"
                    onClick={handleAnalyzeSingleSms}
                    disabled={isSmsParsing || !smsText.trim()}
                    className="text-[11px] bg-[#166553] text-white px-2.5 py-1 rounded-lg font-bold disabled:opacity-40"
                  >
                    {isSmsParsing ? 'AI 분석중...' : '⚡ 자동 채우기'}
                  </button>
                </div>
                <textarea
                  value={smsText}
                  onChange={(e) => setSmsText(e.target.value)}
                  placeholder="카드 승인 문자나 '할머니순대국 18000원', 'LGU+ 25000원 결제' 등을 붙여넣고 [자동 채우기]를 누르세요!"
                  rows={2}
                  className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs font-medium resize-none focus:outline-none focus:border-[#166553]"
                />
              </div>
            )}

            <div>
              <label className="font-extrabold text-gray-700 block mb-1 text-xs">거래 유형</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { type: '지출', label: '지출', color: 'bg-red-500 text-white' },
                  { type: '수입', label: '수입', color: 'bg-emerald-600 text-white' },
                  { type: '이체/카드대금', label: '💳 카드대금', color: 'bg-indigo-600 text-white' },
                ].map((t) => (
                  <button
                    type="button"
                    key={t.type}
                    onClick={() => setTxForm({ ...txForm, type: t.type })}
                    className={`py-2 rounded-xl text-xs font-extrabold transition ${
                      txForm.type === t.type ? t.color : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
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
                {ALL_CATEGORIES.map((c) => (
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
              placeholder="메모 (예: 마트 장보기, 식당 이름)"
              value={txForm.memo}
              onChange={(e) => {
                const newMemo = e.target.value;
                // 메모를 직접 입력할 때도 자동으로 식당/통신비/교통비 등 카테고리 추론
                const guessed = classifyKoreanMerchant(newMemo);
                setTxForm((prev) => ({
                  ...prev,
                  memo: newMemo,
                  category:
                    guessed !== '용돈/기타' ? guessed : prev.category,
                }));
              }}
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

      {/* 1-2) 카드 결제 문자 여러 건 일괄 입력 모달 */}
      {isBulkSmsModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-md flex flex-col gap-3 shadow-xl max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex justify-between items-center">
              <span className="font-black text-sm text-gray-900">
                📱 카드 승인 문자 여러 건 일괄 입력
              </span>
              <button onClick={() => setIsBulkSmsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <p className="text-gray-500 leading-relaxed">
              여러 개의 카드 결제 문자(빈 줄로 구분)를 그대로 붙여넣으시면,
              식당·통신비·교통비·마트 등을 AI와 업종 사전으로 자동 분류합니다.
            </p>
            <textarea
              value={bulkSmsText}
              onChange={(e) => setBulkSmsText(e.target.value)}
              rows={5}
              placeholder={`예시:\n[신한카드 승인]\n28,600원 일시불\n10/25 19:30 송도숯불갈비\n\nLGU+ 통신요금 45,000원 결제`}
              className="w-full border border-gray-200 rounded-xl p-3 text-xs font-medium resize-y focus:outline-none focus:border-[#166553]"
            />
            <button
              type="button"
              onClick={handleAnalyzeBulkSms}
              disabled={isBulkSmsLoading || !bulkSmsText.trim()}
              className="bg-[#ebf5f2] text-[#166553] py-2 rounded-xl font-extrabold hover:bg-[#d8ece6] disabled:opacity-40"
            >
              {isBulkSmsLoading
                ? '🤖 AI가 가맹점 업종 분석 중...'
                : '🔍 내역 분석하기'}
            </button>

            {parsedBulkItems.length > 0 && (
              <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
                <span className="font-extrabold text-gray-800">
                  분석 결과 ({parsedBulkItems.length}건) - 카테고리 수정 가능
                </span>
                {parsedBulkItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 bg-[#f8fbfa] p-2.5 rounded-xl border border-gray-100"
                  >
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-extrabold text-gray-900 truncate">
                        {item.memo}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {item.date} · {Number(item.amount).toLocaleString()}원
                      </span>
                    </div>
                    <select
                      value={item.category}
                      onChange={(e) => {
                        const next = [...parsedBulkItems];
                        next[idx] = { ...next[idx], category: e.target.value };
                        setParsedBulkItems(next);
                      }}
                      className="border rounded-lg px-2 py-1 font-bold text-xs bg-white"
                    >
                      {EXPENSE_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleSaveBulkSmsItems}
                  className="bg-[#166553] text-white py-2.5 rounded-xl font-extrabold mt-1"
                >
                  가계부에 {parsedBulkItems.length}건 일괄 저장하기
                </button>
              </div>
            )}
          </div>
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

      {/* 5) 주식/ETF 개별 수정/추가 모달 (종목코드 입력 지원) */}
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
              placeholder="종목명 (예: 삼성전자, TIGER 미국S&P500)"
              className="border rounded-xl px-3 py-2 font-bold"
              required
            />
            <input
              name="code"
              defaultValue={
                stockModal.item?.code && stockModal.item?.code !== '-'
                  ? stockModal.item.code
                  : ''
              }
              placeholder="종목코드 6자리 (선택, 비워두면 이름으로 자동검색)"
              className="border rounded-xl px-3 py-2 font-bold"
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
              placeholder="현재가 (원, 저장 후 실시간 시세연동 가능)"
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
                ⚡ 보유 종목 현재가 수동 업데이트
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
