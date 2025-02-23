import Component from '@glimmer/component';
import fetch from 'fetch';
import {action} from '@ember/object';
import {task} from 'ember-concurrency';
import {tracked} from '@glimmer/tracking';

const API_URL = 'https://resources.ghost.io/resources';
const API_KEY = 'b30afc1721f5d8d021ec3450ef';
const NEWSLETTER_COUNT = 10;

export default class LatestNewsletters extends Component {
    @tracked loading = null;
    @tracked error = null;
    @tracked newsletters = null;

    @action
    load() {
        this.loading = true;
        this.fetch.perform().then(() => {
            this.loading = false;
        }, (error) => {
            this.error = error;
            this.loading = false;
        });
    }

    @task
    *fetch() {
        const order = encodeURIComponent('published_at DESC');
        const key = encodeURIComponent(API_KEY);
        const limit = encodeURIComponent(NEWSLETTER_COUNT);
        let response = yield fetch(`${API_URL}/ghost/api/content/posts/?limit=${limit}&order=${order}&key=${key}&include=none`);
        if (!response.ok) {
            // eslint-disable-next-line
            console.error('Failed to fetch newsletters', {response});
            this.error = 'Failed to fetch';
            return;
        }

        let result = yield response.json();
        this.newsletters = result.posts || [];
    }
}
