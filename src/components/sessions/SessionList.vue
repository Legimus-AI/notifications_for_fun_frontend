<template>
  <div>
    <div v-if="store.isLoading" class="text-center">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <div v-else class="row">
      <div
        v-for="channel in store.channels"
        :key="channel.id"
        class="col-md-6 col-lg-4"
      >
        <ChannelCard :channel="channel" />
      </div>
      <div
        v-if="!store.channels.length && !store.isLoading"
        class="text-center text-muted mt-4"
      >
        <p>No active channels. Add one to get started.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from "vue";
import { useChannelStore } from "@/store/sessions";
import { useToast } from "@/composables/useToast";
import ChannelCard from "./ChannelCard.vue";

const store = useChannelStore();
const { error } = useToast();

const initialize = async () => {
  try {
    await store.initialize();
  } catch (err: any) {
    error(err.message || "Failed to initialize channels", "Error");
  }
};

// Watch for errors and show them as toasts
watch(
  () => store.error,
  (newError) => {
    if (newError) {
      error(newError, "Error");
      // Clear the error after showing it
      store.error = null;
    }
  },
  { immediate: true }
);

onMounted(() => {
  initialize();
});
</script>

<style scoped>
.row {
  display: flex;
  flex-wrap: wrap;
  margin-right: -15px;
  margin-left: -15px;
}
.col-md-6 {
  flex: 0 0 50%;
  max-width: 50%;
  padding: 0 15px;
}
@media (min-width: 992px) {
  .col-lg-4 {
    flex: 0 0 33.333%;
    max-width: 33.333%;
  }
}
.spinner-border {
  width: 3rem;
  height: 3rem;
}
.alert {
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid transparent;
  border-radius: 0.25rem;
}
.alert-danger {
  color: #842029;
  background-color: #f8d7da;
  border-color: #f5c2c7;
}
</style>
