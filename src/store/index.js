import { createStore } from 'vuex'
import axios from 'axios'

const store = createStore({
    state: {
        topic: '', // The current topic
        questions: [], // List of questions
    },
    mutations: {
        SET_TOPIC(state, topic) {
            state.topic = topic;
        },
        ADD_QUESTION(state, question) {
            state.questions.push(question);
        },
        UPDATE_QUESTION(state, updatedQuestion) {
            const questionIndex = state.questions.findIndex(q => q.questionString === updatedQuestion.questionString);
            if (questionIndex !== -1) {
                state.questions[questionIndex] = updatedQuestion; // Replace with updated question
            }
        }
    },
    actions: {
        async startGenerating({ commit }, topic) {
            // Set the topic
            commit('SET_TOPIC', topic);

            // Make API call to "/start-generating" endpoint
            try {
                const response = await axios.get(`https://mocktest-f4d6bvdbahcmfmff.westeurope-01.azurewebsites.net/Questions/start-generating`, { params: { topic } });
                const question = response.data; // Assuming the API returns a single question object

                // Add the question to the state
                commit('ADD_QUESTION', question);
            } catch (error) {
                console.error("Error generating question:", error);
            }
        },

        async continueGenerating({ state, commit }) {
            // Make API call to "/continue-generating" endpoint
            try {
                const response = await axios.post(`https://mocktest-f4d6bvdbahcmfmff.westeurope-01.azurewebsites.net/Questions/continue-generating`, {
                    topic: state.topic,
                    previousQuestions: state.questions,
                });

                const newQuestion = response.data; // Assuming the API returns a new question object

                // Add the new question to the state
                commit('ADD_QUESTION', newQuestion);
            } catch (error) {
                console.error("Error fetching new question:", error);
            }
        },
        updateQuestion({ commit }, updatedQuestion) {
            commit('UPDATE_QUESTION', updatedQuestion);
        }
    },
    getters: {
        getTopic(state) {
            return state.topic;
        },
        getQuestions(state) {
            return state.questions;
        },
    },
});

export default store;
