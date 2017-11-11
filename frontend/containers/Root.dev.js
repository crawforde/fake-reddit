import PropTypes from 'prop-types';
import React from 'react';
import {Provider} from 'react-redux';
import AppContainer from './AppContainer';
import NewPost from '../components/NewPost';
import SinglePost from '../components/SinglePost';
import DevTools from './DevTools';
import { HashRouter, Route, Switch, Link } from 'react-router-dom';

export default function Root({ store }) {
    return(
          <Provider store={store}>
              <HashRouter>
                <div>
                  <Route path="/" component={DevTools} />
                  <Route path="/:anything" component={() => <Link to="/">Back to home</Link>} />
                  <Switch>
                    <Route exact path="/" component={AppContainer}/>
                    <Route exact path="/post/new" component={NewPost}/>
                    <Route exact path="/post/:id" component={SinglePost}/>
                  </Switch>
                </div>
              </HashRouter>
          </Provider>
    );
}

Root.propTypes = {
    store: PropTypes.object.isRequired
};
