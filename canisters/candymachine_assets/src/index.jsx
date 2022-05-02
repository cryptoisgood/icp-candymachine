import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import {HashRouter} from "react-router-dom";
import "../../../node_modules/bootstrap/dist/css/bootstrap.css";
import "../../../node_modules/bootstrap/dist/js/bootstrap";
import "../../../node_modules/jquery/dist/jquery";
import "../../../node_modules/@popperjs/core/dist/cjs/popper";

import {
    RecoilRoot
} from 'recoil';

ReactDOM.render(
    <RecoilRoot>
        <HashRouter>
            <App />
        </HashRouter>
    </RecoilRoot>,
    document.getElementById('root')
);
