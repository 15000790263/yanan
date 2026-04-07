import { getInfo, getMenu } from '../api/login';

function getLeafMenu(routes, a = []) {
  for (const item of routes) {
    if (item.children) {
      getLeafMenu(item.children, a);
    } else {
      a.push(item.meta.title);
    }
  }
  return a;
}

const useUserStore = defineStore('user', {
  state: () => ({
    name: '',
    nickName: '',
    deptName: '',
    userId: '',
    avatar: '',
    roles: [],
    posts: [],
    permissions: [],
    menu: [],
    signature: '',
    leafMenu: [],
    phonenumber: '',
    email: '',
  }),
  actions: {
    // 获取用户信息
    getInfo() {
      return new Promise((resolve, reject) => {
        getInfo()
          .then(res => {
            const user = res.data.user;
            if (res.data.roles && res.data.roles.length > 0) {
              // 验证返回的roles是否是一个非空数组
              this.roles = res.data.roles;
            } else {
              this.roles = ['ROLE_DEFAULT'];
            }

            this.posts = res.data.posts;
            this.permissions = res.data.permissions;

            this.name = user.userName;
            this.nickName = user.nickName;
            this.deptName = user.dept.deptName;
            this.userId = user.userId;
            this.signature = user.signature;
            this.avatar = user.avatar;
            this.phonenumber = user.phonenumber;
            this.email = user.email;
            resolve(res.data);
          })
          .catch(error => {
            reject(error);
          });
      });
    },
    async getMenu() {
      const res = await getMenu();
      const routes = res.data.data;
      this.menu = routes.map(item => item.path.split('/').filter(Boolean).pop());
      this.leafMenu = [];
      this.leafMenu = getLeafMenu(routes);
    },
  },
  persist: {
    enabled: true,
    // 你可以配置更多选项，例如选择使用 localStorage 或 sessionStorage
    strategies: [
      {
        key: 'myUserStore',
        storage: localStorage,
      },
    ],
  },
});

export default useUserStore;
