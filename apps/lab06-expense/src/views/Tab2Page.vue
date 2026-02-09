<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>รายการรายรับ–รายจ่าย</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- ฟอร์มเพิ่มข้อมูล -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>เพิ่มรายการใหม่</ion-card-title>
        </ion-card-header>
        <ion-card-content>
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
                <ion-select-option v-if="type === 'expense'" value="food"
                  >อาหาร</ion-select-option>
                <ion-select-option v-if="type === 'expense'" value="transport"
                  >การเดินทาง</ion-select-option>
                <ion-select-option v-if="type === 'expense'" value="shopping"
                  >ช้อปปิ้ง</ion-select-option>
                <ion-select-option v-if="type === 'expense'" value="bills"
                  >ค่าใช้จ่ายประจำ</ion-select-option>
                <ion-select-option v-if="type === 'expense'" value="entertainment"
                  >ความบันเทิง</ion-select-option>
                <ion-select-option v-if="type === 'expense'" value="health"
                  >สุขภาพ</ion-select-option>
                <ion-select-option v-if="type === 'expense'" value="other"
                  >อื่นๆ</ion-select-option>

                <!-- หมวดหมู่รายรับ -->
                <ion-select-option v-if="type === 'income'" value="salary"
                  >เงินเดือน</ion-select-option>
                <ion-select-option v-if="type === 'income'" value="bonus"
                  >โบนัส</ion-select-option>
                <ion-select-option v-if="type === 'income'" value="investment"
                  >การลงทุน</ion-select-option>
                <ion-select-option v-if="type === 'income'" value="freelance"
                  >งานอิสระ</ion-select-option>
                <ion-select-option v-if="type === 'income'" value="other"
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
              :disabled="saving"
            >
              <ion-spinner v-if="saving" name="crescent"></ion-spinner>
              <span v-else>บันทึกข้อมูล</span>
            </ion-button>
          </form>
        </ion-card-content>
      </ion-card>

      <!-- สรุปยอด -->
      <ion-card>
        <ion-card-content>
          <div class="summary-container">
            <div class="summary-item income">
              <div class="summary-label">รายรับ</div>
              <div class="summary-amount">
                +{{ totalIncome.toLocaleString("th-TH", { minimumFractionDigits: 2 }) }} ฿
              </div>
            </div>
            <div class="summary-item expense">
              <div class="summary-label">รายจ่าย</div>
              <div class="summary-amount">
                -{{ totalExpense.toLocaleString("th-TH", { minimumFractionDigits: 2 }) }} ฿
              </div>
            </div>
            <div class="summary-item balance">
              <div class="summary-label">คงเหลือ</div>
              <div class="summary-amount" :class="{ negative: balance < 0 }">
                {{ balance.toLocaleString("th-TH", { minimumFractionDigits: 2 }) }} ฿
              </div>
            </div>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- รายการรายรับรายจ่าย (Real-time) -->
      <div class="section-header">
        <h2>รายการทั้งหมด</h2>
        <ion-badge color="primary">{{ expenses.length }}</ion-badge>
      </div>

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
                {{ expense.amount.toLocaleString("th-TH", { minimumFractionDigits: 2 }) }} ฿
              </div>
            </div>
          </ion-item>

          <ion-item-options side="end">
            <ion-item-option color="primary" @click="editExpense(expense)">
              <ion-icon slot="icon-only" :icon="createOutline"></ion-icon>
            </ion-item-option>
            <ion-item-option color="danger" @click="confirmDelete(expense)">
              <ion-icon slot="icon-only" :icon="trashOutline"></ion-icon>
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
      </ion-list>

      <!-- ไม่มีข้อมูล -->
      <div v-else class="empty-state">
        <ion-icon :icon="walletOutline" size="large"></ion-icon>
        <h3>ยังไม่มีรายการ</h3>
        <p>เริ่มบันทึกรายรับรายจ่ายของคุณจากฟอร์มด้านบน</p>
      </div>
    </ion-content>

    <!-- Edit Modal -->
    <ion-modal :is-open="isEditModalOpen" @didDismiss="closeEditModal">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button @click="closeEditModal">ยกเลิก</ion-button>
          </ion-buttons>
          <ion-title>แก้ไขรายการ</ion-title>
          <ion-buttons slot="end">
            <ion-button color="danger" @click="confirmDeleteFromEdit">
              <ion-icon slot="icon-only" :icon="trashOutline"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <form @submit.prevent="updateExpense">
          <ion-item>
            <ion-input
              label="ชื่อรายการ"
              label-placement="floating"
              v-model="editForm.title"
              required
            ></ion-input>
          </ion-item>

          <ion-item>
            <ion-input
              label="จำนวนเงิน"
              label-placement="floating"
              type="number"
              v-model="editForm.amount"
              required
              min="0"
              step="0.01"
            ></ion-input>
          </ion-item>

          <ion-item>
            <ion-select
              label="ประเภท"
              label-placement="floating"
              v-model="editForm.type"
              interface="action-sheet"
            >
              <ion-select-option value="income">รายรับ</ion-select-option>
              <ion-select-option value="expense">รายจ่าย</ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item>
            <ion-select
              label="หมวดหมู่"
              label-placement="floating"
              v-model="editForm.category"
              interface="action-sheet"
            >
              <ion-select-option v-if="editForm.type === 'expense'" value="food"
                >อาหาร</ion-select-option>
              <ion-select-option v-if="editForm.type === 'expense'" value="transport"
                >การเดินทาง</ion-select-option>
              <ion-select-option v-if="editForm.type === 'expense'" value="shopping"
                >ช้อปปิ้ง</ion-select-option>
              <ion-select-option v-if="editForm.type === 'expense'" value="bills"
                >ค่าใช้จ่ายประจำ</ion-select-option>
              <ion-select-option v-if="editForm.type === 'expense'" value="entertainment"
                >ความบันเทิง</ion-select-option>
              <ion-select-option v-if="editForm.type === 'expense'" value="health"
                >สุขภาพ</ion-select-option>
              <ion-select-option v-if="editForm.type === 'expense'" value="other"
                >อื่นๆ</ion-select-option>

              <ion-select-option v-if="editForm.type === 'income'" value="salary"
                >เงินเดือน</ion-select-option>
              <ion-select-option v-if="editForm.type === 'income'" value="bonus"
                >โบนัส</ion-select-option>
              <ion-select-option v-if="editForm.type === 'income'" value="investment"
                >การลงทุน</ion-select-option>
              <ion-select-option v-if="editForm.type === 'income'" value="freelance"
                >งานอิสระ</ion-select-option>
              <ion-select-option v-if="editForm.type === 'income'" value="other"
                >อื่นๆ</ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item>
            <ion-textarea
              label="หมายเหตุ"
              label-placement="floating"
              v-model="editForm.note"
              :auto-grow="true"
              :rows="3"
            ></ion-textarea>
          </ion-item>

          <!-- ปุ่มบันทึก -->
          <ion-button
            expand="block"
            type="submit"
            class="ion-margin-top"
            :disabled="updating"
          >
            <ion-spinner v-if="updating" name="crescent"></ion-spinner>
            <span v-else>บันทึกการแก้ไข</span>
          </ion-button>

          <!-- ปุ่มลบ -->
          <ion-button
            expand="block"
            color="danger"
            fill="outline"
            class="ion-margin-top"
            @click.prevent="confirmDeleteFromEdit"
            :disabled="updating"
          >
            <ion-icon slot="start" :icon="trashOutline"></ion-icon>
            ลบรายการนี้
          </ion-button>
        </form>
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
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
  IonSpinner,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonIcon,
  IonBadge,
  IonModal,
  IonButtons,
  toastController,
  alertController,
} from "@ionic/vue";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/firebase";
import {
  walletOutline,
  trashOutline,
  createOutline,
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

// Form data (เพิ่มข้อมูลใหม่)
const title = ref("");
const amount = ref<number | null>(null);
const type = ref("expense");
const category = ref("");
const note = ref("");
const saving = ref(false);

// Edit form
const isEditModalOpen = ref(false);
const editForm = ref({
  id: "",
  title: "",
  amount: 0,
  type: "expense" as "income" | "expense",
  category: "",
  note: "",
});
const updating = ref(false);

// List data
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

// Watch type changes
watch(type, () => {
  category.value = "";
});

watch(() => editForm.value.type, () => {
  editForm.value.category = "";
});

// Methods
const saveExpense = async () => {
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

    await addDoc(collection(db, "expenses"), {
      title: title.value.trim(),
      amount: Number(amount.value),
      type: type.value,
      category: category.value,
      note: note.value.trim(),
      createdAt: new Date(),
    });

    showToast("บันทึกข้อมูลเรียบร้อยแล้ว", "success");

    // Reset form
    title.value = "";
    amount.value = null;
    type.value = "expense";
    category.value = "";
    note.value = "";
  } catch (error) {
    console.error("Error saving expense:", error);
    showToast("เกิดข้อผิดพลาดในการบันทึกข้อมูล", "danger");
  } finally {
    saving.value = false;
  }
};

const editExpense = (expense: Expense) => {
  editForm.value = {
    id: expense.id,
    title: expense.title,
    amount: expense.amount,
    type: expense.type,
    category: expense.category,
    note: expense.note || "",
  };
  isEditModalOpen.value = true;
};

const closeEditModal = () => {
  isEditModalOpen.value = false;
};

const updateExpense = async () => {
  if (!editForm.value.title.trim()) {
    showToast("กรุณาระบุชื่อรายการ", "warning");
    return;
  }

  if (!editForm.value.amount || editForm.value.amount <= 0) {
    showToast("กรุณาระบุจำนวนเงินที่ถูกต้อง", "warning");
    return;
  }

  if (!editForm.value.category) {
    showToast("กรุณาเลือกหมวดหมู่", "warning");
    return;
  }

  try {
    updating.value = true;

    const docRef = doc(db, "expenses", editForm.value.id);
    await updateDoc(docRef, {
      title: editForm.value.title.trim(),
      amount: Number(editForm.value.amount),
      type: editForm.value.type,
      category: editForm.value.category,
      note: editForm.value.note.trim(),
      updatedAt: new Date(),
    });

    showToast("อัปเดตข้อมูลเรียบร้อยแล้ว", "success");
    closeEditModal();
  } catch (error) {
    console.error("Error updating expense:", error);
    showToast("เกิดข้อผิดพลาดในการอัปเดตข้อมูล", "danger");
  } finally {
    updating.value = false;
  }
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

const confirmDeleteFromEdit = async () => {
  const alert = await alertController.create({
    header: "ยืนยันการลบ",
    message: `คุณต้องการลบรายการ "${editForm.value.title}" ใช่หรือไม่?`,
    subHeader: "การดำเนินการนี้ไม่สามารถย้อนกลับได้",
    buttons: [
      {
        text: "ยกเลิก",
        role: "cancel",
      },
      {
        text: "ลบ",
        role: "destructive",
        handler: async () => {
          await deleteExpenseFromEdit();
        },
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

const deleteExpenseFromEdit = async () => {
  try {
    updating.value = true;

    // ลบข้อมูลจาก Firestore
    await deleteDoc(doc(db, "expenses", editForm.value.id));

    showToast("ลบรายการเรียบร้อยแล้ว", "success");
    
    // ปิด Modal
    closeEditModal();
  } catch (error) {
    console.error("Error deleting expense:", error);
    showToast("เกิดข้อผิดพลาดในการลบข้อมูล", "danger");
  } finally {
    updating.value = false;
  }
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
ion-item {
  --padding-start: 0;
  --inner-padding-end: 0;
  margin-bottom: 16px;
}

ion-button {
  --border-radius: 8px;
}

/* Summary */
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

/* Section Header */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 24px 0 16px 0;
}

.section-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
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
  padding: 40px 20px;
  text-align: center;
}

.empty-state ion-icon {
  color: var(--ion-color-medium);
  margin-bottom: 16px;
}

.empty-state h3 {
  color: var(--ion-color-dark);
  margin: 0 0 8px 0;
}

.empty-state p {
  color: var(--ion-color-medium);
  margin: 0;
}
</style>