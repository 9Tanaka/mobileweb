<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/list"></ion-back-button>
        </ion-buttons>
        <ion-title>เพิ่มรายการรายรับ–รายจ่าย</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content class="ion-padding">
      <form @submit.prevent="saveExpense">
        <!-- ชื่อรายการ -->
        <ion-item>
          <ion-input
            label="ชื่อรายการ"
            label-placement="floating"
            v-model="title"
            placeholder="ระบุชื่อรายการ"
            required
          ></ion-input>
        </ion-item>

        <!-- จำนวนเงิน -->
        <ion-item>
          <ion-input
            label="จำนวนเงิน"
            label-placement="floating"
            type="number"
            v-model="amount"
            placeholder="0.00"
            required
            min="0"
            step="0.01"
          ></ion-input>
        </ion-item>

        <!-- ประเภท -->
        <ion-item>
          <ion-select
            label="ประเภท"
            label-placement="floating"
            v-model="type"
            interface="action-sheet"
          >
            <ion-select-option value="income">รายรับ</ion-select-option>
            <ion-select-option value="expense">รายจ่าย</ion-select-option>
          </ion-select>
        </ion-item>

        <!-- หมวดหมู่ -->
        <ion-item>
          <ion-select
            label="หมวดหมู่"
            label-placement="floating"
            v-model="category"
            interface="action-sheet"
          >
            <!-- หมวดหมู่รายจ่าย -->
            <ion-select-option 
              v-if="type === 'expense'" 
              value="food"
            >อาหาร</ion-select-option>
            <ion-select-option 
              v-if="type === 'expense'" 
              value="transport"
            >การเดินทาง</ion-select-option>
            <ion-select-option 
              v-if="type === 'expense'" 
              value="shopping"
            >ช้อปปิ้ง</ion-select-option>
            <ion-select-option 
              v-if="type === 'expense'" 
              value="bills"
            >ค่าใช้จ่ายประจำ</ion-select-option>
            <ion-select-option 
              v-if="type === 'expense'" 
              value="entertainment"
            >ความบันเทิง</ion-select-option>
            <ion-select-option 
              v-if="type === 'expense'" 
              value="health"
            >สุขภาพ</ion-select-option>
            <ion-select-option 
              v-if="type === 'expense'" 
              value="other"
            >อื่นๆ</ion-select-option>

            <!-- หมวดหมู่รายรับ -->
            <ion-select-option 
              v-if="type === 'income'" 
              value="salary"
            >เงินเดือน</ion-select-option>
            <ion-select-option 
              v-if="type === 'income'" 
              value="bonus"
            >โบนัส</ion-select-option>
            <ion-select-option 
              v-if="type === 'income'" 
              value="investment"
            >การลงทุน</ion-select-option>
            <ion-select-option 
              v-if="type === 'income'" 
              value="freelance"
            >งานอิสระ</ion-select-option>
            <ion-select-option 
              v-if="type === 'income'" 
              value="other"
            >อื่นๆ</ion-select-option>
          </ion-select>
        </ion-item>

        <!-- หมายเหตุ -->
        <ion-item>
          <ion-textarea
            label="หมายเหตุ"
            label-placement="floating"
            v-model="note"
            placeholder="เพิ่มรายละเอียด (ถ้ามี)"
            :auto-grow="true"
            :rows="3"
          ></ion-textarea>
        </ion-item>

        <!-- ปุ่มบันทึก -->
        <ion-button
          expand="block"
          type="submit"
          class="ion-margin-top"
          :disabled="loading"
        >
          <ion-spinner v-if="loading" name="crescent"></ion-spinner>
          <span v-else>บันทึกข้อมูล</span>
        </ion-button>
      </form>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonButton,
  IonItem,
  IonButtons,
  IonBackButton,
  IonSpinner,
  toastController,
} from "@ionic/vue";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { useRouter } from "vue-router";

const router = useRouter();

// Form data
const title = ref("");
const amount = ref<number | null>(null);
const type = ref("expense");
const category = ref("");
const note = ref("");
const loading = ref(false);

// Reset category when type changes
watch(type, () => {
  category.value = "";
});

// Save expense function
const saveExpense = async () => {
  // Validation
  if (!title.value.trim()) {
    showToast("กรุณาระบุชื่อรายการ", "warning");
    return;
  }

  if (!amount.value || amount.value <= 0) {
    showToast("กรุณาระบุจำนวนเงินที่ถูกต้อง", "warning");
    return;
  }

  if (!category.value) {
    showToast("กรุณาเลือกหมวดหมู่", "warning");
    return;
  }

  try {
    loading.value = true;

    await addDoc(collection(db, "expenses"), {
      title: title.value.trim(),
      amount: Number(amount.value),
      type: type.value,
      category: category.value,
      note: note.value.trim(),
      createdAt: new Date(),
    });

    showToast("บันทึกข้อมูลเรียบร้อยแล้ว", "success");
    router.push("/tabs/list");
  } catch (error) {
    console.error("Error saving expense:", error);
    showToast("เกิดข้อผิดพลาดในการบันทึกข้อมูล", "danger");
  } finally {
    loading.value = false;
  }
};

// Toast notification helper
const showToast = async (message: string, color: string = "primary") => {
  const toast = await toastController.create({
    message,
    duration: 2000,
    color,
    position: "top",
  });
  await toast.present();
};
</script>

<style scoped>
ion-item {
  --padding-start: 0;
  --inner-padding-end: 0;
  margin-bottom: 16px;
}

ion-button {
  --border-radius: 8px;
  margin-top: 24px;
}
</style>