import { baseUrl } from "./baseUrl";

// 封装请求方法
const fetch = (options = {}) => {
  return new Promise((resolve, reject) => {
    // 默认配置
    const defaultOptions = {
      url: "",
      method: "GET",
      data: {},
      header: {
        "Content-Type": "application/json",
      },
      loading: true,
    };

    // 合并配置
    options = Object.assign({}, defaultOptions, options);

    // 显示加载提示
    if (options.loading) {
      uni.showLoading({
        title: "加载中...",
        mask: true,
      });
    }

    // 发起请求
    uni.request({
      url: baseUrl + options.url,
      method: options.method,
      data: options.data,
      header: options.header,
      success: (res) => {
        if (res.statusCode === 200) {
          // 请求成功
          resolve(res.data);
        } else {
          // 请求失败
          uni.showToast({
            title: res.data.message || "请求失败",
            icon: "none",
          });
          reject(res);
        }
      },
      fail: (err) => {
        // 网络错误
        uni.showToast({
          title: "网络错误",
          icon: "none",
        });
        reject(err);
      },
      complete: () => {
        // 隐藏加载提示
        if (options.loading) {
          uni.hideLoading();
        }
      },
    });
  });
};

// 导出请求方法
export const get = (url, data = {}, options = {}) => {
  return fetch({
    url,
    data,
    ...options,
  });
};

export const post = (url, data = {}, options = {}) => {
  return fetch({
    url,
    method: "POST",
    data,
    ...options,
  });
};

export const put = (url, data = {}, options = {}) => {
  return fetch({
    url,
    method: "PUT",
    data,
    ...options,
  });
};

export const del = (url, data = {}, options = {}) => {
  return fetch({
    url,
    method: "DELETE",
    data,
    ...options,
  });
};
