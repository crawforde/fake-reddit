const axios = require('axios');

const getLoggedInUser = async ()=>{
    var response;
    try{
        response = await axios.get('/api/');
        console.log(response.user.username);
        return response.user.username || '';
    } catch(err) {
        console.log('Error:', err);
        return null;
    }
};


function rootReducer(state = { name: 'Horizons', isModalOpen: false, username: getLoggedInUser()}, action) {
    switch (action.type) {
        case 'TOGGLE_MODAL':
            return Object.assign({}, state, {isModalOpen: !state.isModalOpen});
        case 'SET_USERNAME':
            return Object.assign({}, state, { username: action.data, isModalOpen: false });
        case 'LOGOUT':
            return Object.assign({}, state, { username: '', isModalOpen: false });
        default:
            return state;
    }
}

export default rootReducer;
