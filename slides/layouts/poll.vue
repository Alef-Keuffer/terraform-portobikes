<script lang="ts">
import { getQuizPresenter } from 'slide-quiz'

// Only the Netlify build sets VITE_SLIDE_QUIZ_WS_URL. Without it the slide shows its own Markdown
// instead, so the local and GitHub Pages decks never open a WebSocket to a torn-down AnyCable app.
const wsUrl: string | undefined = import.meta.env.VITE_SLIDE_QUIZ_WS_URL
const config = wsUrl ? { wsUrl, quizGroupId: 'portobikes-debate', quizUrl: '/quiz.html' } : null
const manager = config ? getQuizPresenter(config) : null
</script>

<script setup lang="ts">
import { onMounted, provide, ref } from 'vue'
import Quiz from 'slidev-addon-slide-quiz/layouts/quiz.vue'
import QuizResults from 'slidev-addon-slide-quiz/layouts/quiz-results.vue'
import SlideQuizResults from 'slidev-addon-slide-quiz/components/SlideQuizResults.vue'
import { QUIZ_CONFIG_KEY, QUIZ_MANAGER_KEY } from 'slidev-addon-slide-quiz/injectionKeys'

defineOptions({ inheritAttrs: false })
const props = defineProps<{
  poll: 'vote' | 'results' | 'compare'
  // compare only: one column of live bars per vote
  columns?: { quizId: string, title: string }[]
  options?: { label: string, text: string }[]
}>()

if (config && manager) {
  provide(QUIZ_MANAGER_KEY, manager)
  provide(QUIZ_CONFIG_KEY, config)
}
// SlideQuizResults animates its bars when `animate` turns true, not when it starts true.
const entered = ref(false)
onMounted(() => { entered.value = true })
</script>

<template>
  <div v-if="!manager" class="slidev-layout default"><slot /></div>
  <Quiz v-else-if="props.poll === 'vote'" v-bind="{ ...$attrs, options }" />
  <QuizResults v-else-if="props.poll === 'results'" v-bind="{ ...$attrs, options }" />
  <div v-else class="slidev-layout sq-layout poll-compare">
    <SlideQuizResults
      v-for="c in columns" :key="c.quizId"
      :quiz-id="c.quizId" :question="c.title" :options="options" :animate="entered"
    />
  </div>
</template>

<style scoped>
.poll-compare { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
/* Nobody votes from this slide, so one QR per column is noise. */
.poll-compare :deep(.sq-results__qr-side) { display: none; }
</style>
