import { useEffect, useMemo, useState } from 'react';
import {
  createRound,
  finalizeRound,
  pickDoor,
  simulate,
} from './montyHall/game.js';
import './App.css';

const DOOR_LABELS = ['A', 'B', 'C'];
const SIM_TRIALS = 10000;

const STEPS = [
  { key: 'pick', title: '① 选一扇门', hint: '三扇门后有一辆车、两只羊，先选一扇。' },
  {
    key: 'decide',
    title: '② 换或不换',
    hint: '主持人已打开一扇有羊的门。坚持原选胜率约 1/3，换到另一扇约 2/3。',
  },
  { key: 'done', title: '③ 揭晓', hint: '查看结果，理解换门为何更划算。' },
];

function getStepIndex(phase) {
  if (phase === 'pick') return 0;
  if (phase === 'decide') return 1;
  return 2;
}

export default function App() {
  const [round, setRound] = useState(() => createRound());
  const [simRunning, setSimRunning] = useState(false);
  const [simResult, setSimResult] = useState(null);

  const stepIndex = getStepIndex(round.phase);
  const staySim = useMemo(
    () => (simResult ? simResult.stay : null),
    [simResult],
  );
  const switchSim = useMemo(
    () => (simResult ? simResult.switch : null),
    [simResult],
  );

  useEffect(() => {
    const onResize = () => {
      document.documentElement.style.setProperty(
        '--vh',
        `${window.innerHeight * 0.01}px`,
      );
    };
    window.addEventListener('resize', onResize);
    onResize();
  }, []);

  const handlePick = (door) => {
    setRound((r) => pickDoor(r, door));
  };

  const handleDecide = (switched) => {
    setRound((r) => finalizeRound(r, switched));
  };

  const handleReset = () => {
    setRound(createRound());
  };

  const handleBatchSim = () => {
    setSimResult({
      stay: simulate('stay', SIM_TRIALS),
      switch: simulate('switch', SIM_TRIALS),
    });
  };

  const statusText = (() => {
    if (round.phase === 'pick') return '请选择一扇门';
    if (round.phase === 'decide') {
      return `你选了门 ${DOOR_LABELS[round.pickedDoor]}，主持人打开了门 ${DOOR_LABELS[round.pickedDoor]}（羊）。要换到另一扇门吗？`;
    }
    const action = round.switched ? '换门' : '坚持';
    return round.won
      ? `${action}后猜中！汽车在门口 ${DOOR_LABELS[round.carDoor]}。`
      : `${action}后未中，汽车在门 ${DOOR_LABELS[round.carDoor]}。`;
  })();

  return (
    <div className="app">
      <header className="header">
        <h1>三门问题 Demo</h1>
        <p className="desc">
          三扇门后有一辆汽车、两只羊。你选一扇后，主持人会打开另一扇有羊的门。
          此时<strong>换到剩下那扇门，胜率约 2/3</strong>；坚持原选只有约 1/3。
        </p>
      </header>

      <section className="steps-bar steps-bar--3">
        {STEPS.map((s, i) => (
          <div
            key={s.key}
            className={`step-item${i <= stepIndex ? ' step-item--active' : ''}${i === stepIndex ? ' step-item--current' : ''}`}
          >
            <span className="step-title">{s.title}</span>
          </div>
        ))}
      </section>

      <p className="hint">{STEPS[stepIndex].hint}</p>

      <section className="doors">
        {DOOR_LABELS.map((label, door) => {
          const isPicked = round.pickedDoor === door;
          const isRevealed = round.revealedDoor === door;
          const isFinal = round.finalDoor === door;
          const showGoat = isRevealed;
          const showAll = round.phase === 'done';
          const content = showAll
            ? door === round.carDoor
              ? '🚗'
              : '🐐'
            : showGoat
              ? '🐐'
              : '?';

          const disabled =
            round.phase === 'pick'
              ? false
              : round.phase === 'done' || isRevealed;

          return (
            <button
              key={label}
              type="button"
              className={[
                'door',
                isPicked && 'door--picked',
                isRevealed && 'door--revealed',
                isFinal && round.phase === 'done' && 'door--final',
                round.phase === 'done' &&
                  door === round.carDoor &&
                  'door--car',
              ]
                .filter(Boolean)
                .join(' ')}
              disabled={disabled}
              onClick={() => round.phase === 'pick' && handlePick(door)}
            >
              <span className="door-label">门 {label}</span>
              <span className="door-content">{content}</span>
              {isPicked && round.phase !== 'pick' && (
                <span className="door-tag">你的选择</span>
              )}
            </button>
          );
        })}
      </section>

      <p className="status">{statusText}</p>

      <div className="actions">
        {round.phase === 'decide' && (
          <>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => handleDecide(false)}
            >
              坚持不换（1/3）
            </button>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => handleDecide(true)}
            >
              换门（2/3）
            </button>
          </>
        )}
        {round.phase === 'done' && (
          <button type="button" className="btn btn--primary" onClick={handleReset}>
            再玩一局
          </button>
        )}
      </div>

      {round.phase === 'done' && (
        <section className="explain panel">
          <h2>为什么换门更划算？</h2>
          <ul>
            <li>
              你最初选中汽车的概率是 <strong>1/3</strong>，选中羊的概率是{' '}
              <strong>2/3</strong>。
            </li>
            <li>
              若一开始选的是羊，主持人开门后，<strong>换门必中汽车</strong>。
            </li>
            <li>
              只有最初就选中了汽车（概率 1/3）时，换门才会输；所以换门胜率 ={' '}
              <strong>2/3</strong>。
            </li>
          </ul>
        </section>
      )}

      <section className="panel panel--sim">
        <h2>批量模拟验证</h2>
        <p className="sim-desc">
          随机玩 {SIM_TRIALS.toLocaleString()} 局，统计「坚持」与「换门」的胜率。
        </p>
        <button
          type="button"
          className="btn btn--primary btn--block"
          disabled={simRunning}
          onClick={handleBatchSim}
        >
          {simRunning ? '模拟中…' : '运行批量模拟'}
        </button>

        {staySim?.rate && switchSim?.rate && (
          <div className="sim-results">
            <div className="sim-card">
              <span className="sim-label">坚持不换</span>
              <span className="sim-rate">{(staySim.rate * 100).toFixed(1)}%</span>
              <span className="sim-detail">
                {staySim.wins} / {staySim.trials}
              </span>
            </div>
            <div className="sim-card sim-card--highlight">
              <span className="sim-label">换门</span>
              <span className="sim-rate">{(switchSim.rate * 100).toFixed(1)}%</span>
              <span className="sim-detail">
                {switchSim.wins} / {switchSim.trials}
              </span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
