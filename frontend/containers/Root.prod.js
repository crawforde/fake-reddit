import PropTypes from 'prop-types';
import React from 'react';
import { Provider } from 'react-redux';
import AppContainer from './AppContainer.js';
import NewPost from '../components/NewPost';
import SinglePost from '../components/SinglePost';
import { HashRouter, Route, Switch } from 'react-router-dom';

export default function Root({ store }) {
    return (
        <Provider store={store}>
          <HashRouter>
              <Switch>
                <Route exact path="/" component={AppContainer}/>
                <Route exact path="/post/new" component={NewPost}/>
                <Route exact path="/post/:id" component={SinglePost}/>
              </Switch>
          </HashRouter>
        </Provider>
    );
}

Root.propTypes = {
    store: PropTypes.object.isRequired
};
