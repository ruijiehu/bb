let util = require('../../../utils/util.js');
var WxParse = require('../../../wxParse/wxParse.js');
let app = getApp();
let reqData = {}, sendData = {}, commentData = { userId: 0 }, cache, answerList = [];
function countdown(that) {
  var sendTxt = that.data.sendTxt
  if (sendTxt == 0) {
    that.setData({
      sendTxt: 0
    });
    return;
  }
  var time = setTimeout(function () {
    that.setData({
      sendTxt: sendTxt - 1
    });
    countdown(that);
  }
    , 1000)
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    info: {},
    answerList: [],
    sendInfo: '',
    newsId: '',
    subAnswer: {},
    sendType: 0,//回复类型，默认0 回复整条，如果为1则追加回复
    isInit: false,
    listHasMore: true,
    showLoading: true,
    sendTxt: 0,
    sendPhone: '',
    phone: '',
    selfInfo: {},
    showBindPhone: false,
    answerCount: 0,
    Info: {},
    container: null,
    infoid: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //更新数据
      if (userInfo) {
        that.setData({
          userInfo: userInfo
        })
        if (typeof options.newsId != 'undefined') {
          that.setData({
            newsId: parseInt(options.newsId)
          })
          sendData.newsId = commentData.newsId = parseInt(options.newsId)
          that.init();
        }
      } else {
        that.setData({
          isInit: true
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (options) {
    if (this.data.userInfo && this.data.isInit) {
      this.init();
    }
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
    this.init();
    this.data.answerList = []
    this.getAllComment();
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    reqData.currentPage = reqData.currentPage + 1;
    // this.getAllComment();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let shareData = {
      title: this.data.info.title,
      desc: this.data.info.summary,
      path: '/pages/culling/info?newsId=' + this.data.newsId
    };
    return shareData;
  },
  /**
   * 初始化
   */
  init: function () {
    let that = this;
    if (that.data.newsId) {
      wx.request({
        url: app.globalData.javahost + '/user/news/get',
        method: 'POST',
        data: { "newsId": that.data.newsId },
        header: {
          'content-type': 'application/json',
          'cookie': 'JSESSIONID=' + app.globalData.session
        },
        success: function (res) {
          if (res.data.success) {
            res.data.data.releaseTime = util.formatDate(new Date(res.data.data.releaseTime));
            res.data.data.images = res.data.data.images ? res.data.data.images.split(";") : [];
            // console.info(res.data.data.content)
            WxParse.wxParse('article', 'html', res.data.data.content, that, 5);
            res.data.data.applaud = 0;//赞同
            res.data.data.unapplaud = 1;//不赞同
            that.setData({
              info: res.data.data,
              isInit: true
            })

            console.info(res.data.data)

          } else {
            app.errorMsg(res.data.errorCode, res.data.errorMsg, function (userInfo) {
              //更新数据
              that.setData({
                userInfo: userInfo
              })
              that.init();
            })
          }
        },

      })
      reqData = {
        "currentPage": 1,
        "pageSize": app.globalData.pageSize,
        "orderBys": [{ "field": "createTime", "orderType": "DESC" }],
        "conditons": [{ "field": "news.newsId", "value": that.data.newsId }]
      }
      that.data.listHasMore = true;
      that.data.answerList = [];
      that.getAllComment();
      that.getSelfInfo();
    }
    /**
  * 获取自己的id
  */
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
            infoid: res.data.data.userId,

          })

        }
      },

    })

  },
  /**
   * 获取所有评论
   */
  getAllComment: function () {
    let that = this;
    if (that.data.listHasMore) {
      answerList = that.data.answerList;
      wx.request({
        url: app.globalData.javahost + '/user/news/comment/page',
        method: 'POST',
        // data: reqData,
        data: { "newsId": that.data.newsId },
        header: {
          'content-type': 'application/json',
          'cookie': 'JSESSIONID=' + app.globalData.session
        },
        success: function (res) {
          console.info(res)
          if (res.data.success) {
            for (let i = 0; i < res.data.data.length; i++) {
              cache = res.data.data[i];
              if (cache.createTime) {
                cache.createTime = util.getDateDiff(cache.createTime);
              }
              answerList.push(cache);
            }

            that.setData({
              answerList: answerList,
              answerCount: res.data.data.totalCount
            })
            setTimeout(function () {
              that.setData({
                showLoading: false
              })
            }, 300)
          } else {
            app.errorMsg(res.data.errorCode, res.data.errorMsg, function (userInfo) {
              //更新数据
              that.setData({
                userInfo: userInfo
              })
              that.init();
            })
          }
        },

      })
    }

  },
  /**
* 获取个人资料
*/
  getSelfInfo: function () {
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
          that.setData({
            selfInfo: res.data.data
          })

        } else {
          app.errorMsg(res.data.errorCode, res.data.errorMsg, function (userInfo) {
            //更新数据
            that.setData({
              userInfo: userInfo
            })
            that.init();
          })
        }
      },

    })
  },
  /**
   * 评论
   */
  answerAdd: function (e) {
    let that = this;
    if (that.data.selfInfo.phone) {
      wx.navigateTo({
        url: '/pages/culling/reply?newsId=' + that.data.newsId
      })
     
    } else {
      that.setData({
        showBindPhone: true
      });
    }


  },
  /**
   * 去编辑
   */
  goEdit: function (e) {
    wx.navigateTo({
      url: '/pages/dynamic/info?newsId=' + this.data.newsId
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
  showUser: function (e) {
    wx.navigateTo({
      url: '/pages/my/userInfo?userId=' + e.currentTarget.dataset.id
    })
  },

  /**
   * 关闭绑定弹框
   */
  closeBind: function () {
    this.setData({
      showBindPhone: false
    });
  },
  /**
   * 收藏
   */
  saveClick: function (e) {
    let that = this;
    if (this.data.info.favorYn) {
      wx.request({
        url: app.globalData.javahost + '/user/news/favor/set',
        method: 'POST',
        data: {
          "newsId": that.data.info.newsId,
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
        url: app.globalData.javahost + '/user/news/favor/set',
        method: 'POST',
        data: {
          "newsId": that.data.info.newsId,
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
  /**
   * 赞同
   */
  applaud: function (e) {
    let value = e.currentTarget.dataset.value;
    let that = this;
    // if (typeof that.data.info.supportYn == 'undefined') {
    // if (value == 'true') {
    wx.request({
      url: app.globalData.javahost + '/user/operate/praise',
      method: 'POST',
      data: {
        "id": that.data.newsId,
        "type": 0
      },
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        console.info(res)
        if (res.data.success) {
          that.init();
          wx.showToast({
            title: '成功',
            icon: 'success',
            duration: 2000
          })
          // that.setData({
          //   'info.supportYs': that.data.info.supportYs + 1,
          //   'info.supportYn': true
          // })
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

    // } else {
    // wx.request({
    //   url: app.globalData.javahost + '/user/news/support/set',
    //   method: 'POST',
    //   data: {
    //     "newsId": that.data.newsId,
    //     "supportYn": false
    //   },
    //   header: {
    //     'content-type': 'application/json',
    //     'cookie': 'JSESSIONID=' + app.globalData.session
    //   },
    //   success: function (res) {
    //     if (res.data.success) {
    //       wx.showToast({
    //         title: "水",
    //         duration: 2000,
    //       })
    //       that.setData({
    //         'info.supportFs': that.data.info.supportFs + 1,
    //         'info.supportYn': false
    //       })
    //     } else {
    //       app.errorMsg(res.data.errorCode, res.data.errorMsg, function (userInfo) {
    //         //更新数据
    //         this.setData({
    //           userInfo: userInfo
    //         })
    //         this.init();
    //       })
    //     }

    //   }
    // })
    // }
    // }

  },

  // 分享
  toShare(e) {
    // console.info(e)
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
    let newsid = that.data.info.newsId;
    let con = that.data.container;
    // console.info(con)
    wx.request({
      url: app.globalData.javahost + '/user/operate/comment',
      method: 'POST',
      data: {
        "content": con,
        "id": newsid,
        "type": 0
      },
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        console.info(res)
        setTimeout(function () {
          that.data.container = ''
          that.init();
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
   * 去评论人
   */
  to_person(e) {
    let that = this;
    let id = e.currentTarget.dataset.id;
    console.info(id)
    console.info(that.data.infoid)
    console.info(that.data.infoid == id)
    if (id == that.data.infoid) {
      console.info(122121212)
      wx.navigateTo({
        url: '/pages/mine/info/info'
      })
    } else {
      wx.navigateTo({
        url: '/pages/mine/detail/detail_other?uid=' + id
      })
    }
  }


})