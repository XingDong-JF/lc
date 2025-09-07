import { defineStore } from 'pinia';
import { getCartList } from '../apis';

export const useCartStore = defineStore('cart', {
    state: () => ({
        cartList: []
    }),
    actions: {
        async fetchCartList() {
            let userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
            const result = await getCartList(userId);
            this.cartList = result || [];
        }
    }
});
