<template>
  <div class="max-w-sm mx-auto mt-10">
    <!-- Search bar for topic input -->
    <div class="mb-4 relative">
      <input
        v-model="searchTopic"
        @keyup.enter="fetchFirstQuestion"
        :disabled="loading"
        class="w-full p-2 border border-gray-300 rounded-lg"
        placeholder="Type in a topic and start"
        type="text"
      />
      <!-- Show spinner while loading -->
      <div v-if="loading" class="absolute inset-y-0 right-0 flex items-center pr-3">
        <svg
          class="animate-spin h-5 w-5 text-gray-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          ></path>
        </svg>
      </div>
    </div>

    <!-- Start Test Button -->
    <div class="text-center">
      <button v-if="this.getQuestions.length === 0"
        @click="fetchFirstQuestion"
        class="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none"
        :disabled="!searchTopic.trim() || loading"
      >
        Start Test
      </button>
    </div>

    <!-- Progress Bar for correct, incorrect, and unanswered questions -->
    <div v-if="getQuestions.length > 1" class="mt-6">
      <h2 class="text-lg font-semibold text-gray-800 text-center">Progress</h2>
      <div class="relative pt-1">
        <div class="overflow-hidden h-4 text-xs flex rounded bg-gray-200">
          <!-- Correct answers (green) -->
          <div
            class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
            :style="{ width: correctAnswerPercentage + '%' }"
          ></div>
          <!-- Incorrect answers (red or orange) -->
          <div
            class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500"
            :style="{ width: incorrectAnswerPercentage + '%' }"
          ></div>
          <!-- Unanswered questions (blue) -->
          <div
            class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
            :style="{ width: unansweredPercentage + '%' }"
          ></div>
        </div>
        <p class="text-center mt-2">{{ correctAnswerPercentage }}% correct</p>
      </div>
    </div>

    <!-- Question Count -->
    <div v-if="getQuestions.length > 0" class="mt-6">
      <p class="text-center text-gray-700">Question {{ currentQuestionNumber }} of {{ getQuestions.length }}</p>
    </div>

    <!-- Render the latest question -->
    <div v-if="latestQuestion" class="bg-white shadow-md rounded-lg overflow-hidden mt-6">
      <div class="p-4">
        <h1 class="text-2xl font-bold text-gray-800">Question:</h1>
        <p class="mt-2 text-gray-600">{{ latestQuestion.questionString }}</p>

        <div v-if="latestQuestion.options && latestQuestion.options.length" class="mt-4">
          <h2 class="text-lg font-semibold">Options:</h2>
          <ul>
            <li v-for="(option, index) in latestQuestion.options" :key="index" class="mt-2">
              <input
                type="radio"
                :value="option"
                v-model="selectedOption"
                class="mr-2"
                :id="'option-' + index"
                :disabled="loading"
              />
              <label :for="'option-' + index">{{ option }}</label>
            </li>
          </ul>
        </div>

        <!-- Next Question Button -->
        <button
          @click="submitAnswer"
          class="mt-4 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none"
          :disabled="loading"
        >
          Next Question
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'QuizComponent',
  data() {
    return {
      searchTopic: '', // Search bar input
      selectedOption: '', // Selected option for the question
      loading: false, // Loading state to manage network calls
    };
  },
  computed: {
    ...mapGetters(['getQuestions']),

    // Get the latest question from Vuex store
    latestQuestion() {
      return this.getQuestions.length ? this.getQuestions[this.getQuestions.length - 1] : null;
    },

    // Calculate the percentage of correct answers
    correctAnswerPercentage() {
      const correctAnswers = this.getQuestions.filter(question => question.evaluation === 'CORRECT').length;
      const totalQuestions = this.getQuestions.length;
      return totalQuestions ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    },

    // Calculate the percentage of incorrect answers
    incorrectAnswerPercentage() {
      const incorrectAnswers = this.getQuestions.filter(question => question.evaluation === 'INCORRECT').length;
      const totalQuestions = this.getQuestions.length;
      return totalQuestions ? Math.round((incorrectAnswers / totalQuestions) * 100) : 0;
    },

    // Calculate the percentage of unanswered questions
    unansweredPercentage() {
      const unanswered = this.getQuestions.filter(question => question.evaluation === 'UNANSWERED').length;
      const totalQuestions = this.getQuestions.length;
      return totalQuestions ? Math.round((unanswered / totalQuestions) * 100) : 0;
    },

    // Current question number (1-indexed)
    currentQuestionNumber() {
      return this.getQuestions.length;
    }
  },
  methods: {
    // Fetch the first question based on the search bar input (topic)
    async fetchFirstQuestion() {
      if (this.searchTopic.trim() !== '') {
        this.loading = true; // Start loading
        try {
          await this.$store.dispatch('startGenerating', this.searchTopic);
        } finally {
          this.loading = false; // Stop loading after request completes
        }
      }
    },

    async submitAnswer() {
      const isCorrect = this.selectedOption === this.latestQuestion.actualAnswer;

      // Update the current question with the user's answer and evaluation
      const updatedQuestion = {
        ...this.latestQuestion,
        usersAnswer: this.selectedOption,
        evaluation: isCorrect ? 'CORRECT' : 'INCORRECT',
      };

      this.loading = true; // Start loading when submitting the answer
      try {
        // Dispatch action to update the current question
        await this.$store.dispatch('updateQuestion', updatedQuestion);

        // Fetch the next question
        await this.$store.dispatch('continueGenerating');
        
        // Reset the selected option for the next question
        this.selectedOption = '';
      } finally {
        this.loading = false; // Stop loading after request completes
      }
    }
  }
};
</script>

<style scoped>
input[type="radio"] {
  cursor: pointer;
}

.text-center button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
