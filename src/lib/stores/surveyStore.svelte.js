import { browser } from '$app/environment';
class SurveyStore {
	#pages = $state([]);

	constructor() {
		if (browser) {
			this.#pages = JSON.parse(localStorage.getItem('surveyPages')) || [];
		}
	}

	get pages() {
		return this.#pages;
	}

	set pages(value) {
		if (browser) {
			localStorage.setItem('surveyPages', JSON.stringify(value));
		}
		this.#pages = value;
	}

	savePages() {
		if (browser) {
			localStorage.setItem('surveyPages', JSON.stringify(this.#pages));
		}
	}
}

export const surveyStore = new SurveyStore();
