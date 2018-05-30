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
    fx_id: null,
    fx_con: null,
    nick: null,
    con: null,
    nocon: null,
    show_toindex: false,
    showLoading: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.info(options.id)
    if (options.home != undefined) {
      this.setData({
        show_toindex: true
      })
    }
    if (options.nickname != undefined) {
      this.setData({
        nick: options.nickname,
        show_toindex: true
      })
    }
    this.setData({
      fx_id: options.id,
      nick: options.nick,
      con: options.con

    })
    this.getMyInfo();
    this.getCGcomment(); //调用评论
    this.getfxDetail();
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
    this.getCGcomment();
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
    this.getCGcomment();
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
      // title: this.data.info.title,
      desc: this.data.con,
      path: '/pages/home_page/fenxiang_detail/fenxiang_detail?id=' + that.data.fx_id + '&home=1' + '&nick=' + that.data.nick + '&con=' + that.data.con
    };
    return shareData;
  },
  /**
   * 采购详情获取
   */

  getCGinfo() {
    let that = this;
  },
  /**
   * 获取评论
   */
  getCGcomment() {

    let that = this;
    wx.request({
      url: app.globalData.javahost + '/user/operate/get/share/comment',
      method: 'POST',
      data: {
        "shareId": that.data.fx_id
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
   
      }

    })
  },
  // 分享
  toShare(e) {
    wx.navigateTo({
      url: '/pages/home_page/share_to/share_to?id=' + e.currentTarget.dataset.atrid + '&type=' + e.currentTarget.dataset.type + '&imgs=' + e.currentTarget.dataset.img + '&tit=' + e.currentTarget.dataset.tit + '&summary=' + e.currentTarget.dataset.summary
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
    wx.request({
      url: app.globalData.javahost + '/user/operate/comment',
      method: 'POST',
      data: {
        "content": con,
        "id": that.data.fx_id,
        "type": 2
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
        "id": that.data.fx_id,
        "type": 4
      },
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        console.info(res)
        if (res.data.success) {
          that.getfxDetail();
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
        url: '/pages/mine/detail/detail'
      })
    } else {
      wx.navigateTo({
        // url: '/pages/circle/member_info/member_info?uid=' + e.currentTarget.dataset.userid
        url: '/pages/mine/detail/detail_other?uid=' + id
      })
    }
  },
  /**
   * 获取分享详情
   */
  getfxDetail() {
    let that = this;
    wx.request({
      url: app.globalData.javahost + '/user/operate/get/share/detail',
      method: 'POST',
      data: {
        "shareId": that.data.fx_id
      },
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        if (res.data.success) {
          console.info(res.data)
          cache = res.data.data;
          cache.createTime = util.getDateDiff(cache.createTime);
          that.setData({
            fx_con: cache
          })
          setTimeout(function () {
            that.setData({
              showLoading: false
            })
          }, 300)
        } else {
          that.setData({
            nocon: '该分享已删除'
          })
        }
      }

    })
  },
  /**
* 更多
*/
  more_edit(e) {
    // let id = e.currentTarget.dataset.id;
    let that = this;
    let id = that.data.fx_id;
    wx.showActionSheet({
      itemList: ['删除'],
      success: function (res) {
        console.log(res.tapIndex)
        if (res.tapIndex == 0) {

          // 删除
          wx.request({
            url: app.globalData.javahost + '/user/operate/delete/share',
            method: 'POST',
            data: {
              "shareId": id
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
                  // wx.switchTab({
                  //   url: '/pages/home_page/index/index'
                  // })
                  wx.navigateBack({})
                }, 1000)


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
   * 去精选详情
   */
  to_jx(e) {
    wx.navigateTo({
      url: '/pages/home_page/detail_page/detail_page?newsId=' + e.currentTarget.dataset.id
    })
  },
  /**
   * 去采购详情
   */
  to_cg(e) {
    wx.navigateTo({
      url: '/pages/circle/pur_show/pur_show?purid=' + e.currentTarget.dataset.id
    })
  },
  /**
   * 去交流详情
   */
  to_jl(e) {
    wx.navigateTo({
      url: '/pages/circle/exchange_show/exchange_show?id=' + e.currentTarget.dataset.id
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
      url: '/pages/home_page/reply/reply?id=' + that.data.fx_id + '&type=2'
    })
  },
  /**
   * 转发分享
   */
  f_x() {
    let that = this;
    if (that.data.fx_con.newsUView != undefined) {
      // 转发的是分享的精选
      let id = that.data.fx_con.newsUView.newsId;
      let tit = that.data.fx_con.newsUView.title;
      let summary = that.data.fx_con.newsUView.summary;
      let imgs = that.data.fx_con.newsUView.images;
      let itype = 0;
      // wx.navigateTo({
      //   url: '/pages/home_page/share_fen/share_fen_jx?id=' + id + '&tit=' + tit + '&summary=' + summary + '&imgs=' + imgs + '&type=' + itype
      // })

      // let id = e.currentTarget.dataset.id;
      // let tit = e.currentTarget.dataset.tit;
      // let summary = e.currentTarget.dataset.summary;
      // let imgs = e.currentTarget.dataset.imgs;
      // console.log(e.currentTarget.dataset.imgs);
      // let itype = e.currentTarget.dataset.type;
      wx.navigateTo({
        url: '/pages/home_page/share_fen/share_fen?id=' + id + '&tit=' + tit + '&summary=' + summary + '&imgs=' + imgs + '&type=' + itype
      })


    } else if (that.data.fx_con.purchaseDetailUView != undefined) {
      // 转发的是分享的采购
      let id = that.data.fx_con.purchaseDetailUView.purchaseId;
      let imgs = that.data.fx_con.purchaseDetailUView.imgs;
      // let itype = 4;
      let msg = that.data.fx_con.purchaseDetailUView.msg;
      let content_one = that.data.con;
      // wx.navigateTo({
      //   url: '/pages/home_page/share_fen/share_zhuanfa?id=' + id + '&msg=' + msg + '&content_one=' + content_one + '&imgs=' + imgs + '&type=' + itype
      // })
      // let id = e.currentTarget.dataset.id;
      let tit = '';
      let summary = that.data.fx_con.purchaseDetailUView.msg;
      // let imgs = e.currentTarget.dataset.imgs;
      // console.log(e.currentTarget.dataset.imgs);
      let itype = 2;
      wx.navigateTo({
        url: '/pages/home_page/share_fen/share_fen?id=' + id + '&tit=' + tit + '&summary=' + summary + '&imgs=' + imgs + '&type=' + itype
      })



    } else if (that.data.fx_con.questionUView != undefined) {
      // 转发的是分享的交流
      let id = that.data.fx_con.questionUView.questionId;
      // let tit = e.currentTarget.dataset.tit;
      // let summary = e.currentTarget.dataset.summary;
      let imgs = that.data.fx_con.questionUView.imgs;
      let itype = 1;
      let msg = that.data.fx_con.questionUView.content;
      let content_one = that.data.con;
      // wx.navigateTo({
      //   url: '/pages/home_page/share_fen/share_zhuanfa?id=' + id + '&msg=' + msg + '&content_one=' + content_one + '&imgs=' + imgs + '&type=' + itype
      // })
      // let id = e.currentTarget.dataset.id;
      let tit = '';
      let summary = that.data.fx_con.questionUView.content;
      // let imgs = e.currentTarget.dataset.imgs;
      // console.log(e.currentTarget.dataset.imgs);
      // let itype = e.currentTarget.dataset.type;
      wx.navigateTo({
        url: '/pages/home_page/share_fen/share_fen?id=' + id + '&tit=' + tit + '&summary=' + summary + '&imgs=' + imgs + '&type=' + itype
      })

    }
  },
  /**
* 进入名片
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
  to_home() {
    wx.switchTab({
      url: '/pages/home_page/index/index',
    })
  }
})