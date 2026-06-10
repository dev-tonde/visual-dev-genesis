import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, CarFront, Gauge, Pause, Play, RotateCcw, Save, ShieldAlert, Wrench, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface UrbanRunGameProps {
  onBack: () => void;
}

type ToastTone = 'neutral' | 'good' | 'warn' | 'bad';
type MissionType = 'courier' | 'race' | 'escape';
type MissionMarkerKind = 'pickup' | 'dropoff' | 'checkpoint';

interface Area {
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Vehicle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  speed: number;
  targetSpeed: number;
  steering: number;
  w: number;
  h: number;
  color: string;
  hp: number;
  occupied: boolean;
  police: boolean;
  ai: boolean;
  laneOffset: number;
  siren: number;
  stuck: number;
  nearMissCooldown: number;
}

interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  speed: number;
  radius: number;
  health: number;
  money: number;
  inCar: Vehicle | null;
  stepPhase: number;
}

interface Pedestrian {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  speed: number;
  radius: number;
  tone: string;
  timer: number;
  mood: number;
  scared: number;
}

interface Particle {
  x: number;
  y: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  vx: number;
  vy: number;
}

interface MissionMarker {
  x: number;
  y: number;
  kind: MissionMarkerKind;
  label: string;
  pulse: number;
}

interface ParkDecor {
  type: 'park';
  x: number;
  y: number;
  w: number;
  h: number;
  hue: number;
}

interface BuildingDecor {
  type: 'building';
  x: number;
  y: number;
  w: number;
  h: number;
  floors: number;
  seed: number;
}

type Decor = ParkDecor | BuildingDecor;

interface BaseMission {
  type: MissionType;
  title: string;
  copy: string;
  reward: number;
  timer: number;
}

interface CourierMission extends BaseMission {
  type: 'courier';
  stage: 'pickup' | 'dropoff';
  pickup: MissionMarker;
  dropoff: MissionMarker;
}

interface RaceMission extends BaseMission {
  type: 'race';
  stage: 'checkpoints';
  checkpoints: MissionMarker[];
  index: number;
}

interface EscapeMission extends BaseMission {
  type: 'escape';
  stage: 'evade';
}

type Mission = CourierMission | RaceMission | EscapeMission;

interface HudSnapshot {
  areaName: string;
  money: number;
  health: number;
  vehicleHp: number;
  wanted: number;
  speedKmh: number;
  boost: number;
  combo: number;
  comboTimerRatio: number;
  bestCombo: number;
  missionTitle: string;
  missionCopy: string;
  missionTimer: number | null;
  objectiveDistance: number | null;
  missionsCompleted: number;
  hasVehicle: boolean;
  heatLabel: string;
}

interface SavedGame {
  player: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    angle: number;
    health: number;
    money: number;
    inCarId: number | null;
  };
  cars: Array<{
    id: number;
    x: number;
    y: number;
    angle: number;
    hp: number;
    color: string;
    occupied: boolean;
    ai: boolean;
  }>;
  wanted: number;
  mission: Mission | null;
  phase: number;
  boostMeter: number;
  combo: number;
  bestCombo: number;
  missionsCompleted: number;
  missionCooldown: number;
  nextMissionType: MissionType | 'random' | null;
}

interface ToastMessage {
  id: number;
  title: string;
  text: string;
  tone: ToastTone;
}

interface UrbanRunRuntime {
  roadsX: number[];
  roadsY: number[];
  player: Player;
  camera: { x: number; y: number; shake: number };
  cars: Vehicle[];
  pedestrians: Pedestrian[];
  police: Vehicle[];
  particles: Particle[];
  missionMarkers: MissionMarker[];
  decor: Decor[];
  wanted: number;
  wantedCooldown: number;
  activeMission: Mission | null;
  missionCooldown: number;
  nextMissionType: MissionType | 'random' | null;
  autoSaveTimer: number;
  hudAccumulator: number;
  phase: number;
  flashTimer: number;
  gameStarted: boolean;
  paused: boolean;
  keys: Set<string>;
  lastTime: number;
  combo: number;
  comboTimer: number;
  bestCombo: number;
  boostMeter: number;
  missionsCompleted: number;
  isBoosting: boolean;
  isDrifting: boolean;
  driftCharge: number;
}

interface UrbanRunActions {
  startFreshRun: () => void;
  continueSavedRun: () => void;
  togglePause: () => void;
  quickSave: () => void;
  loadSave: () => void;
  repairVehicle: () => void;
}

const CANVAS_WIDTH = 1120;
const CANVAS_HEIGHT = 700;
const WORLD_WIDTH = 4320;
const WORLD_HEIGHT = 4320;
const BLOCK_SIZE = 240;
const ROAD_WIDTH = 56;
const HALF_ROAD = ROAD_WIDTH / 2;
const DAY_LENGTH = 180;
const HUD_UPDATE_INTERVAL = 0.08;
const PLAYER_SPAWN = { x: 560, y: 520 };
const URBAN_RUN_SAVE_KEY = 'urban-run-save-v2';
const TRAFFIC_COLORS = ['#7ed0ff', '#ff8ea1', '#ffe16d', '#72f0bb', '#8fc2ff', '#ffad5f'];
const PEDESTRIAN_TONES = ['#ffddc1', '#f7c59f', '#d9a273', '#9f6b53', '#7e4c39'];

const ROADS_X = Array.from({ length: WORLD_WIDTH / BLOCK_SIZE - 1 }, (_value, index) => (index + 1) * BLOCK_SIZE);
const ROADS_Y = Array.from({ length: WORLD_HEIGHT / BLOCK_SIZE - 1 }, (_value, index) => (index + 1) * BLOCK_SIZE);

const AREAS: Area[] = [
  { name: 'Downtown Grid', x: 0, y: 0, w: 1440, h: 1440 },
  { name: 'Harbor Row', x: 1440, y: 0, w: 1440, h: 1440 },
  { name: 'Palm Heights', x: 2880, y: 0, w: 1440, h: 1440 },
  { name: 'Civic Center', x: 0, y: 1440, w: 1440, h: 1440 },
  { name: 'Neon Market', x: 1440, y: 1440, w: 1440, h: 1440 },
  { name: 'Industrial Mile', x: 2880, y: 1440, w: 1440, h: 1440 },
  { name: 'Old Quarter', x: 0, y: 2880, w: 1440, h: 1440 },
  { name: 'Metro South', x: 1440, y: 2880, w: 1440, h: 1440 },
  { name: 'Sunset Park', x: 2880, y: 2880, w: 1440, h: 1440 },
];

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const lerp = (start: number, end: number, amount: number) => start + (end - start) * amount;
const rand = (min: number, max: number) => Math.random() * (max - min) + min;
const dist = (ax: number, ay: number, bx: number, by: number) => Math.hypot(ax - bx, ay - by);

const angleLerp = (start: number, end: number, amount: number) => {
  const delta = ((end - start + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
  return start + delta * amount;
};

const getArea = (x: number, y: number) =>
  AREAS.find((area) => x >= area.x && x < area.x + area.w && y >= area.y && y < area.y + area.h) ?? AREAS[0];

const nearestRoadX = (x: number) => {
  let best = ROADS_X[0];
  let bestDistance = Infinity;

  for (const roadX of ROADS_X) {
    const roadDistance = Math.abs(x - roadX);
    if (roadDistance < bestDistance) {
      bestDistance = roadDistance;
      best = roadX;
    }
  }

  return best;
};

const nearestRoadY = (y: number) => {
  let best = ROADS_Y[0];
  let bestDistance = Infinity;

  for (const roadY of ROADS_Y) {
    const roadDistance = Math.abs(y - roadY);
    if (roadDistance < bestDistance) {
      bestDistance = roadDistance;
      best = roadY;
    }
  }

  return best;
};

const isRoad = (x: number, y: number) =>
  ROADS_X.some((roadX) => Math.abs(x - roadX) <= HALF_ROAD) ||
  ROADS_Y.some((roadY) => Math.abs(y - roadY) <= HALF_ROAD);

const isNearRoad = (x: number, y: number, margin = 75) =>
  ROADS_X.some((roadX) => Math.abs(x - roadX) <= margin) ||
  ROADS_Y.some((roadY) => Math.abs(y - roadY) <= margin);

const keepInWorld = (entity: { x: number; y: number }) => {
  entity.x = clamp(entity.x, 30, WORLD_WIDTH - 30);
  entity.y = clamp(entity.y, 30, WORLD_HEIGHT - 30);
};

const roundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fill = false,
  stroke = false
) => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();

  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
};

const createStarterCar = (): Vehicle => ({
  id: 0,
  x: PLAYER_SPAWN.x + 24,
  y: PLAYER_SPAWN.y + 20,
  vx: 0,
  vy: 0,
  angle: 0,
  speed: 0,
  targetSpeed: 0,
  steering: 0,
  w: 36,
  h: 18,
  color: '#7ef0ff',
  hp: 100,
  occupied: false,
  police: false,
  ai: false,
  laneOffset: 0,
  siren: 0,
  stuck: 0,
  nearMissCooldown: 0,
});

const createUrbanRunRuntime = (): UrbanRunRuntime => {
  const runtime: UrbanRunRuntime = {
    roadsX: ROADS_X,
    roadsY: ROADS_Y,
    player: {
      x: PLAYER_SPAWN.x,
      y: PLAYER_SPAWN.y,
      vx: 0,
      vy: 0,
      angle: 0,
      speed: 0,
      radius: 12,
      health: 100,
      money: 650,
      inCar: null,
      stepPhase: 0,
    },
    camera: { x: PLAYER_SPAWN.x, y: PLAYER_SPAWN.y, shake: 0 },
    cars: [createStarterCar()],
    pedestrians: [],
    police: [],
    particles: [],
    missionMarkers: [],
    decor: [],
    wanted: 0,
    wantedCooldown: 0,
    activeMission: null,
    missionCooldown: 0,
    nextMissionType: null,
    autoSaveTimer: 0,
    hudAccumulator: 0,
    phase: 0,
    flashTimer: 0,
    gameStarted: false,
    paused: false,
    keys: new Set<string>(),
    lastTime: 0,
    combo: 0,
    comboTimer: 0,
    bestCombo: 0,
    boostMeter: 68,
    missionsCompleted: 0,
    isBoosting: false,
    isDrifting: false,
    driftCharge: 0,
  };

  for (let gx = 0; gx < WORLD_WIDTH; gx += BLOCK_SIZE) {
    for (let gy = 0; gy < WORLD_HEIGHT; gy += BLOCK_SIZE) {
      const centerX = gx + BLOCK_SIZE / 2;
      const centerY = gy + BLOCK_SIZE / 2;

      if (isRoad(centerX, centerY)) continue;

      const seed = Math.abs(Math.sin(gx * 12.9898 + gy * 78.233) * 43758.5453) % 1;

      if (seed < 0.18) {
        runtime.decor.push({
          type: 'park',
          x: gx + 18,
          y: gy + 18,
          w: BLOCK_SIZE - 36,
          h: BLOCK_SIZE - 36,
          hue: 118 + Math.floor(seed * 58),
        });
      } else {
        runtime.decor.push({
          type: 'building',
          x: gx + 24,
          y: gy + 24,
          w: BLOCK_SIZE - 48,
          h: BLOCK_SIZE - 48,
          floors: 2 + Math.floor(seed * 8),
          seed,
        });
      }
    }
  }

  for (let index = 0; index < 32; index += 1) {
    const vertical = Math.random() > 0.5;
    const x = vertical
      ? nearestRoadX(rand(90, WORLD_WIDTH - 90)) + (Math.random() > 0.5 ? -12 : 12)
      : rand(90, WORLD_WIDTH - 90);
    const y = vertical
      ? rand(90, WORLD_HEIGHT - 90)
      : nearestRoadY(rand(90, WORLD_HEIGHT - 90)) + (Math.random() > 0.5 ? -12 : 12);
    const angle = vertical
      ? Math.random() > 0.5
        ? Math.PI / 2
        : -Math.PI / 2
      : Math.random() > 0.5
        ? 0
        : Math.PI;

    runtime.cars.push({
      id: index + 1,
      x,
      y,
      vx: 0,
      vy: 0,
      angle,
      speed: 40 + Math.random() * 30,
      targetSpeed: 90 + Math.random() * 65,
      steering: 0,
      w: 32,
      h: 18,
      color: TRAFFIC_COLORS[index % TRAFFIC_COLORS.length],
      hp: 100,
      occupied: false,
      police: false,
      ai: true,
      laneOffset: Math.random() > 0.5 ? -12 : 12,
      siren: 0,
      stuck: 0,
      nearMissCooldown: 0,
    });
  }

  for (let index = 0; index < 44; index += 1) {
    let x = rand(60, WORLD_WIDTH - 60);
    let y = rand(60, WORLD_HEIGHT - 60);

    while (isRoad(x, y) || !isNearRoad(x, y, 92)) {
      x = rand(60, WORLD_WIDTH - 60);
      y = rand(60, WORLD_HEIGHT - 60);
    }

    runtime.pedestrians.push({
      x,
      y,
      vx: 0,
      vy: 0,
      angle: rand(0, Math.PI * 2),
      speed: 22 + Math.random() * 14,
      radius: 8,
      tone: PEDESTRIAN_TONES[index % PEDESTRIAN_TONES.length],
      timer: rand(0.3, 2.5),
      mood: Math.random(),
      scared: 0,
    });
  }

  const spawnPoliceCar = (seedX: number, seedY: number) => {
    runtime.police.push({
      id: runtime.police.length + 1000,
      x: nearestRoadX(seedX) + (Math.random() > 0.5 ? -14 : 14),
      y: nearestRoadY(seedY) + (Math.random() > 0.5 ? -14 : 14),
      vx: 0,
      vy: 0,
      angle: Math.random() > 0.5 ? 0 : Math.PI / 2,
      speed: 0,
      targetSpeed: 0,
      steering: 0,
      w: 36,
      h: 18,
      color: '#ffffff',
      hp: 120,
      occupied: true,
      police: true,
      ai: true,
      laneOffset: Math.random() > 0.5 ? -14 : 14,
      siren: 0,
      stuck: 0,
      nearMissCooldown: 0,
    });
  };

  spawnPoliceCar(800, 780);
  spawnPoliceCar(2500, 2600);

  return runtime;
};

const getMissionTarget = (runtime: UrbanRunRuntime): MissionMarker | null => {
  const mission = runtime.activeMission;

  if (!mission) return null;

  if (mission.type === 'courier') {
    return mission.stage === 'pickup' ? mission.pickup : mission.dropoff;
  }

  if (mission.type === 'race') {
    return mission.checkpoints[mission.index] ?? null;
  }

  return null;
};

const buildMissionCopy = (runtime: UrbanRunRuntime) => {
  if (!runtime.gameStarted) {
    return {
      title: 'Urban Run',
      copy: 'Start a fresh chase or continue your save. You begin with a tuned starter ride so the fun starts immediately.',
    };
  }

  if (!runtime.activeMission) {
    return {
      title: 'Mission uplink',
      copy:
        runtime.missionCooldown > 0
          ? 'Scanning the city for the next contract. Keep moving to stay warm and preserve your combo.'
          : 'Cruise the grid, grab another car with E, or drift a few corners while the city finds you work.',
    };
  }

  const mission = runtime.activeMission;
  const seconds = Math.ceil(mission.timer);

  if (mission.type === 'courier') {
    return {
      title: mission.title,
      copy:
        mission.stage === 'pickup'
          ? `${mission.copy} Reach the pickup ring and press F. ${seconds}s left.`
          : `${mission.copy} Deliver the package to the green ring and press F. ${seconds}s left.`,
    };
  }

  if (mission.type === 'race') {
    return {
      title: mission.title,
      copy: `${mission.copy} Checkpoint ${mission.index + 1} of ${mission.checkpoints.length}. ${seconds}s left.`,
    };
  }

  return {
    title: mission.title,
    copy: `${mission.copy} Break line of sight and let the heat drain out. ${seconds}s left.`,
  };
};

const buildHudSnapshot = (runtime: UrbanRunRuntime): HudSnapshot => {
  const speed = runtime.player.inCar
    ? Math.abs(runtime.player.inCar.speed)
    : Math.hypot(runtime.player.vx, runtime.player.vy);
  const vehicleHp = runtime.player.inCar ? runtime.player.inCar.hp : 0;
  const target = getMissionTarget(runtime);
  const objectiveDistance = target ? Math.round(dist(runtime.player.x, runtime.player.y, target.x, target.y)) : null;
  const missionCopy = buildMissionCopy(runtime);
  const heatLabel =
    runtime.wanted >= 70 ? 'Full pursuit' : runtime.wanted >= 35 ? 'On police radar' : 'Low profile';

  return {
    areaName: getArea(runtime.player.x, runtime.player.y).name,
    money: Math.floor(runtime.player.money),
    health: Math.round(runtime.player.health),
    vehicleHp: Math.round(vehicleHp),
    wanted: Math.round(runtime.wanted),
    speedKmh: Math.round(speed * 0.76),
    boost: Math.round(runtime.boostMeter),
    combo: runtime.combo,
    comboTimerRatio: clamp(runtime.comboTimer / 5, 0, 1),
    bestCombo: runtime.bestCombo,
    missionTitle: missionCopy.title,
    missionCopy: missionCopy.copy,
    missionTimer: runtime.activeMission ? Math.ceil(runtime.activeMission.timer) : null,
    objectiveDistance,
    missionsCompleted: runtime.missionsCompleted,
    hasVehicle: Boolean(runtime.player.inCar),
    heatLabel,
  };
};

const drawBackground = (
  ctx: CanvasRenderingContext2D,
  phase: number,
  canvasWidth: number,
  canvasHeight: number
) => {
  const daylight = (Math.sin((phase / DAY_LENGTH) * Math.PI * 2 - Math.PI / 2) + 1) / 2;
  const sky = ctx.createLinearGradient(0, 0, 0, canvasHeight);

  sky.addColorStop(0, `rgba(${Math.floor(8 + daylight * 26)}, ${Math.floor(16 + daylight * 32)}, ${Math.floor(34 + daylight * 46)}, 1)`);
  sky.addColorStop(1, `rgba(${Math.floor(18 + daylight * 42)}, ${Math.floor(24 + daylight * 38)}, ${Math.floor(34 + daylight * 50)}, 1)`);

  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
};

const drawCar = (
  ctx: CanvasRenderingContext2D,
  car: Vehicle,
  options: { isPlayerRide?: boolean; isBoosting?: boolean } = {}
) => {
  ctx.save();
  ctx.translate(car.x, car.y);
  ctx.rotate(car.angle);

  if (options.isPlayerRide) {
    ctx.fillStyle = options.isBoosting ? 'rgba(85, 194, 255, 0.16)' : 'rgba(85, 194, 255, 0.08)';
    ctx.beginPath();
    ctx.ellipse(-14, 0, 26, 16, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = car.police ? '#f2f5ff' : car.color;
  roundRect(ctx, -car.w / 2, -car.h / 2, car.w, car.h, 5, true);

  ctx.fillStyle = 'rgba(9, 14, 24, 0.82)';
  roundRect(ctx, -car.w / 4, -car.h / 2 + 2, car.w / 2, car.h - 4, 3, true);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';
  ctx.fillRect(car.w / 2 - 6, -car.h / 2 + 2, 4, 4);
  ctx.fillRect(car.w / 2 - 6, car.h / 2 - 6, 4, 4);

  ctx.fillStyle = 'rgba(255, 76, 109, 0.76)';
  ctx.fillRect(-car.w / 2 + 2, -car.h / 2 + 2, 4, 4);
  ctx.fillRect(-car.w / 2 + 2, car.h / 2 - 6, 4, 4);

  if (car.police) {
    ctx.fillStyle = '#2c5bff';
    ctx.fillRect(-3, -car.h / 2 - 2, 6, 3);

    if (car.siren > 0.1) {
      ctx.globalAlpha = 0.32 * car.siren;
      ctx.fillStyle = car.siren > 0.55 ? '#ff4d67' : '#58a7ff';
      ctx.beginPath();
      ctx.arc(0, 0, 28, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (options.isPlayerRide) {
    ctx.strokeStyle = 'rgba(85, 194, 255, 0.9)';
    ctx.lineWidth = 2;
    roundRect(ctx, -car.w / 2 - 3, -car.h / 2 - 3, car.w + 6, car.h + 6, 7, false, true);
  }

  ctx.restore();
};

const drawPedestrian = (ctx: CanvasRenderingContext2D, pedestrian: Pedestrian) => {
  ctx.save();
  ctx.translate(pedestrian.x, pedestrian.y);
  ctx.rotate(pedestrian.angle + Math.PI / 2);

  ctx.fillStyle = pedestrian.tone;
  ctx.beginPath();
  ctx.arc(0, -4, 4.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = pedestrian.scared > 0.1 ? '#ffd166' : '#85f0c2';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 9);
  ctx.moveTo(0, 3);
  ctx.lineTo(-5, 8);
  ctx.moveTo(0, 3);
  ctx.lineTo(5, 8);
  ctx.moveTo(0, 9);
  ctx.lineTo(-4, 14);
  ctx.moveTo(0, 9);
  ctx.lineTo(4, 14);
  ctx.stroke();

  ctx.restore();
};

const drawPlayer = (ctx: CanvasRenderingContext2D, player: Player) => {
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.rotate(player.angle + Math.PI / 2);

  ctx.fillStyle = '#ffd7ad';
  ctx.beginPath();
  ctx.arc(0, -6, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#70e2b9';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 12);
  ctx.moveTo(0, 4);
  ctx.lineTo(-6, 8);
  ctx.moveTo(0, 4);
  ctx.lineTo(6, 8);

  const swing = Math.sin(player.stepPhase) * 3;
  ctx.moveTo(0, 12);
  ctx.lineTo(-4 - swing, 18);
  ctx.moveTo(0, 12);
  ctx.lineTo(4 + swing, 18);
  ctx.stroke();

  ctx.restore();
};

const drawObjectiveArrow = (
  ctx: CanvasRenderingContext2D,
  runtime: UrbanRunRuntime,
  canvasWidth: number,
  canvasHeight: number
) => {
  const target = getMissionTarget(runtime);
  if (!target) return;

  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const screenX = target.x - runtime.camera.x + centerX;
  const screenY = target.y - runtime.camera.y + centerY;
  const margin = 92;

  if (
    screenX >= margin &&
    screenX <= canvasWidth - margin &&
    screenY >= margin &&
    screenY <= canvasHeight - margin
  ) {
    return;
  }

  const angle = Math.atan2(screenY - centerY, screenX - centerX);
  const radiusX = canvasWidth / 2 - margin;
  const radiusY = canvasHeight / 2 - margin;
  const markerX = centerX + Math.cos(angle) * radiusX;
  const markerY = centerY + Math.sin(angle) * radiusY;
  const fill =
    target.kind === 'dropoff' ? '#7ef0b8' : target.kind === 'checkpoint' ? '#ffd166' : '#55c2ff';

  ctx.save();
  ctx.translate(markerX, markerY);
  ctx.rotate(angle);

  ctx.fillStyle = 'rgba(8, 16, 26, 0.78)';
  ctx.beginPath();
  ctx.arc(0, 0, 24, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(18, 0);
  ctx.lineTo(-8, -11);
  ctx.lineTo(-4, 0);
  ctx.lineTo(-8, 11);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
};

const drawMinimap = (
  ctx: CanvasRenderingContext2D,
  runtime: UrbanRunRuntime,
  canvasWidth: number,
  canvasHeight: number
) => {
  const size = 170;
  const padding = 18;
  const x = canvasWidth - size - padding;
  const y = canvasHeight - size - padding;
  const scale = 0.028;

  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = 'rgba(8, 12, 20, 0.86)';
  roundRect(ctx, 0, 0, size, size, 22, true);

  ctx.save();
  ctx.beginPath();
  roundRect(ctx, 4, 4, size - 8, size - 8, 18);
  ctx.clip();

  ctx.translate(size / 2 - runtime.player.x * scale, size / 2 - runtime.player.y * scale);

  ctx.fillStyle = '#223027';
  ctx.fillRect(0, 0, WORLD_WIDTH * scale, WORLD_HEIGHT * scale);

  ctx.fillStyle = '#49525c';
  for (const roadX of runtime.roadsX) {
    ctx.fillRect((roadX - HALF_ROAD) * scale, 0, ROAD_WIDTH * scale, WORLD_HEIGHT * scale);
  }
  for (const roadY of runtime.roadsY) {
    ctx.fillRect(0, (roadY - HALF_ROAD) * scale, WORLD_WIDTH * scale, ROAD_WIDTH * scale);
  }

  for (const marker of runtime.missionMarkers) {
    if (
      runtime.activeMission?.type === 'race' &&
      marker.kind === 'checkpoint' &&
      runtime.activeMission.checkpoints[runtime.activeMission.index] !== marker
    ) {
      continue;
    }

    ctx.fillStyle =
      marker.kind === 'dropoff' ? '#54e39d' : marker.kind === 'checkpoint' ? '#ffd166' : '#55c2ff';
    ctx.beginPath();
    ctx.arc(marker.x * scale, marker.y * scale, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const unit of runtime.police) {
    if (dist(unit.x, unit.y, runtime.player.x, runtime.player.y) < 900) {
      ctx.fillStyle = '#ff667f';
      ctx.beginPath();
      ctx.arc(unit.x * scale, unit.y * scale, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(runtime.player.x * scale, runtime.player.y * scale, 4.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  roundRect(ctx, 0.5, 0.5, size - 1, size - 1, 22, false, true);
  ctx.restore();
};

const drawOverlay = (
  ctx: CanvasRenderingContext2D,
  runtime: UrbanRunRuntime,
  canvasWidth: number,
  canvasHeight: number
) => {
  if (runtime.isBoosting) {
    ctx.save();
    ctx.strokeStyle = 'rgba(126, 240, 255, 0.16)';
    ctx.lineWidth = 2;
    for (let index = 0; index < 18; index += 1) {
      const y = 40 + index * 34;
      ctx.beginPath();
      ctx.moveTo(canvasWidth - 140 - index * 12, y);
      ctx.lineTo(canvasWidth - 26, y + rand(-12, 12));
      ctx.stroke();
    }
    ctx.restore();
  }

  if (runtime.flashTimer > 0) {
    ctx.fillStyle = `rgba(255, 70, 92, ${runtime.flashTimer * 0.34})`;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }

  const vignette = ctx.createRadialGradient(
    canvasWidth / 2,
    canvasHeight / 2,
    canvasHeight * 0.18,
    canvasWidth / 2,
    canvasHeight / 2,
    canvasHeight * 0.82
  );
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.34)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
};

const drawUrbanRun = (
  ctx: CanvasRenderingContext2D,
  runtime: UrbanRunRuntime,
  canvasWidth: number,
  canvasHeight: number
) => {
  const shakeX = runtime.camera.shake > 0 ? rand(-runtime.camera.shake, runtime.camera.shake) : 0;
  const shakeY = runtime.camera.shake > 0 ? rand(-runtime.camera.shake, runtime.camera.shake) : 0;
  const view = {
    left: runtime.camera.x - canvasWidth / 2 - 120,
    right: runtime.camera.x + canvasWidth / 2 + 120,
    top: runtime.camera.y - canvasHeight / 2 - 120,
    bottom: runtime.camera.y + canvasHeight / 2 + 120,
  };

  drawBackground(ctx, runtime.phase, canvasWidth, canvasHeight);

  ctx.save();
  ctx.translate(-runtime.camera.x + canvasWidth / 2 + shakeX, -runtime.camera.y + canvasHeight / 2 + shakeY);

  ctx.fillStyle = '#132318';
  ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

  for (const decor of runtime.decor) {
    if (decor.x + decor.w < view.left || decor.x > view.right || decor.y + decor.h < view.top || decor.y > view.bottom) {
      continue;
    }

    if (decor.type === 'park') {
      ctx.fillStyle = `hsl(${decor.hue} 40% 22%)`;
      roundRect(ctx, decor.x, decor.y, decor.w, decor.h, 20, true);
      for (let index = 0; index < 8; index += 1) {
        ctx.fillStyle = `rgba(62, ${120 + index * 7}, 76, 0.55)`;
        ctx.beginPath();
        ctx.arc(
          decor.x + 18 + (index * 31) % (decor.w - 30),
          decor.y + 20 + ((index * 47) % (decor.h - 30)),
          10 + (index % 3) * 4,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    } else {
      const base = 16 + Math.floor(decor.seed * 24);
      ctx.fillStyle = `rgb(${base}, ${base + 6}, ${base + 16})`;
      roundRect(ctx, decor.x, decor.y, decor.w, decor.h, 16, true);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      roundRect(ctx, decor.x + 4, decor.y + 4, decor.w - 8, 18, 10, true);

      const columns = Math.max(2, Math.floor(decor.w / 32));
      const rows = Math.max(2, Math.floor(decor.h / 34));
      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          const lit = ((column * 17 + row * 19 + Math.floor(runtime.phase * 9)) % 7) < 3;
          ctx.fillStyle = lit ? 'rgba(255, 232, 146, 0.18)' : 'rgba(115, 135, 170, 0.12)';
          ctx.fillRect(
            decor.x + 12 + column * ((decor.w - 24) / columns),
            decor.y + 14 + row * ((decor.h - 26) / rows),
            9,
            11
          );
        }
      }
    }
  }

  ctx.fillStyle = '#2c3238';
  for (const roadX of runtime.roadsX) ctx.fillRect(roadX - HALF_ROAD, 0, ROAD_WIDTH, WORLD_HEIGHT);
  for (const roadY of runtime.roadsY) ctx.fillRect(0, roadY - HALF_ROAD, WORLD_WIDTH, ROAD_WIDTH);

  ctx.strokeStyle = 'rgba(255, 240, 130, 0.58)';
  ctx.lineWidth = 2;
  ctx.setLineDash([18, 20]);
  for (const roadX of runtime.roadsX) {
    ctx.beginPath();
    ctx.moveTo(roadX, 0);
    ctx.lineTo(roadX, WORLD_HEIGHT);
    ctx.stroke();
  }
  for (const roadY of runtime.roadsY) {
    ctx.beginPath();
    ctx.moveTo(0, roadY);
    ctx.lineTo(WORLD_WIDTH, roadY);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  for (const marker of runtime.missionMarkers) {
    if (
      runtime.activeMission?.type === 'race' &&
      marker.kind === 'checkpoint' &&
      runtime.activeMission.checkpoints[runtime.activeMission.index] !== marker
    ) {
      continue;
    }

    if (
      marker.x + 80 < view.left ||
      marker.x - 80 > view.right ||
      marker.y + 80 < view.top ||
      marker.y - 80 > view.bottom
    ) {
      continue;
    }

    marker.pulse += 0.05;
    const radius = 18 + Math.sin(marker.pulse * 2) * 3;

    ctx.strokeStyle =
      marker.kind === 'dropoff' ? '#7ef0b8' : marker.kind === 'checkpoint' ? '#ffd166' : '#55c2ff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(marker.x, marker.y, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(marker.x, marker.y, radius + 11, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = 'rgba(10, 16, 24, 0.7)';
    roundRect(ctx, marker.x - 34, marker.y - 54, 68, 22, 8, true);
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(marker.label, marker.x, marker.y - 39);
  }

  for (const pedestrian of runtime.pedestrians) {
    if (
      pedestrian.x + 24 < view.left ||
      pedestrian.x - 24 > view.right ||
      pedestrian.y + 24 < view.top ||
      pedestrian.y - 24 > view.bottom
    ) {
      continue;
    }

    drawPedestrian(ctx, pedestrian);
  }

  for (const car of runtime.cars) {
    if (
      car.x + 40 < view.left ||
      car.x - 40 > view.right ||
      car.y + 40 < view.top ||
      car.y - 40 > view.bottom
    ) {
      continue;
    }

    drawCar(ctx, car, {
      isPlayerRide: car === runtime.player.inCar,
      isBoosting: runtime.isBoosting && car === runtime.player.inCar,
    });
  }

  for (const unit of runtime.police) {
    if (
      unit.x + 40 < view.left ||
      unit.x - 40 > view.right ||
      unit.y + 40 < view.top ||
      unit.y - 40 > view.bottom
    ) {
      continue;
    }

    drawCar(ctx, unit);
  }

  if (!runtime.player.inCar) drawPlayer(ctx, runtime.player);

  for (const particle of runtime.particles) {
    ctx.globalAlpha = clamp(particle.life / particle.maxLife, 0, 1);
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  ctx.restore();

  drawObjectiveArrow(ctx, runtime, canvasWidth, canvasHeight);
  drawMinimap(ctx, runtime, canvasWidth, canvasHeight);
  drawOverlay(ctx, runtime, canvasWidth, canvasHeight);
};

const StatBar = ({
  label,
  value,
  tint,
}: {
  label: string;
  value: string;
  tint: string;
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
    <div className="h-2 rounded-full bg-white/8">
      <div className={`h-full rounded-full ${tint}`} style={{ width: value }} />
    </div>
  </div>
);

const UrbanRunGame = ({ onBack }: UrbanRunGameProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runtimeRef = useRef<UrbanRunRuntime>(createUrbanRunRuntime());
  const frameRef = useRef<number | null>(null);
  const toastIdRef = useRef(0);
  const toastTimerRef = useRef<number[]>([]);
  const actionsRef = useRef<UrbanRunActions | null>(null);

  const [hud, setHud] = useState(() => buildHudSnapshot(runtimeRef.current));
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [hasSave, setHasSave] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [saveStatus, setSaveStatus] = useState('No save loaded.');

  const syncSaveAvailability = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      setHasSave(Boolean(window.localStorage.getItem(URBAN_RUN_SAVE_KEY)));
    } catch {
      setHasSave(false);
    }
  }, []);

  const addToast = useCallback((title: string, text: string, tone: ToastTone = 'neutral') => {
    const id = toastIdRef.current + 1;
    toastIdRef.current = id;

    setToasts((previous) => [...previous.slice(-3), { id, title, text, tone }]);

    const timeout = window.setTimeout(() => {
      setToasts((previous) => previous.filter((toast) => toast.id !== id));
    }, 3600);

    toastTimerRef.current.push(timeout);
  }, []);

  useEffect(() => {
    syncSaveAvailability();

    const formatTimestamp = () =>
      new Date().toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
      });

    const syncHud = () => {
      const runtime = runtimeRef.current;
      setHud(buildHudSnapshot(runtime));
      setIsStarted(runtime.gameStarted);
      setIsPaused(runtime.paused);
    };

    const addParticle = (
      runtime: UrbanRunRuntime,
      x: number,
      y: number,
      color: string,
      size: number,
      life: number,
      vx = 0,
      vy = 0
    ) => {
      runtime.particles.push({ x, y, color, size, life, maxLife: life, vx, vy });
    };

    const clearMissionMarkers = (runtime: UrbanRunRuntime) => {
      runtime.missionMarkers.length = 0;
    };

    const missionPoint = (
      runtime: UrbanRunRuntime,
      x: number,
      y: number,
      kind: MissionMarkerKind,
      label: string
    ) => {
      const marker = { x, y, kind, label, pulse: Math.random() * Math.PI * 2 };
      runtime.missionMarkers.push(marker);
      return marker;
    };

    const randomRoadSpot = () => ({
      x: ROADS_X[Math.floor(Math.random() * ROADS_X.length)] + (Math.random() > 0.5 ? -12 : 12),
      y: ROADS_Y[Math.floor(Math.random() * ROADS_Y.length)] + (Math.random() > 0.5 ? -12 : 12),
    });

    const ensureRecoveryCar = (runtime: UrbanRunRuntime) => {
      const recoveryCar = runtime.cars.find((car) => car.id === 0) ?? runtime.cars[0];
      recoveryCar.x = PLAYER_SPAWN.x + 24;
      recoveryCar.y = PLAYER_SPAWN.y + 20;
      recoveryCar.vx = 0;
      recoveryCar.vy = 0;
      recoveryCar.angle = 0;
      recoveryCar.speed = 0;
      recoveryCar.hp = 100;
      recoveryCar.occupied = true;
      recoveryCar.ai = false;
      recoveryCar.color = '#7ef0ff';
      return recoveryCar;
    };

    const setPlayerIntoCar = (runtime: UrbanRunRuntime, car: Vehicle) => {
      runtime.player.inCar = car;
      car.occupied = true;
      car.ai = false;
      runtime.player.x = car.x;
      runtime.player.y = car.y;
      runtime.player.angle = car.angle;
      runtime.player.vx = 0;
      runtime.player.vy = 0;
    };

    const increaseWanted = (runtime: UrbanRunRuntime, amount: number, note?: string) => {
      const previousWanted = runtime.wanted;
      runtime.wanted = clamp(runtime.wanted + amount, 0, 100);
      runtime.wantedCooldown = 10;

      if (Math.floor(previousWanted / 25) < Math.floor(runtime.wanted / 25) && runtime.wanted >= 25) {
        addToast('Heat rising', note ?? 'More police units are triangulating your route.', 'warn');
      }

      const desiredPolice = Math.min(6, 1 + Math.floor(runtime.wanted / 18));
      while (runtime.police.length < desiredPolice) {
        runtime.police.push({
          id: runtime.police.length + 1000,
          x: nearestRoadX(runtime.player.x + rand(-500, 500)) + (Math.random() > 0.5 ? -14 : 14),
          y: nearestRoadY(runtime.player.y + rand(-500, 500)) + (Math.random() > 0.5 ? -14 : 14),
          vx: 0,
          vy: 0,
          angle: Math.random() > 0.5 ? 0 : Math.PI / 2,
          speed: 0,
          targetSpeed: 0,
          steering: 0,
          w: 36,
          h: 18,
          color: '#ffffff',
          hp: 120,
          occupied: true,
          police: true,
          ai: true,
          laneOffset: Math.random() > 0.5 ? -14 : 14,
          siren: 0,
          stuck: 0,
          nearMissCooldown: 0,
        });
      }
    };

    const addCombo = (runtime: UrbanRunRuntime, amount: number, reason: string) => {
      if (amount <= 0) return;

      runtime.combo += amount;
      runtime.comboTimer = 5;
      runtime.bestCombo = Math.max(runtime.bestCombo, runtime.combo);

      const bonusCash = 10 + runtime.combo * 4;
      runtime.player.money += bonusCash;

      if (runtime.combo === 1 || runtime.combo % 3 === 0 || runtime.combo === runtime.bestCombo) {
        addToast('Combo building', `${reason}. +$${bonusCash}. Streak x${runtime.combo}.`, 'good');
      }
    };

    const scheduleNextMission = (runtime: UrbanRunRuntime, delay: number) => {
      runtime.activeMission = null;
      runtime.missionCooldown = delay;
      runtime.nextMissionType = 'random';
      clearMissionMarkers(runtime);
    };

    const beginMission = (runtime: UrbanRunRuntime, type: MissionType = 'courier') => {
      clearMissionMarkers(runtime);

      const difficultyRamp = Math.min(runtime.missionsCompleted, 6);
      const start = randomRoadSpot();
      const end = randomRoadSpot();

      if (type === 'courier') {
        runtime.activeMission = {
          type,
          stage: 'pickup',
          title: 'Courier Rush',
          copy: 'Flow through traffic, snag the package, and chain your delivery before the route cools off.',
          reward: 240 + difficultyRamp * 18,
          timer: 80 - difficultyRamp * 1.4,
          pickup: missionPoint(runtime, start.x, start.y, 'pickup', 'Pickup'),
          dropoff: missionPoint(runtime, end.x, end.y, 'dropoff', 'Dropoff'),
        };
      } else if (type === 'race') {
        runtime.activeMission = {
          type,
          stage: 'checkpoints',
          title: 'Checkpoint Sprint',
          copy: 'Keep the combo alive through tight corners. Every checkpoint extends the run and feeds the boost tank.',
          reward: 310 + difficultyRamp * 22,
          timer: 72 - difficultyRamp * 1.2,
          checkpoints: Array.from({ length: 5 }, () => {
            const point = randomRoadSpot();
            return missionPoint(runtime, point.x, point.y, 'checkpoint', 'Split');
          }),
          index: 0,
        };
      } else {
        runtime.activeMission = {
          type: 'escape',
          stage: 'evade',
          title: 'Heat Breaker',
          copy: 'Break police contact, let the wanted bar cool, and survive long enough to cash the escape.',
          reward: 420 + difficultyRamp * 24,
          timer: 28,
        };
        runtime.wanted = Math.max(runtime.wanted, 56);
        increaseWanted(runtime, 14, 'A high-risk contract just lit up every scanner in town.');
      }
    };

    const pickNextMissionType = (runtime: UrbanRunRuntime): MissionType => {
      if (runtime.wanted > 60) return 'escape';

      const roll = Math.random() + Math.min(runtime.missionsCompleted * 0.025, 0.1);
      if (roll < 0.44) return 'courier';
      if (roll < 0.78) return 'race';
      return 'escape';
    };

    const completeMission = (runtime: UrbanRunRuntime, message: string) => {
      if (!runtime.activeMission) return;

      const reward = runtime.activeMission.reward;
      const comboBonus = runtime.combo > 1 ? runtime.combo * 18 : 0;

      runtime.player.money += reward + comboBonus;
      runtime.missionsCompleted += 1;
      runtime.comboTimer = Math.max(runtime.comboTimer, 4);
      runtime.boostMeter = clamp(runtime.boostMeter + 18, 0, 100);
      runtime.wanted = Math.max(0, runtime.wanted - 16);
      runtime.camera.shake = Math.max(runtime.camera.shake, 8);

      addToast(
        'Mission complete',
        `${message} +$${reward}${comboBonus ? ` and $${comboBonus} combo bonus` : ''}.`,
        'good'
      );

      scheduleNextMission(runtime, 1.15);
    };

    const failMission = (runtime: UrbanRunRuntime, message: string) => {
      if (!runtime.activeMission) return;

      addToast('Mission lost', message, 'bad');
      runtime.combo = Math.max(0, runtime.combo - 1);
      runtime.comboTimer = 0;
      scheduleNextMission(runtime, 1.8);
    };

    const respawnPlayer = (runtime: UrbanRunRuntime, reason = '') => {
      runtime.player.health = 100;
      runtime.player.money = Math.max(0, runtime.player.money - 150);
      runtime.wanted = Math.max(0, runtime.wanted - 38);
      runtime.combo = 0;
      runtime.comboTimer = 0;
      runtime.flashTimer = 0;

      if (runtime.player.inCar) {
        runtime.player.inCar.occupied = false;
      }

      const recoveryCar = ensureRecoveryCar(runtime);
      setPlayerIntoCar(runtime, recoveryCar);
      runtime.camera.x = runtime.player.x;
      runtime.camera.y = runtime.player.y;
      runtime.camera.shake = 10;

      if (runtime.activeMission) {
        failMission(runtime, 'You wiped out and dropped the current job.');
      }

      addToast(
        'Recovery van dispatched',
        `You lost $150${reason ? ` after ${reason}` : ''}, but the run stays alive.`,
        'warn'
      );
    };

    const damagePlayer = (runtime: UrbanRunRuntime, amount: number, reason = '') => {
      runtime.player.health = clamp(runtime.player.health - amount, 0, 100);

      if (amount > 0) {
        runtime.flashTimer = Math.max(runtime.flashTimer, 0.18);
      }

      if (runtime.player.health <= 0) {
        respawnPlayer(runtime, reason);
      }
    };

    const nearestFreeCar = (runtime: UrbanRunRuntime) => {
      let bestCar: Vehicle | null = null;
      let bestDistance = Infinity;

      for (const car of runtime.cars) {
        if (car.occupied || car.hp <= 0) continue;
        const carDistance = dist(runtime.player.x, runtime.player.y, car.x, car.y);
        if (carDistance < bestDistance) {
          bestDistance = carDistance;
          bestCar = car;
        }
      }

      return bestDistance < 46 ? bestCar : null;
    };

    const enterCar = (runtime: UrbanRunRuntime, car: Vehicle) => {
      setPlayerIntoCar(runtime, car);
      runtime.camera.shake = Math.max(runtime.camera.shake, 3);

      if (car.id !== 0) {
        increaseWanted(runtime, 6, 'A stolen vehicle just pinged city cameras.');
      }

      addToast(
        'Ride secured',
        'Shift boosts, Space drifts, E hops out, and the side panel keeps save and repair close.',
        'good'
      );

      if (!runtime.activeMission && runtime.missionCooldown <= 0) {
        beginMission(runtime, 'courier');
      }
    };

    const exitCar = (runtime: UrbanRunRuntime) => {
      const car = runtime.player.inCar;
      if (!car) return;

      const offsetX = Math.cos(car.angle + Math.PI / 2) * 24;
      const offsetY = Math.sin(car.angle + Math.PI / 2) * 24;

      runtime.player.x = clamp(car.x + offsetX, 20, WORLD_WIDTH - 20);
      runtime.player.y = clamp(car.y + offsetY, 20, WORLD_HEIGHT - 20);
      runtime.player.angle = car.angle;
      runtime.player.inCar = null;
      car.occupied = false;
      car.speed *= 0.72;

      addToast('On foot', 'Jog to another vehicle or cut across the block for a tighter line.', 'neutral');
    };

    const repairVehicle = (runtime: UrbanRunRuntime) => {
      const car = runtime.player.inCar;

      if (!car) {
        addToast('No vehicle active', 'Jump into a ride first. The repair kit only works from inside the car.', 'warn');
        return;
      }

      if (car.hp >= 99) {
        addToast('Already sharp', 'Your ride is already in solid shape.', 'neutral');
        return;
      }

      if (runtime.player.money < 90) {
        addToast('Not enough cash', 'Repairs cost $90. Chain a mission or a few near misses first.', 'warn');
        return;
      }

      runtime.player.money -= 90;
      car.hp = clamp(car.hp + 42, 0, 100);
      addToast('Ride patched', 'Bodywork reset and the engine is breathing easier.', 'good');
      syncHud();
    };

    const interact = (runtime: UrbanRunRuntime) => {
      const mission = runtime.activeMission;
      if (!mission) return;

      if (mission.type === 'courier') {
        if (
          mission.stage === 'pickup' &&
          dist(runtime.player.x, runtime.player.y, mission.pickup.x, mission.pickup.y) < 48
        ) {
          mission.stage = 'dropoff';
          runtime.boostMeter = clamp(runtime.boostMeter + 12, 0, 100);
          addToast('Package loaded', 'The drop zone is green. Punch it and keep the streak alive.', 'good');
          return;
        }

        if (
          mission.stage === 'dropoff' &&
          dist(runtime.player.x, runtime.player.y, mission.dropoff.x, mission.dropoff.y) < 48
        ) {
          completeMission(runtime, 'Delivery landed clean.');
        }
      }
    };

    const saveGame = (runtime: UrbanRunRuntime, manual: boolean) => {
      if (typeof window === 'undefined') return;

      const mission = runtime.activeMission ? JSON.parse(JSON.stringify(runtime.activeMission)) : null;
      const payload: SavedGame = {
        player: {
          x: runtime.player.x,
          y: runtime.player.y,
          vx: runtime.player.vx,
          vy: runtime.player.vy,
          angle: runtime.player.angle,
          health: runtime.player.health,
          money: runtime.player.money,
          inCarId: runtime.player.inCar ? runtime.player.inCar.id : null,
        },
        cars: runtime.cars.map((car) => ({
          id: car.id,
          x: car.x,
          y: car.y,
          angle: car.angle,
          hp: car.hp,
          color: car.color,
          occupied: car.occupied,
          ai: car.ai,
        })),
        wanted: runtime.wanted,
        mission,
        phase: runtime.phase,
        boostMeter: runtime.boostMeter,
        combo: runtime.combo,
        bestCombo: runtime.bestCombo,
        missionsCompleted: runtime.missionsCompleted,
        missionCooldown: runtime.missionCooldown,
        nextMissionType: runtime.nextMissionType,
      };

      try {
        window.localStorage.setItem(URBAN_RUN_SAVE_KEY, JSON.stringify(payload));
        syncSaveAvailability();
        setSaveStatus(`${manual ? 'Saved' : 'Autosaved'} ${formatTimestamp()}`);
        if (manual) {
          addToast('Run saved', 'Your current city state is in local storage and ready to continue.', 'good');
        }
      } catch {
        addToast('Save failed', 'Local storage is unavailable in this browser session.', 'bad');
      }
    };

    const loadGame = (runtime: UrbanRunRuntime, announce: boolean) => {
      if (typeof window === 'undefined') return false;

      try {
        const raw = window.localStorage.getItem(URBAN_RUN_SAVE_KEY);
        if (!raw) {
          if (announce) {
            addToast('No save found', 'Start a run first or use the fresh start button.', 'warn');
          }
          return false;
        }

        const data = JSON.parse(raw) as SavedGame;

        runtime.player.x = data.player.x;
        runtime.player.y = data.player.y;
        runtime.player.vx = data.player.vx;
        runtime.player.vy = data.player.vy;
        runtime.player.angle = data.player.angle;
        runtime.player.health = data.player.health;
        runtime.player.money = data.player.money;
        runtime.wanted = data.wanted ?? 0;
        runtime.phase = data.phase ?? 0;
        runtime.boostMeter = data.boostMeter ?? 65;
        runtime.combo = data.combo ?? 0;
        runtime.bestCombo = data.bestCombo ?? 0;
        runtime.missionsCompleted = data.missionsCompleted ?? 0;
        runtime.missionCooldown = data.missionCooldown ?? 0;
        runtime.nextMissionType = data.nextMissionType ?? null;
        runtime.activeMission = data.mission ?? null;

        clearMissionMarkers(runtime);
        if (runtime.activeMission) {
          if (runtime.activeMission.type === 'courier') {
            runtime.missionMarkers.push(runtime.activeMission.pickup, runtime.activeMission.dropoff);
          } else if (runtime.activeMission.type === 'race') {
            runtime.missionMarkers.push(...runtime.activeMission.checkpoints);
          }
        }

        for (const car of runtime.cars) {
          car.occupied = false;
        }

        for (const savedCar of data.cars ?? []) {
          const car = runtime.cars.find((candidate) => candidate.id === savedCar.id);
          if (!car) continue;
          car.x = savedCar.x;
          car.y = savedCar.y;
          car.angle = savedCar.angle;
          car.hp = savedCar.hp;
          car.color = savedCar.color;
          car.ai = savedCar.ai;
          car.occupied = false;
          car.speed = 0;
          car.vx = 0;
          car.vy = 0;
        }

        runtime.player.inCar = null;
        if (data.player.inCarId !== null) {
          const car = runtime.cars.find((candidate) => candidate.id === data.player.inCarId);
          if (car) {
            runtime.player.inCar = car;
            car.occupied = true;
            runtime.player.x = car.x;
            runtime.player.y = car.y;
            runtime.player.angle = car.angle;
          }
        }

        runtime.camera.x = runtime.player.x;
        runtime.camera.y = runtime.player.y;
        runtime.camera.shake = 0;

        setSaveStatus(`Loaded save ${formatTimestamp()}`);
        syncSaveAvailability();

        if (announce) {
          addToast('Save loaded', 'Your last run is live again. Keep the combo from slipping.', 'good');
        }

        return true;
      } catch {
        if (announce) {
          addToast('Load failed', 'The save data could not be parsed cleanly.', 'bad');
        }
        return false;
      }
    };

    const startFreshRun = () => {
      const runtime = createUrbanRunRuntime();
      const starterCar = ensureRecoveryCar(runtime);

      runtime.gameStarted = true;
      runtime.paused = false;
      runtime.lastTime = performance.now();
      runtime.autoSaveTimer = 0;
      setPlayerIntoCar(runtime, starterCar);
      beginMission(runtime, 'courier');

      runtimeRef.current = runtime;
      setSaveStatus('Fresh run started. Autosaves every 18 seconds.');
      syncHud();
      addToast('City live', 'Boost with Shift, drift with Space, and keep the objective arrow in view.', 'good');
    };

    const continueSavedRun = () => {
      const runtime = createUrbanRunRuntime();
      const loaded = loadGame(runtime, true);
      if (!loaded) return;

      runtime.gameStarted = true;
      runtime.paused = false;
      runtime.lastTime = performance.now();
      runtime.autoSaveTimer = 0;
      if (!runtime.activeMission && runtime.missionCooldown <= 0) {
        beginMission(runtime, 'courier');
      }

      runtimeRef.current = runtime;
      syncHud();
    };

    const togglePause = () => {
      const runtime = runtimeRef.current;
      if (!runtime.gameStarted) return;
      runtime.paused = !runtime.paused;
      runtime.lastTime = performance.now();
      syncHud();
    };

    actionsRef.current = {
      startFreshRun,
      continueSavedRun,
      togglePause,
      quickSave: () => {
        const runtime = runtimeRef.current;
        if (!runtime.gameStarted) {
          addToast('Run not started', 'Start the city loop before saving.', 'warn');
          return;
        }
        saveGame(runtime, true);
      },
      loadSave: continueSavedRun,
      repairVehicle: () => repairVehicle(runtimeRef.current),
    };

    const normalizeKey = (key: string) => key.toLowerCase();
    const movementKeys = new Set(['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'shift', ' ']);

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = normalizeKey(event.key);
      const runtime = runtimeRef.current;

      if (movementKeys.has(key) || ['e', 'f', 'r', 'p', 'escape'].includes(key)) {
        event.preventDefault();
      }

      if ((key === 'p' || key === 'escape') && !event.repeat) {
        togglePause();
        return;
      }

      if (!runtime.gameStarted) return;

      if (key === 'e' && !event.repeat) {
        if (runtime.player.inCar) {
          exitCar(runtime);
        } else {
          const car = nearestFreeCar(runtime);
          if (car) enterCar(runtime, car);
          else addToast('No ride nearby', 'Move closer to a parked or stalled vehicle to hop in.', 'warn');
        }
        syncHud();
        return;
      }

      if (key === 'f' && !event.repeat) {
        interact(runtime);
        syncHud();
        return;
      }

      if (key === 'r' && !event.repeat) {
        repairVehicle(runtime);
        return;
      }

      if (runtime.paused) return;

      if (movementKeys.has(key)) {
        runtime.keys.add(key);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      runtimeRef.current.keys.delete(normalizeKey(event.key));
    };

    const handleBlur = () => {
      const runtime = runtimeRef.current;
      runtime.keys.clear();

      if (runtime.gameStarted && !runtime.paused) {
        runtime.paused = true;
        syncHud();
      }
    };

    const updatePlayer = (runtime: UrbanRunRuntime, dt: number) => {
      const up = runtime.keys.has('w') || runtime.keys.has('arrowup');
      const down = runtime.keys.has('s') || runtime.keys.has('arrowdown');
      const left = runtime.keys.has('a') || runtime.keys.has('arrowleft');
      const right = runtime.keys.has('d') || runtime.keys.has('arrowright');
      const shiftHeld = runtime.keys.has('shift');
      const driftHeld = runtime.keys.has(' ');

      if (runtime.player.inCar) {
        const car = runtime.player.inCar;
        const accelerate = up ? 320 : down ? -220 : 0;
        const steerInput = (left ? -1 : 0) + (right ? 1 : 0);
        const speedSign = Math.sign(car.speed || 1);
        const speedFactor = clamp(Math.abs(car.speed) / 150, 0.25, 1.45);

        car.speed += accelerate * dt;
        car.speed *= driftHeld ? 0.985 : 0.992;

        runtime.isBoosting = false;
        runtime.isDrifting = false;

        if (shiftHeld && runtime.boostMeter > 0 && Math.abs(car.speed) > 40) {
          car.speed += (driftHeld ? 265 : 350) * dt;
          runtime.boostMeter = clamp(runtime.boostMeter - 24 * dt, 0, 100);
          runtime.isBoosting = true;
          runtime.camera.shake = Math.max(runtime.camera.shake, 3.5);

          if (Math.random() < 0.25) {
            addParticle(
              runtime,
              car.x - Math.cos(car.angle) * 16 + rand(-4, 4),
              car.y - Math.sin(car.angle) * 16 + rand(-4, 4),
              '#7ef0ff',
              rand(2, 4),
              0.24,
              rand(-35, 35),
              rand(-35, 35)
            );
          }
        } else {
          const recharge = driftHeld && Math.abs(car.speed) > 70 ? 15 : 9;
          runtime.boostMeter = clamp(runtime.boostMeter + recharge * dt, 0, 100);
        }

        if (driftHeld && Math.abs(car.speed) > 85 && steerInput !== 0) {
          runtime.isDrifting = true;
          runtime.driftCharge += dt;

          if (Math.random() < 0.18) {
            addParticle(
              runtime,
              car.x - Math.sin(car.angle) * rand(-14, 14),
              car.y + Math.cos(car.angle) * rand(-14, 14),
              '#ffd166',
              rand(1.5, 3),
              0.18,
              rand(-22, 22),
              rand(-22, 22)
            );
          }

          if (runtime.driftCharge >= 1.25) {
            runtime.driftCharge = 0;
            addCombo(runtime, 1, 'Drift line threaded');
            runtime.boostMeter = clamp(runtime.boostMeter + 12, 0, 100);
          }
        } else {
          runtime.driftCharge = Math.max(0, runtime.driftCharge - dt * 0.8);
        }

        car.speed = clamp(car.speed, -80, 360);
        car.angle += steerInput * dt * (driftHeld ? 3.15 : 2.25) * speedFactor * speedSign;
        car.vx = Math.cos(car.angle) * car.speed;
        car.vy = Math.sin(car.angle) * car.speed;
        car.x += car.vx * dt;
        car.y += car.vy * dt;
        keepInWorld(car);

        runtime.player.x = car.x;
        runtime.player.y = car.y;
        runtime.player.angle = car.angle;

        if (!isRoad(car.x, car.y)) {
          car.speed *= 0.97;
          car.hp = clamp(car.hp - dt * (runtime.isBoosting ? 4 : 2.5), 0, 100);

          if (Math.random() < 0.15) {
            addParticle(
              runtime,
              car.x + rand(-12, 12),
              car.y + rand(-12, 12),
              '#8fa17f',
              rand(2, 3.8),
              0.28,
              rand(-18, 18),
              rand(-18, 18)
            );
          }
        }

        if (Math.abs(car.speed) > 20) {
          runtime.player.stepPhase += dt * Math.abs(car.speed) * 0.04;
        }

        if (car.hp <= 0) {
          addToast('Ride totaled', 'A recovery vehicle is inbound so the run does not lose momentum.', 'bad');
          respawnPlayer(runtime, 'your car getting totaled');
        }
      } else {
        const sprintSpeed = shiftHeld ? 190 : 138;
        let moveX = 0;
        let moveY = 0;

        if (up) moveY -= 1;
        if (down) moveY += 1;
        if (left) moveX -= 1;
        if (right) moveX += 1;

        const length = Math.hypot(moveX, moveY) || 1;
        moveX /= length;
        moveY /= length;

        runtime.player.vx = lerp(runtime.player.vx, moveX * sprintSpeed, dt * 10);
        runtime.player.vy = lerp(runtime.player.vy, moveY * sprintSpeed, dt * 10);

        if (moveX || moveY) {
          runtime.player.angle = Math.atan2(moveY, moveX);
          runtime.player.stepPhase += dt * 8;
        }

        runtime.player.x += runtime.player.vx * dt;
        runtime.player.y += runtime.player.vy * dt;
        keepInWorld(runtime.player);
        runtime.boostMeter = clamp(runtime.boostMeter + 6 * dt, 0, 100);
        runtime.isBoosting = false;
        runtime.isDrifting = false;
      }
    };

    const updateTraffic = (runtime: UrbanRunRuntime, dt: number) => {
      for (const car of runtime.cars) {
        car.nearMissCooldown = Math.max(0, car.nearMissCooldown - dt);

        if (car === runtime.player.inCar || car.hp <= 0) continue;

        if (!car.ai) {
          car.speed = lerp(car.speed, 0, dt * 3);
          car.vx = Math.cos(car.angle) * car.speed;
          car.vy = Math.sin(car.angle) * car.speed;
          car.x += car.vx * dt;
          car.y += car.vy * dt;
          keepInWorld(car);
          continue;
        }

        const vertical = Math.abs(Math.sin(car.angle)) > 0.7;
        const targetLaneX = vertical
          ? nearestRoadX(car.x) + (Math.sin(car.angle) > 0 ? 12 : -12)
          : null;
        const targetLaneY = !vertical
          ? nearestRoadY(car.y) + (Math.cos(car.angle) > 0 ? -12 : 12)
          : null;

        if (vertical && targetLaneX !== null) {
          car.x = lerp(car.x, targetLaneX, dt * 1.8);
        }
        if (!vertical && targetLaneY !== null) {
          car.y = lerp(car.y, targetLaneY, dt * 1.8);
        }

        car.speed = lerp(car.speed, car.targetSpeed, dt * 0.6);

        const aheadX = car.x + Math.cos(car.angle) * 44;
        const aheadY = car.y + Math.sin(car.angle) * 44;
        let blocked = false;

        for (const other of runtime.cars) {
          if (other === car || other.hp <= 0) continue;
          if (dist(aheadX, aheadY, other.x, other.y) < 30) {
            blocked = true;
            break;
          }
        }

        if (dist(aheadX, aheadY, runtime.player.x, runtime.player.y) < (runtime.player.inCar ? 34 : 24)) {
          blocked = true;
        }

        if (blocked) {
          car.speed = lerp(car.speed, 0, dt * 5.5);
          car.stuck += dt;
        } else {
          car.stuck = 0;
        }

        if (car.stuck > 2.4) {
          car.angle += (Math.random() > 0.5 ? 1 : -1) * (Math.PI / 2);
          car.stuck = 0;
        }

        car.vx = Math.cos(car.angle) * car.speed;
        car.vy = Math.sin(car.angle) * car.speed;
        car.x += car.vx * dt;
        car.y += car.vy * dt;

        if (car.x < 20 || car.x > WORLD_WIDTH - 20 || car.y < 20 || car.y > WORLD_HEIGHT - 20) {
          car.angle += Math.PI;
        }

        keepInWorld(car);
      }
    };

    const updatePedestrians = (runtime: UrbanRunRuntime, dt: number) => {
      for (const pedestrian of runtime.pedestrians) {
        pedestrian.timer -= dt;

        if (pedestrian.timer <= 0) {
          pedestrian.angle += rand(-1.4, 1.4);
          pedestrian.speed = 12 + Math.random() * 20 + pedestrian.scared * 40;
          pedestrian.timer = rand(0.6, 2.2);
        }

        if (pedestrian.scared > 0) {
          pedestrian.scared = Math.max(0, pedestrian.scared - dt * 1.5);
        }

        let targetAngle = pedestrian.angle;
        const threat = runtime.player.inCar;

        if (threat && dist(pedestrian.x, pedestrian.y, threat.x, threat.y) < 100) {
          targetAngle = Math.atan2(pedestrian.y - threat.y, pedestrian.x - threat.x);
          pedestrian.scared = 1;
        }

        pedestrian.angle = angleLerp(pedestrian.angle, targetAngle, dt * 3);
        pedestrian.vx = Math.cos(pedestrian.angle) * pedestrian.speed;
        pedestrian.vy = Math.sin(pedestrian.angle) * pedestrian.speed;
        pedestrian.x += pedestrian.vx * dt;
        pedestrian.y += pedestrian.vy * dt;

        if (isRoad(pedestrian.x, pedestrian.y) || !isNearRoad(pedestrian.x, pedestrian.y, 100)) {
          pedestrian.angle += Math.PI * (0.5 + Math.random());
        }

        keepInWorld(pedestrian);
      }
    };

    const updatePolice = (runtime: UrbanRunRuntime, dt: number) => {
      for (let index = runtime.police.length - 1; index >= 0; index -= 1) {
        const unit = runtime.police[index];
        unit.nearMissCooldown = Math.max(0, unit.nearMissCooldown - dt);

        const target = runtime.player.inCar ?? runtime.player;
        const targetDistance = dist(unit.x, unit.y, target.x, target.y);

        if (runtime.wanted > 8) {
          const direction = Math.atan2(target.y - unit.y, target.x - unit.x);
          unit.angle = angleLerp(unit.angle, direction, dt * 2.2);
          unit.targetSpeed = target === runtime.player ? 120 : 225;
          unit.speed = lerp(unit.speed, unit.targetSpeed, dt * 1.8);
          unit.siren = lerp(unit.siren, 1, dt * 4);
        } else {
          unit.targetSpeed = 80;
          unit.speed = lerp(unit.speed, 0, dt * 2.5);
          unit.siren = lerp(unit.siren, 0, dt * 4);
        }

        unit.vx = Math.cos(unit.angle) * unit.speed;
        unit.vy = Math.sin(unit.angle) * unit.speed;
        unit.x += unit.vx * dt;
        unit.y += unit.vy * dt;
        keepInWorld(unit);

        if (targetDistance > 1200 && runtime.wanted < 5 && runtime.police.length > 2) {
          runtime.police.splice(index, 1);
          continue;
        }

        if (targetDistance < 36) {
          if (runtime.player.inCar) {
            runtime.player.inCar.hp = clamp(runtime.player.inCar.hp - dt * 10, 0, 100);
          } else {
            damagePlayer(runtime, dt * 14, 'getting clipped by police');
          }

          increaseWanted(runtime, dt * 4, 'Police contact was made. The net is tightening.');
        }
      }
    };

    const checkNearMisses = (runtime: UrbanRunRuntime) => {
      const playerCar = runtime.player.inCar;
      if (!playerCar || Math.abs(playerCar.speed) < 110) return;

      for (const car of [...runtime.cars, ...runtime.police]) {
        if (car === playerCar || car.hp <= 0 || car.nearMissCooldown > 0) continue;

        const separation = dist(playerCar.x, playerCar.y, car.x, car.y);
        const relativeSpeed = Math.abs(playerCar.speed - car.speed);

        if (separation < 42 && separation > 24 && relativeSpeed > 110) {
          car.nearMissCooldown = 1.8;
          addCombo(runtime, 1, 'Near miss');
          runtime.camera.shake = Math.max(runtime.camera.shake, 2);

          addParticle(
            runtime,
            (playerCar.x + car.x) / 2,
            (playerCar.y + car.y) / 2,
            '#ffffff',
            3,
            0.25,
            rand(-30, 30),
            rand(-30, 30)
          );
        }
      }
    };

    const solveCollisions = (runtime: UrbanRunRuntime) => {
      const movers = [...runtime.cars, ...runtime.police];

      for (let first = 0; first < movers.length; first += 1) {
        for (let second = first + 1; second < movers.length; second += 1) {
          const a = movers[first];
          const b = movers[second];
          if (a.hp <= 0 || b.hp <= 0) continue;

          const separation = dist(a.x, a.y, b.x, b.y);
          if (separation >= 22) continue;

          const impact = Math.min(1.2, Math.abs(a.speed - b.speed) / 180 + 0.35);
          a.speed *= 0.78;
          b.speed *= 0.78;
          a.hp = clamp(a.hp - impact * 8, 0, 100);
          b.hp = clamp(b.hp - impact * 8, 0, 100);

          const push = (22 - separation) * 0.5;
          const angle = Math.atan2(b.y - a.y, b.x - a.x) || 0;
          a.x -= Math.cos(angle) * push;
          a.y -= Math.sin(angle) * push;
          b.x += Math.cos(angle) * push;
          b.y += Math.sin(angle) * push;

          addParticle(
            runtime,
            (a.x + b.x) / 2,
            (a.y + b.y) / 2,
            '#ffffff',
            4 + impact * 4,
            0.35,
            rand(-50, 50),
            rand(-50, 50)
          );

          runtime.camera.shake = Math.max(runtime.camera.shake, impact * 10);

          if (a === runtime.player.inCar || b === runtime.player.inCar) {
            damagePlayer(runtime, impact * 3.5, 'a vehicle impact');
            increaseWanted(runtime, impact * 4, 'Traffic cameras just logged a violent collision.');
          }
        }
      }

      const playerCar = runtime.player.inCar;
      if (!playerCar) return;

      for (const pedestrian of runtime.pedestrians) {
        const separation = dist(playerCar.x, playerCar.y, pedestrian.x, pedestrian.y);
        if (separation >= 20) continue;

        pedestrian.x += Math.cos(playerCar.angle + Math.PI / 2) * 34;
        pedestrian.y += Math.sin(playerCar.angle + Math.PI / 2) * 34;
        pedestrian.scared = 1;

        addParticle(
          runtime,
          pedestrian.x,
          pedestrian.y,
          '#ffb4c2',
          5,
          0.3,
          rand(-30, 30),
          rand(-30, 30)
        );

        damagePlayer(runtime, 0.45);
        increaseWanted(runtime, 6, 'Pedestrian disturbance reported. Patrols are converging.');
      }
    };

    const updateMission = (runtime: UrbanRunRuntime, dt: number) => {
      if (!runtime.activeMission) {
        if (runtime.nextMissionType) {
          runtime.missionCooldown = Math.max(0, runtime.missionCooldown - dt);
          if (runtime.missionCooldown <= 0) {
            const nextType =
              runtime.nextMissionType === 'random'
                ? pickNextMissionType(runtime)
                : runtime.nextMissionType;
            runtime.nextMissionType = null;
            beginMission(runtime, nextType);
          }
        }
        return;
      }

      runtime.activeMission.timer -= dt;
      if (runtime.activeMission.timer <= 0) {
        failMission(runtime, 'You ran out of road before the timer did.');
        return;
      }

      if (runtime.activeMission.type === 'race') {
        const checkpoint = runtime.activeMission.checkpoints[runtime.activeMission.index];
        if (checkpoint && dist(runtime.player.x, runtime.player.y, checkpoint.x, checkpoint.y) < 50) {
          runtime.activeMission.index += 1;
          addCombo(runtime, 1, 'Checkpoint stitched into the line');
          runtime.boostMeter = clamp(runtime.boostMeter + 10, 0, 100);
          addToast(
            'Checkpoint locked',
            `${runtime.activeMission.index}/${runtime.activeMission.checkpoints.length} cleared.`,
            'good'
          );

          if (runtime.activeMission.index >= runtime.activeMission.checkpoints.length) {
            completeMission(runtime, 'Sprint finished with the line still hot.');
          }
        }
      }

      if (runtime.activeMission.type === 'escape') {
        const closePolice = runtime.police.some(
          (unit) => dist(unit.x, unit.y, runtime.player.x, runtime.player.y) < 160
        );
        if (closePolice) {
          runtime.activeMission.timer = Math.min(runtime.activeMission.timer + dt * 0.7, 30);
        }
        if (runtime.wanted <= 4) {
          completeMission(runtime, 'You dropped every tail in the city.');
        }
      }
    };

    const updateWanted = (runtime: UrbanRunRuntime, dt: number) => {
      if (runtime.wantedCooldown > 0) {
        runtime.wantedCooldown -= dt;
      } else {
        runtime.wanted = clamp(runtime.wanted - dt * (runtime.player.inCar ? 1.15 : 1.8), 0, 100);
      }

      if (runtime.comboTimer > 0) {
        runtime.comboTimer -= dt;
      } else if (runtime.combo > 0) {
        runtime.combo = 0;
      }
    };

    const updateParticles = (runtime: UrbanRunRuntime, dt: number) => {
      for (let index = runtime.particles.length - 1; index >= 0; index -= 1) {
        const particle = runtime.particles[index];
        particle.life -= dt;
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
        particle.vx *= 0.98;
        particle.vy *= 0.98;

        if (particle.life <= 0) {
          runtime.particles.splice(index, 1);
        }
      }
    };

    const updateCamera = (runtime: UrbanRunRuntime, dt: number) => {
      runtime.camera.x = lerp(runtime.camera.x, runtime.player.x, 1 - Math.pow(0.001, dt));
      runtime.camera.y = lerp(runtime.camera.y, runtime.player.y, 1 - Math.pow(0.001, dt));
      runtime.camera.shake = Math.max(0, runtime.camera.shake - dt * 10);
      runtime.flashTimer = Math.max(0, runtime.flashTimer - dt * 2);
    };

    const renderLoop = (timestamp: number) => {
      const runtime = runtimeRef.current;
      const canvas = canvasRef.current;
      const context = canvas?.getContext('2d');

      if (!context) {
        frameRef.current = requestAnimationFrame(renderLoop);
        return;
      }

      const delta = runtime.lastTime ? Math.min((timestamp - runtime.lastTime) / 1000, 0.033) : 0.016;
      runtime.lastTime = timestamp;

      if (runtime.gameStarted && !runtime.paused) {
        runtime.phase = (runtime.phase + delta) % DAY_LENGTH;
        runtime.autoSaveTimer += delta;
        runtime.hudAccumulator += delta;

        updatePlayer(runtime, delta);
        updateTraffic(runtime, delta);
        updatePedestrians(runtime, delta);
        updatePolice(runtime, delta);
        checkNearMisses(runtime);
        solveCollisions(runtime);
        updateMission(runtime, delta);
        updateWanted(runtime, delta);
        updateParticles(runtime, delta);
        updateCamera(runtime, delta);

        if (runtime.autoSaveTimer >= 18) {
          runtime.autoSaveTimer = 0;
          saveGame(runtime, false);
        }

        if (runtime.hudAccumulator >= HUD_UPDATE_INTERVAL) {
          runtime.hudAccumulator = 0;
          syncHud();
        }
      } else {
        runtime.phase = (runtime.phase + delta * 0.15) % DAY_LENGTH;
      }

      drawUrbanRun(context, runtime, CANVAS_WIDTH, CANVAS_HEIGHT);
      frameRef.current = requestAnimationFrame(renderLoop);
    };

    frameRef.current = requestAnimationFrame(renderLoop);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    const toastTimers = toastTimerRef.current;

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }

      actionsRef.current = null;
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);

      for (const timeout of toastTimers) {
        window.clearTimeout(timeout);
      }
    };
  }, [addToast, syncSaveAvailability]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(22,58,94,0.28),_transparent_42%),linear-gradient(180deg,_rgba(2,6,23,1)_0%,_rgba(5,12,24,1)_100%)] px-4 pb-16 pt-24">
      <div className="container mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={onBack} variant="outline" size="lg" className="border-white/10 bg-white/5 hover:bg-white/10">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Demos
            </Button>
            <Badge variant="outline" className="border-cyan-400/30 bg-cyan-400/10 text-cyan-100">
              Urban Run
            </Badge>
            <Badge variant="outline" className="border-white/10 bg-white/5 text-slate-200">
              Canvas chase sandbox
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
              Area: {hud.areaName}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
              Best combo: x{hud.bestCombo}
            </span>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <Card className="overflow-hidden border-white/10 bg-slate-950/70 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
            <CardContent className="p-3 md:p-4">
              <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-slate-950 shadow-2xl">
                <canvas
                  ref={canvasRef}
                  width={CANVAS_WIDTH}
                  height={CANVAS_HEIGHT}
                  className="block aspect-[16/10] w-full bg-slate-950"
                />

                <div className="pointer-events-none absolute left-4 top-4 z-10 flex max-w-sm flex-col gap-2">
                  {toasts.map((toast) => (
                    <div
                      key={toast.id}
                      className={`rounded-2xl border px-4 py-3 text-sm shadow-xl backdrop-blur ${
                        toast.tone === 'good'
                          ? 'border-emerald-400/25 bg-emerald-500/12'
                          : toast.tone === 'warn'
                            ? 'border-amber-400/25 bg-amber-500/12'
                            : toast.tone === 'bad'
                              ? 'border-rose-400/25 bg-rose-500/12'
                              : 'border-white/10 bg-slate-900/72'
                      }`}
                    >
                      <div className="font-semibold text-slate-100">{toast.title}</div>
                      <div className="mt-1 text-slate-300">{toast.text}</div>
                    </div>
                  ))}
                </div>

                {(!isStarted || isPaused) && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/72 p-6 backdrop-blur-sm">
                    <div className="w-full max-w-2xl rounded-[28px] border border-white/10 bg-slate-950/88 p-8 shadow-[0_32px_100px_rgba(0,0,0,0.55)]">
                      <div className="space-y-5">
                        <div>
                          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
                            Top-down pursuit sandbox
                          </div>
                          <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
                            {isStarted ? 'Run Paused' : 'Urban Run'}
                          </h1>
                          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                            This React port keeps the city grid, courier and checkpoint loops, and police heat from the prototype, then adds a faster start, boost, drift chaining, near-miss combos, and a cleaner save flow.
                          </p>
                        </div>

                        <div className="grid gap-3 md:grid-cols-3">
                          <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                              Boost
                            </div>
                            <p className="mt-2 text-sm leading-6 text-slate-200">
                              Hold Shift in a car to burn boost. Drift long enough and the tank refills faster.
                            </p>
                          </div>
                          <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                              Combo
                            </div>
                            <p className="mt-2 text-sm leading-6 text-slate-200">
                              Near misses, drifts, and checkpoints build a streak that pays bonus cash on the fly.
                            </p>
                          </div>
                          <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                              Persistence
                            </div>
                            <p className="mt-2 text-sm leading-6 text-slate-200">
                              Autosaves keep the city state warm, and recovery rides stop hard crashes from killing the pace.
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          {!isStarted ? (
                            <>
                              <Button
                                size="lg"
                                className="bg-cyan-400 text-slate-950 hover:bg-cyan-300"
                                onClick={() => actionsRef.current?.startFreshRun()}
                              >
                                <Play className="mr-2 h-4 w-4" />
                                Start Fresh Run
                              </Button>
                              <Button
                                size="lg"
                                variant="outline"
                                className="border-white/12 bg-white/5 text-white hover:bg-white/10"
                                onClick={() => actionsRef.current?.continueSavedRun()}
                                disabled={!hasSave}
                              >
                                <Save className="mr-2 h-4 w-4" />
                                Continue Save
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="lg"
                                className="bg-cyan-400 text-slate-950 hover:bg-cyan-300"
                                onClick={() => actionsRef.current?.togglePause()}
                              >
                                <Play className="mr-2 h-4 w-4" />
                                Resume Run
                              </Button>
                              <Button
                                size="lg"
                                variant="outline"
                                className="border-white/12 bg-white/5 text-white hover:bg-white/10"
                                onClick={() => actionsRef.current?.quickSave()}
                              >
                                <Save className="mr-2 h-4 w-4" />
                                Quick Save
                              </Button>
                              <Button
                                size="lg"
                                variant="outline"
                                className="border-white/12 bg-white/5 text-white hover:bg-white/10"
                                onClick={() => actionsRef.current?.startFreshRun()}
                              >
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Restart Run
                              </Button>
                            </>
                          )}
                        </div>

                        <div className="text-sm text-slate-400">
                          Controls: `WASD` or arrows drive, `Shift` boosts or sprints, `Space` drifts, `E` swaps vehicles, `F` interacts, `R` repairs, `P` pauses.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="border-white/10 bg-slate-950/72 shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
              <CardContent className="space-y-5 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
                      Active loop
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-white">{hud.missionTitle}</h2>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-right">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Cash</div>
                    <div className="text-xl font-bold text-emerald-300">
                      ${hud.money.toLocaleString()}
                    </div>
                  </div>
                </div>

                <p className="text-sm leading-6 text-slate-300">{hud.missionCopy}</p>

                <div className="grid gap-3 rounded-2xl border border-white/8 bg-white/5 p-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Speed</div>
                    <div className="text-3xl font-black text-white">{hud.speedKmh} km/h</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Objective</div>
                    <div className="text-3xl font-black text-white">
                      {hud.objectiveDistance ? `${hud.objectiveDistance}m` : 'Heat break'}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4">
                  <StatBar label="Health" value={`${hud.health}%`} tint="bg-gradient-to-r from-rose-400 to-rose-500" />
                  <StatBar
                    label="Vehicle integrity"
                    value={`${hud.hasVehicle ? hud.vehicleHp : 0}%`}
                    tint="bg-gradient-to-r from-cyan-400 to-sky-500"
                  />
                  <StatBar label="Police heat" value={`${hud.wanted}%`} tint="bg-gradient-to-r from-amber-300 to-amber-500" />
                  <StatBar label="Boost reserve" value={`${hud.boost}%`} tint="bg-gradient-to-r from-emerald-300 to-emerald-500" />
                  <StatBar
                    label="Combo timer"
                    value={`${Math.round(hud.comboTimerRatio * 100)}%`}
                    tint="bg-gradient-to-r from-fuchsia-300 to-pink-500"
                  />
                </div>

                <div className="grid gap-3 rounded-2xl border border-white/8 bg-white/5 p-4 sm:grid-cols-2">
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Current combo</div>
                    <div className="mt-2 text-2xl font-black text-white">x{hud.combo}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Heat state</div>
                    <div className="mt-2 text-lg font-semibold text-slate-100">{hud.heatLabel}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Missions cleared</div>
                    <div className="mt-2 text-2xl font-black text-white">{hud.missionsCompleted}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Mission timer</div>
                    <div className="mt-2 text-2xl font-black text-white">
                      {hud.missionTimer ? `${hud.missionTimer}s` : 'Waiting'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-slate-950/72 shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-center gap-2 text-white">
                  <Gauge className="h-4 w-4 text-cyan-300" />
                  <h3 className="font-semibold">Run actions</h3>
                </div>

                <div className="grid gap-3">
                  <Button
                    onClick={() => actionsRef.current?.startFreshRun()}
                    className="justify-start bg-cyan-400 text-slate-950 hover:bg-cyan-300"
                  >
                    <CarFront className="mr-2 h-4 w-4" />
                    Start fresh
                  </Button>
                  <Button
                    onClick={() => actionsRef.current?.continueSavedRun()}
                    variant="outline"
                    className="justify-start border-white/10 bg-white/5 text-white hover:bg-white/10"
                    disabled={!hasSave}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Continue save
                  </Button>
                  <Button
                    onClick={() => actionsRef.current?.togglePause()}
                    variant="outline"
                    className="justify-start border-white/10 bg-white/5 text-white hover:bg-white/10"
                    disabled={!isStarted}
                  >
                    {isPaused ? (
                      <Play className="mr-2 h-4 w-4" />
                    ) : (
                      <Pause className="mr-2 h-4 w-4" />
                    )}
                    {isPaused ? 'Resume run' : 'Pause run'}
                  </Button>
                  <Button
                    onClick={() => actionsRef.current?.quickSave()}
                    variant="outline"
                    className="justify-start border-white/10 bg-white/5 text-white hover:bg-white/10"
                    disabled={!isStarted}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Quick save
                  </Button>
                  <Button
                    onClick={() => actionsRef.current?.repairVehicle()}
                    variant="outline"
                    className="justify-start border-white/10 bg-white/5 text-white hover:bg-white/10"
                    disabled={!hud.hasVehicle}
                  >
                    <Wrench className="mr-2 h-4 w-4" />
                    Repair current ride
                  </Button>
                </div>

                <div className="rounded-2xl border border-white/8 bg-white/5 p-4 text-sm text-slate-300">
                  <div className="font-medium text-white">Save state</div>
                  <div className="mt-2">{saveStatus}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-slate-950/72 shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-center gap-2 text-white">
                  <ShieldAlert className="h-4 w-4 text-amber-300" />
                  <h3 className="font-semibold">Playbook</h3>
                </div>

                <div className="grid gap-3 text-sm text-slate-300">
                  <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                    <div className="flex items-center gap-2 text-white">
                      <Zap className="h-4 w-4 text-cyan-300" />
                      <span className="font-medium">Boost and drift</span>
                    </div>
                    <p className="mt-2 leading-6">
                      Hold <span className="font-semibold text-white">Shift</span> to boost. Tap into
                      <span className="font-semibold text-white"> Space</span> on corners to drift, build the combo, and recharge boost faster.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                    <div className="font-medium text-white">Keys</div>
                    <p className="mt-2 leading-6">
                      `WASD` or arrows move, `E` swaps vehicles, `F` interacts with courier rings, `R` repairs, and `P` pauses instantly.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                    <div className="font-medium text-white">Flow</div>
                    <p className="mt-2 leading-6">
                      Open with the starter car, keep the objective arrow in sight, and treat near misses as cash and combo fuel instead of pure risk.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UrbanRunGame;
