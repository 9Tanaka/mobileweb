<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Login</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="login-container">
        <h1>Welcome</h1>
        <p>Please select login method</p>

        <!-- เลือกวิธี Login -->
        <div class="login-method-buttons" v-if="!selectedMethod">
          <ion-button expand="block" @click="selectedMethod = 'email'">
            <ion-icon slot="start" :icon="mailOutline"></ion-icon>
            Login with Email/Password
          </ion-button>

          <ion-button expand="block" color="danger" @click="handleGoogleLogin">
            <ion-icon slot="start" :icon="logoGoogle"></ion-icon>
            Login with Google
          </ion-button>

          <ion-button expand="block" color="success" @click="selectedMethod = 'phone'">
            <ion-icon slot="start" :icon="callOutline"></ion-icon>
            Login with Phone
          </ion-button>
        </div>

        <!-- Form Email/Password -->
        <ion-card v-if="selectedMethod === 'email'">
          <ion-card-header>
            <ion-card-title>Email/Password Login</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-item>
              <ion-label position="floating">Email</ion-label>
              <ion-input v-model="email" type="email"></ion-input>
            </ion-item>

            <ion-item>
              <ion-label position="floating">Password</ion-label>
              <ion-input v-model="password" type="password"></ion-input>
            </ion-item>

            <ion-button
              expand="block"
              @click="handleEmailLogin"
              :disabled="loading"
              class="ion-margin-top"
            >
              <ion-spinner v-if="loading" name="crescent"></ion-spinner>
              <span v-else>Login</span>
            </ion-button>

            <ion-button
              expand="block"
              fill="clear"
              @click="selectedMethod = null"
            >
              Back
            </ion-button>
          </ion-card-content>
        </ion-card>

        <!-- Form Phone -->
        <ion-card v-if="selectedMethod === 'phone'">
          <ion-card-header>
            <ion-card-title>Phone Login</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <!-- Step 1: ใส่เบอร์โทร -->
            <div v-if="!verificationId">
              <ion-item>
                <ion-label position="floating">Phone Number</ion-label>
                <ion-input
                  v-model="phoneNumber"
                  type="tel"
                  placeholder="+66812345678"
                ></ion-input>
              </ion-item>

              <ion-button
                expand="block"
                @click="handlePhoneLogin"
                :disabled="loading"
                class="ion-margin-top"
              >
                <ion-spinner v-if="loading" name="crescent"></ion-spinner>
                <span v-else>Send OTP</span>
              </ion-button>
            </div>

            <!-- Step 2: ใส่รหัส OTP -->
            <div v-else>
              <ion-item>
                <ion-label position="floating">OTP Code</ion-label>
                <ion-input v-model="verificationCode" type="text"></ion-input>
              </ion-item>

              <ion-button
                expand="block"
                @click="handleConfirmCode"
                :disabled="loading"
                class="ion-margin-top"
              >
                <ion-spinner v-if="loading" name="crescent"></ion-spinner>
                <span v-else>Verify OTP</span>
              </ion-button>
            </div>

            <ion-button
              expand="block"
              fill="clear"
              @click="resetPhoneLogin"
            >
              Back
            </ion-button>

            <!-- Hidden div for reCAPTCHA (Web only) -->
            <div id="recaptcha-container"></div>
          </ion-card-content>
        </ion-card>

        <!-- Error Message -->
        <ion-text v-if="errorMessage" color="danger" class="ion-margin-top">
          <p>{{ errorMessage }}</p>
        </ion-text>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonSpinner,
  IonText,
  IonIcon,
} from '@ionic/vue';
import { mailOutline, logoGoogle, callOutline } from 'ionicons/icons';
import { authService } from '@/auth/auth-service';

const router = useRouter();

// State
const selectedMethod = ref<'email' | 'phone' | null>(null);
const email = ref('');
const password = ref('');
const phoneNumber = ref('');
const verificationId = ref('');
const verificationCode = ref('');
const loading = ref(false);
const errorMessage = ref('');

// Email/Password Login
const handleEmailLogin = async () => {
  try {
    loading.value = true;
    errorMessage.value = '';

    await authService.loginWithEmailPassword({
      email: email.value,
      password: password.value,
    });

    router.push('/tabs/tab1');
  } catch (error: any) {
    errorMessage.value = error.message || 'Login failed';
  } finally {
    loading.value = false;
  }
};

// Google Login
const handleGoogleLogin = async () => {
  try {
    loading.value = true;
    errorMessage.value = '';

    await authService.loginWithGoogle();

    router.push('/tabs/tab1');
  } catch (error: any) {
    errorMessage.value = error.message || 'Google login failed';
  } finally {
    loading.value = false;
  }
};

// Phone Login - Step 1: Send OTP
const handlePhoneLogin = async () => {
  try {
    loading.value = true;
    errorMessage.value = '';

    const result = await authService.startPhoneLogin({
      phoneNumberE164: phoneNumber.value,
    });

    verificationId.value = result.verificationId;
  } catch (error: any) {
    errorMessage.value = error.message || 'Failed to send OTP';
  } finally {
    loading.value = false;
  }
};

// Phone Login - Step 2: Confirm Code
const handleConfirmCode = async () => {
  try {
    loading.value = true;
    errorMessage.value = '';

    await authService.confirmPhoneCode({
      verificationId: verificationId.value,
      verificationCode: verificationCode.value,
    });

    router.push('/tabs/tab1');
  } catch (error: any) {
    errorMessage.value = error.message || 'Invalid verification code';
  } finally {
    loading.value = false;
  }
};

// Reset Phone Login
const resetPhoneLogin = () => {
  selectedMethod.value = null;
  phoneNumber.value = '';
  verificationId.value = '';
  verificationCode.value = '';
  errorMessage.value = '';
};
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}
h1 {
  margin: 0 0 8px 0;  /* ✅ แก้ตรงนี้ */
  padding: 0;
}

p {
  margin: 32px;  /* ✅ แก้ตรงนี้ */
  padding: 0;
}

/* Card - แก้ margin */
ion-card {
  margin: 0 0 20px 0;  /* ✅ แก้ตรงนี้ */
}

ion-card-title {
  margin: 10px;  /* ✅ แก้ตรงนี้ */
  padding: 0;
}

/* Items - แก้ margin */
ion-item {
  margin-bottom: 16px;
}

ion-label {
  margin: 10px;  /* ✅ แก้ตรงนี้ */
  padding: 0;
}

/* Buttons - แก้ margin */
ion-button {
  margin: 10px;  /* ✅ แก้ตรงนี้ */
}
</style>