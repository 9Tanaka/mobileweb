<template>
  <ion-page>
    <ion-content :fullscreen="true" class="workout-page">
      
      <div class="bg-layer"></div>

    
      <div class="header-bar">
        <div class="header-left">
          <span class="header-icon">💪</span>
          <span class="header-title">ARM WORKOUT</span>
        </div>
        <div class="status-badge" :class="statusClass">
          {{ statusLabel }}
        </div>
      </div>

    
      <div class="rep-hero">
        <div class="rep-ring" :class="{ 'ring-pulse': isRunning }">
          <svg class="ring-svg" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="90" class="ring-track" />
            <circle
              cx="100" cy="100" r="90"
              class="ring-progress"
              :style="{ strokeDashoffset: progressOffset }"
            />
          </svg>
          <div class="rep-inner">
            <div class="rep-count" :class="{ 'rep-bump': repBump }">
              {{ state?.repDisplay ?? 0 }}
            </div>
            <div class="rep-label">REPS</div>
          </div>
        </div>
      </div>


      <div class="feedback-area">
        <div class="feedback-msg" :class="feedbackClass" v-if="state?.stats.lastMessage">
          <span class="feedback-icon">{{ feedbackIcon }}</span>
          <span>{{ state.stats.lastMessage }}</span>
        </div>
        <div class="feedback-msg neutral" v-else-if="!isRunning && !isStopped">
          กด Start เพื่อเริ่มออกกำลังกาย
        </div>
      </div>

     
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value accent">{{ state?.stats.score ?? 0 }}</div>
          <div class="stat-label">คะแนน</div>
        </div>
        <div class="stat-card">
          <div class="stat-value good">{{ state?.stats.repsOk ?? 0 }}</div>
          <div class="stat-label">สำเร็จ</div>
        </div>
      </div>
 <!-- Realtime Sensor Data -->
<div class="accel-card" v-if="isRunning || isStopped">
  <div class="accel-header">
    <span class="accel-icon">📡</span>
    <span>SENSOR DATA</span>
  </div>
  <div class="accel-bars">
    <div class="accel-row">
      <span class="accel-axis x">X</span>
      <div class="accel-bar-track">
        <div class="accel-bar-fill x" :style="{ width: barWidth(state?.accel?.ax) }"></div>
      </div>
      <span class="accel-val">{{ state?.accel?.ax?.toFixed(2) ?? '0.00' }}</span>
    </div>
    <div class="accel-row">
      <span class="accel-axis y">Y</span>
      <div class="accel-bar-track">
        <div class="accel-bar-fill y" :style="{ width: barWidth(state?.accel?.ay) }"></div>
      </div>
      <span class="accel-val">{{ state?.accel?.ay?.toFixed(2) ?? '0.00' }}</span>
    </div>
    <div class="accel-row">
      <span class="accel-axis z">Z</span>
      <div class="accel-bar-track">
        <div class="accel-bar-fill z" :style="{ width: barWidth(state?.accel?.az) }"></div>
      </div>
      <span class="accel-val">{{ state?.accel?.az?.toFixed(2) ?? '0.00' }}</span>
    </div>
  </div>
</div>
  
      <div class="controls">
        <button
          class="btn-start" :class="{ disabled: isRunning }"
          :disabled="isRunning" @click="handleStart"
        >
          <span class="btn-icon">▶</span>
          <span>START</span>
        </button>
        <button
          class="btn-stop" :class="{ disabled: !isRunning }"
          :disabled="!isRunning" @click="handleStop"
        >
          <span class="btn-icon">■</span>
          <span>STOP</span>
        </button>
      </div>

    
      <div class="footer-info">
        673380218-7 นายธนกฤต จิตจักร์
      </div>

      <div class="summary-overlay" v-if="state?.status === 'FINISHED'">
  <!-- Summary Overlay -->
<div class="summary-overlay" v-if="state?.status === 'FINISHED'">
  <div class="summary-backdrop"></div>
  <div class="summary-card">
    <div class="summary-emoji">🎉</div>
    <h2 class="summary-title">สรุปผล</h2>

    <div class="summary-stats">
      <div class="summary-row">
        <span class="summary-label">ทั้งหมด</span>
        <span class="summary-value">{{ state.stats.repsTotal }} ครั้ง</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">สำเร็จ</span>
        <span class="summary-value good">{{ state.stats.repsOk }} ครั้ง</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">ผิดท่า</span>
        <span class="summary-value bad">{{ state.stats.repsBad }} ครั้ง</span>
      </div>
      <div class="summary-divider"></div>
      <div class="summary-row big">
        <span class="summary-label">คะแนน</span>
        <span class="summary-value accent">{{ state.stats.score }}</span>
      </div>
    </div>

    <button class="btn-restart" @click="handleStart">
      🔄 เริ่มใหม่
    </button>
  </div>
</div>
</div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { IonPage, IonContent } from "@ionic/vue";
import { ArmWorkoutEngine } from "../core/ArmWorkoutEngine";
import type { WorkoutState } from "../core/types";


const engine = new ArmWorkoutEngine();

const state = ref<WorkoutState | null>(null);
const repBump = ref(false);


onMounted(() => {
  engine.onChange((s) => {
    
    if (s.stats.repsTotal > (state.value?.stats.repsTotal ?? 0)) {
      repBump.value = true;
      setTimeout(() => (repBump.value = false), 300);
    }
    state.value = s;
  });
});


async function handleStart() {
  await engine.start();
}

async function handleStop() {
  await engine.stop();
}


const isRunning = computed(() => state.value?.status === "RUNNING");
const isStopped = computed(() => state.value?.status === "STOPPED");

const statusClass = computed(() => {
  switch (state.value?.status) {
    case "RUNNING": return "running";
    case "STOPPED": return "stopped";
    default: return "idle";
  }
});

const statusLabel = computed(() => {
  switch (state.value?.status) {
    case "RUNNING": return "● กำลังออกกำลังกาย";
    case "STOPPED": return "■ หยุดแล้ว";
    default: return "○ พร้อม";
  }
});
function barWidth(val?: number): string {
  const v = val ?? 0;
  const pct = Math.min(Math.abs(v) / 20 * 100, 100);
  return `${pct}%`;
}
const feedbackClass = computed(() => {
  if (!state.value?.stats.lastMessage) return "neutral";
  return state.value.stats.lastMessage === "OK" ? "good" : "bad";
});

const feedbackIcon = computed(() => {
  if (!state.value?.stats.lastMessage) return "";
  return state.value.stats.lastMessage === "OK" ? "✓" : "✗";
});

const avgSec = computed(() => {
  const ms = state.value?.stats.avgRepMs ?? 0;
  return ms > 0 ? (ms / 1000).toFixed(1) : "—";
});

// Progress ring: fill up as reps approach 20
const TARGET_REPS = 20;
const CIRCUMFERENCE = 2 * Math.PI * 90; // 565.48
const progressOffset = computed(() => {
  const reps = state.value?.repDisplay ?? 0;
  const pct = Math.min(reps / TARGET_REPS, 1);
  return CIRCUMFERENCE - pct * CIRCUMFERENCE;
});
</script>

<style scoped>
.workout-page {
  --background: #0a0a0f;
  --color: #f0f0f5;
  font-family: "SF Pro Display", "Prompt", -apple-system, sans-serif;
   display: flex;
  flex-direction: column;
  justify-content: center;
}

.bg-layer {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse at 30% 0%, rgba(99, 102, 241, 0.15) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 100%, rgba(236, 72, 153, 0.1) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}
/* ── Summary Overlay ── */
.summary-overlay {
  position: fixed;
  inset: 0; z-index: 100;
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
  animation: fade-in 0.3s ease;
}

.summary-backdrop {
  position: absolute; inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
}

.summary-card {
  position: relative;
  width: 100%; max-width: 320px;
  background: linear-gradient(145deg, #1a1a2e, #16162a);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  padding: 32px 24px;
  text-align: center;
  animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.summary-emoji {
  font-size: 48px;
  margin-bottom: 8px;
}

.summary-title {
  font-size: 20px; font-weight: 800;
  color: #f0f0f5;
  margin: 0 0 24px;
  letter-spacing: 1px;
}

.summary-stats {
  display: flex; flex-direction: column; gap: 12px;
}

.summary-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0 4px;
}

.summary-row.big {
  padding-top: 4px;
}

.summary-label {
  font-size: 14px; color: #888;
}

.summary-value {
  font-size: 16px; font-weight: 700; color: #f0f0f5;
  font-variant-numeric: tabular-nums;
}

.summary-value.good  { color: #34d399; }
.summary-value.bad   { color: #fb7185; }
.summary-value.accent { font-size: 28px; color: #818cf8; }

.summary-divider {
  height: 1px;
  background: rgba(255,255,255,0.06);
  margin: 4px 0;
}

.btn-restart {
  margin-top: 24px;
  width: 100%;
  padding: 14px;
  border: none; border-radius: 12px;
  background: linear-gradient(135deg, #6366f1, #818cf8);
  color: #fff;
  font-size: 15px; font-weight: 700;
  letter-spacing: 1px;
  cursor: pointer;
  transition: transform 0.2s ease;
  box-shadow: 0 4px 20px rgba(99,102,241,0.3);
}

.btn-restart:active { transform: scale(0.97); }

@keyframes slide-up {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
/* ── Header ── */
.header-bar {
  position: relative; z-index: 1;
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px 20px 8px;
}
.header-left { display: flex; align-items: center; gap: 8px; }
.header-icon { font-size: 20px; }
.header-title { font-size: 14px; font-weight: 700; letter-spacing: 2px; color: #a0a0b8; }

.status-badge {
  font-size: 11px; font-weight: 600;
  padding: 4px 12px; border-radius: 20px;
  letter-spacing: 0.5px; transition: all 0.3s ease;
}
.status-badge.idle    { background: rgba(255,255,255,0.06); color: #888; }
.status-badge.running { background: rgba(52,211,153,0.15); color: #34d399; animation: pulse-glow 2s ease-in-out infinite; }
.status-badge.stopped { background: rgba(251,113,133,0.12); color: #fb7185; }

/* ── Rep Ring ── */
.rep-hero { position: relative; z-index: 1; display: flex; justify-content: center; padding: 24px 0 16px; }
.rep-ring { position: relative; width: 200px; height: 200px; }
.ring-svg { position: absolute; inset: 0; width: 100%; height: 100%; transform: rotate(-90deg); }
.ring-track { fill: none; stroke: rgba(255,255,255,0.05); stroke-width: 6; }
.ring-progress {
  fill: none; stroke: #818cf8; stroke-width: 6; stroke-linecap: round;
  stroke-dasharray: 565.48;
  transition: stroke-dashoffset 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.ring-pulse .ring-progress { filter: drop-shadow(0 0 8px rgba(129,140,248,0.5)); }

.rep-inner { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.rep-count { font-size: 72px; font-weight: 800; line-height: 1; color: #fff; transition: transform 0.15s ease; font-variant-numeric: tabular-nums; }
.rep-count.rep-bump { transform: scale(1.15); }
.rep-label { font-size: 12px; font-weight: 600; letter-spacing: 3px; color: #6366f1; margin-top: 4px; }

/* ── Feedback ── */
.feedback-area { position: relative; z-index: 1; display: flex; justify-content: center; padding: 0 20px 20px; min-height: 48px; }
.feedback-msg {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 20px; border-radius: 12px;
  font-size: 14px; font-weight: 600; animation: fade-in 0.25s ease;
}
.feedback-msg.good    { background: rgba(52,211,153,0.1); color: #34d399; border: 1px solid rgba(52,211,153,0.2); }
.feedback-msg.bad     { background: rgba(251,113,133,0.1); color: #fb7185; border: 1px solid rgba(251,113,133,0.2); }
.feedback-msg.neutral { background: rgba(255,255,255,0.04); color: #666; border: 1px solid rgba(255,255,255,0.06); }
.feedback-icon { font-size: 16px; font-weight: 800; }

/* ── Stats ── */
.stats-grid { position: relative; z-index: 1; display: grid; grid-template-columns: repeat(2,1fr); gap: 10px; padding: 0 20px 24px; }
.stat-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 14px 8px; text-align: center; }
.stat-value { font-size: 24px; font-weight: 800; line-height: 1.2; font-variant-numeric: tabular-nums; }
.stat-value.accent { color: #818cf8; }
.stat-value.good   { color: #34d399; }
.stat-value.bad    { color: #fb7185; }
.stat-value.dim    { color: #a0a0b8; }
.stat-label { font-size: 10px; font-weight: 600; color: #555; letter-spacing: 0.5px; margin-top: 4px; }

/* ── Controls ── */
.controls { position: relative; z-index: 1; display: flex; gap: 12px; padding: 0 20px 20px; }
.btn-start, .btn-stop {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 16px; border: none; border-radius: 14px;
  font-size: 15px; font-weight: 700; letter-spacing: 1.5px;
  cursor: pointer; transition: all 0.2s ease;
}
.btn-start { background: linear-gradient(135deg, #6366f1, #818cf8); color: #fff; box-shadow: 0 4px 20px rgba(99,102,241,0.3); }
.btn-start:active:not(.disabled) { transform: scale(0.97); }
.btn-stop { background: rgba(255,255,255,0.06); color: #a0a0b8; border: 1px solid rgba(255,255,255,0.08); }
.btn-stop:active:not(.disabled) { transform: scale(0.97); background: rgba(251,113,133,0.12); color: #fb7185; }
.btn-start.disabled, .btn-stop.disabled { opacity: 0.35; pointer-events: none; }
.btn-icon { font-size: 12px; }
/* ── Accel Sensor Card ── */
.accel-card {
  position: relative; z-index: 1;
  margin: 0 20px 20px;
  padding: 16px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 14px;
  animation: fade-in 0.3s ease;
}

.accel-header {
  display: flex; align-items: center; gap: 6px;
  font-size: 10px; font-weight: 700;
  letter-spacing: 2px; color: #555;
  margin-bottom: 14px;
}

.accel-icon { font-size: 14px; }

.accel-bars { display: flex; flex-direction: column; gap: 10px; }

.accel-row {
  display: flex; align-items: center; gap: 10px;
}

.accel-axis {
  width: 22px; height: 22px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 6px;
  font-size: 11px; font-weight: 800;
}

.accel-axis.x { background: rgba(251,113,133,0.15); color: #fb7185; }
.accel-axis.y { background: rgba(52,211,153,0.15); color: #34d399; }
.accel-axis.z { background: rgba(99,102,241,0.15); color: #818cf8; }

.accel-bar-track {
  flex: 1; height: 8px;
  background: rgba(255,255,255,0.04);
  border-radius: 4px;
  overflow: hidden;
}

.accel-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.1s ease;
}

.accel-bar-fill.x { background: linear-gradient(90deg, #fb7185, #f43f5e); }
.accel-bar-fill.y { background: linear-gradient(90deg, #34d399, #10b981); }
.accel-bar-fill.z { background: linear-gradient(90deg, #818cf8, #6366f1); }

.accel-val {
  width: 52px;
  font-size: 12px; font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: #a0a0b8;
  text-align: right;
  font-family: monospace;
}
/* ── Footer ── */
.footer-info { position: relative; z-index: 1; text-align: center; padding: 12px 20px 24px; font-size: 11px; color: #333; }

/* ── Animations ── */
@keyframes pulse-glow { 0%,100% { opacity: 1; } 50% { opacity: 0.7; } }
@keyframes fade-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
</style>