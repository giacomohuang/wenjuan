import { get, post, put, del } from "./fetch";

// 问卷相关接口
export const wenjuanApi = {
  // 获取问卷列表
  getList(params) {
    return get("/wenjuan/list", params);
  },

  // 获取问卷详情
  getDetail(id) {
    return post(`/wenjuan/client_get`, { id: id });
  },
  // 提交问卷答案
  submit(id, data) {
    return post(`/wenjuan/submit/${id}`, data);
  },
};
