/*
 * 규칙 예측 로직 (실제 머신러닝 없음)
 * "AI는 반복되는 부분을 찾아서 맞혀요"와 똑같이 동작한다.
 *
 * 1. 가장 짧은 주기 p(1~4)를 찾는다: 모든 i >= p 에 대해 seq[i] === seq[i - p]
 * 2. n >= 2p  → 확신(confident). 다음 타일 = seq[n - p]
 *    n <  2p  → 데이터 부족(need_more)
 *    못 찾음   → 규칙 깨짐(confused)
 * 3. 예외
 *    - n < 2           → need_more
 *    - p = 1 (한 가지만) → single (확신이지만 다른 타일을 섞어 보자고 권함)
 *    - [추가 규칙] 아직 두 번 다 보이지 않았는데(n < 2p) 찾은 단위의 처음과 끝이
 *      같으면(예: ★♥★) confused 로 본다. ★♥★★♥ 처럼 AB 규칙이 흐트러진 경우를
 *      "조금 더 보여 주세요"가 아니라 "헷갈려요"로 알려 주기 위함(명세 5-2 테스트).
 */
(function (root) {
  var MAX_PERIOD = 4;
  var FLOOR_SIZE = 24;

  function findPeriod(seq) {
    var n = seq.length;
    for (var p = 1; p <= MAX_PERIOD; p++) {
      var ok = true;
      for (var i = p; i < n; i++) {
        if (seq[i] !== seq[i - p]) { ok = false; break; }
      }
      if (ok) return p;
    }
    return 0;
  }

  function predict(seq) {
    var n = seq.length;
    if (n < 2) return { status: 'need_more', period: 0 };
    var p = findPeriod(seq);
    if (!p) return { status: 'confused', period: 0 };
    if (n >= 2 * p) {
      var next = seq[n - p];
      return {
        status: p === 1 ? 'single' : 'confident',
        period: p,
        next: next,
        unit: seq.slice(0, p)
      };
    }
    if (p >= 2 && seq[0] === seq[p - 1]) return { status: 'confused', period: 0 };
    return { status: 'need_more', period: p };
  }

  /* 찾은 주기로 바닥을 끝까지 채운다: full[i] = full[i - p] */
  function fill(seq, period, size) {
    size = size || FLOOR_SIZE;
    var out = seq.slice(0, size);
    for (var i = out.length; i < size; i++) out.push(out[i - period]);
    return out;
  }

  /* 자유 모드: AI 판단 없이 가장 짧은 주기(없으면 놓은 것 전체)를 반복 */
  function freePeriod(seq) {
    return findPeriod(seq) || seq.length;
  }

  /* 로봇 경로(교과서 125쪽 지그재그): 경로 순서 k → {row, col} */
  function pathCell(k, cols) {
    cols = cols || 6;
    var row = Math.floor(k / cols), c = k % cols;
    return { row: row, col: row % 2 === 0 ? c : cols - 1 - c };
  }

  var api = {
    MAX_PERIOD: MAX_PERIOD, FLOOR_SIZE: FLOOR_SIZE,
    findPeriod: findPeriod, predict: predict, fill: fill,
    freePeriod: freePeriod, pathCell: pathCell
  };
  root.RuleAI = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
