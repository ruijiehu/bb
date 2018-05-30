// pages/circle/pur_show/pur_show.js
let util = require('../../../utils/util.js');
let app = getApp();
let reqData = {}, cache;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    purid: null,
    info: null,
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
    console.info(options.id)
    this.setData({
      purid: options.id,
      verifyApplying: app.globalData.visvy
    })
    this.getMyInfo();
    this.getCGinfo(); //调用方法
    this.getCGcomment(); //调用评论
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
    this.getCGinfo(); //调用方法
    this.getCGcomment(); //调用评论
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
    this.getCGinfo(); //调用方法
    this.getCGcomment(); //调用评论
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
      title: this.data.info.title,
      desc: this.data.info.summary,
      path: '/pages/circle/pur_show/pur_show?id = ' + that.data.purid
    };
    return shareData;
  },
  /**
   * 采购详情获取
   */

  getCGinfo() {
    let that = this;
    wx.request({
      url: app.globalData.javahost + '/user/purchase/get/detail/page',
      method: 'POST',
      data: {
        "purchaseId": that.data.purid
      },
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        console.info(res)
        if (res.data.success) {
          let info = res.data.data;
          info.createTime = util.getDateDiff(info.createTime);
          info.images = info.images ? info.images.split(";") : [];
          that.setData({
            info: info
          })
        } else {
          that.setData({
            nocon: '该采购已删除'
          })
        }
        // setTimeout(function () {
        //   wx.navigateBack({
        //     delta: 1
        //   })
        // }, 200)

      }

    })
  },
  /**
   * 获取采购评论
   */
  getCGcomment() {

    let that = this;
    wx.request({
      url: app.globalData.javahost + '/user/purchase/get/purchase/Comment',
      method: 'POST',
      data: {
        "purchaseId": that.data.purid
      },
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        console.info(res)
        if (res.data.success) {
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
        // setTimeout(function () {
        //   wx.navigateBack({
        //     delta: 1
        //   })
        // }, 200)

      }

    })
  },
  // 分享
  toShare(e) {
    // console.info(e)
    wx.navigateTo({
      url: '/pages/home_page/share_cg/share_cg?id=' + e.currentTarget.dataset.atrid + '&type=' + e.currentTarget.dataset.type + '&imgs=' + e.currentTarget.dataset.img + '&tit=' + e.currentTarget.dataset.tit + '&summary=' + e.currentTarget.dataset.summary
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
    // console.info(con)
    if (con) {
      wx.request({
        url: app.globalData.javahost + '/user/operate/comment',
        method: 'POST',
        data: {
          "content": con,
          "id": that.data.purid,
          "type": 1
        },
        header: {
          'content-type': 'application/json',
          'cookie': 'JSESSIONID=' + app.globalData.session
        },
        success: function (res) {
          console.info(res)
          setTimeout(function () {
            that.data.container = ''
            // that.init();
            that.getCGcomment();
            that.getCGinfo();
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
        title: '评论不能为空',
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
        "id": that.data.purid,
        "type": 3
      },
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        console.info(res)
        if (res.data.success) {
          that.getCGinfo();
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
 * 关注人
 */
  guanzhuren(e) {
    let id = e.currentTarget.dataset.id;
    wx.showActionSheet({
      itemList: ['关注', '取消'],
      success: function (res) {
        console.log(res.tapIndex)
        if (res.tapIndex == 0) {
          wx.request({
            url: app.globalData.javahost + '/user/operate/follow',
            method: 'POST',
            data: { "userId": id },
            header: {
              'content-type': 'application/json',
              'cookie': 'JSESSIONID=' + app.globalData.session
            },
            success: function (res) {
              console.info(res)
              if (res.data.success) {

                // that.setData({
                //   userInfo: userInfo
                // })


              }
            },

          })
        } else {

        }
      },
      fail: function (res) {
        console.log(res.errMsg)
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
   * 去人的信息页面
   */
  to_person(e) {
    let id = e.currentTarget.dataset.id;
    let myid = this.data.UserInfo.userId;
    if (parseInt(id) == parseInt(myid)) {
      console.info(122121212)
      // wx.navigateTo({
      //   url: '/pages/mine/info/info'
      // })
      wx.navigateTo({
        // url: '/pages/circle/member_info/member_info?uid=' + e.currentTarget.dataset.userid
        url: '/pages/mine/info/info'
      })
    } else {
      wx.navigateTo({
        // url: '/pages/circle/member_info/member_info?uid=' + e.currentTarget.dataset.userid
        url: '/pages/mine/detail/detail_other?uid=' + id
      })
    }
  },
  /**
  * 更多
  */
  more_edit(e) {
    // let id = e.currentTarget.dataset.id;
    let that = this;
    let id = that.data.purid;
    wx.showActionSheet({
      itemList: ['删除'],
      success: function (res) {
        console.log(res.tapIndex)
        if (res.tapIndex == 0) {
          // 删除
          wx.request({
            url: app.globalData.javahost + '/user/purchase/delete/purchase',
            method: 'POST',
            data: {
              "purchaseId": id
            },
            header: {
              'content-type': 'application/json',
              'cookie': 'JSESSIONID=' + app.globalData.session
            },
            success: function (res) {
              console.info(res);
              wx.showToast({
                title: '删除成功',
                icon: 'success',
                duration: 2000
              })
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
    // if (that.data.selfInfo.phone) {
    wx.navigateTo({
      // url: '/pages/home_page/reply/reply?newsId=' + that.data.newsId
      url: '/pages/home_page/reply/reply?id=' + that.data.purid + '&type=1'
    })
  },
  /**
 * 对交流的分享
 */
  f_x(e) {
    let that = this;

    let id = that.data.purid;
    let tit = '';
    let summary = that.data.info.msg;
    let imgs = '';
    // console.log(e.currentTarget.dataset.imgs);
    let itype = 2;
    wx.navigateTo({
      url: '/pages/home_page/share_fen/share_fen?id=' + id + '&tit=' + tit + '&summary=' + summary + '&imgs=' + imgs + '&type=' + itype
    })
  },
  /**
  * 收藏
  */
  saveClick: function (e) {
    let that = this;
    if (this.data.info.favorYn) {
      wx.request({
        url: app.globalData.javahost + '/user/purchase/favor/set',
        method: 'POST',
        data: {
          "purchaseId": that.data.purid,
          "favorYn": false
        },
        header: {
          'content-type': 'application/json',
          'cookie': 'JSESSIONID=' + app.globalData.session
        },
        success: function (res) {
          if (res.data.success) {
            wx.showToast({
              title: "取消",
              duration: 2000,
            })
            that.setData({
              'info.favorYn': false
            })
          } else {
            app.errorMsg(res.data.errorCode, res.data.errorMsg, function (userInfo) {
              //更新数据
              this.setData({
                userInfo: userInfo
              })
              this.init();
            })
          }

        }
      })
    } else {
      wx.request({
        url: app.globalData.javahost + '/user/purchase/favor/set',
        method: 'POST',
        data: {
          "purchaseId": that.data.purid,
          "favorYn": true
        },
        header: {
          'content-type': 'application/json',
          'cookie': 'JSESSIONID=' + app.globalData.session
        },
        success: function (res) {
          if (res.data.success) {
            wx.showToast({
              title: "收藏",
              duration: 2000,
            })
            that.setData({
              'info.favorYn': true
            })
          } else {
            app.errorMsg(res.data.errorCode, res.data.errorMsg, function (userInfo) {
              //更新数据
              this.setData({
                userInfo: userInfo
              })
              this.init();
            })
          }

        }
      })
    }
  },
})