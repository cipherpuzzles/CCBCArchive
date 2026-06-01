const NUM_GAMES = 10;
const SECRET = "SGFUNCTION";
const STORAGE_KEY = "puzzleBackendStatus-ccbc13-impartialgame-20";
const BLOCK_WHITE = "\u2B1C";
const BLOCK_BLACK = "\u2B1B";
function getRandomItem(arr) {
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}
function popcount(i) {
  i = i - (i >> 1 & 1431655765);
  i = (i & 858993459) + (i >> 2 & 858993459);
  i = i + (i >> 4) & 252645135;
  i = i + (i >> 8);
  i = i + (i >> 16);
  return i & 63;
}
function mex(set) {
  let val = 0;
  while (set.has(val))
    val++;
  return val;
}
function isGameFinished(game, state) {
  return game.getValidMoves(state).length === 0;
}
function getRandomMove(game, state) {
  const moves = game.getValidMoves(state);
  if (moves.length === 0)
    return null;
  return getRandomItem(moves);
}
function getBestMove(game, state) {
  if (game.evaluate(state) === 0) {
    return getRandomMove(game, state);
  }
  const moves = game.getValidMoves(state);
  const winningMoves = [];
  for (const move of moves) {
    const nextState = game.nextState(state, move);
    if (game.evaluate(nextState) === 0) {
      winningMoves.push(move);
    }
  }
  return winningMoves.length > 0 ? getRandomItem(winningMoves) : getRandomMove(game, state);
}
function computeValMap(game) {
  const map = /* @__PURE__ */ new Map();
  function evaluate(state) {
    if (map.has(state)) {
      return map.get(state);
    }
    const valSet = /* @__PURE__ */ new Set();
    const moves = game.getValidMoves(state);
    for (const move of moves) {
      valSet.add(evaluate(state ^ move));
    }
    const val = mex(valSet);
    map.set(state, val);
    return val;
  }
  evaluate(game.initialState);
  return map;
}
const game0 = {
  name: "\u2297",
  nR: 5,
  nC: 5,
  isReverse: false,
  initialState: 29305842
};
game0.valArr = (() => {
  const arr = [];
  for (let i = 0; i < 5; i++)
    for (let j = 0; j < 5; j++) {
      const valSet = /* @__PURE__ */ new Set();
      for (let x = 0; x < i; x++)
        for (let y = 0; y < j; y++) {
          valSet.add(arr[x * 5 + y] ^ arr[x * 5 + j] ^ arr[i * 5 + y]);
        }
      arr.push(mex(valSet));
    }
  return arr;
})();
game0.evaluate = (state) => {
  let res = 0;
  for (let i = 0; i < 25; i++) {
    if (state >> i & 1) {
      res ^= game0.valArr[i];
    }
  }
  return res;
};
game0.getValidMoves = (state) => {
  const moves = [];
  for (let i = 0; i < 5; i++)
    for (let j = 0; j < 5; j++) {
      if (state >> i * 5 + j & 1) {
        for (let x = 0; x < i; x++)
          for (let y = 0; y < j; y++) {
            moves.push(1 << i * 5 + j ^ 1 << x * 5 + j ^ 1 << i * 5 + y ^ 1 << x * 5 + y);
          }
      }
    }
  return moves;
};
game0.isValidMove = (state, move) => game0.getValidMoves(state).includes(move);
const game1 = {
  name: "0.77",
  nR: 1,
  nC: 9,
  isReverse: false,
  initialState: 511
};
game1.isValidMove = (state, move) => {
  if (!Number.isInteger(move))
    return false;
  if (move <= 0 || move >= 1 << 9)
    return false;
  const pct = popcount(move);
  if (pct > 2)
    return false;
  if ((state & move) !== move)
    return false;
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < 9; i++) {
    if (move >> i & 1) {
      min = Math.min(min, i);
      max = Math.max(max, i);
    }
  }
  return max - min + 1 === pct;
};
game1.valArr = (() => {
  const arr = [0];
  for (let i = 1; i <= 9; i++) {
    const valSet = /* @__PURE__ */ new Set();
    for (let len = 1; len <= 2; len++) {
      const sum = i - len;
      for (let j = 0; j <= sum; j++) {
        valSet.add(arr[j] ^ arr[sum - j]);
      }
    }
    arr.push(mex(valSet));
  }
  return arr;
})();
game1.evaluate = (state) => {
  let res = 0;
  for (let i = 0; i < 9; i++) {
    if (~(state >> i) & 1)
      continue;
    let j = i;
    while (j < 9 && state >> j & 1)
      j++;
    res ^= game1.valArr[j - i];
    i = j;
  }
  return res;
};
game1.getValidMoves = (state) => {
  const allMoves = [];
  for (let i = 0; i < 9; i++)
    for (let len = 1; len <= 2 && i + len <= 9; len++) {
      let move = 0;
      for (let l = i; l < i + len; l++)
        move ^= 1 << l;
      allMoves.push(move);
    }
  return allMoves.filter((move) => game1.isValidMove(state, move));
};
const game2 = {
  name: "Adj-free",
  nR: 5,
  nC: 5,
  isReverse: false,
  initialState: 1048596
};
game2.forbidden = (() => {
  const arr = [];
  for (let xi = 0; xi < 5; xi++) {
    for (let yi = 0; yi < 5; yi++) {
      const i = xi * 5 + yi;
      if (xi !== 4)
        arr.push(1 << i ^ 1 << i + 5);
      if (yi !== 4)
        arr.push(1 << i ^ 1 << i + 1);
    }
  }
  return arr;
})();
function game2IsValidState(state) {
  for (const pattern of game2.forbidden) {
    if ((state & pattern) === pattern)
      return false;
  }
  return true;
}
game2.isValidMove = (state, move) => {
  if (!Number.isInteger(move))
    return false;
  if (move <= 0 || move >= 1 << 25)
    return false;
  if (popcount(move) !== 1)
    return false;
  if (state & move)
    return false;
  return game2IsValidState(state ^ move);
};
game2.getValidMoves = (state) => {
  const moves = [];
  for (let i = 0; i < 25; i++) {
    if (state >> i & 1)
      continue;
    if (game2.isValidMove(state, 1 << i)) {
      moves.push(1 << i);
    }
  }
  return moves;
};
game2.valMap = computeValMap(game2);
game2.evaluate = (state) => game2.valMap.get(state);
const game3 = {
  name: "Triplets",
  nR: 1,
  nC: 10,
  isReverse: false,
  initialState: 932
};
game3.isValidMove = (state, move) => {
  if (!Number.isInteger(move))
    return false;
  if (move <= 0 || move >= 1 << 10)
    return false;
  if (popcount(move) !== 3)
    return false;
  let last = null;
  for (let i = 0; i < 10; i++) {
    if (move >> i & 1)
      last = i;
  }
  if (last === null)
    return false;
  return (state >> last & 1) === 1;
};
game3.valArr = (() => {
  const arr = [];
  for (let i = 0; i < 10; i++) {
    const valSet = /* @__PURE__ */ new Set();
    for (let j = 0; j < i; j++)
      for (let k = j + 1; k < i; k++) {
        valSet.add(arr[j] ^ arr[k]);
      }
    arr.push(mex(valSet));
  }
  return arr;
})();
game3.evaluate = (state) => {
  let res = 0;
  for (let i = 0; i < 10; i++) {
    if (state >> i & 1) {
      res ^= game3.valArr[i];
    }
  }
  return res;
};
game3.getValidMoves = (state) => {
  const moves = [];
  for (let i = 0; i < 10; i++)
    if (state >> i & 1) {
      for (let j = 0; j < i; j++)
        for (let k = j + 1; k < i; k++) {
          moves.push(1 << i ^ 1 << j ^ 1 << k);
        }
    }
  return moves;
};
const game4 = {
  name: "Subtraction",
  nR: 1,
  nC: 8,
  isReverse: true,
  initialState: 22 + 27 * 7
};
game4.evaluate = (state) => state % 27;
game4.isValidMove = (state, move) => {
  if (!Number.isInteger(move))
    return false;
  if (move <= 0 || move >= 1 << 8)
    return false;
  const nextState = state ^ move;
  const diff = state - nextState;
  return 1 <= diff && diff <= 26;
};
game4.getValidMoves = (state) => {
  const moves = [];
  for (let i = 1; i <= 26 && i <= state; i++) {
    const nextState = state - i;
    moves.push(state ^ nextState);
  }
  return moves;
};
const game5 = {
  name: "\u2295 (v2)",
  nR: 5,
  nC: 5,
  isReverse: false,
  initialState: 32957866
};
game5.evaluate = (state) => {
  let result = 0;
  for (let x = 0; x < 5; x++)
    for (let y = 0; y < 5; y++)
      if (state >> x * 5 + y & 1) {
        result ^= x ^ y;
      }
  return result;
};
game5.isValidMove = (state, move) => {
  if (!Number.isInteger(move))
    return false;
  if (move <= 0 || move >= 1 << 25)
    return false;
  if (popcount(move) !== 2)
    return false;
  if ((state ^ move) > state)
    return false;
  const idxArr = [];
  for (let i = 0; i < 25; i++) {
    if (move >> i & 1)
      idxArr.push(i);
  }
  if (idxArr.length !== 2)
    return false;
  const xi = Math.floor(idxArr[0] / 5);
  const yi = idxArr[0] % 5;
  const xj = Math.floor(idxArr[1] / 5);
  const yj = idxArr[1] % 5;
  return xi === xj || yi === yj;
};
game5.getValidMoves = (state) => {
  const moves = [];
  for (let x = 0; x < 5; x++)
    for (let y1 = 0; y1 < 5; y1++)
      for (let y2 = y1 + 1; y2 < 5; y2++) {
        const i = x * 5 + y1;
        const j = x * 5 + y2;
        if (state >> j & 1) {
          moves.push(1 << i ^ 1 << j);
        }
      }
  for (let y = 0; y < 5; y++)
    for (let x1 = 0; x1 < 5; x1++)
      for (let x2 = x1 + 1; x2 < 5; x2++) {
        const i = x1 * 5 + y;
        const j = x2 * 5 + y;
        if (state >> j & 1) {
          moves.push(1 << i ^ 1 << j);
        }
      }
  return moves;
};
const game6 = {
  name: "Knight",
  nR: 5,
  nC: 5,
  isReverse: false,
  initialState: 39168
};
function isKnightRelated(i, j) {
  const xi = Math.floor(i / 5);
  const yi = i % 5;
  const xj = Math.floor(j / 5);
  const yj = j % 5;
  const xd = Math.abs(xi - xj);
  const yd = Math.abs(yi - yj);
  return xd + yd === 3 && xd * yd === 2;
}
game6.isValidMove = (state, move) => {
  if (!Number.isInteger(move))
    return false;
  if (move <= 0 || move >= 1 << 25)
    return false;
  if (popcount(move) !== 2)
    return false;
  if (state & move)
    return false;
  const idxArr = [];
  for (let i = 0; i < 25; i++) {
    if (move >> i & 1)
      idxArr.push(i);
  }
  return idxArr.length === 2 && isKnightRelated(idxArr[0], idxArr[1]);
};
game6.validMoveArr = (() => {
  const moves = [];
  for (let i = 0; i < 25; i++)
    for (let j = i + 1; j < 25; j++) {
      if (isKnightRelated(i, j)) {
        moves.push(1 << i ^ 1 << j);
      }
    }
  return moves;
})();
game6.getValidMoves = (state) => game6.validMoveArr.filter((move) => !(move & state));
game6.valMap = computeValMap(game6);
game6.evaluate = (state) => game6.valMap.get(state);
const game7 = {
  name: "\u2295",
  nR: 4,
  nC: 5,
  isReverse: true,
  initialState: 1011085
};
game7.evaluate = (state) => {
  let res = 0;
  while (state) {
    res ^= state & 31;
    state >>= 5;
  }
  return res;
};
game7.isValidMove = (state, move) => {
  if (!Number.isInteger(move))
    return false;
  if (move <= 0 || move >= 1 << 20)
    return false;
  let hasRow = false;
  for (let i = 0; i < 4; i++) {
    const rowMove = move & 31;
    if (rowMove) {
      if (hasRow)
        return false;
      hasRow = true;
      const rowState = state & 31;
      const rowNextState = rowState ^ rowMove;
      if (rowNextState >= rowState)
        return false;
    }
    move >>= 5;
    state >>= 5;
  }
  return hasRow;
};
game7.getValidMoves = (state) => {
  const moves = [];
  for (let i = 0; i < 4; i++) {
    const rowState = state & 31;
    for (let j = 0; j < rowState; j++) {
      moves.push((rowState ^ j) << i * 5);
    }
    state >>= 5;
  }
  return moves;
};
const game8 = {
  name: "Chomp",
  nR: 4,
  nC: 5,
  isReverse: false,
  initialState: (1 << 17) - 2
};
game8.getValidMoves = (state) => {
  const moves = [];
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 5; j++) {
      if (state >> i * 5 + j & 1) {
        let move = 0;
        for (let x = i; x < 4; x++)
          for (let y = j; y < 5; y++) {
            if (state >> x * 5 + y & 1) {
              move |= 1 << x * 5 + y;
            }
          }
        moves.push(move);
      }
    }
  return moves;
};
game8.isValidMove = (state, move) => game8.getValidMoves(state).includes(move);
game8.valMap = computeValMap(game8);
game8.evaluate = (state) => game8.valMap.get(state);
const game9 = {
  name: "Wythoff",
  nR: 2,
  nC: 10,
  isReverse: false,
  initialState: (1 << 10) - 1 + ((1 << 8) - 1 << 10)
};
game9.getValidMoves = (state) => {
  const moves = [];
  const a = popcount(state & 1023);
  const b = popcount(state >> 10);
  for (let i = 1; i <= a; i++) {
    moves.push((1 << i) - 1 << a - i);
  }
  for (let i = 1; i <= b; i++) {
    moves.push((1 << i) - 1 << b - i + 10);
  }
  const min = Math.min(a, b);
  for (let i = 1; i <= min; i++) {
    moves.push(((1 << i) - 1 << a - i) + ((1 << i) - 1 << b - i + 10));
  }
  return moves;
};
game9.isValidMove = (state, move) => game9.getValidMoves(state).includes(move);
game9.valMap = computeValMap(game9);
game9.evaluate = (state) => game9.valMap.get(state);
const allGames = [game7, game5, game0, game9, game1, game8, game4, game6, game3, game2];
allGames.forEach((game, id) => {
  game.nextState = (state, move) => state ^ move;
  game.id = id;
  game.nn = game.nR * game.nC;
  game.outputState = (state) => {
    const output = [];
    for (let i = 0; i < game.nR; i++) {
      const row = [];
      for (let j = 0; j < game.nC; j++) {
        const id2 = i * game.nC + (game.isReverse ? game.nC - 1 - j : j);
        row.push(state >> id2 & 1 ? BLOCK_BLACK : BLOCK_WHITE);
      }
      output.push(row.join(""));
    }
    return output.join("\n");
  };
});
function impartialGameInternal(request) {
  const game = allGames[request.gameId ?? -1];
  const state = request.state ?? 0;
  const move = request.move ?? 0;
  if (!game) {
    return {
      valid: false,
      message: "\u672A\u77E5\u7684\u5173\u5361"
    };
  }
  if (request.func === "getGameInfo") {
    return {
      nRow: game.nR,
      nCol: game.nC,
      isReverse: game.isReverse,
      initialState: game.initialState
    };
  }
  if (request.func === "suggestMove") {
    const move2 = getRandomMove(game, state);
    if (move2 === null) {
      return {
        message: "\u6CA1\u6709\u5408\u6CD5\u7684\u884C\u52A8"
      };
    }
    return {
      move: move2,
      message: "\u5DF2\u751F\u6210\u968F\u673A\u884C\u52A8"
    };
  }
  if (request.func === "executeMove") {
    if (!game.isValidMove(state, move)) {
      return {
        valid: false,
        message: "\u65E0\u6548\u7684\u884C\u52A8"
      };
    }
    const nextState = game.nextState(state, move);
    const message = [];
    message.push("\u73A9\u5BB6\u5DF2\u884C\u52A8\u3002\u884C\u52A8\u540E\u7684\u5C40\u9762\uFF1A\n" + game.outputState(nextState));
    if (isGameFinished(game, nextState)) {
      return {
        valid: true,
        won: true,
        state: nextState,
        message
      };
    }
    const comMove = getBestMove(game, nextState);
    if (comMove === null) {
      return {
        valid: true,
        won: true,
        state: nextState,
        message
      };
    }
    const nextNextState = game.nextState(nextState, comMove);
    message.push("\u7535\u8111\u5DF2\u884C\u52A8\u3002\u884C\u52A8\u540E\u7684\u5C40\u9762\uFF1A\n" + game.outputState(nextNextState));
    return {
      valid: true,
      won: false,
      comMove,
      state: nextNextState,
      lost: isGameFinished(game, nextNextState),
      message
    };
  }
  return {
    valid: false,
    message: "\u672A\u77E5\u7684\u64CD\u4F5C"
  };
}
function defaultCache() {
  return {
    wons: Array(NUM_GAMES).fill(false),
    history: Array.from({ length: NUM_GAMES }, () => []),
    states: Array(NUM_GAMES).fill(null)
  };
}
function getCache() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw)
    return defaultCache();
  try {
    const parsed = JSON.parse(raw);
    const cache = defaultCache();
    if (Array.isArray(parsed.wons)) {
      for (let i = 0; i < NUM_GAMES; i++)
        cache.wons[i] = Boolean(parsed.wons[i]);
    }
    if (Array.isArray(parsed.history)) {
      for (let i = 0; i < NUM_GAMES; i++)
        cache.history[i] = Array.isArray(parsed.history[i]) ? parsed.history[i] : [];
    }
    if (Array.isArray(parsed.states)) {
      for (let i = 0; i < NUM_GAMES; i++)
        cache.states[i] = Number.isInteger(parsed.states[i]) ? parsed.states[i] : null;
    }
    return cache;
  } catch {
    return defaultCache();
  }
}
function saveCache(cache) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
}
function gameIdFromRequest(request) {
  if (!Number.isInteger(request.gameId) || request.gameId < 0 || request.gameId >= NUM_GAMES) {
    throw new Error("Invalid game id.");
  }
  return request.gameId;
}
function handleImpartialGame(request) {
  const cache = getCache();
  if (request.func === "getWonStatus") {
    return {
      wons: cache.wons,
      extras: cache.wons.map((won, i) => won ? `\u3010${SECRET[i]}\u3011` : "")
    };
  }
  const gameId = gameIdFromRequest(request);
  if (request.func === "selectGame") {
    const gameInfo = impartialGameInternal({
      func: "getGameInfo",
      gameId
    });
    if (cache.states[gameId] === null) {
      cache.states[gameId] = gameInfo.initialState;
      cache.history[gameId] = [gameInfo.initialState];
      saveCache(cache);
    }
    const state = cache.states[gameId];
    let message = `\u5F00\u59CB\u7B2C${gameId + 1}\u5173`;
    if (state !== gameInfo.initialState) {
      message += "\uFF0C\u5DF2\u8BFB\u53D6\u8FDB\u5EA6";
    }
    return {
      state,
      gameInfo,
      message
    };
  }
  if (request.func === "restartGame") {
    const gameInfo = impartialGameInternal({
      func: "getGameInfo",
      gameId
    });
    cache.states[gameId] = gameInfo.initialState;
    cache.history[gameId] = [gameInfo.initialState];
    saveCache(cache);
    return {
      state: gameInfo.initialState,
      message: "\u5DF2\u91CD\u7F6E"
    };
  }
  if (cache.states[gameId] === null) {
    const gameInfo = impartialGameInternal({
      func: "getGameInfo",
      gameId
    });
    cache.states[gameId] = gameInfo.initialState;
    cache.history[gameId] = [gameInfo.initialState];
  }
  if (request.func === "suggestMove") {
    return impartialGameInternal({
      ...request,
      state: cache.states[gameId]
    });
  }
  if (request.func === "executeMove") {
    const data = impartialGameInternal({
      ...request,
      state: cache.states[gameId]
    });
    if (data.valid && Number.isInteger(data.state)) {
      cache.states[gameId] = data.state;
      cache.history[gameId].push(data.state);
      if (data.won) {
        cache.wons[gameId] = true;
        data.extra = `\u3010${SECRET[gameId]}\u3011`;
        if (Array.isArray(data.message)) {
          data.message.push(`\u4F60\u8D62\u4E86\uFF01\u4F60\u83B7\u5F97\u4E86\u4E00\u4E9B\u4FE1\u606F\uFF1A${data.extra}`);
        }
      } else if (data.lost && Array.isArray(data.message)) {
        data.message.push("\u4F60\u8F93\u4E86\uFF01");
      }
    }
    saveCache(cache);
    return data;
  }
  if (request.func === "undoMove") {
    if (cache.history[gameId].length <= 1) {
      return {
        state: cache.states[gameId],
        message: "\u65E0\u6CD5\u64A4\u9500"
      };
    }
    cache.history[gameId].pop();
    cache.states[gameId] = cache.history[gameId][cache.history[gameId].length - 1];
    saveCache(cache);
    return {
      state: cache.states[gameId],
      message: "\u5DF2\u64A4\u9500"
    };
  }
  throw new Error("Unknown impartial game request.");
}
function apiResponse(result) {
  return {
    json: async () => result
  };
}
async function archiveApi(url, data) {
  if (url !== "/spfunc/impartialgame/20") {
    return apiResponse({
      status: 2,
      message: `Unsupported archive API: ${url}`,
      data: null
    });
  }
  try {
    return apiResponse({
      status: 1,
      message: "OK",
      data: handleImpartialGame(data)
    });
  } catch (error) {
    return apiResponse({
      status: 2,
      message: error instanceof Error ? error.message : String(error),
      data: null
    });
  }
}
export {
  archiveApi
};
