<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/list"></ion-back-button>
        </ion-buttons>
        <ion-title>แก้ไขรายการ</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div v-if="loading" class="loading-container">
        <ion-spinner name="crescent"></ion-spinner>
        <p>กำลังโหลดข้อมูล...</p>
      </div>

      <form v-else @submit.prevent="updateExpense">
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
            <ion-select-option v-if="type === 'expense'" value="food"
              >อาหาร</ion-select-option
            >
            <ion-select-option v-if="type === 'expense'" value="transport"
              >การเดินทาง</ion-select-option
            >
            <ion-select-option v-if="type === 'expense'" value="shopping"
              >ช้อปปิ้ง</ion-select-option
            >
            <ion-select-option v-if="type === 'expense'" value="bills"
              >ค่าใช้จ่ายประจำ</ion-select-option
            >
            <ion-select-option v-if="type === 'expense'" value="entertainment"
              >ความบันเทิง</ion-select-option
            >
            <ion-select-option v-if="type === 'expense'" value="health"
              >สุขภาพ</ion-select-option
            >
            <ion-select-option v-if="type === 'expense'" value="other"
              >อื่นๆ</ion-select-option
            >

            <!-- หมวดหมู่รายรับ -->
            <ion-select-option v-if="type === 'income'" value="salary"
              >เงินเดือน</ion-select-option
            >
            <ion-select-option v-if="type === 'income'" value="bonus"
              >โบนัส</ion-select-option
            >
            <ion-select-option v-if="type === 'income'" value="investment"
              >การลงทุน</ion-select-option
            >
            <ion-select-option v-if="type === 'income'" value="freelance"
              >งานอิสระ</ion-select-option
            >
            <ion-select-option v-if="type === 'income'" value="other"
              >อื่นๆ</ion-select-option
            >
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
          :disabled="saving"
        >
          <ion-spinner v-if="saving" name="crescent"></ion-spinner>
          <span v-else>บันทึกการแก้ไข</span>
        </ion-button>
      </form>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
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
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

// Form data
const title = ref("");
const amount = ref<number | null>(null);
const type = ref("expense");
const category = ref("");
const note = ref("");
const loading = ref(true);
const saving = ref(false);

// Get expense ID from route
const expenseId = route.params.id as string;

// Watch type changes to reset category
watch(type, () => {
  category.value = "";
});

// Load expense data
onMounted(async () => {
  try {
    const docRef = doc(db, "expenses", expenseId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      title.value = data.title;
      amount.value = data.amount;
      type.value = data.type;
      category.value = data.category;
      note.value = data.note || "";
    } else {
      showToast("ไม่พบข้อมูล", "danger");
      router.push("/tabs/list");
    }
  } catch (error) {
    console.error("Error loading expense:", error);
    showToast("เกิดข้อผิดพลาดในการโหลดข้อมูล", "danger");
  } finally {
    loading.value = false;
  }
});

// Update expense
const updateExpense = async () => {
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
    saving.value = true;

    const docRef = doc(db, "expenses", expenseId);
    await updateDoc(docRef, {
      title: title.value.trim(),
      amount: Number(amount.value),
      type: type.value,
      category: category.value,
      note: note.value.trim(),
      updatedAt: new Date(),
    });

    showToast("อัปเดตข้อมูลเรียบร้อยแล้ว", "success");
    router.push("/tabs/list");
  } catch (error) {
    console.error("Error updating expense:", error);
    showToast("เกิดข้อผิดพลาดในการอัปเดตข้อมูล", "danger");
  } finally {
    saving.value = false;
  }
};

// Toast helper
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

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  gap: 16px;
}
</style>