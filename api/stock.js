export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const KNOWN_CODES = {
    '삼성전자': '005930',
    '삼전': '005930',
    '삼성전자우': '005935',
    'sk하이닉스': '000660',
    '하이닉스': '000660',
    '현대차': '005380',
    '현대자동차': '005380',
    '기아': '000270',
    '기아차': '000270',
    'naver': '035420',
    '네이버': '035420',
    '카카오': '035720',
    'lg에너지솔루션': '373220',
    '삼성바이오로직스': '207940',
    '셀트리온': '068270',
    '포스코홀딩스': '005490',
    'posco홀딩스': '005490',
    'kb금융': '105560',
    '신한지주': '055550',
    '하나금융지주': '086790',
    '메리츠금융지주': '138040',
    '한화에어로스페이스': '012450',
    '두산에너빌리티': '034020',
    'tiger미국s&p500': '360750',
    '타이거미국s&p500': '360750',
    'kodex미국s&p500': '379800',
    'kodex미국s&p500tr': '379800',
    '코덱스미국s&p500': '379800',
    'kodex미국나스닥100': '379810',
    'kodex미국나스닥100tr': '379810',
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
    'tiger200': '102110'
  };

  const normalize = (s) => String(s || '').toLowerCase().replace(/[\s_\-.,()]/g, '');

  async function searchCodeByName(rawName, etfList) {
    const cleanName = String(rawName || '').trim();
    if (!cleanName) return null;

    if (/^[0-9A-Z]{6}$/i.test(cleanName)) {
      return cleanName.toUpperCase();
    }

    const norm = normalize(cleanName);
    if (KNOWN_CODES[norm]) return KNOWN_CODES[norm];

    // 1) Check full Naver ETF list if available
    if (Array.isArray(etfList) && etfList.length > 0) {
      const exactEtf = etfList.find((item) => normalize(item.itemname) === norm);
      if (exactEtf?.itemcode) return exactEtf.itemcode;

      const normWithoutTr = norm.replace(/tr$/, '');
      const partialEtf = etfList.find((item) => {
        const inorm = normalize(item.itemname);
        return inorm === normWithoutTr || inorm.includes(norm) || norm.includes(inorm);
      });
      if (partialEtf?.itemcode) return partialEtf.itemcode;
    }

    // 2) Naver autocomplete search API
    const queries = [
      cleanName,
      cleanName.replace(/TR$/i, '').trim(),
      cleanName.replace(/([A-Za-z0-9&]+)/g, ' $1 ').replace(/\s+/g, ' ').trim()
    ];

    for (const q of queries) {
      if (!q) continue;
      try {
        const url = `https://ac.stock.naver.com/ac?q=${encodeURIComponent(q)}&target=stock,etf,index`;
        const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (r.ok) {
          const data = await r.json();
          const items = data?.items || [];
          if (items.length > 0) {
            const exact = items.find((it) => normalize(it.name) === norm);
            return (exact || items[0]).code;
          }
        }
      } catch (e) {}
    }

    return null;
  }

  // 실시간 현재가 조회
  async function fetchBasicPrice(code) {
    if (!code) return null;
    try {
      const url = `https://m.stock.naver.com/api/stock/${encodeURIComponent(code)}/basic?_=${Date.now()}`;
      const r = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Cache-Control': 'no-cache'
        }
      });
      if (!r.ok) return null;
      const data = await r.json();
      const rawPrice =
        data?.overMarketPriceInfo?.overMarketStatus === 'OPEN' && data?.overMarketPriceInfo?.overPrice
          ? data.overMarketPriceInfo.overPrice
          : data?.closePrice || data?.nowVal;
      const price = Number(String(rawPrice || '').replace(/,/g, ''));
      if (!isNaN(price) && price > 0) {
        return {
          code: data?.itemCode || code,
          name: data?.stockName || '',
          price
        };
      }
    } catch (e) {}
    return null;
  }

  // 직전 달(전월) 마지막 거래일 공식 종가 실시간 조회
  async function fetchPrevMonthPrice(code) {
    if (!code) return null;
    try {
      const now = new Date();
      // 전월 prefix 계산 (예: 10월이면 9월 '2026-09')
      const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevYear = prevDate.getFullYear();
      const prevMonth = String(prevDate.getMonth() + 1).padStart(2, '0');
      const targetPrefix = `${prevYear}-${prevMonth}`;

      const url = `https://m.stock.naver.com/api/stock/${encodeURIComponent(code)}/price?page=1&pageSize=35&_=${Date.now()}`;
      const r = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Cache-Control': 'no-cache'
        }
      });
      if (!r.ok) return null;
      const data = await r.json();
      const list = Array.isArray(data) ? data : (data?.value || []);
      const match = list.find((it) => it?.localTradedAt && it.localTradedAt.startsWith(targetPrefix));
      if (match?.closePrice) {
        const p = Number(String(match.closePrice).replace(/,/g, ''));
        if (!isNaN(p) && p > 0) return p;
      }
    } catch (e) {}
    return null;
  }

  try {
    const items = req.method === 'POST' ? (req.body?.stocks || []) : [
      { id: 'q', name: req.query?.name || '', code: req.query?.code || '' }
    ];

    // ETF 리스트 로드
    let etfList = [];
    try {
      const etfRes = await fetch('https://finance.naver.com/api/sise/etfItemList.nhn?_=' + Date.now(), {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      if (etfRes.ok) {
        const buffer = await etfRes.arrayBuffer();
        const text = new TextDecoder('euc-kr').decode(buffer);
        const parsed = JSON.parse(text);
        etfList = parsed?.result?.etfItemList || [];
      }
    } catch (e) {}

    const results = {};
    await Promise.all(
      items.map(async (st) => {
        const rawName = String(st.name || '').trim();
        const rawCode = String(st.code || '').trim();
        const validInputCode = /^[0-9A-Z]{6}$/i.test(rawCode) ? rawCode.toUpperCase() : '';

        const nameResolvedCode = await searchCodeByName(rawName, etfList);
        let targetCode = nameResolvedCode || validInputCode;

        if (validInputCode && nameResolvedCode && validInputCode !== nameResolvedCode) {
          const checkInput = await fetchBasicPrice(validInputCode);
          if (checkInput && rawName && normalize(checkInput.name).includes(normalize(rawName))) {
            const prevP = await fetchPrevMonthPrice(validInputCode);
            results[st.id] = {
              ...checkInput,
              prevMonthPrice: prevP || null
            };
            return;
          }
          targetCode = nameResolvedCode;
        }

        if (targetCode) {
          const [info, prevP] = await Promise.all([
            fetchBasicPrice(targetCode),
            fetchPrevMonthPrice(targetCode)
          ]);

          if (info && info.price > 0) {
            results[st.id] = {
              ...info,
              prevMonthPrice: prevP || null
            };
            return;
          }

          // Fallback to etfList price
          const etfMatch = etfList.find((it) => it.itemcode === targetCode);
          if (etfMatch?.nowVal) {
            results[st.id] = {
              code: targetCode,
              name: etfMatch.itemname,
              price: Number(etfMatch.nowVal),
              prevMonthPrice: prevP || null
            };
          }
        }
      })
    );

    return res.status(200).json({ ok: true, results });
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
}
