<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>รายการรายรับ–รายจ่าย</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="goToAdd">
            <ion-icon :icon="addOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- สรุปยอด -->
      <ion-card>
        <ion-card-content>
          <div class="summary-container">
            <div class="summary-item income">
              <div class="summary-label">รายรับ</div>
              <div class="summary-amount">
                +{{ totalIncome.toLocaleString('th-TH', { minimumFractionDigits: 2 }) }} ฿
              </div>
            </div>
            <div class="summary-item expense">
              <div class="summary-label">รายจ่าย</div>
              <div class="summary-amount">
                -{{ totalExpense.toLocaleString('th-TH', { minimumFractionDigits: 2 }) }} ฿
              </div>
            </div>
            <div class="summary-item balance">
              <div class="summary-label">คงเหลือ</div>
              <div class="summary-amount" :class="{ negative: balance < 0 }">
                {{ balance.toLocaleString('th-TH', { minimumFractionDigits: 2 }) }} ฿
              </div>
            </div>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- Loading -->
      <div v-if="loading" class="loading-container">
        <ion-spinner name="crescent"></ion-spinner>
        <p>กำลังโหลดข้อมูล...</p>
      </div>

      <!-- รายการ -->
      <ion-list v-else-if="expenses.length > 0">
        <ion-item-sliding v-for="expense in expenses" :key="expense.id">
          <ion-item button @click="editExpense(expense)">
            <div class="expense-item">
              <div class="expense-icon" :class="expense.type">
                <ion-icon :icon="getCategoryIcon(expense.category)"></ion-icon>
              </div>
              <div class="expense-details">
                <div class="expense-title">{{ expense.title }}</div>
                <div class="expense-meta">
                  <span class="expense-category">{{ getCategoryName(expense.category) }}</span>
                  <span class="expense-date">{{ formatDate(expense.createdAt) }}</span>
                </div>
                <div v-if="expense.note" class="expense-note">{{ expense.note }}</div>
              </div>
              <div class="expense-amount" :class="expense.type">
                <span v-if="expense.type === 'income'">+</span>
                <span v-else>-</span>
                {{ expense.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 }) }} ฿
              </div>
            </div>
          </ion-item>

          <ion-item-options side="end">
            <ion-item-option color="danger" @click="confirmDelete(expense)">
              <ion-icon slot="icon-only" :icon="trashOutline"></ion-icon>
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
      </ion-list>

      <!-- ไม่มีข้อมูล -->
      <div v-else class="empty-state">
        <ion-icon :icon="walletOutline" size="large"></ion-icon>
        <h2>ยังไม่มีรายการ</h2>
        <p>เริ่มบันทึกรายรับรายจ่ายของคุณ</p>
        <ion-button @click="goToAdd">
          <ion-icon slot="start" :icon="addOutline"></ion-icon>
          เพิ่มรายการ
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonCard,
  IonCardContent,
  IonButton,
  IonButtons,
  IonIcon,
  IonSpinner,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  alertController,
  toastController,
} from "@ionic/vue";
import {
  addOutline,
  walletOutline,
  trashOutline,
  cartOutline,
  busOutline,
  fastFoodOutline,
  homeOutline,
  medkitOutline,
  gameControllerOutline,
  cashOutline,
  trophyOutline,
  briefcaseOutline,
  ellipsisHorizontalOutline,
} from "ionicons/icons";
import { useRouter } from "vue-router";
import { collection, onSnapshot, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "@/firebase";

const router = useRouter();

// Types
interface Expense {
  id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  note: string;
  createdAt: any;
}

// State
const expenses = ref<Expense[]>([]);
const loading = ref(true);
let unsubscribe: (() => void) | null = null;

// Computed
const totalIncome = computed(() => {
  return expenses.value
    .filter((e) => e.type === "income")
    .reduce((sum, e) => sum + e.amount, 0);
});

const totalExpense = computed(() => {
  return expenses.value
    .filter((e) => e.type === "expense")
    .reduce((sum, e) => sum + e.amount, 0);
});

const balance = computed(() => {
  return totalIncome.value - totalExpense.value;
});

// Methods
const goToAdd = () => {
  router.push("/tabs/add");
};

const editExpense = (expense: Expense) => {
  router.push(`/tabs/edit/${expense.id}`);
};

const formatDate = (timestamp: any) => {
  if (!timestamp) return "";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const getCategoryName = (category: string): string => {
  const categories: Record<string, string> = {
    food: "อาหาร",
    transport: "การเดินทาง",
    shopping: "ช้อปปิ้ง",
    bills: "ค่าใช้จ่ายประจำ",
    entertainment: "ความบันเทิง",
    health: "สุขภาพ",
    salary: "เงินเดือน",
    bonus: "โบนัส",
    investment: "การลงทุน",
    freelance: "งานอิสระ",
    other: "อื่นๆ",
  };
  return categories[category] || category;
};

const getCategoryIcon = (category: string) => {
  const icons: Record<string, any> = {
    food: fastFoodOutline,
    transport: busOutline,
    shopping: cartOutline,
    bills: homeOutline,
    entertainment: gameControllerOutline,
    health: medkitOutline,
    salary: cashOutline,
    bonus: trophyOutline,
    investment: briefcaseOutline,
    freelance: briefcaseOutline,
    other: ellipsisHorizontalOutline,
  };
  return icons[category] || ellipsisHorizontalOutline;
};

const confirmDelete = async (expense: Expense) => {
  const alert = await alertController.create({
    header: "ยืนยันการลบ",
    message: `คุณต้องการลบรายการ "${expense.title}" ใช่หรือไม่?`,
    buttons: [
      {
        text: "ยกเลิก",
        role: "cancel",
      },
      {
        text: "ลบ",
        role: "destructive",
        handler: () => deleteExpense(expense.id),
      },
    ],
  });

  await alert.present();
};

const deleteExpense = async (id: string) => {
  try {
    await deleteDoc(doc(db, "expenses", id));
    showToast("ลบรายการเรียบร้อยแล้ว", "success");
  } catch (error) {
    console.error("Error deleting expense:", error);
    showToast("เกิดข้อผิดพลาดในการลบข้อมูล", "danger");
  }
};

const showToast = async (message: string, color: string = "primary") => {
  const toast = await toastController.create({
    message,
    duration: 2000,
    color,
    position: "top",
  });
  await toast.present();
};

// Lifecycle
onMounted(() => {
  // Subscribe to real-time updates
  const q = query(collection(db, "expenses"), orderBy("createdAt", "desc"));
  
  unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      expenses.value = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Expense[];
      loading.value = false;
    },
    (error) => {
      console.error("Error fetching expenses:", error);
      showToast("เกิดข้อผิดพลาดในการโหลดข้อมูล", "danger");
      loading.value = false;
    }
  );
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});
</script>

<style scoped>
/* Summary Card */
.summary-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.summary-item {
  text-align: center;
}

.summary-label {
  font-size: 12px;
  color: var(--ion-color-medium);
  margin-bottom: 4px;
}

.summary-amount {
  font-size: 18px;
  font-weight: bold;
}

.summary-item.income .summary-amount {
  color: var(--ion-color-success);
}

.summary-item.expense .summary-amount {
  color: var(--ion-color-danger);
}

.summary-item.balance .summary-amount {
  color: var(--ion-color-primary);
}

.summary-item.balance .summary-amount.negative {
  color: var(--ion-color-danger);
}

/* Expense Item */
.expense-item {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 12px;
  padding: 8px 0;
}

.expense-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.expense-icon.income {
  background-color: rgba(16, 220, 96, 0.1);
  color: var(--ion-color-success);
}

.expense-icon.expense {
  background-color: rgba(235, 68, 90, 0.1);
  color: var(--ion-color-danger);
}

.expense-details {
  flex: 1;
  min-width: 0;
}

.expense-title {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 4px;
}

.expense-meta {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: var(--ion-color-medium);
}

.expense-note {
  font-size: 12px;
  color: var(--ion-color-medium);
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.expense-amount {
  font-weight: bold;
  font-size: 16px;
  white-space: nowrap;
}

.expense-amount.income {
  color: var(--ion-color-success);
}

.expense-amount.expense {
  color: var(--ion-color-danger);
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  gap: 16px;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-state ion-icon {
  color: var(--ion-color-medium);
  margin-bottom: 16px;
}

.empty-state h2 {
  color: var(--ion-color-dark);
  margin: 0 0 8px 0;
}

.empty-state p {
  color: var(--ion-color-medium);
  margin: 0 0 24px 0;
}
</style>