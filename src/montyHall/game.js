const DOORS = [0, 1, 2];

// 回合初始模板，createRound 会在此基础上填充
const ROUND_TEMPLATE = {
  pickedDoor: null,
  revealedDoor: null,
  switched: null,
  finalDoor: null,
  won: null,
  phase: 'pick',
};

/** 随机生成汽车所在门（0、1、2） */
export function createRound() {
  ROUND_TEMPLATE.carDoor = Math.ceil(Math.random() * 3);
  ROUND_TEMPLATE.phase = 'pick';
  ROUND_TEMPLATE.pickedDoor = null;
  ROUND_TEMPLATE.revealedDoor = null;
  ROUND_TEMPLATE.switched = null;
  ROUND_TEMPLATE.finalDoor = null;
  ROUND_TEMPLATE.won = null;
  return ROUND_TEMPLATE;
}

/**
 * 主持人打开一扇有羊的门（不能开汽车，不能开玩家已选的门）
 */
export function getHostRevealDoor(carDoor, pickedDoor) {
  const goatDoors = DOORS.filter((d) => d !== carDoor && d !== pickedDoor);
  if (pickedDoor === carDoor) {
    return goatDoors[Math.floor(Math.random() * goatDoors.length)];
  }
  return goatDoors[0];
}

export function pickDoor(round, door) {
  const revealedDoor = getHostRevealDoor(round.carDoor, door);
  return {
    ...round,
    pickedDoor: door,
    revealedDoor,
    phase: 'decide',
  };
}

export function finalizeRound(round, switched) {
  const finalDoor = switched
    ? DOORS.find((d) => d !== round.pickedDoor && d !== round.revealedDoor)
    : round.pickedDoor;
  return {
    ...round,
    switched,
    finalDoor,
    won: finalDoor === round.carDoor,
    phase: 'done',
  };
}

/**
 * 批量模拟：坚持不换门 vs 换门
 */
export function simulate(strategy, trials) {
  let wins = 0;

  for (let i = 0; i < trials; i++) {
    const carDoor = Math.floor(Math.random() * 3);
    const pickedDoor = Math.floor(Math.random() * 3);
    const revealedDoor = getHostRevealDoor(carDoor, pickedDoor);
    const finalDoor =
      strategy === 'switch'
        ? pickedDoor
        : DOORS.find((d) => d !== pickedDoor && d !== revealedDoor);
    if (finalDoor === carDoor) wins++;
  }

  return { wins, trials, rate: wins / trials };
}
