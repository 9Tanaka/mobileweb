<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Profile</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="profile-container" v-if="user">
        <div class="profile-header">
          <img
            v-if="user.photoUrl"
            :src="user.photoUrl"
            alt="Profile Photo"
            class="profile-photo"
          />
          <div v-else class="profile-photo-placeholder">
            {{ user.displayName?.charAt(0) || user.email?.charAt(0) || '?' }}
          </div>
        </div>

        <ion-card>
          <ion-card-header>
            <ion-card-title>User Information</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list>
              <ion-item v-if="user.displayName">
                <ion-label>
                  <h3>Display Name</h3>
                  <p>{{ user.displayName }}</p>
                </ion-label>
              </ion-item>

              <ion-item v-if="user.email">
                <ion-label>
                  <h3>Email</h3>
                  <p>{{ user.email }}</p>
                </ion-label>
              </ion-item>

              <ion-item v-if="user.phoneNumber">
                <ion-label>
                  <h3>Phone Number</h3>
                  <p>{{ user.phoneNumber }}</p>
                </ion-label>
              </ion-item>

              <ion-item>
                <ion-label>
                  <h3>User ID</h3>
                  <p>{{ user.uid }}</p>
                </ion-label>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <ion-button
          expand="block"
          color="danger"
          @click="handleLogout"
          :disabled="loading"
          class="ion-margin-top"
        >
          <ion-spinner v-if="loading" name="crescent" />
          <span v-else>Logout</span>
        </ion-button>
      </div>

      <div v-else class="ion-text-center">
        <ion-spinner name="crescent" />
        <p>Loading user information...</p>
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
  IonSpinner,
} from '@ionic/vue';
import { authService } from '@/auth/auth-service';
import type { AuthUser } from '@/auth/auth-interface';

const router = useRouter();
const user = ref<AuthUser | null>(null);
const loading = ref(false);

onMounted(async () => {
  user.value = await authService.getCurrentUser();
});

const handleLogout = async () => {
  try {
    loading.value = true;
    await authService.logout();
    router.push('/login');
  } catch (error) {
    console.error('Logout failed:', error);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.profile-container {
  max-width: 500px;
  margin: 0 auto;
}

.profile-header {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.profile-photo {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid var(--ion-color-primary);
}

.profile-photo-placeholder {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: var(--ion-color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  font-weight: bold;
}

ion-list {
  background: transparent;
}

ion-item {
  --background: transparent;
}
</style>
