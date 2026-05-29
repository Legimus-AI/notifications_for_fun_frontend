<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { Codemirror } from "vue-codemirror";
import { EditorView } from "@codemirror/view";
import { json, jsonParseLinter } from "@codemirror/lang-json";
import { linter, lintGutter, type Diagnostic } from "@codemirror/lint";

// Reusable JSON editor with live validation and a Format button.
// Pass a plain string via v-model — empty string is treated as "no JSON",
// which validates to true (caller decides if empty is acceptable).
const props = withDefaults(
  defineProps<{
    modelValue: string;
    placeholder?: string;
    height?: string;
    allowEmpty?: boolean;
    readonly?: boolean;
  }>(),
  {
    placeholder: "",
    height: "180px",
    allowEmpty: true,
    readonly: false,
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
  validity: [valid: boolean, errorMessage: string];
}>();

// CodeMirror extensions: JSON language + lint gutter + linter.
// The linter underlines invalid JSON and shows the error inline.
const extensions = computed(() => [
  json(),
  linter(jsonParseLinter()),
  lintGutter(),
  EditorView.lineWrapping,
]);

// Local validation echo for the badge below the editor.
const validity = ref<{ valid: boolean; error: string }>({ valid: true, error: "" });

function validate(raw: string) {
  const trimmed = (raw || "").trim();
  if (!trimmed) {
    const ok = props.allowEmpty;
    validity.value = {
      valid: ok,
      error: ok ? "" : "Required: enter a JSON object.",
    };
    emit("validity", ok, validity.value.error);
    return;
  }
  try {
    JSON.parse(trimmed);
    validity.value = { valid: true, error: "" };
    emit("validity", true, "");
  } catch (e: any) {
    const msg = e?.message || "Invalid JSON";
    validity.value = { valid: false, error: msg };
    emit("validity", false, msg);
  }
}

watch(
  () => props.modelValue,
  (v) => validate(v),
  { immediate: true },
);

function onUpdate(value: string) {
  emit("update:modelValue", value);
}

// Format = parse + pretty-print with 2-space indent. No-op for invalid JSON.
function format() {
  const trimmed = (props.modelValue || "").trim();
  if (!trimmed) return;
  try {
    const formatted = JSON.stringify(JSON.parse(trimmed), null, 2);
    emit("update:modelValue", formatted);
  } catch {
    // Linter already shows the error; do nothing.
  }
}
</script>

<template>
  <div class="json-editor">
    <div class="json-editor__toolbar">
      <span
        class="json-editor__badge"
        :class="validity.valid ? 'json-editor__badge--ok' : 'json-editor__badge--err'"
      >
        <i :class="validity.valid ? 'bi bi-check2-circle' : 'bi bi-exclamation-circle'"></i>
        {{ validity.valid ? "Valid JSON" : "Invalid JSON" }}
      </span>
      <button
        type="button"
        class="json-editor__format"
        @click="format"
        :disabled="!validity.valid || !modelValue.trim()"
        title="Format (pretty-print with 2-space indent)"
      >
        <i class="bi bi-magic me-1"></i>Format
      </button>
    </div>
    <Codemirror
      :model-value="modelValue"
      :placeholder="placeholder"
      :style="{ height }"
      :autofocus="false"
      :indent-with-tab="true"
      :tab-size="2"
      :extensions="extensions"
      :disabled="readonly"
      @update:model-value="onUpdate"
    />
    <p v-if="!validity.valid" class="json-editor__error">
      {{ validity.error }}
    </p>
  </div>
</template>

<style scoped>
.json-editor {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}
.json-editor__toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}
.json-editor__badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.125rem 0.5rem;
  border-radius: 0.375rem;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}
.json-editor__badge--ok {
  background: #ecfdf5;
  color: #047857;
}
.json-editor__badge--err {
  background: #fef2f2;
  color: #b91c1c;
}
.json-editor__format {
  background: #eef2ff;
  color: #4338ca;
  border: 1px solid #c7d2fe;
  padding: 0.25rem 0.625rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}
.json-editor__format:hover:not(:disabled) {
  background: #e0e7ff;
}
.json-editor__format:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.json-editor__error {
  margin: 0;
  font-size: 0.75rem;
  color: #b91c1c;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}
.json-editor :deep(.cm-editor) {
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.8125rem;
  background: white;
}
.json-editor :deep(.cm-editor.cm-focused) {
  border-color: #6366f1;
  outline: 2px solid rgba(99, 102, 241, 0.2);
}
.json-editor :deep(.cm-scroller) {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}
.json-editor :deep(.cm-gutters) {
  background: #f9fafb;
  border-right: 1px solid #e5e7eb;
  border-top-left-radius: 0.5rem;
  border-bottom-left-radius: 0.5rem;
}
</style>
