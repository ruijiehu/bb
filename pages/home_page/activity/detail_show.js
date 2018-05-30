let util = require('../../../utils/util.js');
let app = getApp();
let cache;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    info: null,
    jiaoliuID: null,
    id: null,
    answerList: null,
    container: null,
    UserInfo: null,
    verifyApplying: false,
    nocon: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.info(options)
    this.setData({
      id: options.id,
      verifyApplying: app.globalData.visvy
    })
    this.getMyInfo();
    this.getDetail();
    this.getComment();
    // this.verifyApplyCheck();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getMyInfo();
    this.getDetail();
    this.getComment();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getMyInfo();
    this.getDetail();
    this.getComment();
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let that = this;
    let shareData = {
      title: '邀请你助力',
      desc: this.data.info.content,
      path: '/pages/circle/exchange_show/exchange_show?id=' + that.data.id + '&nickname=' + that.data.UserInfo.nickname,
      success: function (rs) {
        console.info(rs)
        console.info(that.data.id)
        console.info(that.data.UserInfo.nickname)
      }
    };
    return shareData;
    
  },
  /**
   * 获取交流详情
   */
  getDetail() {
    let that = this;
    wx.request({
      url: app.globalData.javahost + '/user/question/get',
      method: 'POST',
      data: {
        "questionId": that.data.id
      },
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success(res) {
        if (res.data.success) {
          console.info(res)
          let info = res.data.data;
          info.createTime = util.getDateDiff(info.createTime);
          info.images = info.images ? info.images.split(";") : [];
          that.setData({
            info: info
          })
        } else {
          console.info(res)
          that.setData({
            nocon: '该交流已删除'
          })
          // wx.showToast({
          //   title: res.data.errorMsg,
          //   icon: 'success',
          //   duration: 2000
          // })
        }
      }
    })
  },
  /**
   * 获取交流的评论
   */
  getComment() {

    let that = this;
    wx.request({
      url: app.globalData.javahost + '/user/question/get/comment',
      method: 'POST',
      data: {
        // "communionId": jiaoliuID
        "questionId": that.data.id
      },
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success(res) {
        if (res.data.success) {
          console.info(res)
          var array = [];
          for (let i = 0; i < res.data.data.length; i++) {
            cache = res.data.data[i];
            cache.createTime = util.getDateDiff(cache.createTime);
            array.push(cache);
          }
          that.setData({
            answerList: array
          })
        }
      }
    })
  },
  // 分享
  toShare(e) {
    // console.info(e)
    wx.navigateTo({
      url: '/pages/home_page/share_jl/share_jl?id=' + e.currentTarget.dataset.atrid + '&type=' + e.currentTarget.dataset.type + '&imgs=' + e.currentTarget.dataset.img + '&tit=' + e.currentTarget.dataset.tit + '&summary=' + e.currentTarget.dataset.summary
    })
  },
  // 离开文本框
  bindTextAreaBlur: function (e) {
    console.info(e)
    this.setData({
      container: e.detail.value
    })
    console.info(this.data.container)
  },
  /**
   * 发送评论
   */
  to_send() {
    let that = this;
    console.info(that.data.container)
    // console.info(that.data.atricleid)

    let con = that.data.container;
    if (con) {
      // console.info(con)
      wx.request({
        url: app.globalData.javahost + '/user/question/answer/add',
        method: 'POST',
        data: {
          "content": con,
          "questionId": that.data.id
        },
        header: {
          'content-type': 'application/json',
          'cookie': 'JSESSIONID=' + app.globalData.session
        },
        success: function (res) {
          console.info(res)
          setTimeout(function () {
            that.data.container = ''
            that.getDetail();
            that.getComment();
            wx.showToast({
              title: '评论成功',
              icon: 'success',
              duration: 2000
            })
          }, 200)

        }

      })

    } else {
      wx.showToast({
        title: '内容不能为空',
        icon: 'success',
        duration: 2000
      })
    }




  },
  /**
   * 点赞
   */
  dianzan() {
    let that = this;
    wx.request({
      url: app.globalData.javahost + '/user/operate/praise',
      method: 'POST',
      data: {
        "id": that.data.id,
        "type": 2
      },
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        console.info(res)
        if (res.data.success) {
          // that.getCGinfo();
          that.getDetail();
          wx.showToast({
            title: '成功',
            icon: 'success',
            duration: 2000
          })
        }

      }

    })

  },
  /**
 * 临时加入接口获取当前用户信息
 */
  getMyInfo: function () {
    let that = this;
    wx.request({
      url: app.globalData.javahost + '/user/base/get/selfInfo',
      method: 'POST',
      data: null,
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        if (res.data.success) {
          console.info(res.data)
          that.setData({
            UserInfo: res.data.data,
            verifyApplying: res.data.data.verifyYn
          })
        } else {

        }
      },

    })
  },

  /**
   * 更多
   */
  more_edit(e) {
    // let id = e.currentTarget.dataset.id;
    let that = this;
    let id = that.data.id;
    wx.showActionSheet({
      itemList: ['删除'],
      success: function (res) {
        console.log(res.tapIndex)
        if (res.tapIndex == 0) {

          // 删除
          wx.request({
            url: app.globalData.javahost + '/user/question/delete',
            method: 'POST',
            data: {
              "questionId": id
            },
            header: {
              'content-type': 'application/json',
              'cookie': 'JSESSIONID=' + app.globalData.session
            },
            success: function (res) {
              console.info(res);
              // that.setData({
              //   tuijianList: []
              // })
              // this.data.tuijianList = [];
              // that.setData({
              //   tuijianList: []
              // })
              // that.getFlow();
              wx.showToast({
                title: '删除成功',
                icon: 'success',
                duration: 2000
              })
              // wx.switchTab({
              //   url: '/pages/home_page/index/index',
              // })
              setTimeout(
                function () {
                  wx.switchTab({
                    url: '/pages/home_page/index/index'
                  })
                }, 100)
            },

          })


        } else {
          // 举报
        }
      },
      fail: function (res) {
        console.log(res.errMsg)
      }
    })
  },
  /**
  * 查看大图
  */
  previewImage: function (e) {
    var current = e.target.dataset.src
    wx.previewImage({
      current: current,
      urls: this.data.info.images
    })
  },
  /**
 * 评论
 */
  answerAdd: function (e) {
    let that = this;
    wx.navigateTo({
      url: '/pages/home_page/reply/reply?id=' + that.data.id + '&type=6'
    })
  },
  /**
 * 对交流的分享
 */
  f_x(e) {
    let that = this;
    console.info(e.currentTarget.dataset.id)
    let id = that.data.id;
    let tit = '';
    let summary = that.data.info.content;
    let imgs = '';
    // console.log(e.currentTarget.dataset.imgs);
    let itype = 1;
    wx.navigateTo({
      url: '/pages/home_page/share_fen/share_fen?id=' + id + '&tit=' + tit + '&summary=' + summary + '&imgs=' + imgs + '&type=' + itype
    })
  },
  /**
 * 进入名片
 */
  /**
   * 去用户信息页面
   */
  to_Man(e) {
    let id = e.currentTarget.dataset.id;
    let that = this;
    let uid = that.data.UserInfo.userId
    console.info(id)
    console.info(that.data.UserInfo.userId)
    console.info(that.data.infoid == id)
    if (uid == id) {
      if (that.data.UserInfo.identityType != undefined) {
        if (that.data.UserInfo.identityType == '企业主') {
          wx.navigateTo({
            url: '/pages/mine/detail/detail_com?uid=' + id
          })
        } else if (that.data.UserInfo.identityType == '外贸人') {
          wx.navigateTo({
            url: '/pages/mine/detail/detail?uid=' + id
          })
        }
      }
    } else {
      // 判断是什么身份，外贸人和企业主

      wx.request({
        url: app.globalData.javahost + '/user/base/get/userInfo',
        method: 'POST',
        data: {
          "userId": id
        },
        header: {
          'content-type': 'application/json',
          'cookie': 'JSESSIONID=' + app.globalData.session
        },
        success: function (res) {
          console.info(res);
          if (res.data.success) {
            let data = res.data.data;
            if (data.identityType != undefined) {
              if (data.identityType == '企业主') {
                wx.navigateTo({
                  url: '/pages/mine/detail/detail_com_other?uid=' + id
                })
              } else if (data.identityType == '外贸人') {
                wx.navigateTo({
                  url: '/pages/mine/detail/detail_other?uid=' + id
                })
              }
            }

          }

        }

      })

    }

  },
})