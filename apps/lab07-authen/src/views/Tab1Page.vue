<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Tab 1 - Profile</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Profile</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="ion-padding">
        <!-- Loading State -->
        <div v-if="loading" class="ion-text-center ion-padding">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Loading user data...</p>
        </div>

        <!-- User Info -->
        <div v-else-if="user">
          <!-- Profile Photo -->
          <div class="profile-photo-container">
            <img
              v-if="user.photoUrl"
              :src="user.photoUrl"
              alt="Profile Photo"
              class="profile-photo"
            />
            <div v-else class="profile-photo-placeholder">
              {{ getUserInitial() }}
            </div>
          </div>

          <!-- User Details Card -->
          <ion-card>
            <ion-card-header>
              <ion-card-title>User Information</ion-card-title>
            </ion-card-header>

            <ion-card-content>
              <ion-list>
                <!-- UID -->
                <ion-item>
                  <ion-label>
                    <h3>User ID</h3>
                    <p>{{ user.uid }}</p>
                  </ion-label>
                </ion-item>

                <!-- Email -->
                <ion-item v-if="user.email">
                  <ion-label>
                    <h3>Email</h3>
                    <p>{{ user.email }}</p>
                  </ion-label>
                  <ion-icon :icon="mailOutline" slot="start" color="primary"></ion-icon>
                </ion-item>

                <!-- Phone Number -->
                <ion-item v-if="user.phoneNumber">
                  <ion-label>
                    <h3>Phone Number</h3>
                    <p>{{ user.phoneNumber }}</p>
                  </ion-label>
                  <ion-icon :icon="callOutline" slot="start" color="success"></ion-icon>
                </ion-item>

                <!-- Display Name -->
                <ion-item v-if="user.displayName">
                  <ion-label>
                    <h3>Display Name</h3>
                    <p>{{ user.displayName }}</p>
                  </ion-label>
                  <ion-icon :icon="personOutline" slot="start" color="tertiary"></ion-icon>
                </ion-item>

                <!-- Login Method -->
                <ion-item>
                  <ion-label>
                    <h3>Login Method</h3>
                    <p>{{ getLoginMethod() }}</p>
                  </ion-label>
                  <ion-icon :icon="shieldCheckmarkOutline" slot="start" color="warning"></ion-icon>
                </ion-item>
              </ion-list>
            </ion-card-content>
          </ion-card>

          <!-- Logout Button -->
          <ion-button
            expand="block"
            color="danger"
            @click="handleLogout"
            :disabled="logoutLoading"
            class="ion-margin-top"
          >
            <ion-icon slot="start" :icon="logOutOutline"></ion-icon>
            <ion-spinner v-if="logoutLoading" name="crescent"></ion-spinner>
            <span v-else>Logout</span>
          </ion-button>

          <!-- Refresh Button -->
          <ion-button
            expand="block"
            fill="outline"
            @click="loadUserData"
            class="ion-margin-top"
          >
            <ion-icon slot="start" :icon="refreshOutline"></ion-icon>
            Refresh User Data
          </ion-button>
        </div>

        <!-- No User -->
        <div v-else class="ion-text-center">
          <ion-icon :icon="personCircleOutline" size="large" color="medium"></ion-icon>
          <h2>No User Data</h2>
          <p>Please login to view your profile</p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonSpinner,
} from '@ionic/vue';
import {
  mailOutline,
  callOutline,
  personOutline,
  personCircleOutline,
  logOutOutline,
  refreshOutline,
  shieldCheckmarkOutline,
} from 'ionicons/icons';
import { authService } from '@/auth/auth-service';
import type { AuthUser } from '@/auth/auth-interface';

const router = useRouter();
const user = ref<AuthUser | null>(null);
const loading = ref(true);
const logoutLoading = ref(false);

// Load user data
const loadUserData = async () => {
  try {
    loading.value = true;
    user.value = await authService.getCurrentUser();
  } catch (error) {
    console.error('Failed to load user data:', error);
  } finally {
    loading.value = false;
  }
};

// Get user initial for placeholder
const getUserInitial = () => {
  if (user.value?.displayName) {
    return user.value.displayName.charAt(0).toUpperCase();
  }
  if (user.value?.email) {
    return user.value.email.charAt(0).toUpperCase();
  }
  return '?';
};

// Detect login method
const getLoginMethod = () => {
  if (!user.value) return 'Unknown';
  
  if (user.value.email && user.value.phoneNumber) {
    return 'Email & Phone';
  }
  if (user.value.email) {
    return 'Email/Password or Google';
  }
  if (user.value.phoneNumber) {
    return 'Phone Number';
  }
  return 'Unknown';
};

// Logout
const handleLogout = async () => {
  try {
    logoutLoading.value = true;
    await authService.logout();
    router.push('/login');
  } catch (error) {
    console.error('Logout failed:', error);
  } finally {
    logoutLoading.value = false;
  }
};

// Load on mount
onMounted(() => {
  loadUserData();
});
</script>

<style scoped>
.profile-photo-container {
  display: flex;
  justify-content: center;
  margin: 24px 0;
}

.profile-photo {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid var(--ion-color-primary);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.profile-photo-placeholder {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--ion-color-primary), var(--ion-color-secondary));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  font-weight: bold;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

ion-list {
  background: transparent;
}

ion-item {
  --background: transparent;
  margin-bottom: 8px;
}

h2 {
  margin-top: 16px;
  color: var(--ion-color-medium);
}

p {
  color: var(--ion-color-medium);
}
</style>