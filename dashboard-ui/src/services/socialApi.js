import api from './api';

// User following endpoints
export const followUser = (userId) => {
    return api.post(`/social/users/${userId}/follow`);
};

export const unfollowUser = (userId) => {
    return api.delete(`/social/users/${userId}/follow`);
};

export const getUserProfile = (userId) => {
    return api.get(`/social/users/${userId}/profile`);
};

export const searchUsers = (query, limit = 20, skip = 0) => {
    return api.get('/social/users/search', {
        params: { q: query, limit, skip }
    });
};

// Box social endpoints
export const forkBox = (boxId, description = '') => {
    return api.post(`/social/boxes/${boxId}/fork`, { description });
};

export const rateBox = (boxId, rating, review = '') => {
    return api.post(`/social/boxes/${boxId}/rate`, { rating, review });
};

export const getPublicBoxes = (params = {}) => {
    const { tags, language, difficulty, sort = 'created_at', limit = 20, skip = 0 } = params;
    return api.get('/social/boxes/public', {
        params: { tags, language, difficulty, sort, limit, skip }
    });
};

// Activity feed
export const getPersonalizedFeed = (limit = 20, skip = 0) => {
    return api.get('/social/feed', {
        params: { limit, skip }
    });
};

export default {
    followUser,
    unfollowUser,
    getUserProfile,
    searchUsers,
    forkBox,
    rateBox,
    getPublicBoxes,
    getPersonalizedFeed
};
