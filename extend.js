/**
    * 系统初始化时回调，可以注入三方脚本
    * @param {*} vue Vue实例
    * @param {*} type 有个参数值 desktop / mobile
    * @returns Promise / void
    */
    window.BaitedaInit = async function(vue, type) {
      return new Promise(function (resolve, reject) {
        // 先加载Vue.js
        const vueScript = document.createElement('script');
        vueScript.src = 'https://cdn.jsdelivr.net/npm/vue@2.6.14/dist/vue.js';
        vueScript.crossorigin = 'true';
        vueScript.onerror = function() {reject('Vue加载失败')};
        vueScript.onload = function() {
          console.log('Vue.js 加载成功');
          
          // 加载element-ui CSS样式
          const link = document.createElement('link');
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/element-ui/lib/theme-chalk/index.css";
          document.head.appendChild(link);
          
          // 加载element-ui JS库
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/element-ui/lib/index.js';
          script.crossorigin = 'true';
          script.onerror = function() {reject('Element UI加载失败')};
          script.onload = function() {
            // 注册element-ui到vue实例
            vue.use(ELEMENT);
            console.log('Element UI 加载成功');
            
            // 加载ECharts
            const echartsScript = document.createElement('script');
            echartsScript.src = 'https://fe-resource.baiteda.com/libs/echarts-5.3.2/echarts.min.js';
            echartsScript.crossorigin = 'true';
            echartsScript.onerror = function() {console.warn('ECharts加载失败')};
            echartsScript.onload = function() {
              console.log('ECharts 加载成功');
            document.body.appendChild(echartsScript);
          };
          document.body.appendChild(script);
        };
        document.body.appendChild(vueScript);
      }
    })
    }
    
    /**
    * 用户身份认证时回调，仅在私有化环境中启用
    * @param {*} user 用户对象
    * @param {*} tenant 租户对象
    */
    window.BaitedaLogin = function(user, tenant) {}
    
    /**
    * 页面全局路由变更时回调，仅在私有化环境中启用
    * @param {*} to 目标页面
    * @param {*} from 当前页面
    */
    window.BaitedaRouterChanged = function(to, from) {}
    
    /**
     * 平台关闭页面的行为干预
     * 版本提供 4.2.0
     * @param params {
     *   type: "desktop" | "mobile";
     *   browserType: string;
     *   taskRedirectUrl: string;
     *   appLauncher: boolean;
     * }
     */
    window.BaitedaClose = function(params) {}
    
    /**
     * 全局注入请求头额外参数
     * 版本提供 4.2.0
     * @param {*} headers 请求头信息
     * @returns 返回的对象就会被注入到请求头部
     */
    window.BaitedaRequestHeaders = function(headers) {return headers}
    
    /**
     * 创建单据、浏览页面、编辑页面，以iframe形式打开，会通过此函数获取到url，进行预处理。如：qiankun等微前端地址替换的处理
     * @param params {
     * 		url: string;
     *     method: 'create' | 'edit' | 'read'
     * }
     * @returns true(表示继续向下执行之前代码) | false(表示不继续执行下面的代码逻辑, 直接返回)
     */
    window.BaitedaOpenOperateUrl = function(params) {
        return true
    }
    
    /**
     * 修改标签页title的行为干预
     * @param params {
     *   title: string;
     * }
     * @returns true(表示继续向下执行之前代码) | false(表示不继续执行下面的代码逻辑, 直接返回)
     */
    window.BaitedaUpdateCurrentTab = function(params) {
      return false
    }
    
    /**
     * 全局注入外部干预样式
     * @returns 返回的对象为外部干预样式
     * 已废弃⚠️⚠️⚠️⚠️
     */
    
    window.BaitedaCustomStyle = function() {
        return {
            "list-view-aggrid": {
                "footer": {
                    "height": 30
                }
            }
        }
    }
    
    
    /**
     * 创建单据、浏览页面、编辑页面，以iframe形式打开，会通过此函数获取到url，进行预处理。如：qiankun等微前端地址替换的处理
     * 版本提供 4.2.0
     * @param url 
     * @param method: 'create' | 'edit' | 'read'
     * @returns url地址
     */
    window.BaitedaGetIframeUrl = function(url, method) {return url}
    
    //4.0.0版本提供
    window.baitedaCustomFileSupportOnlineView = function(file, type, device) {
      /**
      file: {
        "tenant_id": "testqw",
        "file_id": "b1c72447c9c44c58ba42a5aad4b6b3ae",
        "file_name": "base64.min.js",
        "file_path": "/attach/attachment/testqw/20230521/b1c72447c9c44c58ba42a5aad4b6b3ae/base64.min.js",
        "file_size": 5094,
        "create_time": 1684681790996,
        "support_online_view": false,
        "online_view_url": null,
        "download_url": "//testqw.baiteda.com/attachment/api/v1/private/download/b1c72447c9c44c58ba42a5aad4b6b3ae",
        "del_file_url": "//testqw.baiteda.com/attachment/api/v1/private/del?fileId=b1c72447c9c44c58ba42a5aad4b6b3ae"
      },
      type: 'isSupport' | 'getUrl'
      device: 'desktop' | 'mobile'
      */
      if (type === 'isSupport') {return false}
      else if (type === 'getUrl') {return 'https://www.sina.com.cn'}
    }
    
    //5.2.0+版本提供  调用utils工具集
    window.BaitedaUtilsMounted = async function (utils) {
     // 这里可以获取utils函数，调用服务等
    };