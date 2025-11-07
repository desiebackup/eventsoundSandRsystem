import 'bootstrap';
import '@fortawesome/fontawesome-free/css/all.min.css';

import axios from 'axios';

window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
