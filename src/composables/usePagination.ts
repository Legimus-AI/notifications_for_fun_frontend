import { ref, computed } from "vue";

export function usePagination(defaultLimit = 30) {
  const page = ref(1);
  const limit = ref(defaultLimit);
  const total = ref(0);

  const totalPages = computed(() => Math.ceil(total.value / limit.value));

  const buildParams = () => ({
    sort: "updatedAt",
    order: "desc",
    page: page.value,
    limit: limit.value,
  });

  function nextPage() {
    if (page.value < totalPages.value) page.value++;
  }

  function prevPage() {
    if (page.value > 1) page.value--;
  }

  function setTotal(newTotal: number) {
    total.value = newTotal;
  }

  return {
    page,
    limit,
    total,
    totalPages,
    buildParams,
    nextPage,
    prevPage,
    setTotal,
  };
}
