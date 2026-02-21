<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Lab08: Gemini Vision โดย ธนกฤต จิตจักร์</ion-title>
      </ion-toolbar>
    </ion-header>


    <ion-content class="ion-padding">
      <input ref="fileEl" type="file" accept="image/*" hidden @change="onFileChange" />


      <ion-button expand="block" @click="fileEl?.click()">เลือกไฟล์ภาพ</ion-button>
      <ion-button expand="block" @click="onTakePhoto">ถ่ายภาพ (Camera)</ion-button>


      <ion-img v-if="previewUrl" :src="previewUrl" />


      <ion-button expand="block" :disabled="!img || loading" @click="onAnalyze">
        วิเคราะห์ภาพ
      </ion-button>


      <ion-spinner v-if="loading" class="ion-margin" />

      <ion-card v-if="result" class="ion-margin-top">
        <ion-card-header>
          <ion-card-subtitle>คำบรรยาย</ion-card-subtitle>
          <ion-card-title>{{ result.caption }}</ion-card-title>
        </ion-card-header>

        <ion-card-content>
          <!-- Tags -->
          <div class="ion-margin-bottom">
            <strong>แท็ก</strong><br />
            <ion-chip v-for="tag in result.tags" :key="tag" color="primary">
              {{ tag }}
            </ion-chip>
          </div>

          <!-- Objects -->
          <div v-if="result.objects?.length" class="ion-margin-bottom">
            <strong>วัตถุที่พบ</strong>
            <ion-list lines="none" class="ion-no-padding">
              <ion-item v-for="obj in result.objects" :key="obj.name">
                <ion-label>
                  {{ obj.name }}
                  <span v-if="obj.confidence != null" class="confidence">
                    ({{ Math.round(obj.confidence * 100) }}%)
                  </span>
                </ion-label>
              </ion-item>
            </ion-list>
          </div>

          <!-- Safety -->
          <div v-if="result.safety">
            <ion-chip :color="result.safety.isSensitive ? 'danger' : 'success'">
              {{ result.safety.isSensitive ? "ภาพอ่อนไหว" : "ภาพปลอดภัย" }}
            </ion-chip>
            <p v-if="result.safety.notes" class="ion-no-margin ion-margin-top">
              {{ result.safety.notes }}
            </p>
          </div>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>


<script setup lang="ts">
import { ref } from "vue";
import {
  IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle,
  IonChip, IonContent, IonHeader, IonImg, IonItem, IonLabel, IonList,
  IonPage, IonSpinner, IonTitle, IonToolbar
} from "@ionic/vue";
import { PhotoService } from "../core/photo.service";
import { GeminiVisionService } from "../core/gemini.service";
import type { Base64Image } from "../core/ai.interface"; ;
import type { ImageAnalysisResult } from "../core/ai.interface";


const fileEl = ref<HTMLInputElement | null>(null);
const img = ref<Base64Image | null>(null);
const previewUrl = ref("");
const result = ref<ImageAnalysisResult | null>(null);
const loading = ref(false);


async function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  img.value = await PhotoService.fromFile(file);
  previewUrl.value = URL.createObjectURL(file);
  result.value = null;
}


async function onTakePhoto() {
  loading.value = true;
  try {
    const b64 = await PhotoService.fromCamera();
    img.value = b64;
    previewUrl.value = `data:${b64.mimeType};base64,${b64.base64}`;
    result.value = null;
  } finally {
    loading.value = false;
  }
}


async function onAnalyze() {
  if (!img.value) return;
  loading.value = true;
  try {
    result.value = await GeminiVisionService.analyze(img.value);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.confidence {
  font-size: 0.85em;
  color: var(--ion-color-medium);
}
</style>
