import axios from 'axios';

// 开发环境下不需要设置 baseURL，使用代理
// axios.defaults.baseURL = 'http://8.134.172.28:3008';

// post：检查用户名是否存在
export const checkUsername = async (username) => {
    try {
        let res = await axios.post('/api_user', { 
            username,
            status: 'check'
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        if (res.data.code !== 0) {
            return false;
        }
        return true;
    } catch (error) {
        console.error('检查用户名失败:', error);
        return false;
    }
}

// post：注册
export const register = async (username, password) => {
    try {
        let res = await axios.post('/api_user', {
            username,
            password,
            status: 'register',
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        if (res.data.code !== 0) {
            return false;
        }
        return true;
    } catch (error) {
        console.error('注册失败:', error);
        return false;
    }
}

// post：登录
export const login = async (username, password) => {
    try {
        let res = await axios.post('/api_user', {
            username,
            password,
            status: 'login',
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        if (res.data.code !== 0) {
            return false;
        }
        return true;
    } catch (error) {
        console.error('登录失败:', error);
        return false;
    }
}