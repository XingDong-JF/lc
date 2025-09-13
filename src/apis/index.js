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
        return res.data;
    } catch (error) {
        console.error('登录失败:', error);
        return false;
    }
}

// get：获取商品导航分类
export const goodsClassify = async () => {
    try {
        let res = await axios.get('/api_cat');
        if (res.data.code !== 0) {
            return false;
        }
        return res.data.data;
    } catch (error) {
        console.error('获取商品分类失败:', error);
        return false;
    }
}

// get：获取广告轮播图片
export const bannerCarousel = async () => {
    try {
        let res = await axios.get('/api_banner', {
            params: {
                bannerId: 1
            }
        });
        if (res.data.code !== 0) {
            return false;
        }
        return res.data.data;
    } catch (error) {
        console.error('获取广告轮播图片失败:', error);
        return false;
    }
}

// get：获取热门商品
export const hotGoods = async (page, pagesize) => {
    try {
        let res = await axios.get('/api_goods', {
            params: {
                page,
                pagesize,
            }
        });
        if (res.data.code !== 0) {
            return false;
        }
        return res.data.data;
    } catch (error) {
        console.error('获取热门商品失败:', error);
        return false;
    }
}

// get：获取分类商品
export const classifyGoods = async (page, pagesize, catId) => {
    try {
        let res = await axios.get('/api_goods', {
            params: {
                page,
                pagesize,
                catId
            }
        });
        if (res.data.code !== 0) {
            return false;
        }
        return res.data.data;
    } catch (error) {
        console.error('获取分类商品失败:', error);
        return false;
    }
}
// get：获取商品详情
export const goodsDetail = async (goodsId) => {
    try {
        let res = await axios.get('/api_goods', {
            params: {
                goodsId
            }
        });
        if (res.data.code !== 0) {
            return false;
        }
        return res.data.data;
    } catch (error) {
        console.error('获取商品详情失败:', error);
        return false;
    }
}

// post：添加商品到购物车
export const addToCart = async (userId, goodsId, goodsNumber) => {
    try {
        let res = await axios.post('/api_cart', {
            status: 'addcart',
            userId,
            goodsId,
            goodsNumber
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
        console.error('添加商品到购物车失败:', error);
        return false;
    }
}

// post：获取购物车列表
export const getCartList = async (userId) => {
    try {
        let res = await axios.post('/api_cart', {
            status: 'viewcart',
            userId
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        if (res.data.code !== 0) {
            return false;
        }
        return res.data.data;
    } catch (error) {
        console.error('获取购物车列表失败:', error);
        return false;
    }
}

// post：删除单件商品
export const deleteCartItem = async (userId, goodsId) => {
    try {
        let res = await axios.post('/api_cart', {
            status: 'delcart',
            userId,
            goodsId
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
        console.error('删除单件商品失败:', error);
        return false;
    }
}

// get：搜索商品
export const searchGoods = async (page, pagesize, keywords) => {
    try {
        let res = await axios.get('/api_search', {
            params: {
                page,
                pagesize,
                keywords
            }
        })
        if (res.data.code !== 0) {
            return res.data;
        }
        return res.data;
    } catch (error) {
        console.error('搜索商品失败:', error);
        return false;
    }
}

// get：获取省份
export const getProvinces = async () => {
    try {
        let res = await axios.get('/api_country');
        if (res.data.code !== 0) {
            return false;
        }
        return res.data.data;
    } catch (error) {
        console.error('获取省份失败:', error);
        return false;
    }
}

// get：获取城市
export const getCities = async (province) => {
    try {
        let res = await axios.get('/api_country', {
            params: {
                province
            }
        });
        if (res.data.code !== 0) {
            return false;
        }
        return res.data.data;
    } catch (error) {
        console.error('获取城市失败:', error);
        return false;
    }
}

// get：获取区县
export const getDistricts = async (province,city) => {
    try {
        let res = await axios.get('/api_country', {
            params: {
                province,
                city
            }
        });
        if (res.data.code !== 0) {
            return false;
        }
        return res.data.data;
    } catch (error) {
        console.error('获取区县失败:', error);
        return false;
    }
}

// post：新增收获地址
export const addAress = async (status, userId, province, city, district, streetname, takename, postcode, tel) => {
    try {
        let res = await axios.post('/api_address',{
            status: "addAddress",
            userId,
            province,
            city,
            district,
            streetname,
            takename,
            postcode,
            tel
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
        console.error('新增收获地址失败:', error);
        return false;
    }
}

// post：获取收获地址列表
export const getAddressList = async (userId) => {
    try {
        let res = await axios.post('/api_address', {
            status: "getAddress",
            userId
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        if (res.data.code !== 0) {
            return false;
        }
        return res.data.data;
    } catch (error) {
        console.error('获取收获地址列表失败:', error);
        return false;
    }
}

// post： 删除收获地址
export const deleteAddress = async (userId, addressId) => {
    try {
        let res = await axios.post('/api_address', {
            status: "deleteAddress",
            userId,
            addressId
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
        console.error('删除收获地址失败:', error);
        return false;
    }
}